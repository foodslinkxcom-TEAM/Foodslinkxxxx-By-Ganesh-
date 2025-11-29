"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PaymentQRProps {
  orderId: string
  hotelId: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hotelId = params.id as string
  const orderId = searchParams.get("orderId") as string

  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [hotelName, setHotelName] = useState("")
  const [total, setTotal] = useState(0)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
         // Fetch order total
         const orderResponse = await fetch(`/api/orders/${orderId}`)
         const orderData = await orderResponse.json()
         if (orderResponse.ok) {
           setTotal(orderData.total)
         }

        // Fetch hotel data for UPI QR
        const hotelResponse = await fetch(`/api/hotels/${hotelId}`)
        if (hotelResponse.ok) {
          const hotelData = await hotelResponse.json()
          setHotelName(hotelData.name)

          // Generate QR code
          const qrResponse = await fetch("/api/payment/qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              upiId: hotelData.upiId,
              hotelName: hotelData.name,
              amount:orderData.total , // Will be set from order
              orderId,
            }),
          })

          if (qrResponse.ok) {
            const qrData = await qrResponse.json()
            setQrCode(qrData.qrCode)
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
  }, [hotelId, orderId])

  const handleConfirmPayment = async () => {
    setConfirming(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      })

      if (response.ok) {
        setPaymentConfirmed(true)
        setTimeout(() => {
          router.push(`/hotels/${hotelId}/orders`)
        }, 2000)
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading payment...</p>
        </div>
      </div>
    )
  }

  if (paymentConfirmed) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <HotelNavbar hotelName={hotelName} onSearch={() => {}} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Confirmed!</h2>
            <p className="text-muted-foreground mb-4">Thank you for your order</p>
            <p className="text-lg font-semibold text-primary">₹{(total * 1.05).toFixed(2)}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HotelNavbar hotelName={hotelName} onSearch={() => {}} />

      <main className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
        <button
          onClick={() => window.history.back()}
          className="self-start mb-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Scan to Pay</h2>
          <p className="text-muted-foreground text-center mb-6">Use any UPI app to scan and pay</p>

          {/* QR Code */}
          {qrCode && (
            <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
              <img src={qrCode || "/placeholder.svg"} alt="UPI QR Code" className="w-64 h-64" />
            </div>
          )}

          {/* Amount */}
          <div className="bg-card border-2 border-border rounded-lg p-4 mb-6 text-center">
            <p className="text-muted-foreground mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-primary">₹{(total * 1.05).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">Including 5% tax</p>
          </div>

          {/* Payment Instructions */}
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-2">Payment Instructions:</h3>
            <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
              <li>Open any UPI app (Google Pay, PhonePe, etc.)</li>
              <li>Scan the QR code above</li>
              <li>Confirm the payment</li>
              <li>Click "Confirm Payment" below</li>
            </ol>
          </div>

          {/* Confirm Payment Button */}
          <Link href={`/hotels/${hotelId}/invoice/${orderId}`}>
          <button
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mb-3"
          >
            Download Invoice
          </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
