"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, ChefHat, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDeviceId } from "@/lib/utils/device-id"
import { useCart } from "@/lib/contexts/cart-context"

interface MenuItem {
  menuItemId?: string
  _id?: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image?: string
}

interface MenuDetailsModalProps {
  item: MenuItem
  onClose: () => void
  hotelId: string
}

export default function MenuDetailsModal({ item, onClose, hotelId }: MenuDetailsModalProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState("")
  const [adding, setAdding] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true)
    // Prevent background scrolling
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      const deviceId = getDeviceId()
      const newItem = {
        ...item,
        menuItemId: item?._id || "No Item Id Found",
        deviceId,
        hotelId,
        quantity,
        customization,
      }
      addItem(newItem)
      handleClose()
      // Optional: Delay navigation slightly to show success state if desired
      router.push(`/hotels/${hotelId}/cart`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div 
        className={`
          relative w-full md:w-[480px] bg-white 
          rounded-t-[32px] md:rounded-3xl shadow-2xl overflow-hidden 
          flex flex-col max-h-[90vh] md:max-h-[85vh]
          transform transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0 scale-100" : "translate-y-full md:translate-y-10 md:scale-95"}
        `}
      >
        
        {/* --- 1. Header Image Area --- */}
        <div className="relative h-30 md:h-64 flex-shrink-0 bg-rose-100">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-rose-300">
              <ChefHat size={48} className="mb-2" />
              <span className="text-sm font-medium">No image available</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Close Button (Floating) */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- 2. Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 md:pb-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight pr-4">{item.name}</h2>
            <div className="flex-shrink-0">
               <span className="text-2xl font-extrabold text-rose-600">₹{item.price}</span>
            </div>
          </div>

          <p className="text-slate-500 leading-relaxed text-sm mb-8">
            {item.description}
          </p>

          <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Quantity</span>
              <div className="flex items-center gap-4 bg-white shadow-sm border border-slate-200 rounded-full px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-2 rounded-full transition-colors ${quantity === 1 ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100 active:scale-95'}`}
                  disabled={quantity === 1}
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <span className="text-lg font-bold text-slate-900 w-6 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-colors"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Customization Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                <MessageSquare size={16} className="text-rose-500" />
                Cooking Request <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="Ex: Less spicy, no onions, extra sauce..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* --- 3. Sticky Footer Action --- */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-10 md:relative md:border-none md:p-6 md:pt-0">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <span className="text-sm font-medium text-slate-500">Total Amount</span>
            <span className="text-lg font-bold text-slate-900">₹{item.price * quantity}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`
              w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-rose-500/30
              flex items-center justify-center gap-2 transition-all duration-300
              ${adding 
                ? "bg-slate-300 cursor-not-allowed transform-none" 
                : "bg-rose-600 hover:bg-rose-700 active:scale-[0.98]"
              }
            `}
          >
            {adding ? (
              <span className="animate-pulse">Adding to Cart...</span>
            ) : (
              <>
                <span>Add to Cart</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm md:block hidden">
                  ₹{item.price * quantity}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}