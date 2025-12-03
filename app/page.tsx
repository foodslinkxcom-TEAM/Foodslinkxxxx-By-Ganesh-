 "use client"

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import FeaturedRestaurants from "@/components/landing/FeaturedRestaurants";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Services from "@/components/landing/Services";
import BlogSection from "@/components/landing/BlogSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col font-sans text-gray-900 bg-orange-50/30 selection:bg-red-200 selection:text-red-900">
      
      {/* Global Animations for this page */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}</style>

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-red-50"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />
      
      <div className="flex-1">
        <Hero />
        <Services/>
        <HowItWorks />
        <BlogSection/>
        {/* <FeaturedRestaurants /> */}
        <FeaturesGrid />
      </div>

      <Footer />
    </main>
  );
}