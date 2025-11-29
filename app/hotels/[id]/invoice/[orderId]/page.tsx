"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { ArrowLeft, Download, Printer, Receipt } from "lucide-react"

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  customization?: string
}

interface Order {
  _id: string
  hotelId: string
  table: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

interface Hotel {
  _id: string
  name: string
  address?: string
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, hotelRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch(`/api/hotels/${hotelId}`)
        ])

        if (orderRes.ok) {
          const orderData = await orderRes.json()
          setOrder(orderData)
        } else {
          setError("Order not found")
        }

        if (hotelRes.ok) {
          const hotelData = await hotelRes.json()
          setHotel(hotelData)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (orderId && hotelId) {
      fetchData()
    }
  }, [orderId, hotelId])

  const downloadPDF = () => {
    // Since PDF generation has compatibility issues, use print dialog which allows saving as PDF
    window.print()
  }

  const printInvoice = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground">Loading invoice...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order || !hotel) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <HotelNavbar hotelName={hotel?.name || ""} onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">{error || "Invoice not found"}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tax = order.total * 0.05 // 5% tax
  const finalTotal = order.total + tax

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HotelNavbar hotelName={hotel.name} onSearch={() => {}} />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={printInvoice}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download size={18} />
                Print/Save PDF
              </button>
            </div>
          </div>

          {/* Invoice */}
          <div ref={invoiceRef} className="bg-card border-2 border-border rounded-lg p-8 print:shadow-none print:border-none">
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <Receipt size={48} className="text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Invoice</h1>
              <p className="text-muted-foreground">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>

            {/* Hotel & Order Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-foreground mb-2">From</h3>
                <p className="text-foreground font-medium">{hotel.name}</p>
                {hotel.address && <p className="text-muted-foreground text-sm">{hotel.address}</p>}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Order Details</h3>
                <p className="text-muted-foreground text-sm">Table: {order.table}</p>
                <p className="text-muted-foreground text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-muted-foreground text-sm">Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-foreground font-semibold">Item</th>
                      <th className="px-4 py-3 text-center text-foreground font-semibold">Qty</th>
                      <th className="px-4 py-3 text-right text-foreground font-semibold">Price</th>
                      <th className="px-4 py-3 text-right text-foreground font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground font-medium">{item.name}</p>
                            {item.customization && (
                              <p className="text-muted-foreground text-sm">Note: {item.customization}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-foreground">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-foreground">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-border pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Tax (5%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary border-t border-border pt-2">
                  <span>Total:</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">Thank you for dining with us!</p>
              <p className="text-muted-foreground text-xs mt-2">Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          
        </div>
      </main>
    </div>
  )
}