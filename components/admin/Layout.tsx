'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Building, Users, ShieldCheck, Menu, X, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMediaQuery } from '@/hooks/use-mobile'


interface HotelNavbarProps {
  hotelName: string
}

export function DashboardLayout() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Building, label: 'Hotels', path: '/admin/hotels' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: ShieldCheck, label: 'Verification', path: '/admin/verification-requests' },
    { icon: LogOut, label: 'Logout', path: '/auth/logout' },
  ]

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <h1 className="text-2xl font-bold text-primary mb-8">Admin Panel</h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  )
}

export function Navbar({ hotelName }: HotelNavbarProps) {
    return (
            <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-xl font-bold truncate">{hotelName}</h1>
                </div>
              </div>
            </nav>
    )
}
