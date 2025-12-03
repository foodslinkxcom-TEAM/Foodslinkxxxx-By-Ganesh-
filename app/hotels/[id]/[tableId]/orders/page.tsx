"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { getDeviceId } from "@/lib/utils/device-id"
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Receipt, 
  RefreshCw, 
  UtensilsCrossed, 
  FileText, 
  CreditCard 
} from "lucide-react"

interface OrderItem {
  _id?: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  customization?: string
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
}

export default function OrdersPage() {
  const params = useParams()
  const hotelId = params.id as string
  const paramTableId = params.tableId as string
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [hotelName, setHotelName] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // --- Data Fetching ---
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true)
    try {
      const deviceId = getDeviceId()
      
      // Parallel Fetching
      const [ordersRes, hotelRes] = await Promise.all([
        fetch(`/api/orders?hotelId=${hotelId}&deviceId=${deviceId}`),
        fetch(`/api/hotels/${hotelId}`)
      ])

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        // Ensure array even if single object returned
        const ordersArray = Array.isArray(data) ? data : (data ? [data] : [])
        // Sort by newest first
        setOrders(ordersArray.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }

      if (hotelRes.ok) {
        const data = await hotelRes.json()
        setHotelName(data.name)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [hotelId])

  // --- Initial Load & Polling (20 Seconds) ---
  useEffect(() => {
    fetchData()

    const intervalId = setInterval(() => {
      fetchData(true) // Silent background refresh
    }, 20000) // 20 Seconds

    return () => clearInterval(intervalId)
  }, [fetchData])

  // --- Helper: Status Visuals ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
            <Clock size={14} /> Order Received
          </span>
        )
      case "cooking":
        return (
          <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-100 animate-pulse">
            <ChefHat size={14} /> Preparing
          </span>
        )
      case "served":
        return (
          <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
            <UtensilsCrossed size={14} /> Served
          </span>
        )
      case "paid":
        return (
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            <CheckCircle2 size={14} /> Completed
          </span>
        )
      default:
        return null
    }
  }

  // --- Render: Loading Skeleton ---
  if (loading) {
    return (
      <MainLayout hotelId={hotelId} tableId={paramTableId}>
        <div className="p-6 space-y-4 max-w-3xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout hotelId={hotelId} tableId={paramTableId}>
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Orders</h2>
          <button 
            onClick={() => fetchData()} 
            disabled={refreshing}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Content */}
        {orders.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-rose-50 p-6 rounded-full mb-4">
              <Receipt size={48} className="text-rose-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No orders yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Go ahead and explore our menu to place your first order.
            </p>
            <Link
              href={`/hotels/${hotelId}`}
              className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition-all"
            >
              Order Food
            </Link>
          </div>
        ) : (
          // Orders List
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl border border-rose-100/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                    <p className="text-xs font-mono text-slate-600">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(order.status)}
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Card Body: Items */}
                <div className="px-5 py-4">
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <span className="bg-rose-100 text-rose-700 font-bold w-6 h-6 flex items-center justify-center rounded text-xs mt-0.5">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            {item.customization && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5">
                                "{item.customization}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-slate-600">
                          ₹{item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Divider */}
                  <div className="my-4 border-t border-dashed border-slate-200" />

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-700">Total Amount</span>
                    <span className="text-xl font-extrabold text-rose-600">₹{order.total}</span>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/hotels/${hotelId}/invoice/${order._id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={16} />
                      Invoice
                    </Link>
                    
                    {order.status !== 'paid' ? (
                      <Link
                        href={`/hotels/${hotelId}/${paramTableId}/pay?orderId=${order._id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-semibold text-sm hover:bg-rose-700 shadow-md shadow-rose-200 transition-all"
                      >
                        <CreditCard size={16} />
                        Pay Bill
                      </Link>
                    ) : (
                       <button disabled className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-semibold text-sm cursor-not-allowed">
                         <CheckCircle2 size={16} /> Paid
                       </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}