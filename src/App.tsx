/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ShoppingCart, 
  Star, 
  Truck, 
  ShieldCheck, 
  ThumbsUp, 
  XCircle, 
  Heart,
  ChevronRight,
  Phone,
  MapPin,
  User as UserIcon,
  Ruler,
  LogIn,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth, collection, doc, getDoc, getDocs, setDoc, onSnapshot, query, orderBy, signInWithPopup, googleProvider, OperationType, handleFirestoreError } from './firebase';
import AdminPanel from './components/AdminPanel';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}

interface Content {
  heroTitle: string;
  heroSubtitle: string;
  offerText: string;
  offerPrice: number;
  originalPrice: number;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [path, setPath] = useState(window.location.pathname);
  const [visitCount, setVisitCount] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Content>({
    heroTitle: 'আপনার ছোট্ট মেয়ের জন্য পারফেক্ট কটন ড্রেস 👗',
    heroSubtitle: 'নরম, আরামদায়ক এবং স্টাইলিশ – সারাদিন আরামে থাকবে আপনার বাচ্চা। গরমেও থাকবে সতেজ।',
    offerText: 'সীমিত সময়ের জন্য ডিসকাউন্ট! স্টক শেষ হওয়ার আগে অর্ডার করুন।',
    offerPrice: 1200,
    originalPrice: 1500
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    size: '২-৪ বছর',
    productId: ''
  });

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    
    const count = parseInt(localStorage.getItem('visit_count') || '0');
    const newCount = count + 1;
    localStorage.setItem('visit_count', newCount.toString());
    setVisitCount(newCount);

