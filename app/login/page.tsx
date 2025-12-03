"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react"

export default function RedirectPage() {
  const router = useRouter()
  const [count, setCount] = useState(5)

  useEffect(() => {
    // Redirect logic
    if (count === 0) {
      router.push("/auth/login")
      return
    }

    // Countdown timer
    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    // Cleanup
    return () => clearTimeout(timer)
  }, [count, router])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-in zoom-in-95 duration-500">
        
        {/* Icon Animation */}
        <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-4 border-rose-100 rounded-full animate-ping opacity-20"></div>
          <ShieldCheck size={40} className="text-rose-600" />
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Action Successful
        </h1>
        <p className="text-slate-500 mb-8">
          We are redirecting you to the secure login page to access your account.
        </p>

        {/* Countdown Circle */}
        <div className="relative mb-8 flex justify-center">
           <svg className="w-24 h-24 transform -rotate-90">
             <circle
               cx="48"
               cy="48"
               r="40"
               stroke="currentColor"
               strokeWidth="4"
               fill="transparent"
               className="text-slate-100"
             />
             <circle
               cx="48"
               cy="48"
               r="40"
               stroke="currentColor"
               strokeWidth="4"
               fill="transparent"
               strokeDasharray={251.2}
               strokeDashoffset={251.2 - (251.2 * count) / 5}
               className="text-rose-600 transition-all duration-1000 ease-linear"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-2xl font-bold text-slate-800">{count}</span>
           </div>
        </div>

        {/* Manual Action */}
        <button
          onClick={() => router.push("/auth/login")}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
        >
          Login Now <ArrowRight size={18} />
        </button>
        
        <p className="text-xs text-slate-400 mt-4 font-medium">
            Auto-redirecting in {count} seconds...
        </p>
      </div>
    </div>
  )
}