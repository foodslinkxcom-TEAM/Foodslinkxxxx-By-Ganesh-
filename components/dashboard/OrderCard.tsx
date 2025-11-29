"use client"

import { useState } from "react"
import { Clock, Utensils, CheckCircle, DollarSign, AlertCircle, MapPin, Download } from "lucide-react"

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
  location?: {
    lat: number
    lon: number
    accuracy: number
    verified: boolean
    note?: string
  }
  requiresReview?: boolean
  createdAt: string
  updatedAt: string
}

interface OrderCardProps {
  order: Order
  hotelId: string
}

export default function OrderCard({ order, hotelId }: OrderCardProps) {
  const [updating, setUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "cooking":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "served":
        return "bg-green-100 text-green-800 border-green-300"
      case "paid":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />
      case "cooking":
        return <Utensils size={16} />
      case "served":
        return <CheckCircle size={16} />
      case "paid":
        return <DollarSign size={16} />
      default:
        return null
    }
  }

  const getNextStatus = (status: string) => {
    const statusFlow = { pending: "cooking", cooking: "served", served: "paid", paid: "paid" }
    return statusFlow[status as keyof typeof statusFlow]
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const nextStatus = getNextStatus(order.status)
      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        console.error("Error updating order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdating(false)
    }
  }

  // const handleLocationApproval = async (approved: boolean) => {
  //   try {
  //     const response = await fetch(`/api/hotels/${hotelId}/verify-location`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ orderId: order._id, approved }),
  //     })

  //     if (!response.ok) {
  //       console.error("Error verifying location")
  //     }
  //   } catch (error) {
  //     console.error("Error:", error)
  //   }
  // }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Table {order.table}</h3>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(order.status)} shadow-sm`}>
          {getStatusIcon(order.status)}
          <span className="text-sm font-semibold capitalize">{order.status}</span>
        </div>
      </div>

      {/* {order.requiresReview && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600" />
          <span className="text-sm text-red-700 font-medium">Location verification required</span>
        </div>
      )} */}

      {/* {order.location && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <MapPin size={16} className="text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">
            {order.location.verified ? "Location verified" : "Location unverified"}
          </span>
        </div>
      )} */}

      {/* Items */}
      <div className="space-y-3 mb-6 pb-4 border-b border-gray-200">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex-1">
              <span className="text-gray-900 font-medium">
                {item.quantity}x {item.name}
              </span>
              {item.customization && (
                <p className="text-sm text-gray-600 mt-1">{item.customization}</p>
              )}
            </div>
            <span className="text-gray-900 font-bold">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl">
        <span className="font-semibold text-gray-900 text-lg">Total:</span>
        <span className="text-2xl font-bold text-green-600">₹{order.total}</span>
      </div>

      {/* {order.requiresReview && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleLocationApproval(true)}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Approve
          </button>
          <button
            onClick={() => handleLocationApproval(false)}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Reject
          </button>
        </div>
      )} */}

      {/* Download Invoice Button */}
      <button
        onClick={() => window.open(`/hotels/${hotelId}/invoice/${order._id}`, '_blank')}
        className="w-full mb-3 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Download Invoice
      </button>

      {/* Action Button */}
      {order.status !== "paid" && !order.requiresReview && (
        <button
          onClick={handleStatusUpdate}
          disabled={updating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {updating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </div>
          ) : (
            `Mark as ${getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}`
          )}
        </button>
      )}
    </div>
  )
}
