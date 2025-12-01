'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Calendar, Hash, Crown, 
  MapPin, DollarSign, Mail, Phone, Globe, 
  Save, Loader2, Building, AlertCircle 
} from "lucide-react";

// --- Types ---
type Hotel = {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  upiId: string;
  verified: boolean;
  plan: 'free' | 'basic' | 'premium';
  planExpiry: string; // ISO Date string
  maxTables: number;
  locationVerificationRadius: number;
  createdAt: string;
};

export default function VerifyHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<'saving' | 'verifying' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Fetch Data ---
  useEffect(() => {
    if (!hotelId) setMessage({type:"error",text:"Hotel Id Not Found"});
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/admin/hotels/${hotelId}`);
        if (!res.ok) throw new Error("Failed to fetch hotel details");
        const data = await res.json();
        console.log(data)
        // Format date for input field (YYYY-MM-DD)
        if (data?.hotel?.planExpiry) {
          data.hotel.planExpiry = new Date(data?.hotel?.planExpiry).toISOString().split('T')[0];
        }
        setHotel({...data.hotel,...data.user});
        console.log("data:",hotel)
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
        console.log(err)
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId]);

  // --- Actions ---
  
  // 1. Save Details Only (Does not change verification status)
  const handleSave = async () => {
    await submitUpdate(false);
  };

  // 2. Verify Hotel (Saves details AND sets verified = true)
  const handleVerify = async () => {
    if (confirm("Are you sure you want to verify this hotel and bring it live?")) {
      await submitUpdate(true);
    }
  };

  const submitUpdate = async (shouldVerify: boolean) => {
    if (!hotel) return;
    setProcessing(shouldVerify ? 'verifying' : 'saving');
    setMessage(null);

    try {
      const payload = {
        plan: hotel.plan,
        planExpiry: hotel.planExpiry,
        maxTables: hotel.maxTables,
        locationVerificationRadius: hotel.locationVerificationRadius,
        verified: shouldVerify ? true : hotel.verified // If clicking save, keep current status. If verify, force true.
      };

      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");
      
      const updatedData = await res.json();
      
      // Update local state with response
      setHotel(prev => prev ? { ...prev, ...updatedData.hotel } : null);
      
      setMessage({ 
        type: 'success', 
        text: shouldVerify ? "Hotel verified successfully!" : "Details saved successfully!" 
      });

      if (shouldVerify) {
        setTimeout(() => router.push('/admin/verification-requests'), 1500);
      }

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Something went wrong" });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;
  if (!hotel) return <div className="p-8 text-center text-red-500">Hotel not found</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Link href="/admin/verification-requests" className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Requests</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${hotel.verified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
              {hotel.verified ? 'Live / Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>

        {/* --- Notification Toast --- */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ================= LEFT COL: Read-Only Info ================= */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-red-200">
                  <Building size={32} />
               </div>
               <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
               <p className="text-slate-500 text-sm mt-1">{hotel.description || "No description provided."}</p>
               
               <div className="mt-6 space-y-3">
                 <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-red-500 shrink-0" />
                    <span className="text-sm">{hotel.address}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-red-500 shrink-0" />
                    <a href={`mailto:${hotel.email}`} className="text-sm hover:underline">{hotel.email}</a>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} className="text-red-500 shrink-0" />
                    <span className="text-sm">{hotel.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Globe size={18} className="text-red-500 shrink-0" />
                    <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">UPI: {hotel.upiId}</span>
                 </div>
               </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-900 mb-4">Metadata</h3>
               <div className="text-sm text-slate-500">
                 <p className="flex justify-between py-2 border-b border-slate-50">
                   <span>Registered On</span>
                   <span className="font-medium text-slate-800">{new Date(hotel.createdAt).toLocaleDateString()}</span>
                 </p>
                 <p className="flex justify-between py-2">
                   <span>Hotel ID</span>
                   <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{hotel?._id?.substring(0, 10)}...</span>
                 </p>
               </div>
            </div>
          </div>


          {/* ================= RIGHT COL: Editable Settings ================= */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Configuration & Plan</h2>
              <p className="text-slate-500 text-sm mb-6">Configure subscription limits before verifying.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Plan Selection */}
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Crown size={16} className="text-amber-500"/> Subscription Plan
                      </label>
                      <select 
                        value={hotel.plan} 
                        onChange={(e) => setHotel({ ...hotel, plan: e.target.value as any })} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                      >
                          <option value="free">Free Starter</option>
                          <option value="basic">Basic Tier</option>
                          <option value="premium">Premium / Enterprise</option>
                      </select>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Calendar size={16} className="text-red-500"/> Plan Expiry
                      </label>
                      <input 
                        type="date" 
                        value={hotel.planExpiry} 
                        onChange={(e) => setHotel({ ...hotel, planExpiry: e.target.value })} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                      />
                  </div>

                  {/* Max Tables */}
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Hash size={16} className="text-slate-400"/> Max Table Capacity
                      </label>
                      <input 
                        type="number" 
                        value={hotel.maxTables} 
                        onChange={(e) => setHotel({ ...hotel, maxTables: parseInt(e.target.value) })} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                      />
                  </div>

                  {/* Location Radius */}
                  <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400"/> Geo-Fence Radius (Meters)
                      </label>
                      <input 
                        type="number" 
                        value={hotel.locationVerificationRadius} 
                        onChange={(e) => setHotel({ ...hotel, locationVerificationRadius: parseInt(e.target.value) })} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                      />
                  </div>
              </div>
            </div>

            {/* --- Action Bar --- */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.02)] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-10 md:static">
               <div className="text-sm text-slate-500 hidden sm:block">
                 <p>Review all details carefully.</p>
                 <p>Verification sends an email to the owner.</p>
               </div>
               
               <div className="flex w-full sm:w-auto gap-3">
                  <button 
                    onClick={handleSave} 
                    disabled={processing !== null}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === 'saving' ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                    Save Changes
                  </button>
                  
                  <button 
                    onClick={handleVerify} 
                    disabled={processing !== null}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === 'verifying' ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20} />}
                    {hotel.verified ? 'Update & Save' : 'Approve & Verify'}
                  </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}