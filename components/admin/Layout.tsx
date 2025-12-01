"use client"

import { ReactNode, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile" 
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ShieldAlert,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  CreditCard,
  FileText
} from "lucide-react"

// --- Types ---
interface SuperAdminLayoutProps {
  children: ReactNode
  userName?: string
}

export default function SuperAdminLayout({ 
  children, 
  userName = "Super Admin" 
}: SuperAdminLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content Wrapper */}
      <main 
        className={`
          relative min-h-screen transition-all duration-300 ease-in-out flex flex-col
          ${!isMobile ? "ml-72" : "pb-24"} 
        `}
      >
        {/* Top Navbar (Fixed) */}
        

        {/* Page Content */}
        <div className="flex-1 md:p-8 pt-24 md:pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  )
}

// --- Sub-Component: Desktop Sidebar ---
function DesktopSidebar() {
  const pathname = usePathname()

  // Full Menu for Desktop
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Building2, label: "Hotels", path: "/admin/hotels" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: ShieldCheck, label: "Verifications", path: "/admin/verification-requests" },
    { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: Settings, label: "System Settings", path: "/admin/settings" },
  ]

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === path;
    return pathname.startsWith(path);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-red-100 p-6 z-40 flex flex-col shadow-2xl shadow-red-900/5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Master Panel</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Super Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${active 
                  ? "bg-red-50 text-red-700 font-semibold shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${active ? "text-red-600" : "text-slate-400 group-hover:text-red-500"}`} 
              />
              <span className="relative z-10">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </Link>
      </div>
    </aside>
  )
}

// --- Sub-Component: Mobile Navigation (Floating Dock) ---
function MobileNav() {
  const pathname = usePathname()
  
  // DIFFERENT MENU LIST for Mobile (Simplified)
  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/admin" },
    { icon: Building2, label: "Hotels", path: "/admin/hotels" },
    { icon: ShieldCheck, label: "Verify", path: "/admin/verification-requests" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ]

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === path;
    return pathname.startsWith(path);
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <nav className="flex justify-between items-center bg-white/95 backdrop-blur-xl border border-red-200/50 rounded-2xl shadow-xl shadow-red-900/10 px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                active ? "-translate-y-2" : "hover:-translate-y-1"
              }`}
            >
              {active && (
                <span className="absolute -top-10 w-1 h-1 bg-red-500 rounded-full animate-bounce shadow-glow" />
              )}
              
              <div
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  active 
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-110 rotate-3" 
                    : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// --- Sub-Component: Top Navbar ---
function Navbar({ userName, isMobile }: { userName: string, isMobile: boolean }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={`
       fixed top-0 z-30 w-full transition-all duration-300
       ${isMobile ? "left-0 right-0 px-4 py-3" : "pl-72 pr-8 py-4"}
    `}>
      <div className="bg-white/80 backdrop-blur-xl border-b border-red-100/50 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl shadow-sm flex items-center justify-between">
        
        {/* Left: Mobile Brand or Desktop Search */}
        {isMobile ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
              <ShieldAlert size={18} />
            </div>
            <span className="font-bold text-slate-800">Master</span>
          </div>
        ) : (
          <div className="flex items-center bg-slate-100/80 rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-red-300 focus-within:bg-white transition-all">
            <Search size={16} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search hotels, users..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          
          <button className="relative p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 md:gap-3 pl-1 md:pl-3 pr-1 md:pr-2 py-1 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-red-100 rounded-full transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-sm font-bold text-slate-700 leading-none">{userName}</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-red-900/10 border border-red-100 overflow-hidden py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="px-4 py-3 border-b border-slate-50 md:hidden bg-slate-50/50">
                   <p className="text-sm font-bold text-slate-800">{userName}</p>
                   <p className="text-xs text-slate-500">Super Administrator</p>
                </div>
                
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={16} />
                  System Settings
                </Link>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <Link
                  href="/auth/logout"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  onClick={() => setDropdownOpen(false)}
                >
                  <LogOut size={16} />
                  Sign Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}