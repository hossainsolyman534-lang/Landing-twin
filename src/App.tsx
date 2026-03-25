import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  MessageCircle, 
  ArrowRight,
  Calculator,
  DollarSign,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  doc, 
  getDoc, 
  addDoc, 
  collection
} from './firebase';

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
  const [pixelId, setPixelId] = useState('');

  // Fetch Pixel ID and Inject Script
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPixelId(data.pixelId || '');
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

  const injectPixelScript = (id: string) => {
    if (!id || typeof window === 'undefined') return;
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

    try {
      // 1. Save to Firestore (as backup)
      await addDoc(collection(db, 'leads'), {
        ...formData,
        timestamp: new Date().toISOString()
      });

      // 2. Track with Pixel
      if (window.fbq) {
        window.fbq('track', 'Lead');
      }

      // 3. Send to Google Sheets
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      {/* HERO */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200&h=800" 
            alt="Super shop background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-sm uppercase tracking-widest"
          >
            একটি লাভজনক ব্যবসায়িক সুযোগ
          </motion.div>
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
            <p className="font-medium">আপনার বিনিয়োগ, আমাদের অভিজ্ঞতা — একসাথে গড়বো আগামীর সফল ব্যবসা।</p>
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

      {/* WHY SUPER SHOP BUSINESS? */}
      <FadeInSection className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">কেন <span className="text-green-600">সুপার শপ</span> ব্যবসা?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">সুপার শপ বর্তমানে বাংলাদেশের অন্যতম দ্রুত বর্ধনশীল এবং নিরাপদ ব্যবসায়িক খাত।</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { icon: "🛒", title: "নিত্যপ্রয়োজনীয় পণ্য", desc: "মানুষের প্রতিদিনের প্রয়োজনীয় পণ্য হওয়ায় এই ব্যবসায় মন্দার ভয় নেই।" },
              { icon: "📈", title: "দ্রুত বর্ধনশীল মার্কেট", desc: "আধুনিক জীবনযাত্রার সাথে তাল মিলিয়ে সুপার শপের চাহিদা দিন দিন বাড়ছে।" },
              { icon: "🛡️", title: "নিরাপদ বিনিয়োগ", desc: "ফিজিক্যাল ইনভেন্টরি এবং রানিং আউটলেট হওয়ায় আপনার বিনিয়োগ থাকে সুরক্ষিত।" },
              { icon: "💰", title: "ক্যাশ বিজনেস", desc: "প্রতিদিনের টাকা প্রতিদিন হাতে আসে, ফলে ওয়ার্কিং ক্যাপিটাল নিয়ে চিন্তা থাকে না।" },
              { icon: "🤝", title: "সামাজিক মর্যাদা", desc: "একটি আধুনিক সুপার শপের মালিক হওয়া আপনার সামাজিক মর্যাদা বৃদ্ধি করবে।" },
              { icon: "🚀", title: "সহজ অপারেশন", desc: "আমাদের দক্ষ টিম আপনার হয়ে পুরো অপারেশনাল কাজগুলো পরিচালনা করবে।" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-black mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInSection>

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
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=800" 
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
            src="https://images.unsplash.com/photo-1521791136064-7986c29535ad?auto=format&fit=crop&q=80&w=1200&h=800" 
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
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">📉</span> ব্যবসার ঝুঁকি কতটুকু
                </li>
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">⌛</span> টাকা কবে ফেরত পাওয়া যাবে
                </li>
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">😴</span> ব্যবসার দৈনন্দিন কাজ নিয়ে কোনো মাথাব্যথা নেই
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

      {/* PARTNERSHIP STEPS */}
      <FadeInSection className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">পার্টনারশিপের <span className="text-blue-600">ধাপসমূহ</span></h2>
            <p className="text-slate-500 text-lg">খুব সহজেই আপনি আমাদের সাথে যুক্ত হতে পারেন।</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -z-0"></div>
            {[
              { step: "০১", title: "আবেদন", desc: "নিচের ফর্মটি পূরণ করে আপনার আগ্রহ প্রকাশ করুন।" },
              { step: "০২", title: "আলোচনা", desc: "আমাদের টিম আপনার সাথে যোগাযোগ করবে এবং বিস্তারিত আলোচনা হবে।" },
              { step: "০৩", title: "চুক্তি", desc: "আইনি প্রক্রিয়ার মাধ্যমে পার্টনারশিপ চুক্তি সম্পন্ন হবে।" },
              { step: "০৪", title: "শুরু", desc: "প্রথম মাস থেকেই আপনি ব্যবসার লভ্যাংশ পেতে শুরু করবেন।" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black mx-auto mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* WHY PARTNERS? */}
      <FadeInSection className="py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img 
                      src="https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=600&h=400" 
                      alt="Business 1" 
                      className="rounded-3xl shadow-lg w-full h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1534452203294-45c851135f8a?auto=format&fit=crop&q=80&w=600&h=400" 
                      alt="Business 2" 
                      className="rounded-3xl shadow-lg w-full h-48 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-4 pt-8">
                    <img 
                      src="https://images.unsplash.com/photo-1566385101042-1a000c1267c4?auto=format&fit=crop&q=80&w=600&h=400" 
                      alt="Business 3" 
                      className="rounded-3xl shadow-lg w-full h-48 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1556742049-02e1f6d0d0ee?auto=format&fit=crop&q=80&w=600&h=400" 
                      alt="Business 4" 
                      className="rounded-3xl shadow-lg w-full h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                  কেন আপনি আমাদের <br/> <span className="text-blue-600">পার্টনার হবেন?</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "নিজের ব্যবসা", desc: "অন্যের অধীনে নয়, নিজের একটি লাভজনক ব্যবসার মালিক হোন।" },
                    { title: "গাইডলাইন ও সাপোর্ট", desc: "আমরা আপনাকে প্রতিটি ধাপে গাইড করবো এবং অপারেশনাল সাপোর্ট দিবো।" },
                    { title: "লোকাল মার্কেট", desc: "আপনার এলাকার পরিচিত মার্কেটে ব্যবসা করার সুযোগ।" },
                    { title: "স্বচ্ছতা ও জবাবদিহিতা", desc: "ব্যবসার প্রতিটি সিদ্ধান্তে আপনার মতামত এবং মাসিক প্রফিট রিপোর্ট ও অডিট।" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black mb-1">{item.title}</h4>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-8">
                  <h3 className="text-2xl font-black mb-6">আমাদের অপারেশনাল সাপোর্ট:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "সাপ্লাই চেইন ম্যানেজমেন্ট",
                      "দক্ষ সেলস টিম",
                      "মার্কেটিং ও প্রমোশন",
                      "আইনি ও প্রশাসনিক সহায়তা",
                      "ইনভেন্টরি কন্ট্রোল",
                      "কাস্টমার সার্ভিস সাপোর্ট",
                      "রিয়েল-টাইম সেলস ট্র্যাকিং",
                      "প্রশিক্ষিত জনবল সরবরাহ"
                    ].map((support, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {support}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* LEGAL & SECURITY */}
      <FadeInSection className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter">
                আইনগত <span className="text-blue-500">নিরাপত্তা</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                আমাদের সাথে পার্টনারশিপ সম্পূর্ণভাবে বাংলাদেশ সরকারের প্রচলিত আইন ও বিধিমালা অনুযায়ী পরিচালিত হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="p-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                <h3 className="text-3xl font-black mb-10 leading-tight">লিখিত চুক্তি (Legal Agreement)</h3>
                <ul className="space-y-6">
                  {[
                    "বিনিয়োগের পরিমাণ ও শেয়ারিং মডেল",
                    "আউটলেট পরিচালনার দায়িত্ব ও সময়সীমা",
                    "প্রফিট ডিস্ট্রিবিউশন পলিসি",
                    "চুক্তির মেয়াদ ও নবায়ন শর্তাবলী",
                    "স্বচ্ছ অডিট ও রিপোর্ট সিস্টেম",
                    "পারস্পরিক সমঝোতার ভিত্তিতে এক্সিট পলিসি",
                    "ট্রেড লাইসেন্স ও টিআইএন (TIN) সংক্রান্ত তথ্যাদি",
                    "ব্যাংক একাউন্ট ও ট্রানজেকশন স্বচ্ছতা নিশ্চিতকরণ"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-4 text-lg font-medium text-slate-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative group">
                <img 
                  src="https://images.unsplash.com/photo-1450175849256-0233409d9bb4?auto=format&fit=crop&q=80&w=800&h=600" 
                  alt="Legal" 
                  className="rounded-[3rem] shadow-2xl h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-blue-600/20 rounded-[3rem] mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* INVESTMENT & CALCULATOR */}
      <FadeInSection className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">বিনিয়োগ ও <br/> <span className="text-green-500 italic">মুনাফা</span></h2>
                <div className="space-y-8 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-green-400">
                      <DollarSign size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">মিনিমাম ইনভেস্ট</p>
                      <p className="text-4xl font-black">৳১,০০,০০০</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-blue-400">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">মাসিক মুনাফা</p>
                      <p className="text-4xl font-black">~১১%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-slate-400 leading-relaxed">
                  আপনার বিনিয়োগ সরাসরি আউটলেটের ইনভেন্টরি, ডেকোরেশন এবং অপারেশনে ব্যবহৃত হবে। আমরা প্রতিটি টাকার হিসাব স্বচ্ছতার সাথে প্রদান করি এবং মাসিক ভিত্তিতে প্রফিট ডিস্ট্রিবিউশন নিশ্চিত করি।
                </p>
                <p className="mt-4 text-green-400 font-bold">
                  📌 গত ১.৫ বছরের অভিজ্ঞতায় আমরা আমাদের ইনভেস্টরদের নিয়মিত প্রফিট প্রদান করে আসছি।
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Calculator className="text-blue-600" /> প্রফিট ক্যালকুলেটর
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">আপনার ইনভেস্টমেন্ট (৳)</label>
                  <input 
                    type="number" 
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="যেমন: 100000"
                    className="w-full px-8 py-6 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-2xl font-black"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateProfit}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-blue-900/20"
                >
                  হিসাব করুন
                </motion.button>
                
                <AnimatePresence>
                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="grid grid-cols-2 gap-6"
                    >
                      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">মাসিক</p>
                        <p className="text-3xl font-black text-blue-600">৳<CountUp value={result.monthly} /></p>
                      </div>
                      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">বার্ষিক</p>
                        <p className="text-3xl font-black text-green-600">৳<CountUp value={result.yearly} /></p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* VISION & MISSION */}
      <FadeInSection className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-12">আমাদের <span className="text-green-600">ভিশন ও লক্ষ্য</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="text-4xl mb-6">🎯</div>
                <h3 className="text-2xl font-black mb-4">আমাদের লক্ষ্য</h3>
                <p className="text-slate-600">আগামী ১৮ মাসের মধ্যে ঢাকা শহরের প্রতিটি গুরুত্বপূর্ণ মোড়ে আমাদের সুপার শপের উপস্থিতি নিশ্চিত করা এবং সাধারণ মানুষের কাছে মানসম্মত পণ্য পৌঁছে দেওয়া।</p>
              </div>
              <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="text-4xl mb-6">🚀</div>
                <h3 className="text-2xl font-black mb-4">আমাদের ভিশন</h3>
                <p className="text-slate-600">একটি শক্তিশালী রিটেইল নেটওয়ার্ক গড়ে তোলা যেখানে পার্টনাররা শুধু বিনিয়োগকারী নন, বরং ব্যবসার প্রকৃত অংশীদার হিসেবে সফল হবেন।</p>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* TRANSPARENCY & TRUST */}
      <FadeInSection className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-8">স্বচ্ছতা ও <span className="text-blue-200 italic">জবাবদিহিতা</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-xl text-blue-50 leading-relaxed">
                      আমরা বিশ্বাস করি একটি সফল পার্টনারশিপের মূল ভিত্তি হলো স্বচ্ছতা। তাই আমরা প্রতিটি পার্টনারকে প্রদান করি:
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-blue-300" size={20} /> মাসিক সেলস ও প্রফিট রিপোর্ট
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-blue-300" size={20} /> ইনভেন্টরি ম্যানেজমেন্ট এক্সেস
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="text-blue-300" size={20} /> সরাসরি আউটলেট ভিজিটের সুযোগ
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                    <p className="text-blue-100 italic">
                      "আমাদের লক্ষ্য শুধু ব্যবসা করা নয়, বরং একটি বিশ্বস্ত কমিউনিটি গড়ে তোলা যেখানে সবাই একসাথে লাভবান হবে।"
                    </p>
                    <p className="mt-4 font-bold">— ম্যানেজমেন্ট টিম</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">সাধারণ <span className="text-purple-600 italic">জিজ্ঞাসা</span></h2>
            <p className="text-slate-500 text-lg">আপনার মনে থাকা কিছু সাধারণ প্রশ্নের উত্তর এখানে দেওয়া হলো।</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "এটা কি ইনভেস্টমেন্ট নাকি ব্যবসা?", a: "এটা সরাসরি পার্টনারশিপ ব্যবসা। আপনি ব্যবসার অংশীদার হিসেবে যুক্ত হচ্ছেন।" },
              { q: "মিনিমাম কত টাকা লাগবে?", a: "৳১,০০,০০০ থেকে আপনি শুরু করতে পারবেন।" },
              { q: "আমি কি নতুন হলেও পারবো?", a: "হ্যাঁ, আমরা আপনাকে সম্পূর্ণ গাইডলাইন এবং অপারেশনাল সাপোর্ট প্রদান করবো।" },
              { q: "প্রফিট কত হতে পারে?", a: "গড়ে ~১১% মাসিক মুনাফা হতে পারে, যা আউটলেটের পারফরম্যান্স অনুযায়ী পরিবর্তনশীল।" },
              { q: "চুক্তির মেয়াদ কতদিন?", a: "প্রাথমিকভাবে চুক্তির মেয়াদ ২ বছর, যা পরবর্তীতে আলোচনার ভিত্তিতে নবায়ন করা যাবে।" },
              { q: "টাকা ফেরত নিতে চাইলে কি করতে হবে?", a: "আমাদের একটি নির্দিষ্ট এক্সিট পলিসি রয়েছে। ৩ মাস আগে নোটিশ প্রদান করে আপনি আপনার মূলধন ফেরত নিতে পারবেন।" },
              { q: "আমি কি ব্যবসার সিদ্ধান্ত নিতে পারবো?", a: "হ্যাঁ, পার্টনার হিসেবে আপনি গুরুত্বপূর্ণ ব্যবসায়িক সিদ্ধান্তগুলোতে অংশ নিতে পারবেন।" },
              { q: "ব্যবসার ঝুঁকি কেমন?", a: "যেকোনো ব্যবসায় ঝুঁকি থাকে, তবে আমাদের ১.৫ বছরের অভিজ্ঞতা এবং রানিং আউটলেট হওয়ায় ঝুঁকি অনেক কম।" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h3 className="text-xl font-black mb-3 flex items-start gap-4">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-black shrink-0">Q</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 pl-12 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* FORM SECTION */}
      <FadeInSection id="form" className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1580913209323-6f73d1e72023?auto=format&fit=crop&q=80&w=1200&h=800" 
            alt="Form BG" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                আজই <br/> <span className="text-green-500">শুরু</span> করুন
              </h2>
              <div className="space-y-6">
                <p className="text-2xl font-bold text-blue-400">📌 আপনি শুধু একটি ব্যবসায় যোগ দিচ্ছেন না—আপনি একটি সুরক্ষিত পার্টনারশিপে যুক্ত হচ্ছেন।</p>
                <p className="text-xl text-slate-400">আগামী ১৮ মাসে একটি বড় সুপার শপ নেটওয়ার্কের অংশ হতে আপনার তথ্য দিয়ে আবেদন করুন।</p>
              </div>
            </div>
            <div className="bg-white rounded-[3rem] p-12 text-slate-900 shadow-2xl">
              <form onSubmit={submitForm} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">আপনার নাম</label>
                  <input 
                    type="text" 
                    placeholder="আপনার নাম" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">মোবাইল নাম্বার</label>
                  <input 
                    type="text" 
                    placeholder="মোবাইল নাম্বার" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">লোকেশন</label>
                  <input 
                    type="text" 
                    placeholder="লোকেশন" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg font-bold"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-green-600 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'আবেদন জমা দিন'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* CONTACT INFO */}
      <FadeInSection className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-12">সরাসরি যোগাযোগ করুন</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100">
              <MapPin className="text-red-600" />
              <span className="font-bold">উত্তরা, ঢাকা</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100">
              <MessageCircle className="text-green-600" />
              <span className="font-bold">+৮৮০ ১৯১১১১০৪৭৬</span>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* FOOTER */}
      <footer className="py-20 bg-slate-950 text-slate-500 text-center border-t border-white/5">
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium tracking-widest uppercase">© ২০২৬ সুপার শপ পার্টনারশিপ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
