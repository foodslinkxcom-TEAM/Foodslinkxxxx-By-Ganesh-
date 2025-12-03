"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { 
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag, 
  Receipt, ChefHat, User, Phone, X 
} from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const paramTableId = params.tableId as string

  const { items, updateQuantity, removeItem, clearCart, total, itemCount, placeOrder, placingOrder, placeOrderError } = useCart()

  const [hotelName, setHotelName] = useState("")
  const [loading, setLoading] = useState(true)

  // --- Modal State ---
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

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

  // --- Final Submit Handler ---
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Optional: Add validation
    if (!customerName.trim()) {
      alert("Please enter your name")
      return
    }

    // Call Context API
    const order = await placeOrder(paramTableId, {
        name: customerName,
        contact: customerPhone
    })

    if (order) {
      setIsCheckoutModalOpen(false)
      router.push(`/hotels/${hotelId}/${paramTableId}/orders`)
    }
  }

  // --- Loading State ---
  if (loading) {
    return (
      <MainLayout hotelId={hotelId} tableId={paramTableId}>
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    )
  }

  // --- Empty State ---
  if (items.length === 0) {
    return (
      <MainLayout hotelId={hotelId} tableId={paramTableId}>
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="bg-rose-50 p-6 rounded-full mb-6">
            <ShoppingBag size={48} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <button
            onClick={() => router.push(`/hotels/${hotelId}`)}
            className="mt-6 flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-700 transition-all"
          >
            <ArrowLeft size={20} /> Browse Menu
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout hotelId={hotelId} tableId={paramTableId}>
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-40">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Your Order</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-rose-100"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* --- Items List --- */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.menuItemId} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                  {item.customization && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                      Note: {item.customization}
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-lg">₹{item.price * item.quantity}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <button onClick={() => removeItem(item.menuItemId)} className="text-xs font-medium text-slate-400 hover:text-rose-600 underline">
                  Remove
                </button>
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm">
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Add More --- */}
        <button
          onClick={() => router.push(`/hotels/${hotelId}`)}
          className="w-full py-3 mb-8 border-2 border-dashed border-rose-200 text-rose-500 font-bold rounded-xl hover:bg-rose-50 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add More Items
        </button>

        {/* --- Bill Summary --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Receipt size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Bill Details</span>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-medium text-slate-900">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="my-4 border-t-2 border-dashed border-slate-200" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 text-lg">Grand Total</span>
            <span className="font-extrabold text-rose-600 text-2xl">₹{total.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* --- Sticky Footer Checkout Button --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-30 md:pl-72">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-rose-500/20 bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-between px-6 transition-all"
          >
            <span className="text-rose-100 text-sm font-medium">{itemCount} items</span>
            <span className="flex items-center gap-2">
              Proceed to Checkout
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">₹{total}</span>
            </span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* USER DETAILS MODAL (Sheet)        */}
      {/* ========================================== */}
      {isCheckoutModalOpen && (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm transition-opacity"
                onClick={() => setIsCheckoutModalOpen(false)}
            />
            
            {/* Modal Content */}
            <div className="fixed z-[70] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] md:rounded-3xl bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 md:slide-in-from-bottom-10">
                <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Confirm Order</h3>
                        <button 
                            onClick={() => setIsCheckoutModalOpen(false)}
                            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleConfirmOrder} className="space-y-4">
                        
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <User size={16} className="text-rose-500"/> Your Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter your full name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Phone size={16} className="text-rose-500"/> Phone Number <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                            </label>
                            <input 
                                type="tel" 
                                placeholder="Enter mobile number"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Order Summary (Mini) */}
                        <div className="bg-rose-50 p-4 rounded-xl flex justify-between items-center mt-4">
                            <span className="text-sm text-rose-800 font-medium">Total Amount</span>
                            <span className="text-lg font-black text-rose-600">₹{total.toFixed(2)}</span>
                        </div>

                        {/* Error Message */}
                        {placeOrderError && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded text-center">
                                {placeOrderError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={placingOrder}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg
                                flex items-center justify-center gap-2 mt-4
                                ${placingOrder 
                                    ? "bg-slate-800 text-slate-400 cursor-not-allowed" 
                                    : "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                                }
                            `}
                        >
                            {placingOrder ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Place Order <ChefHat size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                {/* Safe area spacing for mobile bottom bars */}
                <div className="h-6 md:hidden w-full bg-white"></div> 
            </div>
        </>
      )}

    </MainLayout>
  )
}