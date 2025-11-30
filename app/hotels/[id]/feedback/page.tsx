"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import { Star, Send, MessageSquare, Heart, ThumbsUp } from "lucide-react"
import { getWithExpiry } from "@/lib/utils/localStorageWithExpiry"

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string

  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tableId, setTableId] = useState<string | null>(null)

  useEffect(() => {
    const storedTable = getWithExpiry("tableId")
    if (storedTable) setTableId(storedTable)
  }, [])

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating first")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          table: tableId || "Unknown",
          rating,
          message,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push(`/hotels/${hotelId}`)
        }, 3000)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Dynamic label based on star count
  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return "Terrible 😞"
      case 2: return "Bad 🙁"
      case 3: return "Okay 😐"
      case 4: return "Good 🙂"
      case 5: return "Excellent! 😍"
      default: return "Rate your experience"
    }
  }

  // --- Success View ---
  if (submitted) {
    return (
      <MainLayout hotelId={hotelId}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-rose-200">
            <Heart size={40} className="text-rose-600 fill-rose-600 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Thank You!</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">
            We truly appreciate your feedback. It helps us serve you better.
          </p>
          <p className="text-sm text-rose-400 font-medium animate-pulse">
            Redirecting to menu...
          </p>
        </div>
      </MainLayout>
    )
  }

  // --- Form View ---
  return (
    <MainLayout hotelId={hotelId}>
      <div className="max-w-xl mx-auto px-4 py-8 pb-32">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">How was your meal?</h2>
          <p className="text-slate-500">
            We'd love to hear about your experience{tableId ? ` at Table ${tableId}` : ""}.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
          
          {/* Star Rating Section */}
          <div className="flex flex-col items-center mb-8">
            <span className="text-rose-600 font-bold text-lg mb-4 h-6 transition-all duration-300">
              {getRatingLabel(rating)}
            </span>
            
            <div className="flex gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="group relative transition-transform hover:scale-110 active:scale-90 focus:outline-none"
                >
                  <Star
                    size={42}
                    className={`transition-all duration-300 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-md"
                        : "text-slate-200 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <MessageSquare size={16} className="text-rose-500" />
              Anything else to add?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="The food was spicy, the service was great..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`
              w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-rose-500/20
              flex items-center justify-center gap-2 transition-all duration-300
              ${submitting 
                ? "bg-slate-300 cursor-not-allowed" 
                : "bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/40 active:scale-[0.98]"
              }
            `}
          >
            {submitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Feedback</span>
              </>
            )}
          </button>

        </div>
      </div>
    </MainLayout>
  )
}