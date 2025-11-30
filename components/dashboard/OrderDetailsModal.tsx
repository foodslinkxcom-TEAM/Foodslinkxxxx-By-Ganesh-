"use client"

import { useState, useEffect } from "react"
import {
  Clock, User, ChefHat, FastForward, Utensils,
  DollarSign, CheckCircle, Printer, Download, X
} from "lucide-react"

interface OrderItem {
  _id: string
  name: string
  price: number
  quantity: number
  customization?: string
}

interface Order {
  _id: string
  table: string
  items: OrderItem[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
}

interface Props {
  open: boolean
  onClose: () => void
  order: Order
  hotelId: string
}

export function OrderDetailsModal({ open, onClose, order, hotelId }: Props) {
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      onClose()
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdating(false)
    }
  }

  const steps = ["pending", "cooking", "served", "paid"] as const
  const currentStepIndex = steps.indexOf(order.status)
  const tax = order.total * 0.05
  const subtotal = order.total - tax

  return (
   

      <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div
        className="
          relative w-full max-w-5xl max-h-[90vh]
          bg-white rounded-2xl md:rounded-3xl shadow-2xl
          overflow-hidden flex flex-col md:flex-row
          animate-in zoom-in-95 duration-300
        "
      >
        {/* LEFT: DETAILS */}
        <div className="w-full md:w-3/5 bg-white flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8">
          {/* Header */}
          <header className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1
                  id={`order-dialog-${order._id}`}
                  className="text-2xl sm:text-3xl font-bold text-slate-900"
                >
                  Table {order.table}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    order.status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} /> Guest
                </span>
                <span className="font-mono text-[11px] opacity-70">
                  #{order._id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Desktop close */}
            <button
              onClick={onClose}
              className="hidden md:inline-flex rounded-full p-1.5 hover:bg-slate-100 text-slate-500 hover:text-red-600 transition"
            >
              <X size={18} />
            </button>
          </header>

          {/* Timeline */}
          <section className="mb-5 sm:mb-6">
            <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span>Received</span>
              <span>Kitchen</span>
              <span>Table</span>
              <span>Payment</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`flex-1 transition-all duration-500 ${
                    idx <= currentStepIndex ? "bg-red-500" : "bg-transparent"
                  } ${idx !== 0 && "border-l border-white/20"}`}
                />
              ))}
            </div>
          </section>

          {/* Items */}
          <section className="flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 sm:mb-4 border-b border-slate-100 pb-2">
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-start gap-3 group"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-xs sm:text-sm">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="font-semibold sm:font-bold text-slate-800 text-sm sm:text-base leading-tight group-hover:text-red-600 transition">
                        {item.name}
                      </p>
                      {item.customization && (
                        <p className="text-[11px] sm:text-xs text-amber-700 mt-1 font-medium bg-amber-50 inline-block px-2 py-0.5 rounded">
                          Note: {item.customization}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Total */}
          <section className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-dashed border-slate-300 flex justify-between items-end gap-4">
            <div className="text-xs sm:text-sm text-slate-500">
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>Taxes (5%): ₹{tax.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                Total Amount
              </span>
              <p className="text-2xl sm:text-3xl font-black text-red-600 leading-none mt-1">
                ₹{order.total}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="w-full md:w-2/5 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col p-4 sm:p-6 md:p-8">
          {/* Mobile header + close */}
          <div className="flex items-center justify-between mb-4 md:mb-6 md:hidden">
            <h3 className="font-semibold text-slate-800 text-sm">Actions</h3>
            <button className="p-2 bg-white rounded-full shadow-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Actions</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus("cooking")}
                  disabled={updating}
                  className="w-full py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold sm:font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 sm:gap-3 text-sm sm:text-base disabled:opacity-60"
                >
                  <ChefHat size={22} />
                  Start Cooking
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink-0 mx-3 text-slate-400 text-[10px] font-bold uppercase">
                    Or Skip To
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                <button
                  onClick={() => updateStatus("served")}
                  disabled={updating}
                  className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] disabled:opacity-60"
                >
                  <FastForward size={18} />
                  Direct Serve
                </button>
              </>
            )}

            {order.status === "cooking" && (
              <button
                onClick={() => updateStatus("served")}
                disabled={updating}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-base disabled:opacity-60"
              >
                <Utensils size={24} />
                Mark as Served
              </button>
            )}

            {order.status === "served" && (
              <button
                onClick={() => updateStatus("paid")}
                disabled={updating}
                className="w-full py-4 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl font-bold shadow-lg shadow-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-base disabled:opacity-60"
              >
                <DollarSign size={24} />
                Mark as Paid
              </button>
            )}

            {order.status === "paid" && (
              <div className="w-full py-5 sm:py-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle size={28} />
                </div>
                <h4 className="font-bold text-emerald-800 text-base sm:text-lg">
                  Order Completed
                </h4>
                <p className="text-emerald-600 text-xs sm:text-sm">
                  Payment received
                </p>
              </div>
            )}

            {order.status !== "paid" && order.status !== "served" && (
              <button
                onClick={() => updateStatus("paid")}
                disabled={updating}
                className="w-full py-3 bg-white border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 text-xs sm:text-sm active:scale-[0.98] disabled:opacity-60"
              >
                <DollarSign size={16} />
                Mark Paid (Quick Close)
              </button>
            )}
          </div>

          {/* Bottom actions */}
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                window.open(`/hotels/${hotelId}/invoice/${order._id}`, "_blank")
              }
              className="flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-[10px] sm:text-xs"
            >
              <Printer size={18} />
              <span className="font-bold">Print Bill</span>
            </button>
            <button
              onClick={() =>
                window.open(`/hotels/${hotelId}/invoice/${order._id}`, "_blank")
              }
              className="flex flex-col items-center justify-center gap-1 p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-[10px] sm:text-xs"
            >
              <Download size={18} />
              <span className="font-bold">Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
