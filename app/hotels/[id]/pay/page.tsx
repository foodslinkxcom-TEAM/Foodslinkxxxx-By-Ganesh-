"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { 
  ArrowLeft, 
  CheckCircle, 
  Smartphone, 
  QrCode, 
  Copy, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Banknote,
  Wallet
} from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hotelId = params.id as string
  const orderId = searchParams.get("orderId") as string

  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [hotelName, setHotelName] = useState("")
  const [hotelUpi, setHotelUpi] = useState("")
  const [finalAmount, setFinalAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "cash_pending">("pending")
  const [upiLink, setUpiLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [processingCash, setProcessingCash] = useState(false)

  // Use a ref to control polling to avoid state closure issues
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
         // 1. Fetch order details
         const orderResponse = await fetch(`/api/orders/${orderId}`)
         if (orderResponse.ok) {
           const orderData = await orderResponse.json()
           
           // Check if already paid
           if (orderData.status === 'paid') {
             setPaymentStatus('paid')
             setLoading(false)
             return
           }

           const totalWithTax = Number((orderData.total * 1.05).toFixed(2))
           setFinalAmount(totalWithTax)

           // 2. Fetch hotel data (UPI ID)
           const hotelResponse = await fetch(`/api/hotels/${hotelId}`)
           if (hotelResponse.ok) {
             const hotelData = await hotelResponse.json()
             setHotelName(hotelData.name)
             setHotelUpi(hotelData.upiId)

             // 3. Generate Deep Link
             const deepLink = `upi://pay?pa=${hotelData.upiId}&pn=${encodeURIComponent(hotelData.name)}&am=${totalWithTax}&tr=${orderId}&tn=Order-${orderId.slice(-4)}&cu=INR`
             setUpiLink(deepLink)

             // 4. Generate QR
             const qrResponse = await fetch("/api/payment/qr", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 upiId: hotelData.upiId,
                 hotelName: hotelData.name,
                 amount: totalWithTax, 
                 orderId,
               }),
             })

             if (qrResponse.ok) {
               const qrData = await qrResponse.json()
               setQrCode(qrData.qrCode)
             }
           }
         }
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchPaymentData()
    }

    // --- Auto-Poll for Payment Status (Replaces Manual Confirm) ---
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'paid') {
            setPaymentStatus('paid')
            if (pollInterval.current) clearInterval(pollInterval.current)
          }
        }
      } catch (error) {
        console.error("Polling error", error)
      }
    }

    pollInterval.current = setInterval(checkStatus, 3000) // Check every 3 seconds

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [hotelId, orderId])

  const handleCopyUpi = () => {
    if (hotelUpi) {
      navigator.clipboard.writeText(hotelUpi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCashPayment = async () => {
    setProcessingCash(true)
    try {
      // Notify backend that user chose cash
      // You might want to update status to 'pending_cash' or similar
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "cash", status: "pending" }), // Keeping status pending until waiter confirms
      })

      if (response.ok) {
        setPaymentStatus("cash_pending")
      }
    } catch (error) {
      console.error("Error processing cash payment", error)
    } finally {
      setProcessingCash(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Payment Details...</p>
      </div>
    )
  }

  // --- Success View (Paid) ---
  if (paymentStatus === 'paid') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Received!</h2>
          <p className="text-slate-500 mb-6">Thank you for dining with us.</p>
          
          <button 
             onClick={() => router.push(`/hotels/${hotelId}/orders`)}
             className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors"
          >
            View Order Status
          </button>
        </main>
      </div>
    )
  }

  // --- Cash Instructions View ---
  if (paymentStatus === 'cash_pending') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
            <Banknote size={40} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Pay at Counter</h2>
          <p className="text-slate-500 mb-6 max-w-xs">
            Please pay <span className="font-bold text-slate-900">₹{finalAmount}</span> to the waiter or at the cash counter.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link 
               href={`/hotels/${hotelId}/invoice/${orderId}`}
               className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Invoice
            </Link>
            <button 
               onClick={() => router.push(`/hotels/${hotelId}/orders`)}
               className="text-rose-600 font-semibold py-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Go to Orders
            </button>
          </div>
        </main>
      </div>
    )
  }

  // --- Main Payment View ---
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Total Payable</h2>
          <div className="flex items-baseline justify-center gap-1 mt-1">
             <span className="text-4xl font-extrabold text-rose-600">₹{finalAmount}</span>
             <span className="text-sm text-slate-400 font-medium">(inc. taxes)</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-rose-900/5 overflow-hidden border border-rose-100">
          
          {/* --- Option 1: Digital Payment --- */}
          <div className="p-6">
             <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4">
               <Smartphone size={20} className="text-rose-500" />
               Pay Online
             </h3>

             {/* Mobile App Link */}
             <a 
               href={upiLink}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 hover:border-rose-400 p-4 rounded-xl shadow-sm mb-6 group transition-all"
             >
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                     <ExternalLink size={20} className="text-slate-600" />
                 </div>
                 <div className="text-left">
                     <p className="font-bold text-slate-800">Pay via UPI App</p>
                     <p className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm</p>
                 </div>
               </div>
               <span className="text-rose-600 font-bold text-sm">Open App</span>
             </a>

             {/* QR Code Section */}
             <div className="flex flex-col items-center text-center pt-2">
               <div className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-200 mb-3 relative">
                 {qrCode ? (
                   <img src={qrCode} alt="UPI QR" className="w-40 h-40 object-contain mix-blend-multiply" />
                 ) : (
                   <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-lg" />
                 )}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    OR SCAN
                  </div>
               </div>
               
               {/* UPI ID Copy */}
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 mt-2">
                 <span className="text-xs font-mono text-slate-600">{hotelUpi}</span>
                 <button onClick={handleCopyUpi} className="text-slate-400 hover:text-rose-600">
                    {copied ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14} />}
                 </button>
               </div>
             </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-bold uppercase">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* --- Option 2: Cash Payment --- */}
          <div className="p-6 bg-slate-50/50">
             <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4">
               <Wallet size={20} className="text-slate-500" />
               Cash Payment
             </h3>
             
             <button
               onClick={handleCashPayment}
               disabled={processingCash}
               className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-70"
             >
               {processingCash ? (
                 <span className="animate-pulse">Processing...</span>
               ) : (
                 <>
                   <Banknote size={18} />
                   <span>Pay Cash at Counter</span>
                 </>
               )}
             </button>
          </div>

        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-400">
           <ShieldCheck size={14} />
           <span className="text-[10px] uppercase tracking-widest font-bold">Secure Payment Gateway</span>
        </div>

      </main>
    </div>
  )
}