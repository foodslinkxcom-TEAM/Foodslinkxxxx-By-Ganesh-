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
  Wallet,
  Info,
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hotelId = params.id as string
  const tableId = params.tableId as string
  const orderId = searchParams.get("orderId") as string

  // --- States ---
  // Mode: null (selection) | 'online' | 'cash'
  const [paymentMode, setPaymentMode] = useState<"online" | "cash" | "not-decide" |null>("not-decide")
  
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [hotelName, setHotelName] = useState("")
  const [hotelUpi, setHotelUpi] = useState("")
  const [finalAmount, setFinalAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "cash_pending">("pending")
  const [upiLink, setUpiLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [processingCash, setProcessingCash] = useState(false)

  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // 1. Fetch Data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
         const orderResponse = await fetch(`/api/orders/${orderId}`)
         if (orderResponse.ok) {
           const orderData = await orderResponse.json()
           
           if (orderData.status === 'paid') {
             setPaymentStatus('paid')
             setLoading(false)
             return
           }
           // Handle case where user already selected cash previously
           if (orderData.paymentMethod === 'cash') {
             setPaymentStatus('cash_pending')
             setLoading(false)
             return
           }

           const totalWithTax = Number((orderData.total).toFixed(2))
           setFinalAmount(totalWithTax)

           const hotelResponse = await fetch(`/api/hotels/${hotelId}`)
           if (hotelResponse.ok) {
             const hotelData = await hotelResponse.json()
             setHotelName(hotelData.name)
             setHotelUpi(hotelData.upiId)

             const deepLink = `upi://pay?pa=${hotelData.upiId}&pn=${encodeURIComponent(hotelData.name)}&am=${totalWithTax}&tr=${orderId}&tn=Order-${orderId.slice(-4)}&cu=INR`
             setUpiLink(deepLink)

             // Generate QR immediately so it's ready if they click 'Online'
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

    // Polling for Online Payment Success
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

    pollInterval.current = setInterval(checkStatus, 3000)

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [hotelId, orderId, paymentMode])

  const handleCopyUpi = () => {
    if (hotelUpi) {
      navigator.clipboard.writeText(hotelUpi)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 2. Handle Cash Selection
  const confirmCashPayment = async () => {
    setProcessingCash(true)
    try {
      // Update Order to Cash Pending
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "cash", status: "pending" }),
      })

      if (response.ok) {
        setPaymentStatus("cash_pending")
      }
    } catch (error) {
      console.error("Error processing cash payment", error)
      alert("Something went wrong. Please notify the waiter.")
    } finally {
      setProcessingCash(false)
    }
  }

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Payment Options...</p>
      </div>
    )
  }

  // --- VIEW 1: SUCCESS (Online Paid) ---
  if (paymentStatus === 'paid') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        
        {/* Icon with Pop Animation */}
        <div className="animate-in zoom-in duration-500 ease-out">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
            <CheckCircle size={48} className="text-green-600 drop-shadow-sm" />
          </div>
        </div>

        {/* Text with Slide Up & Fade */}
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-backwards">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Received!</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Your transaction was successful. A confirmation email has been sent.
          </p>
        </div>

        {/* Buttons with Slide Up & Fade (Delayed) */}
        <div className="flex flex-col gap-4 w-full max-w-sm animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-backwards">
          
          <button 
             onClick={() => router.push(`/hotels/${hotelId}/${tableId}/orders`)}
             className="bg-rose-600 text-white w-full py-3.5 rounded-xl font-bold hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/20 transition-all active:scale-95"
          >
            Track Order
          </button>

          <Link 
             href={`/hotels/${hotelId}/${tableId}/invoice/${orderId}`}
             className="flex items-center justify-center gap-2 text-slate-600 bg-white border border-slate-200 w-full py-3.5 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors active:scale-95"
          >
            <Download size={18} />
            Download Invoice
          </Link>

        </div>
      </main>
    </div>
    )
  }

  // --- VIEW 2: CASH PENDING INSTRUCTIONS ---
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
            Please pay <span className="font-bold text-slate-900">₹{finalAmount}</span> to the waiter or at the cash counter to complete your order.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link 
               href={`/hotels/${hotelId}/${tableId}/invoice/${orderId}`}
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

  // --- MAIN LAYOUT ---
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-10">
        
        {/* Back Button Logic */}
        <button
          onClick={() => {
            if (paymentMode !== "not-decide") setPaymentMode("not-decide") // Go back to selection
            else router.back() // Go back to previous page
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          {paymentMode !== "not-decide" ? "Change Method" : "Back"}
        </button>

        {/* Total Display */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-slate-500 uppercase tracking-wide">Total Payable</h2>
          <div className="flex items-baseline justify-center gap-1 mt-1">
             <span className="text-4xl font-extrabold text-slate-900">₹{finalAmount}</span>
          </div>
        </div>

        {/* ========================================== */}
        {/* VIEW 3: SELECTION SCREEN (Choose Method) */}
        {/* ========================================== */}
        {paymentMode === "not-decide" && (
           <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setPaymentMode('online')}
                className="w-full bg-white p-6 rounded-2xl border border-rose-100 shadow-lg shadow-rose-100/50 flex items-center justify-between group hover:border-rose-300 transition-all active:scale-[0.98]"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                       <QrCode size={24} />
                    </div>
                    <div className="text-left">
                       <h3 className="text-lg font-bold text-slate-800">Pay Online</h3>
                       <p className="text-sm text-slate-500">UPI, GPay, PhonePe, Paytm</p>
                    </div>
                 </div>
                 <ChevronRight className="text-slate-300 group-hover:text-rose-500 transition-colors" />
              </button>

              <button 
                onClick={() => setPaymentMode('cash')}
                className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-400 transition-all active:scale-[0.98]"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                       <Banknote size={24} />
                    </div>
                    <div className="text-left">
                       <h3 className="text-lg font-bold text-slate-800">Pay Cash</h3>
                       <p className="text-sm text-slate-500">Pay at the counter</p>
                    </div>
                 </div>
                 <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
           </div>
        )}

        {/* ========================================== */}
        {/* VIEW 4: ONLINE PAYMENT (QR Code)         */}
        {/* ========================================== */}
        {paymentMode === 'online' && (
           <div className="animate-in fade-in duration-500">
              <div className="bg-white rounded-3xl shadow-xl shadow-rose-900/5 overflow-hidden border border-rose-100 p-6">
                
                {/* App Deep Link */}
                {/* <a 
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
                        <p className="font-bold text-slate-800">Open UPI App</p>
                        <p className="text-[10px] text-slate-500">Click to pay instantly</p>
                    </div>
                  </div>
                  <span className="text-rose-600 font-bold text-sm">Pay Now</span>
                </a> */}

                {/* QR Section */}
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-200 mb-3 relative">
                    {qrCode ? (
                      <img src={qrCode} alt="UPI QR" className="w-48 h-48 object-contain mix-blend-multiply" />
                    ) : (
                      <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </div>
                  
                  {/* Copy UPI */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 mt-2 mb-4">
                    <span className="text-xs font-mono text-slate-600">{hotelUpi}</span>
                    <button onClick={handleCopyUpi} className="text-slate-400 hover:text-rose-600">
                        {copied ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* IMPORTANT WARNING TEXT */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div>
                      <h4 className="text-sm font-bold text-amber-800 mb-1">Payment Confirmation Required</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">
                          Please show your payment success screen to the counter staff or waiter to confirm your order immediately.
                      </p>
                  </div>
              </div>
           </div>
        )}

        {/* ========================================== */}
        {/* VIEW 5: CASH CONFIRMATION                */}
        {/* ========================================== */}
        {paymentMode === 'cash' && (
         <div className="animate-in fade-in duration-500">
         <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-lg">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Wallet size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Pay Cash at Counter</h3>
            <p className="text-slate-500 text-sm">
               Please pay <span className="font-bold text-slate-900">₹{finalAmount}</span> at the counter. After payment, you can download your invoice.
            </p>
         </div>
       </div>
        )}

      </main>
    </div>
  )
}

