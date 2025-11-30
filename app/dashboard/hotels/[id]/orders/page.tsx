"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { 
  Trash2, 
  ClipboardList, 
  Search, 
  Filter, 
  ChefHat, 
  Loader2,
  AlertTriangle 
} from "lucide-react"
import OrderCard from "@/components/dashboard/OrderCard"
import {OrderDetailsModal} from "@/components/dashboard/OrderDetailsModal"
import { useRealTimeFetch } from "@/lib/fetchReal"

// --- Types ---
interface Order {
  _id: string
  table: string
  items: any[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  // --- Data Fetching ---
  const { data, loading, error } = useRealTimeFetch(`/api/dashboard/hotels/${hotelId}/orders`, 5000)
  
  // --- State ---
  const [filter, setFilter] = useState<"all" | "active" | "paid">("active") // Default to Active for utility
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // --- Handlers ---
  const handleDelete = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation() // Prevent opening the modal
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return

    setDeletingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete order")
      // Real-time fetch will auto-update, but we can optimistically update UI logic if needed
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("Failed to delete order")
    } finally {
      setDeletingId(null)
    }
  }

  // --- Filtering Logic ---
  const filteredOrders = data?.filter((order: Order) => {
    // 1. Status Filter
    let matchesFilter = true
    if (filter === "paid") matchesFilter = order.status === "paid"
    if (filter === "active") matchesFilter = order.status !== "paid"

    // 2. Search Filter
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      order.table.toLowerCase().includes(term) || 
      order._id.toLowerCase().includes(term)

    return matchesFilter && matchesSearch
  })

  // Count helper
  const getCount = (type: "all" | "active" | "paid") => {
    if (!data) return 0
    if (type === "all") return data.length
    if (type === "paid") return data.filter((o: Order) => o.status === "paid").length
    if (type === "active") return data.filter((o: Order) => o.status !== "paid").length
    return 0
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2 rounded-xl text-rose-600">
                <ClipboardList size={32} />
              </span>
              Order Management
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Track live orders and view history.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="text-right hidden md:block">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
                {/* Simple calculation example */}
                <p className="text-xl font-bold text-slate-800">
                   ₹{data?.reduce((acc: number, curr: Order) => acc + (curr.status === 'paid' ? curr.total : 0), 0) || 0}
                </p>
             </div>
          </div>
        </div>

        {/* --- Toolbar (Search & Filter) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search table or Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
              {(["active", "paid", "all"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`
                    flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all
                    ${filter === tab 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                    }
                  `}
                >
                  {tab} <span className="ml-1 opacity-60 text-xs">({getCount(tab)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Orders Grid --- */}
        {loading && !data ? (
           // Loading Skeleton
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
           </div>
        ) : filteredOrders?.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               {filter === 'active' ? <ChefHat className="text-slate-300" size={40} /> : <AlertTriangle className="text-slate-300" size={40} />}
             </div>
             <h3 className="text-xl font-bold text-slate-700">No {filter} orders found</h3>
             <p className="text-slate-500 mt-1">
               {searchQuery ? "Try adjusting your search terms." : "Orders will appear here automatically."}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
            {filteredOrders?.map((order: Order) => (
              <div key={order._id} className="relative group">
                
                {/* 1. Order Card Component */}
                <OrderCard 
                  order={order} 
                  hotelId={hotelId} 
                  // Note: Ensure OrderCard (from previous response) accepts an onClick prop
                  // If standard OrderCard doesn't, we might need to wrap the internal div or pass this to the component
                  // Assuming the refactored OrderCard from the "Lifting State Up" solution:
                  // @ts-ignore - Ignoring if types mismatch slightly during copy-paste
                  onClick={() => setSelectedOrder(order)}
                />

                {/* 2. Delete Button (Overlay) */}
                <button
                  onClick={(e) => handleDelete(e, order._id)}
                  disabled={deletingId === order._id}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="Delete Order"
                >
                  {deletingId === order._id ? (
                    <Loader2 size={16} className="animate-spin text-red-500" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Detail Modal (Lifted State) --- */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          hotelId={hotelId}
          onClose={() => setSelectedOrder(null)} open={!!selectedOrder}        />
      )}
    </div>
  )
}