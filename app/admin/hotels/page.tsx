'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard,
  MapPin,
  Star,
  Plus,
  X
} from 'lucide-react';

// --- Types ---
interface Hotel {
  _id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  pricePerNight: number;
  rating: number;
  verified: boolean;
  images: string[];
  locationVerificationRadius: number;
  plan: "free" | "basic" | "premium";
  planExpiry: Date;
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "basic" | "premium">("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "newest">("name");

  // Modal State
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<"free" | "basic" | "premium">("free");

  // --- Fetch Data ---
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/hotels', { credentials: 'include' });
        const data = await res.json();
        setHotels(data.hotels || []);
      } catch (error) {
        console.error("Failed to load hotels", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // --- Filter & Sort Logic ---
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(lowerQuery) || 
        h.city.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Filter
    if (planFilter !== 'all') {
      result = result.filter(h => h.plan === planFilter);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // Default (usually insertion order)
    });

    return result;
  }, [hotels, searchQuery, planFilter, sortBy]);

  // --- Actions ---
  const handleChangePlan = async () => {
    if (!selectedHotel) return;

    try {
      const response = await fetch(`/api/admin/hotels/${selectedHotel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setHotels((prev) => prev.map((h) => (h._id === selectedHotel._id ? data.hotel : h)));
        setShowPlanModal(false);
        setSelectedHotel(null);
      }
    } catch (error) {
      console.error("Error changing plan:", error);
    }
  };

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 pb-24 md:p-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Hotels</h1>
          <p className="text-slate-500 mt-1">View, edit, and manage subscription plans.</p>
        </div>
        <Link href="/admin/hotels/create">
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all active:scale-95">
            <Plus size={18} />
            Add New Hotel
          </button>
        </Link>
      </div>

      {/* --- Controls Bar --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 cursor-pointer hover:bg-slate-50"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-red-500 cursor-pointer hover:bg-slate-50"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="rating">Sort: Rating (High)</option>
          </select>
        </div>
      </div>

      {/* --- Loading State --- */}
      {loading && (
        <div className="flex justify-center py-20 text-red-500">
           Loading hotels data...
        </div>
      )}

      {/* --- DESKTOP VIEW: Table --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Hotel Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Location</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Current Plan</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Rating</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHotels.length === 0 && !loading && (
               <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hotels found.</td></tr>
            )}
            {filteredHotels.map((hotel) => (
              <tr key={hotel._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{hotel.name}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">{hotel.description || 'No description'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1"><MapPin size={14}/> {hotel.city}, {hotel.country}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPlanColor(hotel.plan)} capitalize`}>
                    {hotel.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      hotel.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {hotel.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {hotel.verified ? 'Verified' : 'Unverified'}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star size={14} fill="currentColor" /> {hotel.rating || 'N/A'}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       onClick={() => { setSelectedHotel(hotel); setNewPlan(hotel.plan); setShowPlanModal(true); }}
                       className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                       title="Change Plan"
                    >
                       <CreditCard size={18} />
                    </button>
                    <Link href={`/admin/hotels/${hotel._id}/edit`}>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit3 size={18} />
                      </button>
                    </Link>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW: Cards --- */}
      <div className="md:hidden space-y-4">
        {filteredHotels.length === 0 && !loading && (
           <div className="text-center py-10 text-slate-400">No hotels found matching your search.</div>
        )}
        {filteredHotels.map((hotel) => (
          <div key={hotel._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 relative overflow-hidden">
            {/* Top Row: Name & Rating */}
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-bold text-lg text-slate-900">{hotel.name}</h3>
                 <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                   <MapPin size={14}/> {hotel.city}
                 </p>
               </div>
               <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg">
                  <Star size={14} fill="currentColor" /> {hotel.rating || 'N/A'}
               </div>
            </div>

            {/* Middle Row: Badges */}
            <div className="flex gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPlanColor(hotel.plan)} capitalize flex items-center gap-1`}>
                 <CreditCard size={12}/> {hotel.plan}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                  hotel.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                {hotel.verified ? <><ShieldCheck size={12} /> Verified</> : <><ShieldAlert size={12} /> Unverified</>}
              </span>
            </div>

            {/* Bottom Row: Actions */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100">
               <button 
                  onClick={() => { setSelectedHotel(hotel); setNewPlan(hotel.plan); setShowPlanModal(true); }}
                  className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  Plan
               </button>
               <Link href={`/admin/hotels/${hotel._id}/edit`} className="w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    Edit
                  </button>
               </Link>
               <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                  Delete
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Plan Change Modal --- */}
      {showPlanModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Subscription Plan</h2>
              <p className="text-slate-500">Updating plan for <span className="font-semibold text-slate-800">{selectedHotel.name}</span></p>
            </div>

            <div className="space-y-3 mb-8">
              {(["free", "basic", "premium"] as const).map((plan) => (
                <label
                  key={plan}
                  className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    newPlan === plan
                      ? 'border-red-500 bg-red-50 shadow-md ring-1 ring-red-500'
                      : 'border-slate-200 hover:border-red-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${newPlan === plan ? 'border-red-600' : 'border-slate-300'}`}>
                    {newPlan === plan && <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 capitalize text-lg">{plan} Plan</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan === 'free' && 'Basic visibility, 5% commission'}
                      {plan === 'basic' && 'Priority support, 3% commission'}
                      {plan === 'premium' && 'Zero commission, Top listing'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}