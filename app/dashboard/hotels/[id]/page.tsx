"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  Clock, 
  Utensils, 
  CheckCircle, 
  DollarSign, 
  RefreshCw, 
  Search, 
  ChefHat, 
  Filter
} from "lucide-react"
import OrderCard from "@/components/dashboard/OrderCard"
import StatsCard from "@/components/dashboard/StatsCard"
import { useRealTimeFetch } from "@/lib/fetchReal"
import { OrderDetailsModal } from "@/components/dashboard/OrderDetailsModal"

interface Order {
  _id: string
  table: string
  items: any[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
  updatedAt?: string
}

export default function HotelDashboard() {
  const params = useParams()
  const hotelId = params.id as string
  
  // State
  const [stats, setStats] = useState({ pending: 0, cooking: 0, served: 0, paid: 0 })
  const [hotelData, setHotelData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<null | Order["status"]>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Real-time Fetch
  const { data, loading, error } = useRealTimeFetch(`/api/dashboard/hotels/${hotelId}/orders`, 5000)

  // Fetch Hotel Details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`)
        if (res.ok) {
          const data = await res.json()
          setHotelData(data)
        }
      } catch (err) {
        console.error("Error fetching hotel data:", err)
      }
    }
    fetchHotel()
  }, [hotelId])

  // Calculate Stats
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setStats({ pending: 0, cooking: 0, served: 0, paid: 0 })
      return
    }

    const newStats = data.reduce(
      (acc, order) => {
        if (acc[order.status] !== undefined) {
          acc[order.status] += 1
        }
        return acc
      },
      { pending: 0, cooking: 0, served: 0, paid: 0 }
    )

    setStats(newStats)
  }, [data])

  // Filter Logic
  const filteredOrders = data?.filter((order: Order) => {
    const term = searchTerm.toLowerCase()
    const matchesTable = order.table.toLowerCase().includes(term)
    const matchesOrderId = order._id.toLowerCase().includes(term)
    const matchesStatus = filterStatus ? order.status === filterStatus : true
    return (matchesTable || matchesOrderId) && matchesStatus
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2 rounded-xl text-rose-600">
                <ChefHat size={32} />
              </span>
              {hotelData?.name || "Dashboard"}
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Live overview of your restaurant's performance
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* --- Stats Cards Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-700">
          <StatsCard 
            icon={Clock} 
            label="Pending" 
            value={stats.pending} 
            color="yellow" 
          />
          <StatsCard 
            icon={Utensils} 
            label="Cooking" 
            value={stats.cooking} 
            color="blue" 
          />
          <StatsCard 
            icon={CheckCircle} 
            label="Served" 
            value={stats.served} 
            color="green" 
          />
          <StatsCard 
            icon={DollarSign} 
            label="Paid" 
            value={stats.paid} 
            color="purple" 
          />
        </div>

        {/* --- Controls Toolbar --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-20 z-20 animate-in slide-in-from-bottom-2 duration-500">
          
          {/* Search */}
          <div className="relative w-full lg:w-96 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search table or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 py-3">
            <Filter size={20} className="text-slate-400 mr-2 flex-shrink-0" />
            
            {[
              { label: "All", value: null },
              { label: "Pending", value: "pending" },
              { label: "Cooking", value: "cooking" },
              { label: "Served", value: "served" },
              { label: "Paid", value: "paid" },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setFilterStatus(tab.value as any)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${filterStatus === tab.value 
                    ? "bg-slate-900 text-white shadow-md transform scale-105" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Orders Grid --- */}
        {loading && !data ? (
           // Loading Skeleton
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
           </div>
        ) : filteredOrders?.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No orders found</h3>
            <p className="text-slate-500 max-w-sm mt-1">
              {searchTerm || filterStatus 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "New orders will appear here automatically."}
            </p>
            {(searchTerm || filterStatus) && (
               <button 
                 onClick={() => { setSearchTerm(""); setFilterStatus(null); }}
                 className="mt-6 text-rose-600 font-bold hover:underline"
               >
                 Clear all filters
               </button>
            )}
          </div>
        ) : (
          // Data Grid
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders?.map((order: Order) => (
              <div key={order._id} className="animate-in zoom-in duration-300">
                <OrderCard order={order} hotelId={hotelId} onClick={(clickedOrder) => setSelectedOrder(clickedOrder)}/>
              </div>
            ))}
          </div>
        )}

{selectedOrder && (
        <OrderDetailsModal 
            order={selectedOrder}
            hotelId={hotelId}
            onClose={() => setSelectedOrder(null)} open={!!selectedOrder}        />
      )}
      </div>
    </div>
  )
}