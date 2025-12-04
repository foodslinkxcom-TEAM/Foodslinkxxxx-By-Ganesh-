'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, MapPin, CreditCard, Navigation, 
  Settings, Layers, Save, ArrowLeft, Loader2 
} from 'lucide-react'

export default function CreateHotelPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    upiId: '',
    latitude: 0,
    longitude: 0,
    plan: 'free',
    maxTables: 10,
    maxOrdersPerTable: 5,
    locationVerificationRadius: 500
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) : value
    }))
  }

  // Feature: Get current browser location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
      })
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin') // Redirect to list view
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to create hotel.')
      }
    } catch (error) {
      alert('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Hotel</h1>
            <p className="mt-2 text-slate-600">Enter the details to register a new establishment.</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="p-6 sm:p-10 space-y-10">
            
            {/* Section 1: Basic Information */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                <Building2 className="text-blue-600" size={20} />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hotel Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., The Grand Hotel"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g., 123 Main Street, Downtown"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">UPI ID</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      placeholder="merchant@upi"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2: Location Settings */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Navigation className="text-blue-600" size={20} />
                  Geofencing
                </h2>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Get Current Location
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Radius (meters)</label>
                  <input
                    type="number"
                    name="locationVerificationRadius"
                    value={formData.locationVerificationRadius}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3: Configuration */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
                <Settings className="text-blue-600" size={20} />
                Plan & Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subscription Plan</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    >
                      <option value="free">Free Plan</option>
                      <option value="basic">Basic Plan</option>
                      <option value="premium">Premium Plan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Tables</label>
                  <input
                    type="number"
                    name="maxTables"
                    value={formData.maxTables}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Orders Per Table</label>
                  <input
                    type="number"
                    name="maxOrdersPerTable"
                    value={formData.maxOrdersPerTable}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-6 py-5 sm:px-10 flex items-center justify-end gap-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Creating...
                </>
              ) : (
                <>
                  <Save size={20} /> Create Hotel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}