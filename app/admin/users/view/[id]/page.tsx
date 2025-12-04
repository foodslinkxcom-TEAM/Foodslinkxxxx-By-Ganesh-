'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, 
  MapPin, Shield, Building2, Calendar, 
  CheckCircle, XCircle, Loader2, User as UserIcon
} from 'lucide-react';

// --- Interfaces ---
interface User {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  role: "admin" | "hotel" | "user";
  hotelId?: string | { _id: string; name: string }; // Handle both populated and unpopulated
  createdAt?: string;
}

interface Hotel {
  _id: string;
  name: string;
  address: string;
  city: string;
  plan: "free" | "basic" | "premium";
  verified: boolean;
  planExpiry: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch User Details
        const userRes = await fetch(`/api/admin/users/${params.id}`);
        if (!userRes.ok) throw new Error("User not found");
        const userData = await userRes.json();
        setUser(userData);

        // 2. If User has a Hotel Assigned, Fetch Hotel Details
        // We handle whether hotelId is a string or an object
        const hotelId = userData.hotelId 
          ? (typeof userData.hotelId === 'string' ? userData.hotelId : userData.hotelId._id)
          : null;

        if (hotelId) {
          const hotelRes = await fetch(`/api/admin/hotels/${hotelId}`);
          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            setHotel(hotelData.hotel);
          }
        }

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!user || !confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
      router.push('/admin/users');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-slate-500">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* --- Header --- */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-500 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            <p className="text-sm text-slate-500">View detailed account information</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/admin/users/edit/${user._id}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 rounded-lg font-medium transition-colors shadow-sm">
              <Edit size={16} /> Edit
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COL: User Info --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Identity Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-slate-50">
                  <UserIcon size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.name || 'Unnamed User'}</h2>
                  <p className="text-slate-500 font-medium">@{user.username}</p>
                  <div className="mt-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'hotel' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role} Account
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-slate-700 font-medium">{user.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-slate-700 font-medium">{user.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. System Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-slate-400" />
              System Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{user._id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500">Account Created</span>
                <span className="text-slate-700 font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COL: Hotel Details (Conditional) --- */}
        <div className="lg:col-span-1">
          {user.role === 'hotel' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-1 opacity-90">
                  <Building2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Managed Property</span>
                </div>
                <h3 className="text-xl font-bold truncate">
                  {hotel ? hotel.name : 'Loading Hotel...'}
                </h3>
              </div>

              {hotel ? (
                <div className="p-6 space-y-6 flex-1">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                        hotel.plan === 'premium' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        hotel.plan === 'basic' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {hotel.plan} Plan
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                        hotel.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hotel.verified ? <><CheckCircle size={10}/> Verified</> : <><XCircle size={10}/> Unverified</>}
                    </span>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Location</p>
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin size={16} className="text-slate-400 mt-0.5" />
                      <span className="text-sm font-medium">{hotel.address}, {hotel.city}</span>
                    </div>
                  </div>

                  {/* Plan Expiry */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Subscription Expiry</p>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm font-medium">
                        {hotel.planExpiry ? new Date(hotel.planExpiry).toLocaleDateString() : 'Lifetime'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link href={`/admin/hotels/${hotel._id}/edit`}>
                        <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                            Manage Hotel Details
                        </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                   {user.hotelId ? (
                       <Loader2 className="animate-spin text-red-600" />
                   ) : (
                       <>
                        <Building2 size={40} className="text-slate-200 mb-3" />
                        <p className="text-slate-500 text-sm">No hotel assigned to this user.</p>
                        <Link href={`/admin/users/edit/${user._id}`} className="mt-4 text-red-600 text-sm font-medium hover:underline">
                            Assign a Hotel
                        </Link>
                       </>
                   )}
                </div>
              )}
            </div>
          ) : (
            // Info Card for Non-Hotel Users
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 text-center h-full flex flex-col items-center justify-center text-slate-500">
                <UserIcon size={48} className="text-slate-300 mb-4" />
                <p>This user is a standard <strong>{user.role}</strong>.</p>
                <p className="text-sm mt-1">They do not manage any properties.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}