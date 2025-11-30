"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Receipt, ChefHat } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string

  const { items, updateQuantity, removeItem, clearCart, total, itemCount, placeOrder, placingOrder, placeOrderError } = useCart()

  const [hotelName, setHotelName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelResponse = await fetch(`/api/hotels/${hotelId}`)
        if (hotelResponse.ok) {
          const hotelData = await hotelResponse.json()
          setHotelName(hotelData.name)
        }
      } catch (error) {
        console.error("Error fetching hotel:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHotel()
  }, [hotelId])

  // --- Loading State ---
  if (loading) {
    return (
      <MainLayout hotelId={hotelId}>
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Preparing your cart...</p>
        </div>
      </MainLayout>
    )
  }

  // --- Empty State ---
  if (items.length === 0) {
    return (
      <MainLayout hotelId={hotelId}>
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="bg-rose-50 p-6 rounded-full mb-6 animate-in zoom-in duration-500">
            <ShoppingBag size={48} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">
            Looks like you haven't added any delicious food yet.
          </p>
          <button
            onClick={() => router.push(`/hotels/${hotelId}`)}
            className="flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:bg-rose-700 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Browse Menu</span>
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout hotelId={hotelId}>
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-40">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Order</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        {/* --- Cart Items List --- */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div 
              key={item.menuItemId} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100/50 flex flex-col gap-3 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                  {item.customization && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-medium">
                      <span>Note: {item.customization}</span>
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-lg">₹{item.price * item.quantity}</p>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <span className="text-xs font-medium underline">Remove</span>
                </button>

                <div className="flex items-center bg-slate-100 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 shadow-sm hover:text-rose-600 active:scale-95 transition-all"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 shadow-sm hover:text-rose-600 active:scale-95 transition-all"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Add More Button --- */}
        <button
          onClick={() => router.push(`/hotels/${hotelId}`)}
          className="w-full py-3 mb-8 border-2 border-dashed border-rose-200 text-rose-500 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add More Items
        </button>

        {/* --- Bill Summary (Receipt Style) --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Decorative Zigzag Top (CSS trick or simplified visual) */}
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Receipt size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Bill Details</span>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-medium text-slate-900">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Charges</span>
              <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded">Free</span>
            </div>
          </div>

          <div className="my-4 border-t-2 border-dashed border-slate-200" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 text-lg">Grand Total</span>
            <span className="font-extrabold text-rose-600 text-2xl">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* --- Error Message --- */}
        {placeOrderError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-pulse">
                {placeOrderError}
            </div>
        )}

      </div>

      {/* --- Sticky Footer Checkout --- */}
      <div className="fixed bottom-25 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 md:pl-72">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={async () => {
              const order = await placeOrder()
              if (order) {
                router.push(`/hotels/${hotelId}/orders`)
              }
            }}
            disabled={placingOrder || items.length === 0}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20
              flex items-center justify-between px-6 transition-all duration-300
              ${placingOrder 
                ? "bg-slate-300 cursor-not-allowed text-slate-500" 
                : "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]"
              }
            `}
          >
            {placingOrder ? (
              <span className="mx-auto flex items-center gap-2">
                <ChefHat className="animate-bounce" size={20} /> 
                Placing Order...
              </span>
            ) : (
              <>
                <span className="text-rose-100 text-sm font-medium">{itemCount} items</span>
                <span className="flex items-center gap-2">
                  Place Order
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">₹{total}</span>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </MainLayout>
  )
}