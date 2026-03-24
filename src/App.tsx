import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [investment, setInvestment] = useState<string>('');
  const [result, setResult] = useState<{ monthly: number; yearly: number } | null>(null);

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

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    alert("ধন্যবাদ! আমরা আপনার সাথে যোগাযোগ করবো");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HERO */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
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
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            রানিং সুপার শপে পার্টনার হওয়ার সুযোগ
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto space-y-2"
          >
            <p>প্রথম মাস থেকেই আয় শুরু</p>
            <p className="text-green-400 font-bold">👉 সীমিত স্লট — এখনই আবেদন করুন</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#form" 
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
            >
              পার্টনার হতে চাই <ArrowRight size={20} />
            </a>
            <a 
              href="https://wa.me/8801911110476" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} /> WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* LOCATION & EXPANSION */}
      <section className="py-20">
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
                <img 
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
      </section>

      {/* INVESTOR VS PARTNER */}
      <section className="py-20 bg-slate-950 text-white overflow-hidden relative">
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
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
              <h3 className="text-2xl font-bold mb-8 text-slate-400">একজন ইনভেস্টর সাধারণত শুধু দেখেন—</h3>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-xl">
                  <span className="text-3xl">📊</span> লাভ হচ্ছে কি না, কত রিটার্ন আসছে
                </li>
              </ul>
            </div>
            
            <div className="bg-green-600 p-10 rounded-[2.5rem] shadow-2xl shadow-green-900/40">
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
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-3xl font-black text-slate-300">
              👉 সহজভাবে বললে, <br/>
              <span className="text-white">ইনভেস্টর টাকা দেন — পার্টনার ব্যবসা গড়ে তোলেন</span>
            </p>
          </div>
        </div>
      </section>

      {/* WHY PARTNERS? */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center max-w-6xl mx-auto">
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
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
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <CheckCircle className="text-green-600 shrink-0" size={24} />
                    <p className="font-bold text-lg">{text}</p>
                  </div>
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
      </section>

      {/* LEGAL SECURITY */}
      <section className="py-20 bg-slate-50">
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
                    <li key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-lg font-bold">
                      <span className="text-2xl">{item.icon}</span> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80" 
                    alt="Legal Contract" 
                    className="rounded-[2.5rem] shadow-2xl transition-transform group-hover:scale-[1.02] duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 rounded-[2.5rem]"></div>
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
      </section>

      {/* INVESTMENT */}
      <section className="py-20">
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
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" 
                  alt="Business partnership" 
                  className="rounded-2xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFIT CALCULATOR */}
      <section className="py-20 bg-slate-100">
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
              <button 
                onClick={calculateProfit}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
              >
                ক্যালকুলেট করুন
              </button>
              
              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-600 text-sm mb-1">মাসিক প্রফিট</p>
                      <p className="text-2xl font-black text-blue-900">৳{result.monthly.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 text-sm mb-1">বার্ষিক প্রফিট</p>
                      <p className="text-2xl font-black text-blue-900">৳{result.yearly.toFixed(0)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
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
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">Q</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 pl-9">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="py-20 bg-slate-900 text-white">
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
                    className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">মোবাইল নাম্বার</label>
                  <input 
                    type="text" 
                    placeholder="মোবাইল নাম্বার" 
                    required
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
                  className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-xl transition-all shadow-lg shadow-green-900/20"
              >
                সাবমিট করুন
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-center border-t border-white/5">
        <div className="container mx-auto px-4">
          <p>© ২০২৬ সুপার শপ পার্টনারশিপ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
