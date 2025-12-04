'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, UserPlus, User, Mail, 
  Phone, Lock, Shield, Building2, Loader2, AtSign 
} from 'lucide-react';

interface Hotel {
  _id: string;
  name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  
  // State
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'user', // Default role
    hotelId: ''
  });

  // Fetch Hotels for Dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch('/api/admin/hotels');
        if (res.ok) {
          const data = await res.json();
          setHotels(data.hotels || []);
        }
      } catch (error) {
        console.error("Failed to load hotels", error);
      } finally {
        setLoadingHotels(false);
      }
    };
    fetchHotels();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Logic: Only send hotelId if role is 'hotel'
      const payload = {
        ...formData,
        hotelId: formData.role === 'hotel' ? formData.hotelId : null
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push('/admin/users');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Create New User</h1>
            <p className="text-sm text-slate-500">Add a new administrator, manager, or standard user.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section 1: Credentials */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={14} /> Login Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      required
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. hotel_manager_01"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Personal Details */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Role Assignment */}
            <div className={`transition-all duration-300 ${formData.role === 'hotel' ? 'bg-red-50 p-6 rounded-xl border border-red-100' : ''}`}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={14} /> Access Level
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Role Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Role <span className="text-red-500">*</span></label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all cursor-pointer"
                  >
                    <option value="user">User (Standard)</option>
                    <option value="hotel">Hotel Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Hotel Select (Conditional) */}
                {formData.role === 'hotel' && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assign Hotel <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <select
                        name="hotelId"
                        value={formData.hotelId}
                        onChange={handleChange}
                        required={formData.role === 'hotel'}
                        disabled={loadingHotels}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all cursor-pointer"
                      >
                        <option value="">-- Select Property --</option>
                        {hotels.map(h => (
                          <option key={h._id} value={h._id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}