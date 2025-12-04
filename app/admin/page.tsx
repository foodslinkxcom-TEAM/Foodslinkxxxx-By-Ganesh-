"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  CheckCircle, TrendingUp, Users, Calendar, AlertCircle, 
  Plus, Building2, DollarSign, Activity, MoreHorizontal, 
  ArrowRight, Search, Filter, Clock
} from "lucide-react"

interface Hotel {
  _id: string
  name: string
  address: string
  verified: boolean
  plan: "free" | "basic" | "premium"
  planExpiry: string
  maxTables: number
  maxOrdersPerTable: number
  createdAt: string
}

interface Stats {
  totalHotels: number
  verifiedHotels: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminPanel() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [stats, setStats] = useState<Stats>({ totalHotels: 0, verifiedHotels: 0, totalOrders: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [newPlan, setNewPlan] = useState<"free" | "basic" | "premium">("free")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, statsRes] = await Promise.all([
          fetch("/api/admin/hotels"),
          fetch("/api/admin/stats")
        ])

        if (hotelsRes.ok) {
          const data = await hotelsRes.json()
          // Sort by createdAt descending (newest first)
          const sortedHotels = (data.hotels || []).sort((a: Hotel, b: Hotel) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setHotels(sortedHotels)
        }

        if (statsRes.ok) {
          setStats(await statsRes.json())
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleVerifyHotel = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      })
      if (response.ok) {
        setHotels((prev) => prev.map((h) => (h._id === hotelId ? { ...h, verified: true } : h)))
      }
    } catch (error) {
      console.error("Error verifying hotel:", error)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedHotel) return
    try {
      const response = await fetch(`/api/admin/hotels/${selectedHotel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      })
      if (response.ok) {
        const data = await response.json()
        setHotels((prev) => prev.map((h) => (h._id === selectedHotel._id ? data.hotel : h)))
        setShowPlanModal(false)
        setSelectedHotel(null)
      }
    } catch (error) {
      console.error("Error changing plan:", error)
    }
  }

  const handleRejectHotel = async (hotelId: string) => {
    if(!confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await fetch(`/api/admin/hotels/${hotelId}`, { method: "DELETE" })
      setHotels((prev) => prev.filter((h) => h._id !== hotelId))
    } catch (error) {
      console.error("Error rejecting hotel:", error)
    }
  }

  const isPlanExpired = (expiryDate: string) => new Date(expiryDate) < new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your platform metrics and partners.</p>
          </div>
          <Link href="/admin/hotels/create">
            <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus size={18} />
              Add New Hotel
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={<Building2 size={20} className="text-red-600" />}
            label="Total Hotels"
            value={stats.totalHotels}
            trend="+12% this month"
            bg="bg-red-50"
          />
          <StatCard 
            icon={<CheckCircle size={20} className="text-green-600" />}
            label="Verified Partners"
            value={stats.verifiedHotels}
            trend="95% verification rate"
            bg="bg-green-50"
          />
          <StatCard 
            icon={<Users size={20} className="text-purple-600" />}
            label="Total Orders"
            value={stats.totalOrders}
            trend="+8% from last week"
            bg="bg-purple-50"
          />
          <StatCard 
            icon={<DollarSign size={20} className="text-orange-600" />}
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            trend="Updated just now"
            bg="bg-orange-50"
          />
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Clock size={18} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
            </div>
            
            <Link 
              href="/admin/hotels" 
              className="group flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              View All Hotels
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hotel Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotels.length > 0 ? (
                  // Showing only top 8 for dashboard view
                  hotels.slice(0, 8).map((hotel) => (
                    <tr key={hotel._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {hotel.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{hotel.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                            hotel.plan === 'premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            hotel.plan === 'basic' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {hotel.plan}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            Exp: {new Date(hotel.planExpiry).toLocaleDateString()}
                            {isPlanExpired(hotel.planExpiry) && <AlertCircle size={10} className="text-red-500" />}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hotel.verified ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            Verified
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleVerifyHotel(hotel._id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            Verify Now
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(hotel.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-gray-400">
                          {new Date(hotel.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedHotel(hotel)
                              setNewPlan(hotel.plan)
                              setShowPlanModal(true)
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit Plan"
                          >
                            <DollarSign size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectHotel(hotel._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <AlertCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 size={40} className="text-gray-300 mb-3" />
                        <p className="text-sm">No recent hotels found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {hotels.length > 8 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-center">
              <Link href="/admin/hotels" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                View {hotels.length - 8} more hotels
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Plan Update Modal */}
      {showPlanModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update Subscription</h3>
            <p className="text-sm text-gray-500 mb-6">Modify plan for <span className="font-medium text-gray-900">{selectedHotel.name}</span></p>

            <div className="space-y-3 mb-8">
              {(["free", "basic", "premium"] as const).map((plan) => (
                <label
                  key={plan}
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    newPlan === plan
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={plan}
                      checked={newPlan === plan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="font-medium text-gray-900 capitalize">{plan} Plan</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {plan === 'free' ? '₹0' : plan === 'basic' ? '₹999' : '₹2999'}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Stat Card Component
function StatCard({ icon, label, value, trend, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${bg}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500">
        <TrendingUp size={14} className="text-green-600" />
        <span className="text-green-600">{trend}</span>
      </div>
    </div>
  )
}