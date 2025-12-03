"use client"

import { ReactNode, useEffect, useState } from "react"
import { useParams, usePathname } from "next/navigation" 
import { setWithExpiry, getWithExpiry } from "@/lib/utils/localStorageWithExpiry"
import { Loader2, UtensilsCrossed, AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
}

export default function HotelOrderLayout({ children }: Props) {
  // 1. Get Params from URL path (e.g., /hotel/[id]/table/[tableId])
  const params = useParams()
  const pathname = usePathname()
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Logic: Skip checks if we are on invoice or payment pages
  const requiresTable = !pathname.includes('/invoice/') && !pathname.includes('/pay')

  useEffect(() => {
    if (!requiresTable) {
      setLoading(false)
      return
    }

    const storedTableId = getWithExpiry("tableId")

    // 2. Extract Table ID from Params 
    // Adjust 'tableId' below to match your [folderName] in Next.js
    const paramTableId = params?.tableId as string || params?.table as string

    // CASE A: We have a new ID from the URL Params
    if (paramTableId) {
      setWithExpiry("tableId", paramTableId, 2 * 60 * 60 * 1000) // 2 hours
      setLoading(false)
      return
    }

    // CASE B: No param, but we have a saved session in LocalStorage
    if (storedTableId) {
      setLoading(false)
      return
    }

    // CASE C: Missing everywhere
    setError("Table ID is missing. Please scan the QR code on your table.")
    setLoading(false)
    
  }, [params, requiresTable])

  // --- 3. Modern Loading UI ---
  if (requiresTable && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center animate-in fade-in duration-700">
          <div className="relative mb-6">
             {/* Glowing Effect */}
             <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
             <div className="relative bg-white p-5 rounded-full shadow-xl border border-rose-100">
                <UtensilsCrossed size={48} className="text-rose-600 animate-pulse" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome!</h2>
          <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
             <Loader2 size={18} className="animate-spin text-rose-500" />
             <span>Setting up your table...</span>
          </div>
        </div>
      </div>
    )
  }

  // --- 4. Error UI ---
  if (requiresTable && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-3">Scan Required</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We couldn't verify your session. Please scan the QR code located on your table to access the menu.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}