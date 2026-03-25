import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  MapPin, 
  CheckCircle, 
  HelpCircle, 
  MessageCircle, 
  ArrowRight,
  Calculator,
  DollarSign,
  Briefcase,
  Settings,
  LogOut,
  Trash2,
  ExternalLink,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc,
  OperationType,
  handleFirestoreError,
  User
} from './firebase';

const ADMIN_EMAIL = "hossainsolyman534@gmail.com";

const CountUp = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.floor(value);
    if (start === end) {
      setCount(end);
      return;
    }

    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end) * 10;
    
    let step = Math.max(1, Math.floor(end / 100));
    incrementTime = (totalMiliseconds / (end / step));

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const FadeInSection = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.section>
);

export default function App() {
  const [investment, setInvestment] = useState<string>('');
  const [result, setResult] = useState<{ monthly: number; yearly: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Admin & Settings State
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [pixelId, setPixelId] = useState('');
  const [newPixelId, setNewPixelId] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setIsAdmin(currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Pixel ID and Inject Script
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPixelId(data.pixelId || '');
          setNewPixelId(data.pixelId || '');
          
          if (data.pixelId) {
            injectPixelScript(data.pixelId);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch Leads for Admin
  useEffect(() => {
    if (isAdmin && showAdminPanel) {
      const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(leadsData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      });
      return () => unsubscribe();
    }
  }, [isAdmin, showAdminPanel]);

  const injectPixelScript = (id: string) => {
    if (!id || typeof window === 'undefined') return;
    
    // Check if already injected
    if (document.getElementById('fb-pixel-script')) return;

    const script = document.createElement('script');
    script.id = 'fb-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${id}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const loggedInUser = result.user;
      if (loggedInUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        setShowLoginForm(false);
        alert("অ্যাডমিন হিসেবে লগইন সফল হয়েছে!");
      } else {
        alert(`আপনি ${loggedInUser.email} দিয়ে লগইন করেছেন, যা অ্যাডমিন ইমেইল নয়।`);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert("ইমেইল অথবা পাসওয়ার্ড ভুল। দয়া করে সঠিক তথ্য দিন।");
      } else {
        alert("লগইন করতে সমস্যা হয়েছে: " + error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAdminPanel(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const savePixelId = async () => {
    if (!isAdmin) return;
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), { pixelId: newPixelId });
      setPixelId(newPixelId);
      alert("Pixel ID সফলভাবে সেভ হয়েছে। পেজ রিফ্রেশ করুন।");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/config');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("আপনি কি নিশ্চিতভাবে এই লিডটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  };

  const calculateProfit = () => {
    const amount = parseFloat(investment);
    if (isNaN(amount) || amount <= 0) {
      alert("সঠিক এমাউন্ট দিন");
      return;
    }
    const monthly = amount * 0.11;
    const yearly = monthly * 12;
    setResult({ monthly, yearly });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      // Fallback for demo if URL is not set
      setTimeout(() => {
        alert("ধন্যবাদ! আমরা আপনার সাথে যোগাযোগ করবো (Demo Mode: Google Sheet URL not set)");
        setFormData({ name: '', phone: '', location: '' });
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'leads'), {
        ...formData,
        timestamp: new Date().toISOString()
      });

      // 2. Track with Pixel if available
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }

      // 3. Send to Google Sheets (Original Logic)
      const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
      if (sheetUrl) {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, timestamp: new Date().toISOString() }),
        });
      }

      alert("ধন্যবাদ! আপনার তথ্য সফলভাবে জমা হয়েছে।");
      setFormData({ name: '', phone: '', location: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("দুঃখিত, তথ্য জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-2xl">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black">Admin Dashboard</h1>
                <p className="text-slate-400">Manage leads and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
              >
                Back to Site
              </button>
              <button 
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SETTINGS */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="text-green-500" /> Pixel Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Facebook Pixel ID</label>
                    <input 
                      type="text" 
                      value={newPixelId}
                      onChange={(e) => setNewPixelId(e.target.value)}
                      placeholder="Enter Pixel ID"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <button 
                    onClick={savePixelId}
                    disabled={isSavingSettings}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Pixel ID'}
                  </button>
                  {pixelId && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} /> Active Pixel: {pixelId}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-4">Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-slate-400 text-xs mb-1">Total Leads</p>
                    <p className="text-2xl font-black">{leads.length}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-slate-400 text-xs mb-1">Today</p>
                    <p className="text-2xl font-black">
                      {leads.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADS LIST */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="text-blue-500" /> Recent Leads
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 text-sm">
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Phone</th>
                        <th className="p-4 font-bold">Location</th>
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold">{lead.name}</td>
                          <td className="p-4">
                            <a href={`tel:${lead.phone}`} className="text-blue-400 hover:underline flex items-center gap-1">
                              {lead.phone} <ExternalLink size={12} />
                            </a>
                          </td>
                          <td className="p-4 text-slate-400">{lead.location}</td>
                          <td className="p-4 text-xs text-slate-500">
                            {new Date(lead.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => deleteLead(lead.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500">
                            No leads found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      {/* HERO */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80" 
            alt="Super shop background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
          >
            রানিং সুপার শপে <br/> <span className="text-green-500">পার্টনার</span> হওয়ার সুযোগ
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto space-y-3"
          >
            <p className="font-medium">প্রথম মাস থেকেই আয় শুরু</p>
            <p className="text-green-400 font-black bg-green-400/10 py-2 px-6 rounded-full inline-block">👉 সীমিত স্লট — এখনই আবেদন করুন</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: "#15803d" }}
              whileTap={{ scale: 0.95 }}
              href="#form" 
              className="px-10 py-5 bg-green-600 text-white font-black text-xl rounded-2xl transition-colors shadow-2xl shadow-green-900/40 flex items-center justify-center gap-3"
            >
              পার্টনার হতে চাই <ArrowRight size={24} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              href="https://wa.me/8801911110476" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-black text-xl rounded-2xl transition-colors border border-white/20 flex items-center justify-center gap-3"
            >
              <MessageCircle size={24} /> WhatsApp করুন
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* LOCATION & EXPANSION */}
      <FadeInSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3">
                <MapPin className="text-red-600" /> আমাদের বর্তমান অবস্থান ও এক্সপ্যানশন প্ল্যান
              </h2>
              <div className="space-y-6 text-lg text-slate-700">
                <p className="font-bold text-slate-900">বর্তমানে আমাদের সফলভাবে চালু রয়েছে ২টি সুপার শপ আউটলেট:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">📌 ১৮ নং সেক্টর, উত্তরা</li>
                  <li className="flex items-center gap-2">📌 দিয়া বাড়ি, উত্তরা</li>
                </ul>
                <p className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 italic">
                  এই আউটলেটগুলো গত ১.৫ বছরে একটি স্থিতিশীল কাস্টমার বেস তৈরি করেছে এবং প্রুভ করেছে যে আমাদের ব্যবসায়িক মডেল বাস্তব এবং কার্যকর।
                </p>
                
                <div className="pt-8">
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-600" /> আগামী পরিকল্পনা (Next 18 Months)
                  </h3>
                  <p className="mb-4">আমাদের লক্ষ্য আগামী ১৮ মাসের মধ্যে উত্তরা এবং আশেপাশের প্রাইম লোকেশনগুলোতে আরও ১০টি নতুন আউটলেট চালু করা।</p>
                  <p className="text-slate-600">এই এক্সপ্যানশন প্ল্যান শুধু একটি আইডিয়া নয়— এটি একটি পরিকল্পিত, স্ট্র্যাটেজিক গ্রোথ মডেল, যেখানে লোকেশন, ডিমান্ড এবং অপারেশন সব কিছু বিবেচনা করে এগানো হচ্ছে।</p>
                  <p className="mt-6 font-bold text-green-700 flex items-center gap-2">
                    <ArrowRight size={20} /> এই গ্রোথ জার্নির অংশ হিসেবেই আমরা এখন সরাসরি পার্টনার অনবোর্ড করছি
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <motion.img 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80" 
                  alt="Modern Supermarket" 
                  className="rounded-[2.5rem] shadow-2xl relative z-10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-6 -right-6 w-full h-full bg-red-600/10 rounded-[2.5rem] -z-0"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-red-600/20 blur-3xl rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* INVESTOR VS PARTNER */}
      <FadeInSection className="py-20 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1521791136364-798a7bc0d262?auto=format&fit=crop&w=1920&q=80" 
            alt="Collaboration Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">
            <span className="text-green-500">🤝 ইনভেস্টর না, পার্টনার</span> — পার্থক্যটা এখানেই
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 transition-colors hover:bg-white/10"
            >
              <h3 className="text-2xl font-bold mb-8 text-slate-400">একজন ইনভেস্টর সাধারণত শুধু দেখেন—</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">📊</span> লাভ হচ্ছে কি না, কত রিটার্ন আসছে
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-green-600 p-10 rounded-[2.5rem] shadow-2xl shadow-green-900/40"
            >
              <h3 className="text-2xl font-bold mb-8 text-green-100">কিন্তু একজন পার্টনার দেখেন—</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">📦</span> ব্যবসা কীভাবে চলছে
                </li>
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">🛒</span> কাস্টমার কিভাবে বাড়ছে
                </li>
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">📈</span> কিভাবে সেলস বাড়ানো যায়
                </li>
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">🏬</span> কীভাবে একটি আউটলেট সফল করা যায়
                </li>
              </ul>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-3xl font-black text-slate-300">
              👉 সহজভাবে বললে, <br/>
              <span className="text-white">ইনভেস্টর টাকা দেন — পার্টনার ব্যবসা গড়ে তোলেন</span>
            </p>
          </div>
        </div>
      </FadeInSection>

      {/* WHY PARTNERS? */}
      <FadeInSection className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center max-w-6xl mx-auto">
            <div className="lg:w-1/2">
              <div className="relative">
                <motion.img 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  src="https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1000&q=80" 
                  alt="Store Partnership" 
                  className="rounded-[3rem] shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3">
                <Briefcase className="text-blue-600" /> কেন আমরা পার্টনার খুঁজছি?
              </h2>
              <p className="text-xl text-slate-600 mb-8">আমরা এমন মানুষদের সাথে কাজ করতে চাই—</p>
              
              <div className="space-y-4 mb-10">
                {[
                  "যারা নিজের ব্যবসা গড়তে চান",
                  "যারা শুধু লাভ না, গ্রোথ বুঝেন",
                  "যারা লোকাল মার্কেট নিয়ে কাজ করতে আগ্রহী"
                ].map((text, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 10 }}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 transition-colors hover:bg-slate-100"
                  >
                    <CheckCircle className="text-green-600 shrink-0" size={24} />
                    <p className="font-bold text-lg">{text}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-900/20">
                <p className="text-xl font-bold italic">
                  "কারণ আমরা বিশ্বাস করি— <br/>
                  👉 একজন committed পার্টনারই একটি আউটলেটকে দ্রুত সফল করতে পারে"
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* LEGAL SECURITY */}
      <FadeInSection className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6 flex items-center justify-center gap-3">
                <CheckCircle className="text-blue-600" /> 🔒 আইনগত নিরাপত্তা ও চুক্তি ব্যবস্থা
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আমাদের সাথে পার্টনারশিপ সম্পূর্ণভাবে বাংলাদেশ সরকারের প্রচলিত আইন ও বিধিমালা অনুযায়ী পরিচালিত হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                  <ArrowRight className="text-green-600" /> প্রতিটি পার্টনারের সাথে একটি লিখিত চুক্তি (Legal Agreement) করা হবে, যেখানে স্পষ্টভাবে উল্লেখ থাকবে:
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: "📄", text: "বিনিয়োগের পরিমাণ" },
                    { icon: "📊", text: "প্রফিট ও শেয়ারিং মডেল" },
                    { icon: "🏬", text: "আউটলেট পরিচালনার দায়িত্ব" },
                    { icon: "⏳", text: "চুক্তির মেয়াদ" },
                    { icon: "🔁", text: "শর্তাবলী ও দায়িত্বসমূহ" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-lg font-bold transition-colors hover:bg-slate-100"
                    >
                      <span className="text-2xl">{item.icon}</span> {item.text}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <motion.img 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.5 }}
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80" 
                    alt="Legal Contract" 
                    className="rounded-[2.5rem] shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 rounded-[2.5rem] pointer-events-none"></div>
                </div>

                <div className="bg-blue-600 text-white p-10 rounded-[2.5rem] shadow-xl">
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                    🤝 আপনার নিরাপত্তা, আমাদের অঙ্গীকার
                  </h3>
                  <p className="mb-8 text-blue-100">আমরা বিশ্বাস করি একটি সফল পার্টনারশিপের ভিত্তি হচ্ছে স্বচ্ছতা (Transparency) এবং বিশ্বাস (Trust)</p>
                  <ul className="space-y-4">
                    {[
                      "প্রতিটি শর্ত পরিষ্কারভাবে লিখিত থাকবে",
                      "কোন হিডেন কন্ডিশন থাকবে না",
                      "পার্টনার হিসেবে আপনার অধিকার সংরক্ষিত থাকবে",
                      "প্রয়োজন হলে সরাসরি আলোচনা ও ক্ল্যারিফিকেশন করা যাবে"
                    ].map((text, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-blue-300 shrink-0" size={20} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    🛡️ কেন এটি গুরুত্বপূর্ণ?
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    অনেক সময় অনানুষ্ঠানিকভাবে ব্যবসা শুরু হলে ভবিষ্যতে ভুল বোঝাবুঝি তৈরি হয়। <br/>
                    <span className="font-bold text-slate-900 mt-2 block">👉 আমরা সেই ঝুঁকি এড়াতে শুরু থেকেই একটি স্ট্রাকচার্ড ও লিগ্যাল ফ্রেমওয়ার্কে কাজ করি</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* INVESTMENT */}
      <FadeInSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 blur-[100px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-black mb-8">ইনভেস্টমেন্ট</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-green-400">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">মিনিমাম ইনভেস্ট</p>
                      <p className="text-2xl font-bold">৳১,০০,০০০</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">আনুমানিক প্রফিট</p>
                      <p className="text-2xl font-bold">~১১% মাসিক</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <motion.img 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.5 }}
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" 
                  alt="Business partnership" 
                  className="rounded-2xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* PROFIT CALCULATOR */}
      <FadeInSection className="py-20 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-slate-200">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-center flex items-center justify-center gap-3">
              <Calculator className="text-blue-600" /> প্রফিট ক্যালকুলেটর
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">আপনার ইনভেস্টমেন্ট (৳)</label>
                <input 
                  type="number" 
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  placeholder="যেমন: 100000"
                  className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculateProfit}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
              >
                ক্যালকুলেট করুন
              </motion.button>
              
              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-600 text-sm mb-1">মাসিক প্রফিট</p>
                      <p className="text-2xl font-black text-blue-900">৳<CountUp value={result.monthly} /></p>
                    </div>
                    <div>
                      <p className="text-blue-600 text-sm mb-1">বার্ষিক প্রফিট</p>
                      <p className="text-2xl font-black text-blue-900">৳<CountUp value={result.yearly} /></p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center flex items-center justify-center gap-3">
            <HelpCircle className="text-purple-600" /> প্রশ্ন ও উত্তর
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: "এটা কি ইনভেস্টমেন্ট নাকি ব্যবসা?", a: "এটা সরাসরি পার্টনারশিপ ব্যবসা। আপনি নিজেই চালাবেন।" },
              { q: "মিনিমাম কত টাকা লাগবে?", a: "৳১,০০,০০০" },
              { q: "আমি কি নতুন হলেও পারবো?", a: "হ্যাঁ, আমরা গাইডলাইন দিবো" },
              { q: "প্রফিট কত হতে পারে?", a: "গড়ে ~১১% (পারফরম্যান্স অনুযায়ী পরিবর্তন হতে পারে)" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">Q</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 pl-9">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* FORM */}
      <FadeInSection id="form" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-blue-400 font-black text-2xl md:text-3xl mb-6">
                📌 আপনি শুধু একটি ব্যবসায় যোগ দিচ্ছেন না—আপনি একটি সুরক্ষিত, স্বচ্ছ এবং পরিকল্পিত পার্টনারশিপে যুক্ত হচ্ছেন।
              </p>
              <p className="text-orange-400 font-black text-xl md:text-2xl mb-8">
                🔥 আজ আপনি একজন পার্টনার হিসেবে শুরু করলে, আগামী ১৮ মাসে একটি বড় সুপার শপ নেটওয়ার্কের অংশ হতে পারবেন।
              </p>
              <h2 className="text-3xl md:text-4xl font-black mb-4">পার্টনার হতে আবেদন করুন</h2>
              <p className="text-slate-400 text-lg">আপনার তথ্য দিন, আমরা আপনার সাথে যোগাযোগ করবো।</p>
            </div>
            <form onSubmit={submitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">আপনার নাম</label>
                  <input 
                    type="text" 
                    placeholder="আপনার নাম" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">মোবাইল নাম্বার</label>
                  <input 
                    type="text" 
                    placeholder="মোবাইল নাম্বার" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">লোকেশন</label>
                <input 
                  type="text" 
                  placeholder="লোকেশন" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-white"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#15803d" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 bg-green-600 text-white font-black text-xl rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    প্রসেসিং হচ্ছে...
                  </>
                ) : 'সাবমিট করুন'}
              </motion.button>
            </form>
          </div>
        </div>
      </FadeInSection>

      {/* FOOTER */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-center border-t border-white/5">
        <div className="container mx-auto px-4">
          <p>© ২০২৬ সুপার শপ পার্টনারশিপ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="mt-6 flex flex-col items-center gap-4">
            {!user ? (
              <>
                {!showLoginForm ? (
                  <button 
                    onClick={() => setShowLoginForm(true)}
                    className="text-xs text-slate-700 hover:text-slate-400 transition-colors flex items-center gap-1"
                  >
                    <Lock size={12} /> Admin Login
                  </button>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleLogin}
                    className="bg-white/5 p-6 rounded-2xl border border-white/10 w-full max-w-xs space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-white">Admin Login</h3>
                      <button 
                        type="button"
                        onClick={() => setShowLoginForm(false)}
                        className="text-xs text-slate-500 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <button 
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50"
                    >
                      {isLoggingIn ? 'Logging in...' : 'Login'}
                    </button>
                  </motion.form>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdminPanel(true)}
                    className="text-xs text-green-600 hover:text-green-400 transition-colors flex items-center gap-1"
                  >
                    <LayoutDashboard size={12} /> Admin Panel
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-xs text-red-800 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut size={12} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
