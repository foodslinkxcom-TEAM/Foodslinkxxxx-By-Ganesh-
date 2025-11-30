"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ChevronRight, 
  Loader2,
  ShieldCheck
} from "lucide-react";

export default function ForgotPasswordPage() {
  // --- State ---
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP/NewPass, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Handlers ---

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      // In real app: await fetch('/api/auth/forgot-password', { email })
    }, 1500);
  };

  // Step 2: Verify & Reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      // In real app: await fetch('/api/auth/reset-password', { email, otp, password })
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* ================= LEFT SIDE: VISUAL (Desktop Only) ================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center p-12 text-white/90 max-w-lg">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
              <ShieldCheck size={40} className="text-rose-500" />
           </div>
           <h1 className="text-4xl font-bold mb-4 tracking-tight text-white">Secure Account Recovery</h1>
           <p className="text-lg text-slate-400 leading-relaxed">
             Don't worry, it happens to the best of us. We'll verify your identity and get you back to managing your hotel in no time.
           </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE: FORM ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 relative">
        
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          {step !== 3 && (
            <Link 
              href="/login" 
              className="absolute top-8 left-8 md:left-12 flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium text-sm"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          )}

          {/* --- STEP 1: ENTER EMAIL --- */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
                <p className="text-slate-500">Enter your email address and we'll send you a code to reset your password.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@hotel.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-[0.98] shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 size={20} className="animate-spin" /> Sending Code...</>
                  ) : (
                    <>Send Reset Code <ChevronRight size={18} /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* --- STEP 2: VERIFY & RESET --- */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
                <p className="text-slate-500">
                  We sent a code to <span className="font-bold text-slate-800">{email}</span>. <br/>
                  Please enter it below to create a new password.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Verification Code (OTP)</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-center tracking-widest font-mono text-lg"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="h-px bg-slate-100 my-4"></div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        required
                        minLength={6}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
                      >
                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-rose-600 transition-all active:scale-[0.98] shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 size={20} className="animate-spin" /> Resetting...</>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button 
                  onClick={() => setStep(1)} 
                  className="text-sm text-slate-400 hover:text-slate-600 underline"
                >
                  Wrong email? Go back
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: SUCCESS --- */}
          {step === 3 && (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Password Reset!</h2>
              <p className="text-slate-500 mb-8">
                Your password has been updated successfully. You can now log in with your new credentials.
              </p>
              
              <Link href="/login">
                <button className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30">
                  Back to Login
                </button>
              </Link>
            </div>
          )}

        </div>

        {/* Footer (Mobile only) */}
        <div className="absolute bottom-6 text-xs text-slate-300 md:hidden">
          &copy; 2024 FoodsLinkX
        </div>
      </div>
    </div>
  );
}