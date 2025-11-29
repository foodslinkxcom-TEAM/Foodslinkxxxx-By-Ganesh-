"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, ShoppingCart, ClipboardList, MessageSquare, Menu, X,LogOut,Settings, QrCode, Receipt, MoreVertical  } from "lucide-react"

import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile"

interface ResponsiveNavProps {
  hotelId: string
}


interface HotelNavbarProps {
    hotelName: string
    hotelId: string
  }

export function DashboardLayout({ hotelId }: ResponsiveNavProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const isActive = (path: string) => {
    // Path for dashboard home (no hotel selected)
    if (path === '') {
      // Match exactly `/dashboard/hotels/[hotelId]`
      return /^\/dashboard\/hotels\/[^/]+$/.test(pathname)
    }
  
    // Path for a given submenu (like menu, orders etc.)
    // This matches `/dashboard/hotels/[hotelId]/menu`, `/orders`, etc.
    return pathname === `/dashboard/hotels/${hotelId}/${path}`
  }
  
  const navItems = [
    { icon: Home, label: "Home", path: `` },
    { icon: ShoppingCart, label: "Menu", path: `menu` },
    { icon: ClipboardList, label: "Orders", path: `orders` },
    { icon: Receipt, label: "Invoices", path: `invoices` },
    { icon: MessageSquare, label: "Feedback", path: `feedback` },
    { icon: QrCode, label: "QR Code", path: `qr` },       // New QR route
    { icon: Settings, label: "Settings", path: `settings` },
  ];

  const bottomNavItems = [
    { icon: QrCode, label: "QR Code", path: `qr` },
    { icon: MessageSquare, label: "Feedback", path: `feedback` },
    { icon: ClipboardList, label: "Orders", path: `orders` },
    { icon: ShoppingCart, label: "Menu", path: `menu` },
    { icon: Receipt, label: "Invoices", path: `invoices` },
  ];

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-40">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                href={`/dashboard/hotels/${hotelId}/${item.path}`}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  // Desktop Sidebar
  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 hover:bg-secondary rounded-lg transition-colors md:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r-2 border-border p-6 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h1 className="text-2xl font-bold text-primary mb-8">Hotel Dashboard</h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                href={`/dashboard/hotels/${hotelId}/${item.path}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link
                href="/auth/logout"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors`}
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </Link>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  )
}

export function Navbar({ hotelName, hotelId }: HotelNavbarProps) {
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
            <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-xl font-bold truncate">{hotelName}</h1>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="p-2 hover:bg-primary-foreground/10 rounded"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-primary-foreground text-foreground rounded shadow-lg z-50 min-w-[120px]">
                        <Link
                          href={`/dashboard/hotels/${hotelId}/settings`}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <Link
                          href={`/dashboard/hotels/${hotelId}/logout`}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary"
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
            </nav>
    )
  }
