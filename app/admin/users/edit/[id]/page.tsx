'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, ArrowLeft, User as UserIcon, Mail, 
  Phone, Shield, Building2, Loader2, AtSign 
} from 'lucide-react';

// --- Interfaces ---
interface Hotel {
  _id: string;
  name: string;
}

interface UserFormData {
  username: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "hotel" | "user";
  hotelId: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    hotelId: ''
  });

  // --- Fetch Data ---
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Fetch User and Hotels in parallel
        const [userRes, hotelsRes] = await Promise.all([
          fetch(`/api/admin/users/${params.id}`),
          fetch(`/api/admin/hotels`) // Need list for dropdown
        ]);

        if (!userRes.ok) throw new Error("Failed to fetch user");
        
        const userData = await userRes.json();
        
        // Handle Hotels List
        if (hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          setHotels(hotelsData.hotels || []);
        }

        // Normalize User Data for Form
        // If hotelId comes populated as an object, extract _id, otherwise use string
        const currentHotelId = userData.hotelId 
          ? (typeof userData.hotelId === 'string' ? userData.hotelId : userData.hotelId._id)
          : '';

        setFormData({
          username: userData.username || '',
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'user',
          hotelId: currentHotelId
        });

      } catch (error) {
        console.error("Error loading edit page:", error);
        alert("Error loading user data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [params.id]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare payload - if role is NOT hotel, send hotelId as null/empty
      const payload = {
        ...formData,
        hotelId: formData.role === 'hotel' ? formData.hotelId : null
      };

      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push('/admin/users'); // Redirect to list
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-500 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit User Details</h1>
            <p className="text-sm text-slate-500">Update profile information and permissions</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section 1: Identity */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserIcon size={16} /> Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Contact */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail size={16} /> Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Permissions */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={16} /> Permissions & Access
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Account Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="hotel">Hotel Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Hotel Selector - Only visible if role is 'hotel' */}
                {formData.role === 'hotel' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Hotel</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <select
                        name="hotelId"
                        value={formData.hotelId}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      >
                        <option value="">-- Select a Hotel --</option>
                        {hotels.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      This user will have management access to the selected hotel.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}