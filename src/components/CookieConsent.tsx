"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Link from "next/link";
import { Settings, X, Check } from "lucide-react";

type Language = "en" | "th";

const text = {
  en: {
    title: "Cookie Consent",
    message: "This website uses cookies to improve user experience. By using our website you consent to all cookies in accordance with our Cookie Policy.",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    manage: "Manage Settings",
    policy: "Cookie Policy",
    save: "Save Preferences",
    categories: {
      necessary: {
        title: "Strictly Necessary",
        desc: "These cookies are required for the website to function properly. They cannot be disabled.",
      },
      analytics: {
        title: "Analytics & Performance",
        desc: "Helps us understand how visitors interact with the website.",
      },
      marketing: {
        title: "Marketing & Targeting",
        desc: "Used to track visitors across websites to display relevant ads.",
      }
    }
  },
  th: {
    title: "นโยบายคุกกี้",
    message: "เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของผู้ใช้ เมื่อคุณใช้งานเว็บไซต์ของเรา ถือว่าคุณยินยอมให้มีการใช้คุกกี้ทั้งหมดตามนโยบายคุกกี้ของเรา",
    acceptAll: "ยอมรับทั้งหมด",
    rejectAll: "ปฏิเสธทั้งหมด",
    manage: "จัดการการตั้งค่า",
    policy: "นโยบายคุกกี้",
    save: "บันทึกการตั้งค่า",
    categories: {
      necessary: {
        title: "จำเป็นอย่างยิ่ง",
        desc: "คุกกี้เหล่านี้จำเป็นสำหรับการทำงานที่เหมาะสมของเว็บไซต์ ไม่สามารถปิดใช้งานได้",
      },
      analytics: {
        title: "การวิเคราะห์และประสิทธิภาพ",
        desc: "ช่วยให้เราเข้าใจว่าผู้เยี่ยมชมโต้ตอบกับเว็บไซต์อย่างไร",
      },
      marketing: {
        title: "การตลาดและการกำหนดเป้าหมาย",
        desc: "ใช้สำหรับติดตามผู้เยี่ยมชมข้ามเว็บไซต์เพื่อแสดงโฆษณาที่เกี่ยวข้อง",
      }
    }
  }
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lang, setLang] = useState<Language>("th");
  
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    // Check if consent is already given
    const consent = Cookies.get("itech_cookie_consent");
    if (!consent) {
      // Small delay for auto fade-in effect
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
    
  }, []);

  const handleAcceptAll = () => {
    Cookies.set("itech_cookie_consent", JSON.stringify({ necessary: true, analytics: true, marketing: true }), { expires: 365 });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    Cookies.set("itech_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false }), { expires: 365 });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveSettings = () => {
    Cookies.set("itech_cookie_consent", JSON.stringify({ necessary: true, analytics: analyticsEnabled, marketing: marketingEnabled }), { expires: 365 });
    setShowBanner(false);
    setShowModal(false);
  };

  const t = text[lang];

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
          >
            <div className="max-w-4xl mx-auto glass dark:glass border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-[var(--color-tech-indigo)] blur-[80px] rounded-full opacity-20 pointer-events-none" />
              
              <div className="flex-1 pr-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{t.title}</h3>
                  <div className="flex gap-1 text-xs font-medium">
                    <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-[var(--color-academic-navy)] text-white" : "text-gray-400 hover:text-white"}`}>EN</button>
                    <button onClick={() => setLang("th")} className={`px-2 py-1 rounded ${lang === "th" ? "bg-[var(--color-academic-navy)] text-white" : "text-gray-400 hover:text-white"}`}>TH</button>
                  </div>
                </div>
                <p className="text-sm opacity-80 mb-2">
                  {t.message}
                </p>
                <Link href="/cookie-policy" className="text-[var(--color-tech-indigo-light)] text-sm font-medium hover:underline">
                  {t.policy}
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
                <button 
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Settings className="w-4 h-4" />
                  {t.manage}
                </button>
                <button 
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  {t.rejectAll}
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--color-tech-indigo)] hover:bg-[var(--color-academic-navy-light)] text-white transition-all hover:scale-105 whitespace-nowrap"
                >
                  {t.acceptAll}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GDPR Settings Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !showBanner && setShowModal(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[var(--color-slate-900)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-bold">{t.manage}</h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    if (!Cookies.get("itech_cookie_consent")) setShowBanner(true);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Necessary (Always active) */}
                <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="mt-1 w-6 h-6 rounded bg-[var(--color-academic-navy)] flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{t.categories.necessary.title}</h3>
                    <p className="text-sm text-gray-400">{t.categories.necessary.desc}</p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <button 
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`mt-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${analyticsEnabled ? 'bg-[var(--color-tech-indigo)] border-[var(--color-tech-indigo)]' : 'border-gray-500'}`}
                  >
                    {analyticsEnabled && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="cursor-pointer" onClick={() => setAnalyticsEnabled(!analyticsEnabled)}>
                    <h3 className="font-bold mb-1">{t.categories.analytics.title}</h3>
                    <p className="text-sm text-gray-400">{t.categories.analytics.desc}</p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex gap-4 items-start p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <button 
                    onClick={() => setMarketingEnabled(!marketingEnabled)}
                    className={`mt-1 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${marketingEnabled ? 'bg-[var(--color-tech-indigo)] border-[var(--color-tech-indigo)]' : 'border-gray-500'}`}
                  >
                    {marketingEnabled && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="cursor-pointer" onClick={() => setMarketingEnabled(!marketingEnabled)}>
                    <h3 className="font-bold mb-1">{t.categories.marketing.title}</h3>
                    <p className="text-sm text-gray-400">{t.categories.marketing.desc}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button 
                  onClick={handleRejectAll}
                  className="px-6 py-2 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
                >
                  {t.rejectAll}
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveSettings}
                    className="px-6 py-2 text-sm font-medium rounded-lg border border-[var(--color-tech-indigo)] text-[var(--color-tech-indigo-light)] hover:bg-[var(--color-tech-indigo)]/10 transition-colors w-full sm:w-auto"
                  >
                    {t.save}
                  </button>
                  <button 
                    onClick={handleAcceptAll}
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-[var(--color-tech-indigo)] hover:bg-[var(--color-academic-navy-light)] text-white transition-all w-full sm:w-auto"
                  >
                    {t.acceptAll}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
