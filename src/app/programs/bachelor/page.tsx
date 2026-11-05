import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { BookOpen, GraduationCap, Wrench, Zap, Cpu, Building2 } from "lucide-react";

export default function BachelorProgramsPage() {
  return (
    <>
      <Navigation />
      <main className="flex-grow flex flex-col w-full bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-[var(--color-academic-navy)] text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">หลักสูตรปริญญาตรี (2 ปีต่อเนื่อง)</h1>
            <p className="text-xl text-gray-200">คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--color-academic-navy)] mb-6 flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาวิศวกรรมอุตสาหการ</h3>
                  <p className="text-gray-600 text-sm">หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาวิศวกรรมเครื่องกล</h3>
                  <p className="text-gray-600 text-sm">หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาวิศวกรรมไฟฟ้า</h3>
                  <p className="text-gray-600 text-sm">หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาวิชาวิศวกรรมอิเล็กทรอนิกส์และหุ่นยนต์</h3>
                  <p className="text-gray-600 text-sm">หลักสูตรอุตสาหกรรมศาสตรบัณฑิต (อส.บ.)</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-academic-navy)] mb-6 flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              หลักสูตรวิทยาศาสตร์บัณฑิต (วท.บ.)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg text-[var(--color-academic-navy)]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">สาขาเทคโนโลยีสถาปัตยกรรมและการก่อสร้าง</h3>
                  <p className="text-gray-600 text-sm">หลักสูตรวิทยาศาสตร์บัณฑิต (วท.บ.)</p>
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
