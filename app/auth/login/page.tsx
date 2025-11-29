"use client"

import type React from "react"
import Link from "next/link"
import { Eye, EyeOff, ChefHat, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

export default function LoginPage() {
  const { login, error, loading } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* --- LEFT SIDE: Image (Desktop Only) --- */}
      {/* hidden on mobile/tablet, flex on large screens (50% width) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" 
            alt="Restaurant Ambience" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/40 to-transparent mix-blend-multiply" />

        {/* Content over Image */}
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
            <ChefHat size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Taste the best food in your city.
          </h2>
          <p className="text-red-100 text-lg leading-relaxed">
            "FoodsLinkx has transformed how I order dinner. The delivery is lightning fast and the choices are endless."
          </p>
          <div className="mt-8 flex items-center gap-4">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-red-900 bg-gray-300 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                  </div>
                ))}
             </div>
             <p className="text-sm font-medium">Joined by 10,000+ foodies</p>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form (Full Width Mobile, 50% Desktop) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
        
        {/* Mobile Background decoration (Subtle) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="w-full max-w-md relative z-10 space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-semibold text-gray-700">Password</label>
                 <Link href="/auth/forgot-password" className="text-xs font-semibold text-red-600 hover:text-red-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer / Signup Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              New to FoodsLinkx?{" "}
              <Link href="/auth/signup" className="font-bold text-red-600 hover:text-red-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}