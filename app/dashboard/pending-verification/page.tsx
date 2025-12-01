"use client";

import Link from "next/link";
import { Hourglass, Mail, ArrowLeft, ShieldCheck } from "lucide-react";

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full relative z-10">
        
        {/* Icon Wrapper */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-amber-50 p-6 rounded-full border border-amber-100">
            <Hourglass className="text-amber-500 animate-pulse" size={48} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
          Verification Pending
        </h1>
        
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          We've received your registration! Our team is currently reviewing your hotel details to ensure quality and security.
        </p>

        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-8 text-sm text-slate-600 flex items-start gap-3 text-left">
          <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={18} />
          <span>
            Most reviews are completed within <strong>24 hours</strong>. You will receive an email immediately upon approval.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href="/" 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <ArrowLeft size={18} /> Back Home
          </Link>
          <a
            href="mailto:foodslinkx@gmail.com"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            <Mail size={18} /> Contact Support
          </a>
        </div>
        
      </div>
    </div>
  );
}