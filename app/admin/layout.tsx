"use client"

import { useParams } from "next/navigation"
import type { ReactNode } from "react"

import SuperAdminLayout from "@/components/admin/Layout"


interface LayoutProps {
  children: ReactNode
}
const Layout = ({ children}: LayoutProps) => {
   const params = useParams()
  return (
    <SuperAdminLayout>
        {children}
        </SuperAdminLayout>
  )
}

export default Layout
