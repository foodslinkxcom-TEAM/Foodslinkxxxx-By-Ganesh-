'use client'

import { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Shield, 
  Clock, 
  MapPin, 
  ExternalLink, 
  AlertCircle, 
  Building2, 
  Loader2, 
  Calendar,
  CreditCard
} from 'lucide-react';
import Link from "next/link"

// --- Types ---
interface Hotel {
  _id: string;
  name: string;
  address: string;
  upiId: string;
  plan: 'free' | 'basic' | 'premium';
  createdAt: string;
}

export default function VerificationRequestsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchUnverifiedHotels = async () => {
      try {
        const res = await fetch('/api/admin/hotels/unverified');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setHotels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnverifiedHotels();
  }, []);

  // --- Actions ---
  const handleAction = async () => {
    if (!selectedHotel || !actionType) return;

    setProcessing(true);
    try {
      const endpoint = actionType === 'verify' 
        ? `/api/admin/hotels/verify/${selectedHotel._id}` 
        : `/api/admin/hotels/reject/${selectedHotel._id}`;
      
      const method = actionType === 'verify' ? 'PATCH' : 'DELETE';

      const res = await fetch(endpoint, { method });

      if (!res.ok) throw new Error(`Failed to ${actionType}`);

      // Update UI
      setHotels(prev => prev.filter(h => h._id !== selectedHotel._id));
      closeModal();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (hotel: Hotel, type: 'verify' | 'reject') => {
    setSelectedHotel(hotel);
    setActionType(type);
  };

  const closeModal = () => {
    setSelectedHotel(null);
    setActionType(null);
  };

  // --- Helpers ---
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="text-red-600" size={32} />
              Verification Requests
            </h1>
            <p className="text-slate-500 mt-1">Review and approve new hotel registrations.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <span className="text-sm font-medium text-slate-500">Pending:</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-sm">
              {hotels.length}
            </span>
          </div>
        </div>

        {/* --- Empty State --- */}
        {hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-16 rounded-3xl shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Check size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">All caught up!</h2>
            <p className="text-slate-500 mt-2 max-w-md">
              There are no pending verification requests at the moment. Great job keeping the queue clean.
            </p>
          </div>
        ) : (
          /* --- Grid --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div 
                key={hotel._id} 
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-red-900/5 hover:border-red-100 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 mb-2">
                      <Building2 size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize flex items-center gap-1 ${getPlanBadge(hotel.plan)}`}>
                      <CreditCard size={10} /> {hotel.plan}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {hotel.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={12} /> Requested: {new Date(hotel.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 pt-4 flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 line-clamp-2">{hotel.address}</span>
                  </div>
                  
                  {/* Link to Full Profile */}
                  <div className="pt-2">
                    <Link 
                      href={`/admin/verify/${hotel._id}`} // Changed to internal admin view route usually
                      className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      View Documents <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                {/* Card Footer / Actions */}
                <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openModal(hotel, 'reject')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm"
                  >
                    <X size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => openModal(hotel, 'verify')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-green-600 transition-all text-sm shadow-md"
                  >
                    <Shield size={16} />
                    Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Confirmation Modal --- */}
      {selectedHotel && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 scale-100">
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                actionType === 'verify' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {actionType === 'verify' ? <Shield size={28} /> : <AlertCircle size={28} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 capitalize">
                {actionType} Hotel?
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Are you sure you want to <strong>{actionType}</strong> <span className="text-slate-800 font-medium">{selectedHotel.name}</span>?
                {actionType === 'reject' && " This action cannot be undone."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${
                  actionType === 'verify' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {processing ? <Loader2 size={18} className="animate-spin" /> : (actionType === 'verify' ? 'Confirm Verify' : 'Confirm Reject')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}