    // Auth listener
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAdminUser = userDoc.exists() && userDoc.data().role === 'admin' || user.email === 'hossainsolyman534@gmail.com';
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });

    // Firestore listeners
    const unsubContent = onSnapshot(doc(db, 'content', 'landingPage'), (doc) => {
      if (doc.exists()) setContent(doc.data() as Content);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      if (prods.length > 0 && !formData.productId) {
        setFormData(prev => ({ ...prev, productId: prods[0].id }));
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      unsubAuth();
      unsubContent();
      unsubProducts();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('সবগুলো ঘর পূরণ করুন');
      return;
    }

    const selectedProduct = products.find(p => p.id === formData.productId) || products[0];

    try {
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        productId: formData.productId || 'default',
        productName: selectedProduct?.name || 'Cotton Dress',
        quantity: 1,
        totalPrice: content.offerPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert('অর্ডার সফল হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।');
      setFormData({ name: '', phone: '', address: '', size: '২-৪ বছর', productId: products[0]?.id || '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (path === '/admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <LogIn className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <p className="text-slate-600 mb-8">Please login with your admin account to access the dashboard.</p>
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> Login with Google
            </button>
            <button
              onClick={() => { window.location.pathname = '/'; }}
              className="mt-4 text-slate-400 hover:text-rose-500 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return <AdminPanel />;
  }

  // Section Components
  const HeroSection = () => {
    let headline = content.heroTitle;
    if (visitCount === 2 && !content.heroTitle.includes('গরমে')) headline = "গরমে বাচ্চার আরামের সেরা সমাধান – 100% কটন ড্রেস।";
    if (visitCount === 3 && !content.heroTitle.includes('ডেইলি')) headline = "ডেইলি ইউজের জন্য সবচেয়ে আরামদায়ক কিডস ড্রেস।";

    return (
      <section key="hero" className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-rose-600 uppercase bg-rose-100 rounded-full">
                প্রিমিয়াম কটন কালেকশন
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900">
                {headline}
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                {content.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <button 
                  onClick={scrollToOrder}
                  className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  👉 এখনই অর্ডার করুন
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-sm font-medium">১০০% কটন ফেব্রিক্স</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-sm font-medium">গরমে আরামদায়ক</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-sm font-medium">২–১২ বছর সাইজ</span>
                </div>
              </div>
            </motion.div>

          <div className="lg:w-1/2 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={products[0]?.imageUrl || "https://picsum.photos/seed/dress/800/800"} 
                alt="Kids Cotton Dress" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-6 -right-6 bg-yellow-400 text-slate-900 font-black p-6 rounded-full shadow-xl z-20 transform rotate-12 animate-pulse">
              ৳{content.offerPrice}<br/><span className="text-xs line-through opacity-50">৳{content.originalPrice}</span>
            </div>
          </div>
          </div>
        </div>
      </section>
    );
  };

  const ProblemSection = () => (
    <section key="problem" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-900">
            বাচ্চার ড্রেস নিয়ে কি এই সমস্যাগুলো হয়?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "গরমে বেশি ঘামে", desc: "সিন্থেটিক কাপড়ে বাচ্চা ঘেমে অস্থির হয়ে যায়।", icon: <XCircle className="text-rose-500" /> },
            { title: "স্কিনে সমস্যা হয়", desc: "কাপড় রাফ হলে বাচ্চার নরম স্কিনে র‍্যাশ বা চুলকানি হতে পারে।", icon: <XCircle className="text-rose-500" /> },
            { title: "আরামদায়ক না", desc: "সুন্দর দেখায়, কিন্তু পরলে বাচ্চা অস্বস্তি বোধ করে।", icon: <XCircle className="text-rose-500" /> }
          ].map((item, i) => (
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              key={i} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl font-medium text-rose-600 italic">
            👉 তাই বাচ্চারা অনেক সময় ড্রেস পরতে চায় না
          </p>
        </div>
      </div>
    </section>
  );

  const SolutionSection = () => (
    <section key="solution" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <img 
              src={products[1]?.imageUrl || "https://picsum.photos/seed/comfort/800/800"} 
              alt="Comfortable Cotton Dress" 
              className="rounded-3xl shadow-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-slate-900">
              {visitCount === 3 ? "এই ড্রেস গুলাই আপনার বাচ্চার জন্য প্রয়োজন" : "এই ড্রেসটাই আপনার বাচ্চার জন্য সঠিক চয়েস"}
            </h2>
            <ul className="space-y-6">
              {[
                "সুপার সফট কটন ফেব্রিক্স",
                "গরমে আরাম দেয়, ঘাম কমায়",
                "স্কিন-ফ্রেন্ডলি – কোনো জ্বালা বা অস্বস্তি নেই",
                "লাইটওয়েট – সারাদিন পরে থাকতে পারবে",
                "ডেইলি ইউজ + বাইরে যাওয়ার জন্য পারফেক্ট"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-green-100 p-1 rounded-full">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <span className="text-lg font-medium text-slate-700">{text}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={scrollToOrder}
              className="mt-10 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              অর্ডার করতে এখানে ক্লিক করুন
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const GallerySection = () => (
    <section key="gallery" className="py-20 bg-rose-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">সুন্দর ডিজাইন, বাচ্চার পছন্দ নিশ্চিত</h2>
          <p className="text-lg text-slate-600">🌸 ফ্লাওয়ার প্রিন্ট | 🦋 বাটারফ্লাই ডিজাইন | 🎨 কালারফুল ও ট্রেন্ডি লুক</p>
        </div>
        
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {products.length > 0 ? products.map((prod, i) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={prod.id} 
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-md bg-white p-2"
            >
              <img 
                src={prod.imageUrl || `https://picsum.photos/seed/${prod.id}/400/600`} 
                alt={prod.name} 
                className="w-full h-auto rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="p-4">
                <h3 className="font-bold text-slate-800">{prod.name}</h3>
                <p className="text-rose-600 font-bold">৳{prod.price}</p>
              </div>
            </motion.div>
          )) : (
            <div className="text-center text-slate-400 py-12">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-2xl font-bold text-slate-800">
            👉 আপনার বাচ্চা নিজেই পছন্দ করবে
          </p>
        </div>
      </div>
    </section>
  );

  const DetailsSection = () => (
    <section key="details" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <Ruler className="text-yellow-400" /> প্রোডাক্ট ডিটেইলস
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-yellow-400">📌</div>
                  <div>
                    <p className="text-slate-400 text-sm">ফেব্রিক</p>
                    <p className="text-lg font-semibold">100% কটন (GSM 170)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-yellow-400">📌</div>
                  <div>
                    <p className="text-slate-400 text-sm">সাইজ</p>
                    <p className="text-lg font-semibold">২ – ১২ বছর</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-yellow-400">📌</div>
                  <div>
                    <p className="text-slate-400 text-sm">ফিট</p>
                    <p className="text-lg font-semibold">কমফোর্ট ফিট</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-yellow-400">📌</div>
                  <div>
                    <p className="text-slate-400 text-sm">ব্যবহার</p>
                    <p className="text-lg font-semibold">ডেইলি + আউটডোর</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const TrustSection = () => (
    <section key="trust" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">কেন আমাদের প্রোডাক্ট নিবেন?</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "ছবির সাথে মিল", icon: <Star className="text-yellow-500" /> },
            { title: "কোয়ালিটি নিশ্চিত", icon: <ShieldCheck className="text-blue-500" /> },
            { title: "দ্রুত ডেলিভারি", icon: <Truck className="text-green-500" /> },
            { title: "ক্যাশ অন ডেলিভারি", icon: <ThumbsUp className="text-rose-500" /> }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-800">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const OfferSection = () => (
    <section key="offer" className="py-16 bg-rose-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <h2 className="text-4xl lg:text-5xl font-black mb-6">🎉 {content.offerText}</h2>
        </motion.div>
        <p className="text-xl mb-8 opacity-90">সীমিত সময়ের জন্য ডিসকাউন্ট! স্টক শেষ হওয়ার আগে অর্ডার করুন।</p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-4xl font-black">৳{content.offerPrice}</span>
          <span className="text-xl line-through opacity-60">৳{content.originalPrice}</span>
        </div>
        <button 
          onClick={scrollToOrder}
          className="px-10 py-5 bg-white text-rose-600 font-black text-xl rounded-2xl shadow-2xl hover:bg-rose-50 transition-colors"
        >
          অফারটি লুফে নিন
        </button>
      </div>
    </section>
  );

  const OrderFormSection = () => (
    <section key="order-form" id="order-form" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 bg-rose-50 rounded-[2.5rem] p-8 lg:p-16 shadow-xl border border-rose-100">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">আপনার বাচ্চার জন্য এখনই অর্ডার করুন</h2>
            <p className="text-lg text-slate-600 mb-8">নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-700">
                <ShieldCheck className="text-green-500" />
                <span>নিরাপদ অর্ডার</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Truck className="text-green-500" />
                <span>ডেলিভারির পর পেমেন্ট</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle className="text-green-500" />
                <span>কোনো হিডেন চার্জ নেই</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-inner">
              <p className="text-rose-600 font-bold text-lg mb-2">প্রয়োজনে কল করুন:</p>
              <a href="tel:01700000000" className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Phone size={24} className="text-rose-500" /> 017XX-XXXXXX
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 bg-white p-8 rounded-3xl shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmitOrder}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <UserIcon size={16} /> আপনার নাম
                </label>
                <input 
                  type="text" 
                  placeholder="নাম লিখুন"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} /> মোবাইল নাম্বার
                </label>
                <input 
                  type="tel" 
                  placeholder="মোবাইল নাম্বার লিখুন"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} /> আপনার ঠিকানা
                </label>
                <textarea 
                  placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Ruler size={16} /> সাইজ
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all bg-white"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                  >
                    <option>২-৪ বছর</option>
                    <option>৪-৬ বছর</option>
                    <option>৬-৮ বছর</option>
                    <option>৮-১০ বছর</option>
                    <option>১০-১২ বছর</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Package size={16} /> প্রোডাক্ট
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all bg-white"
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-rose-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <ShoppingCart />
                অর্ডার কনফার্ম করুন
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer key="footer" className="py-20 bg-slate-900 text-white text-center">
      <div className="container mx-auto px-4">
        <Heart className="text-rose-500 mx-auto mb-6 animate-bounce" size={48} />
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">আপনার ছোট্ট মেয়ের জন্য আরামদায়ক + সুন্দর ড্রেস খুঁজছেন?</h2>
        <p className="text-xl text-slate-400 mb-10">আজই অর্ডার করুন এবং পার্থক্য দেখুন। আমরা দিচ্ছি সেরা কোয়ালিটির নিশ্চয়তা।</p>
        <button 
          onClick={scrollToOrder}
          className="px-12 py-5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xl rounded-full transition-all flex items-center gap-2 mx-auto"
        >
          অর্ডার করতে ক্লিক করুন <ChevronRight />
        </button>
        
        <div className="mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500">© ২০২৬ লিটল প্রিন্সেস কালেকশন। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</a>
            <a href="#" className="hover:text-white transition-colors">রিফান্ড পলিসি</a>
            <a href="#" className="hover:text-white transition-colors">টার্মস এন্ড কন্ডিশন</a>
          </div>
        </div>
      </div>
    </footer>
  );

  // Dynamic Section Ordering Logic
  const renderSections = () => {
    const sections = {
      hero: <HeroSection />,
      problem: <ProblemSection />,
      solution: <SolutionSection />,
      gallery: <GallerySection />,
      details: <DetailsSection />,
      trust: <TrustSection />,
      offer: <OfferSection />,
      form: <OrderFormSection />,
    };

    let order: (keyof typeof sections)[] = ['hero', 'problem', 'solution', 'gallery', 'details', 'trust', 'offer', 'form'];

    if (visitCount === 2) {
      order = ['hero', 'gallery', 'problem', 'solution', 'details', 'trust', 'offer', 'form'];
    } else if (visitCount === 3) {
      order = ['hero', 'solution', 'problem', 'gallery', 'details', 'trust', 'offer', 'form'];
    } else if (visitCount === 4) {
      order = ['problem', 'hero', 'solution', 'gallery', 'details', 'trust', 'offer', 'form'];
    } else if (visitCount === 5) {
      order = ['offer', 'hero', 'problem', 'solution', 'gallery', 'details', 'trust', 'form'];
    }

    return order.map(key => (
      <React.Fragment key={key}>
        {sections[key]}
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen bg-rose-50 font-sans text-slate-800 selection:bg-rose-200">
      {renderSections()}
      <Footer />
    </div>
  );
}
