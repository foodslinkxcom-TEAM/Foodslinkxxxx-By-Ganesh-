import React from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-bold mb-6 border border-red-100">
             🚀 The #1 Food Tech Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            Manage your Restaurant <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            From QR Menus to Kitchen Display Systems. We provide the complete ecosystem to run your food business efficiently.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <PlayCircle size={20} /> Watch Demo
            </button>
          </div>
        </div>

        {/* Platform Visual */}
        <div className="relative mx-auto max-w-5xl mt-12">
           <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-20"></div>
           <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden aspect-[16/9]">
              {/* Replace with your actual Dashboard Screenshot */}
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
                alt="FoodsLinkx Dashboard Interface" 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
              
              {/* Floating UI Elements */}
              <div className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                 <div className="text-xs font-bold text-slate-400 uppercase">Total Revenue</div>
                 <div className="text-2xl font-bold text-slate-900">$12,450.00</div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}