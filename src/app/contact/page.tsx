import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { MapPin, Phone, Mail, Globe, Printer } from "lucide-react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings-store";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phoneLink = settings.phone.replace(/[^\d+]/g, "");
  const publicRelationsPhoneLink = settings.publicRelationsPhone.replace(/[^\d+]/g, "");
  return (
    <>
      <Navigation />
      <main className="flex-grow flex flex-col w-full bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-[var(--color-academic-navy)] text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
            <p className="text-xl text-gray-200">{settings.facultyNameTh} {settings.universityNameTh}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 w-full grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Address */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6 text-[var(--color-academic-navy)]">
              <div className="p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold">ที่อยู่</h2>
            </div>
            
            <div className="text-gray-600 space-y-2 text-lg leading-relaxed">
              <p className="font-semibold text-gray-900">{settings.facultyNameTh}</p>
              <p className="font-semibold text-gray-900">{settings.universityNameTh}</p>
              <p>{settings.address}</p>
            </div>
            <div className="w-full h-64 mt-8 rounded-xl overflow-hidden border border-gray-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8190.023039336076!2d104.74681198596954!3d17.38929786535634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313c0ea834c7a78f%3A0x287fc4dab0eb1806!2sFaculty%20of%20industrial%20Technology%20Nakhon%20Phanom%20University!5e1!3m2!1sen!2sth!4v1786415779730!5m2!1sen!2sth" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6 text-[var(--color-academic-navy)]">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Phone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold">ช่องทางสื่อสาร</h2>
            </div>
            
            <div className="space-y-6 text-gray-600">
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">งานประชาสัมพันธ์</p>
                  <a href={`tel:${publicRelationsPhoneLink}`} className="text-lg font-medium text-gray-900 hover:underline">{settings.publicRelationsPhone}</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">งานทะเบียนคณะ</p>
                  <a href={`tel:${phoneLink}`} className="text-lg font-medium text-gray-900 hover:underline">{settings.phone}</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Printer className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">โทรศัพท์ / โทรสาร</p>
                  <a href={`tel:${phoneLink}`} className="text-lg font-medium text-gray-900 hover:underline">{settings.phone}</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">E-Mail</p>
                  <a href={`mailto:${settings.email}`} className="text-lg font-medium text-[var(--color-academic-navy)] hover:underline">{settings.email}</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <div>
                  <p className="text-sm text-gray-500">Facebook</p>
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-[var(--color-academic-navy)] hover:underline">
                    {settings.facultyNameTh}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
