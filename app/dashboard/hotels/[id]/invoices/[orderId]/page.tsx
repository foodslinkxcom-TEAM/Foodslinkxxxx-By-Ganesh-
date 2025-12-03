"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Receipt, 
  MapPin, 
  ChefHat 
} from "lucide-react"

// ... (Keep Interfaces same as before)
interface OrderItem {
  _id: string
  name: string
  price: number
  quantity: number
  customization?: string
}

interface Charges {
  label:string;
  amount:number;
  type:string;
  _id:string;
}
interface Customer{
  name:string
  contact:number
}

interface Order {
  _id: string
  table: string
  items: OrderItem[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
  additionalCharges:Charges[]
  subTotal:number
  customer:Customer
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

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Generating Invoice...</p>
      </div>
    )
  }

  if (error || !order || !hotel) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <HotelNavbar hotelName={hotel?.name || ""} onSearch={() => {}} />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <p className="text-lg font-bold text-slate-800 mb-2">{error || "Invoice not found"}</p>
          <button onClick={() => router.back()} className="text-rose-600 underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const subTotal = order.total
  const taxRate = 0.05
  const taxAmount = subTotal * taxRate
  const grandTotal = subTotal + taxAmount

  return (
    <>
      {/* 1. FORCE PRINT COLORS 
         This style tag forces the browser to respect background colors and text colors
      */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          /* Hide default browser headers/footers if possible */
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 print:bg-white pb-20 print:pb-0">

        <main className="max-w-3xl mx-auto px-4 py-6 print:p-0 print:max-w-none print:w-full">
          
          {/* Toolbar (Hidden in Print) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
            <button
              onClick={() => router.back()}
              className="self-start flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2.5 rounded-xl hover:bg-rose-700 transition-colors font-semibold shadow-md shadow-rose-200"
              >
                <Download size={18} />
                Download / Print Bill
              </button>
            </div>
          </div>

          {/* INVOICE CARD 
              Removed 'print:shadow-none' and 'print:border-none' if you want the border to show,
              but usually, full-page print looks better without the outer card border.
              I kept colors active (removed print:grayscale).
          */}
          <div 
            id="invoice-content"
            className="bg-white p-8 md:p-12 rounded-xl shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden print:shadow-none print:border-none print:rounded-none print:p-8 print:w-full"
          >
            {/* Paid Stamp */}
            {order.status === 'paid' && (
              <div className="absolute top-12 right-12 border-4 border-green-500 text-green-500 font-black text-4xl uppercase tracking-widest px-4 py-2 rotate-[-15deg] opacity-20 pointer-events-none">
                PAID
              </div>
            )}

            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-slate-200 pb-8 mb-8">
              <div className="flex justify-center mb-4">
                 <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                    <ChefHat size={32} />
                 </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{hotel.name}</h1>
              {hotel.address && (
                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mb-1">
                  <MapPin size={14} />
                  <span>{hotel.address}</span>
                </div>
              )}
            </div>

            {/* Meta Data */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-8">
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-slate-800">Name: {order?.customer.name}</p>
                <p className="font-bold text-slate-800">Contact: {order?.customer.contact}</p>
                <p className="text-slate-600">Table No: {order.table}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">Invoice Details</p>
                <p className="font-bold text-slate-800">#{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full text-sm">
                <thead className="bg-rose-50 text-rose-900 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-l-lg">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {item.name}
                        {item.customization && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {item.customization}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">₹{item.price}</td>
                      <td className="px-4 py-3 text-right text-slate-800 font-bold">
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Summary */}
            <div className="flex justify-end mb-12">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{order.subTotal}</span>
                </div>
                {order?.additionalCharges?.map((c)=>(
                <div className="flex justify-between text-slate-600 text-sm" key={c._id}>
                <span>{c?.label}</span>
                <span className="font-medium">₹{c?.amount}</span>
              </div>
              ))}
                <div className="border-t-2 border-slate-800 my-2 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-lg">Grand Total</span>
                  <span className="font-extrabold text-rose-600 text-2xl">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-slate-100 pt-8">
              <h3 className="text-rose-600 font-bold text-lg mb-1">Thank You!</h3>
              <p className="text-slate-500 text-sm mb-4">We hope you enjoyed your meal.</p>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}