import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookOpen, Wrench, Briefcase, MonitorPlay, Plane } from "lucide-react";

export default function VocationalProgramsPage() {
  const departments = [
    {
      title: "ประเภทวิชาอุตสาหกรรม",
      icon: Wrench,
      programs: [
        "ช่างยนต์",
        "ช่างกลโรงงานอุตสาหกรรม",
        "ช่างก่อสร้าง",
        "สถาปัตยกรรม",
        "ช่างเชื่อมโลหะ",
        "ช่างไฟฟ้า",
        "อิเล็กทรอนิกส์"
      ]
    },
    {
      title: "ประเภทวิชาบริหารธุรกิจ",
      icon: Briefcase,
      programs: [
        "การบัญชี",
        "การตลาด",
        "การจัดการสำนักงานดิจิทัล"
      ]
    },
    {
      title: "ประเภทวิชาอุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ",
      icon: MonitorPlay,
      programs: [
        "เทคโนโลยีธุรกิจดิจิทัล"
      ]
    },
    {
      title: "ประเภทวิชาอุตสาหกรรมท่องเที่ยว",
      icon: Plane,
      programs: [
        "การโรงแรม"
      ]
    }
  ];

  return (
    <>
      <Navigation />
      
      <main className="flex-grow bg-gray-50 pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[var(--color-academic-navy)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-md">
                <BookOpen size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.)
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                เปิดรับสมัครผู้สำเร็จการศึกษาระดับมัธยมศึกษาตอนต้น (ม.3) หรือเทียบเท่า เพื่อเข้าศึกษาต่อในระดับประกาศนียบัตรวิชาชีพ โดยมุ่งเน้นการฝึกทักษะปฏิบัติจริงควบคู่กับทฤษฎี เพื่อผลิตช่างฝีมือและบุคลากรวิชาชีพที่มีคุณภาพ
              </p>
            </div>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-50 text-[var(--color-academic-navy)] rounded-xl flex items-center justify-center border border-yellow-100">
                      <Icon size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{dept.title}</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {dept.programs.map((program, pIndex) => (
                      <li key={pIndex} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-academic-navy)] mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{program}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  );
}
