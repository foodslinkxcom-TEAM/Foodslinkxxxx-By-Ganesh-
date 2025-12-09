'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, ArrowLeft, MapPin, CreditCard, 
  Settings, Crown, ShieldCheck, Navigation, 
  Loader2, UtensilsCrossed, AlertTriangle 
} from 'lucide-react';

// Updated Plan Types
type PlanType = "starter" | "pro" | "diamond" | "custom";

// Full Hotel Interface based on your model
interface Hotel {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  upiId: string;
  verified: boolean;
  plan: PlanType;
  planExpiry: string;
  maxTables: number;
  maxOrdersPerTable: number;
  locationVerificationRadius: number;
  createdAt: string;
}

export default function EditHotelPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initialize state with default values
  const [formData, setFormData] = useState<Omit<Hotel, '_id' | 'createdAt'>>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    upiId: '',
    verified: false,
    plan: 'starter',
    planExpiry: '',
    maxTables: 10,
    maxOrdersPerTable: 5,
    locationVerificationRadius: 500,
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/admin/hotels/${params.id}`);
        const data = await res.json();
        
        if (res.ok && data.hotel) {
          // Normalize plan to ensure it fits our types
          const validPlans = ["starter", "pro", "diamond", "custom"];
          const currentPlan = validPlans.includes(data.hotel.plan) ? data.hotel.plan : 'starter';

          setFormData({
            name: data.hotel.name || '',
            address: data.hotel.address || '',
            latitude: data.hotel.latitude || 0,
            longitude: data.hotel.longitude || 0,
            upiId: data.hotel.upiId || '',
            verified: data.hotel.verified || false,
            plan: currentPlan,
            planExpiry: data.hotel.planExpiry ? new Date(data.hotel.planExpiry).toISOString().split('T')[0] : '',
            maxTables: data.hotel.maxTables || 10,
            maxOrdersPerTable: data.hotel.maxOrdersPerTable || 5,
            locationVerificationRadius: data.hotel.locationVerificationRadius || 500,
          });
        }
      } catch (error) {
        console.error('Error fetching hotel:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleToggle = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hotels/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planExpiry: new Date(formData.planExpiry), // Ensure date object
        }),
      });

      if (res.ok) {
        alert('Hotel updated successfully');
        router.push('/admin/hotels');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update hotel');
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Hotel Details</h1>
              <p className="text-slate-500 text-sm">Update configuration and subscription settings.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             {/* Link to Menu Management (Separate View recommended for arrays) */}
            <button 
              type="button"
              onClick={() => router.push(`/admin/hotels/${params.id}/menu`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              <UtensilsCrossed size={18} />
              Manage Menu
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: General Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-red-500" size={20} />
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="block text-sm font-medium text-slate-700">Verified Status</span>
                  <span className="text-xs text-slate-500">Is this hotel verified?</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('verified')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.verified ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    formData.verified ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Navigation className="text-red-500" size={20} />
                Location & Geofencing
              </h2>
              <button 
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <MapPin size={14} /> Get Current
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Radius (meters)</label>
                <input
                  type="number"
                  name="locationVerificationRadius"
                  value={formData.locationVerificationRadius}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 3: Subscription */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Crown className="text-purple-500" size={20} />
                Subscription Plan
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Plan</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none bg-white capitalize"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="diamond">Diamond</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Expiry</label>
                  <input
                    type="date"
                    name="planExpiry"
                    value={formData.planExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Operational Limits */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="text-gray-500" size={20} />
                Operational Limits
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Tables</label>
                  <input
                    type="number"
                    name="maxTables"
                    value={formData.maxTables}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Maximum unique QR codes allowed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Orders Per Table</label>
                  <input
                    type="number"
                    name="maxOrdersPerTable"
                    value={formData.maxOrdersPerTable}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Active orders limit per session</p>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}