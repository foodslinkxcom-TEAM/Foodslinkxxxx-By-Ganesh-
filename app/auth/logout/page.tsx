'use client'

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import Link from 'next/link';
import { LogIn, Home, ChefHat, UtensilsCrossed } from 'lucide-react';

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/50 relative overflow-hidden font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-white/60">
        
        {/* Hero Icon */}
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 relative group">
          <ChefHat size={48} className="transform transition-transform group-hover:rotate-12 duration-300" />
          <div className="absolute -right-2 -bottom-2 bg-orange-500 text-white p-2 rounded-full border-4 border-white">
            <UtensilsCrossed size={16} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          See You Soon!
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          You have been successfully logged out. We hope you enjoyed your meal. Come back when you're hungry!
        </p>

        <div className="flex flex-col gap-3">
            <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-red-300 transform hover:-translate-y-0.5 transition-all duration-200"
            >
                <LogIn size={20} />
                <span>Login Again</span>
            </Link>
            
            <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 hover:text-red-600 transition-all duration-200"
            >
                <Home size={20} />
                <span>Return to Home</span>
            </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
           <p className="text-xs text-gray-400">FoodsLinkx &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}