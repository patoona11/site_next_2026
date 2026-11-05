import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { GraduationCap, Zap, Settings } from "lucide-react";

export default function PhdProgramsPage() {
  return (
    <>
      <Navigation />
      <main className="flex-grow flex flex-col w-full bg-gray-50 min-h-screen">
        <div className="bg-[var(--color-academic-navy)] text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">หลักสูตรปริญญาเอก</h1>
            <p className="text-xl text-gray-200">คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 w-full">
          <h2 className="text-2xl font-semibold text-[var(--color-academic-navy)] mb-6 flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            หลักสูตรปรัชญาดุษฎีบัณฑิต (ปร.ด.)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาวิศวกรรมไฟฟ้า</h3>
                <p className="text-gray-600 text-sm">หลักสูตรปรัชญาดุษฎีบัณฑิต (ปร.ด.)</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาเทคโนโลยีอุตสาหกรรม</h3>
                <p className="text-gray-600 text-sm">หลักสูตรปรัชญาดุษฎีบัณฑิต (ปร.ด.)</p>
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
