"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChefHat, Menu, X, ChevronRight, LogIn, UserPlus } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { name: "About Us", href: "https://foodslinkx.com/about" },
    { name: "Pricing", href: "https://foodslinkx.com/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-2 group z-50 relative">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <ChefHat size={24} />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
              FoodsLinkx
            </span>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* --- DESKTOP ACTIONS --- */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login" className="text-slate-900 font-bold hover:text-red-600 transition-colors">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            className="md:hidden text-slate-800 p-2 z-50 relative" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR (DRAWER) --- */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-visibility duration-300 ${isMenuOpen ? 'visible' : 'invisible delay-300'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar Content */}
        <div 
          className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 pt-24 flex-1 flex flex-col">
            
            {/* Mobile Links */}
            <div className="space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl text-lg font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  {item.name}
                  <ChevronRight size={18} className="opacity-50" />
                </Link>
              ))}
            </div>

            <div className="my-8 border-t border-slate-100"></div>

            {/* Mobile Actions */}
            <div className="space-y-4">
              <Link 
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-slate-100 font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <LogIn size={18} /> Log In
              </Link>
              <Link 
                href="/auth/signup"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all"
              >
                <UserPlus size={18} /> Get Started
              </Link>
            </div>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-6 bg-slate-50 text-center text-xs text-slate-400">
             &copy; FoodsLinkx. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}