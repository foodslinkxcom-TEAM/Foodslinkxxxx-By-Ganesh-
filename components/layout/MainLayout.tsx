"use client"

import type { ReactNode } from "react"
import ResponsiveNav from "./ResponsiveNav"
// import OrderStack from "./OrderStack" // Keep commented as per original
import { useMediaQuery } from "@/hooks/use-mobile"

interface MainLayoutProps {
  children: ReactNode
  hotelId: string
  tableId:string
}

export default function MainLayout({ children, hotelId, tableId }: MainLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden relative">
      
      {/* --- Ambient Background Effects --- */}
      {/* Top Right Red Glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none" />
      {/* Bottom Left Subtle Glow */}
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none" />

      {/* --- Navigation --- */}
      <ResponsiveNav hotelId={hotelId} tableId={tableId}/>

      {/* --- Main Content Area --- */}
      <main
        className={`
          relative flex-1 min-h-screen transition-all duration-300 ease-in-out
          ${!isMobile ? "ml-72 p-8" : "p-4 pb-32"}
        `}
      >
        {/* Content Wrapper with Entry Animation */}
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* <OrderStack /> */}
    </div>
  )
}