"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, ShoppingCart, ClipboardList, MessageSquare, Menu, X, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile"

interface ResponsiveNavProps {
  hotelId: string;
  tableId:string;
}

export default function ResponsiveNav({ hotelId,tableId }: ResponsiveNavProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const navItems = [
    { icon: Home, label: "Menu", path: `/hotels/${hotelId}/${tableId}` },
    { icon: ShoppingCart, label: "Cart", path: `/hotels/${hotelId}/${tableId}/cart` },
    { icon: ClipboardList, label: "Orders", path: `/hotels/${hotelId}/${tableId}/orders` },
    { icon: MessageSquare, label: "Feedback", path: `/hotels/${hotelId}/${tableId}/feedback` },
  ]

  const isActive = (path: string) => pathname === path

  // --- Mobile Design: Floating Island ---
  if (isMobile) {
    return (
      <div className="fixed bottom-6 left-4 right-4 z-50">
        <nav className="flex justify-between items-center bg-white/95 backdrop-blur-md border border-rose-100 rounded-2xl shadow-lg shadow-rose-900/10 px-6 py-3">
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
                
                
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    active 
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-110" 
                      : "text-slate-400 hover:text-rose-500"
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span 
                  className={`text-[10px] font-bold mt-1 transition-colors ${
                    active ? "text-rose-600" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
                {/* Active Indicator Dot */}
                {active && (
                  <span className="absolute  w-1 h-1 bg-rose-500 rounded-full animate-bounce" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    )
  }

  // --- Desktop Design: Modern Sidebar ---
  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white text-rose-600 shadow-md rounded-lg hover:bg-rose-50 transition-colors md:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white border-r border-rose-100 p-6 transition-transform duration-300 z-40 flex flex-col shadow-2xl shadow-rose-900/5 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Hotel Menu
          </h1>
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  active
                    ? "bg-rose-50 text-rose-600 shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-rose-500 hover:shadow-md hover:shadow-rose-100/50"
                }`}
              >
                {/* Active Left Border Accent */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r-full" />
                )}

                <div className="flex items-center gap-4 z-10">
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-300 ${active || "group-hover:scale-110"}`} 
                  />
                  <span className="font-semibold">{item.label}</span>
                </div>

                {active && <ChevronRight size={16} className="text-rose-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-4 py-4 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-xs text-rose-800 font-medium">Need help?</p>
          <p className="text-[10px] text-rose-500">Call waiter support</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  )
}