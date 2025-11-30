'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChefHat, Home, ArrowLeft, HelpCircle } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        
        {/* Illustration Placeholder - Replace src with an actual fun SVG/Image */}
        <div className="mb-8 relative flex justify-center">
           {/* A background glow effect */}
           <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full transform scale-150 z-0"></div>
           
           {/* Using an icon as a placeholder for an illustration */}
           <div className="relative z-10 bg-white p-8 rounded-full shadow-xl border border-slate-100">
             <ChefHat size={80} className="text-rose-500 opacity-80" strokeWidth={1.5} />
             <div className="absolute -bottom-2 -right-2 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
               404 Error
             </div>
           </div>
        </div>
        
        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Oops! That dish isn't on the menu.
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          The page you're looking for seems to have gotten lost in the kitchen. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link href="/" className="group">
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95 w-full sm:w-auto">
              <Home size={18} />
              Return to Home
            </button>
          </Link>
        </div>

        <div className="mt-12 text-slate-400 text-sm flex items-center justify-center gap-2">
          <HelpCircle size={14} />
          <span>Need help? <a href="/contact" className="text-rose-600 hover:underline">Contact Support</a></span>
        </div>

      </div>
    </div>
  )
}