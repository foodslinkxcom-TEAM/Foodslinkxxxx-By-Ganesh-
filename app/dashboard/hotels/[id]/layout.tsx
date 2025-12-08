"use client"

import { useParams,useRouter } from "next/navigation"
import type { ReactNode } from "react";
import { useEffect,useState } from 'react';
import { DashboardLayout as SidebarNavigation, Navbar as TopNavbar } from '@/components/dashboard/Layout'
import { useMediaQuery } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/contexts/auth-context";

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const isMobile = useMediaQuery("(max-width: 768px)")
  const {user} = useAuth()
  let hotelName = "FoodslinkX"
  const fetchData = async() =>{
    if(user?.role !== "hotel") {
      router.push('/auth/login')
    }
    const res = await fetch(`/api/hotels/${hotelId}`)
    const data = await res.json();   
    if(!data.verified){
      router.push(`/dashboard/pending-verification`)
    }
    hotelName = data?.name
    console.log(data,hotelName);
  }

  useEffect(()=>{
    fetchData();

  },[user])



  return (
    <SidebarNavigation hotelId={hotelId}>
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900 relative overflow-x-hidden">
      
      {/* --- Ambient Background Glows (Optional Visual Flair) --- */}
      {/* <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none" /> */}

      {/* --- Navigation Layer --- */}
      {/* This component (from your import) likely handles:
         1. The Side Sidebar (on Desktop)
         2. The Bottom Floating Dock (on Mobile)
         We render it here so it's always present.
      */}
        
           <TopNavbar hotelName={hotelName} hotelId={hotelId} />
       

        {/* Page Content */}
        {/* <main className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"> */}
            {children}
        {/* </main> */}
    </div>
    </SidebarNavigation>
  )
}

export default Layout
