"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import SuperAdminLayout from "@/components/admin/Layout"
import { useAuth } from "@/lib/contexts/auth-context"


interface LayoutProps {
  children: ReactNode
}
const Layout = ({ children}: LayoutProps) => {
   const { user } = useAuth();
   const router = useRouter()
   useEffect(()=>{
    if(user?.role !== 'admin'){
      router.push('/auth/login')
    }
   },[user])
  return (
    <SuperAdminLayout>
        {children}
        </SuperAdminLayout>
  )
}

export default Layout
