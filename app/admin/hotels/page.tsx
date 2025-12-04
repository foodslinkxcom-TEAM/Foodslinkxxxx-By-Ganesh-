'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, MapPin, Plus, 
  MoreVertical, Edit3, Trash2, 
  Utensils, ShieldCheck, ShieldAlert, 
  Loader2, Building2, ChevronDown 
} from 'lucide-react';

// --- Types ---
interface Hotel {
  _id: string;
  name: string;
  address: string;
  city: string; // Assuming derived from address or separate field
  plan: "free" | "basic" | "premium";
  verified: boolean;
  rating: number;
  totalMenu: number; // Mock field for UI demonstration
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  
  // State for managing the "More" dropdown
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch('/api/admin/hotels');
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // --- Logic ---
  const filteredHotels = useMemo(() => {
    return hotels.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = filterPlan === 'all' || h.plan === filterPlan;
      return matchesSearch && matchesPlan;
    });
  }, [hotels, searchQuery, filterPlan]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this hotel?")) return;
    
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHotels(prev => prev.filter(h => h._id !== id));
      } else {
        alert("Failed to delete hotel");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const styles = {
      premium: "bg-purple-100 text-purple-700 border-purple-200",
      basic: "bg-red-100 text-red-700 border-red-200",
      free: "bg-slate-100 text-slate-600 border-slate-200"
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wide ${styles[plan as keyof typeof styles] || styles.free}`}>
        {plan}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotel Management</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor partners, manage menus, and subscriptions.</p>
        </div>
        <Link href="/admin/hotels/create">
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all active:scale-95">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Hotel</span>
          </button>
        </Link>
      </div>

      {/* --- Filters & Search --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search hotels by name or address..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-red-500 outline-none appearance-none cursor-pointer hover:bg-slate-50"
            >
              <option value="all">All Plans</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
              <option value="free">Free</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* --- Desktop Table View --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hotel Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan & Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHotels.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No hotels found.</td></tr>
            )}
            {filteredHotels.map((hotel) => (
              <tr key={hotel._id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{hotel.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {hotel.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-2">
                    <PlanBadge plan={hotel.plan} />
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {hotel.verified ? (
                        <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1"><ShieldAlert size={12} /> Unverified</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* View Menu Button */}
                    <Link href={`/admin/hotels/${hotel._id}/menu`}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold transition-all shadow-sm">
                        <Utensils size={14} />
                        View Menu
                      </button>
                    </Link>
                    
                    {/* Edit Button */}
                    <Link href={`/admin/hotels/${hotel._id}/edit`}>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit Details">
                        <Edit3 size={16} />
                      </button>
                    </Link>

                    {/* More Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === hotel._id ? null : hotel._id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === hotel._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1 animation-fade-in origin-top-right">
                          <button 
                            onClick={() => handleDelete(hotel._id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={16} /> Delete Hotel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card View --- */}
      <div className="md:hidden space-y-4">
        {filteredHotels.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            No hotels found.
          </div>
        )}
        {filteredHotels.map((hotel) => (
          <div key={hotel._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{hotel.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                    <MapPin size={12} /> {hotel.address || 'No address'}
                  </p>
                </div>
              </div>
              
              {/* More Dropdown (Mobile) */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === hotel._id ? null : hotel._id);
                  }}
                  className="p-1 text-slate-400"
                >
                  <MoreVertical size={20} />
                </button>
                {activeDropdown === hotel._id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1">
                    <button 
                      onClick={() => handleDelete(hotel._id)}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <PlanBadge plan={hotel.plan} />
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                hotel.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {hotel.verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/admin/hotels/${hotel._id}/menu`} className="col-span-1">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors">
                  <Utensils size={16} />
                  Menu
                </button>
              </Link>
              <Link href={`/admin/hotels/${hotel._id}/edit`} className="col-span-1">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors">
                  <Edit3 size={16} />
                  Edit
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}