import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import QuickLinks from "@/components/QuickLinks";
import NewsSection from "@/components/NewsSection";
import FacultyHighlights from "@/components/FacultyHighlights";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex-grow flex flex-col w-full bg-white">
        <HeroCarousel />
        <QuickLinks />
        <NewsSection />
        <FacultyHighlights />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
