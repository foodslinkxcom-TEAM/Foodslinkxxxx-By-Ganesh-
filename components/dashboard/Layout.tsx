"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile"
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Receipt, 
  MessageSquare, 
  QrCode, 
  Settings, 
  LogOut, 
  ChefHat,
  ChevronDown,
  Bell
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  hotelId: string
}

export function DashboardLayout({ children, hotelId }: DashboardLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar hotelId={hotelId} />}

      {/* Main Content Area */}
      <main 
        className={`
          relative min-h-screen transition-all duration-300 ease-in-out print:ml-0 print:p-0
          ${!isMobile ? "ml-72 p-8" : "pb-24"} 
        `}
      >
          {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav hotelId={hotelId} />}
    </div>
  )
}

// --- Sub-Component: Desktop Sidebar ---
function DesktopSidebar({ hotelId }: { hotelId: string }) {
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: `/dashboard/hotels/${hotelId}` },
    { icon: UtensilsCrossed, label: "Menu Management", path: `/dashboard/hotels/${hotelId}/menu` },
    { icon: ClipboardList, label: "Live Orders", path: `/dashboard/hotels/${hotelId}/orders` },
    { icon: Receipt, label: "Invoices", path: `/dashboard/hotels/${hotelId}/invoices` },
    { icon: QrCode, label: "QR Generator", path: `/dashboard/hotels/${hotelId}/qr` },
    { icon: MessageSquare, label: "Feedback", path: `/dashboard/hotels/${hotelId}/feedback` },
    { icon: Settings, label: "Settings", path: `/dashboard/hotels/${hotelId}/settings` },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <>  <style jsx global>{`
      @media print {
        @page {
          margin: 0;
          size: auto;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-color: white !important;
        }
        /* Hide default browser headers/footers if possible */
      }
    `}</style>
    <aside className="print:hidden print fixed left-0 top-0 h-screen w-72 bg-white border-r border-rose-100 p-6 z-40 flex flex-col shadow-2xl shadow-rose-900/5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
          <ChefHat size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active 
                  ? "bg-rose-50 text-rose-700 font-semibold shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${active ? "text-rose-600" : "text-slate-400 group-hover:text-rose-500"}`} 
              />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </aside>
    </>
  )
}

// --- Sub-Component: Mobile Navigation (Floating Dock) ---
function MobileNav({ hotelId }: { hotelId: string }) {
  const pathname = usePathname()
  
  // Reduced items for mobile to save space
  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: `/dashboard/hotels/${hotelId}` },
    { icon: ClipboardList, label: "Orders", path: `/dashboard/hotels/${hotelId}/orders` },
    { icon: UtensilsCrossed, label: "Menu", path: `/dashboard/hotels/${hotelId}/menu` },
    { icon: Settings, label: "Settings", path: `/dashboard/hotels/${hotelId}/settings` },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 print:hidden">
      <nav className="flex justify-between items-center bg-white/95 backdrop-blur-xl border border-rose-100 rounded-2xl shadow-xl shadow-rose-900/10 px-6 py-4">
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
                <span className="absolute -top-10 w-1 h-1 bg-rose-500 rounded-full animate-bounce" />
              )}
              
              <div
                className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  active 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110 rotate-3" 
                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}


interface HotelNavbarProps {
  hotelName: string
  hotelId: string
  userName?: string // Optional: To show who is logged in
}

export function Navbar({ hotelName, hotelId, userName = "Manager" }: HotelNavbarProps) {
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
    <header className="print:hidden sticky top-0 z-30 w-full mb-8">
      {/* Glassmorphism Container */}
      <div className="bg-white/80 backdrop-blur-md border-b border-rose-100 px-6 py-4 rounded-b-2xl md:rounded-2xl md:mx-0 md:mt-2 shadow-sm flex items-center justify-between">
        
        {/* Left: Hotel Identity */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text text-transparent">
            {hotelName}
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden md:block">
            Dashboard Overview
          </span>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Notification Bell (Visual only) */}
          <button className="relative p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors hidden md:block">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-rose-100 rounded-full transition-all duration-200"
            >
              <div className="w-8 h-8 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 font-bold text-sm">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-sm font-bold text-slate-700 leading-none">{userName}</p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl shadow-rose-900/10 border border-rose-100 overflow-hidden py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                  <p className="text-sm font-bold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
                
                <Link
                  href={`/dashboard/hotels/${hotelId}/settings`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <Link
                  href="/auth/logout"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <LogOut size={16} />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}