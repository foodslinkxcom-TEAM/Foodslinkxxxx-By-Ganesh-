"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useRealtimeData } from "@/hooks/use-realtime-data"
import { IOrder as Order } from "@/lib/models/Order"
import { 
  Receipt, 
  Calendar, 
  Download, 
  Search, 
  Plus, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Printer
} from "lucide-react"
import CreateInvoiceModal from "@/components/dashboard/CreateInvoiceModal"
import Link from "next/link"

export default function InvoicesPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  // Fetch Data
  const { data, loading } = useRealtimeData<Order[]>(`/api/dashboard/hotels/${hotelId}/orders`, 5000)
  
  // State
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // --- Filtering Logic ---
  const filteredOrders = data?.filter((order) => {
    // Status Filter
    let matchesStatus = true
    if (filter === "paid") matchesStatus = order.status === "paid"
    if (filter === "pending") matchesStatus = order.status !== "paid"

    // Search Filter
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      (order?._id as unknown as string).toLowerCase().includes(term) || 
      order.table.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  // --- Stats Calculation ---
  const totalRevenue = data?.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.total : 0), 0) || 0
  const paidCount = data?.filter(o => o.status === 'paid').length || 0


  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2.5 rounded-xl text-rose-600">
                <Receipt size={32} />
              </span>
              Invoices
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Manage billing and download receipts.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex gap-4">
             <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-[140px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <TrendingUp size={12} /> Total Revenue
                </span>
                <span className="text-xl font-black text-slate-800 mt-1">₹{totalRevenue.toLocaleString()}</span>
             </div>
             <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-[120px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <CheckCircle size={12} /> Paid Bills
                </span>
                <span className="text-xl font-black text-emerald-600 mt-1">{paidCount}</span>
             </div>
          </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search Invoice # or Table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="flex w-full md:w-auto gap-3">
               {/* Filter Tabs */}
               <div className="flex p-1 bg-slate-100 rounded-xl flex-1 md:flex-none">
                  {(["all", "paid", "pending"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`
                        flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all
                        ${filter === tab 
                          ? "bg-white text-slate-800 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
               </div>

               {/* Create Button */}
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95"
               >
                  <Plus size={18} /> <span className="hidden sm:inline">New Invoice</span>
               </button>
            </div>
          </div>
        </div>

        {/* --- Invoices Grid --- */}
        {loading ? (
           // Skeleton Loading
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
           </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Search className="text-slate-300" size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-700">No invoices found</h3>
             <p className="text-slate-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
            {filteredOrders.map((order) => (
              <div
                key={order?._id as unknown as string}
                className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Decorative Top Border */}
                <div className={`h-1.5 w-full ${order.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                <div className="p-6 flex-1 flex flex-col">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="text-lg font-bold text-slate-800">Table {order.table}</h3>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            order.status === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                         }`}>
                            {order.status}
                         </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        #{(order?._id as unknown as string)?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-black text-slate-900">₹{order.total}</span>
                       <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bill</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 bg-slate-50 p-2 rounded-lg border border-slate-100">
                     <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-rose-400" /> 
                        {new Date(order.createdAt).toLocaleDateString()}
                     </span>
                     <span className="w-px h-3 bg-slate-300" />
                     <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-rose-400" /> 
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2 mb-6 flex-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-center border-b border-dashed border-slate-100 pb-1 last:border-0">
                        <span className="text-slate-600">
                           <span className="font-bold text-slate-800 mr-1">{item.quantity}x</span> 
                           {item.name}
                        </span>
                        <span className="text-slate-400 font-medium text-xs">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-rose-500 font-bold mt-2">+{order.items.length - 3} more items...</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                <div className="flex">
                    <Link href={`/dashboard/hotels/${hotelId}/invoices/${order._id}`}>
                     <button
                        className="flex items-center justify-center gap-2 py-2.5 text-white bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-900 shadow-md transition-all active:scale-95"
                     >
                        <Printer size={16} /> Print
                     </button>
                     </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Create Invoice Modal --- */}
      {isModalOpen && (
        <CreateInvoiceModal
          hotelId={hotelId}
          onClose={() => setIsModalOpen(false)}
          onInvoiceCreated={() => {
            setIsModalOpen(false);
            // In a real app with SWR/React Query, revalidate here
          }}
        />
      )}
    </div>
  )
}