"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Lock, 
  CreditCard, 
  Trash2, 
  Save, 
  Loader2, 
  Building, 
  Smartphone,
  ShieldAlert,
  CheckCircle
} from "lucide-react";

// --- Types ---
interface IHotel {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  upiId: string;
  verified: boolean;
  plan: string;
  maxTables: number;
  maxOrdersPerTable: number;
  locationVerificationRadius: number;
  planExpiry: string;
  email?: string;
  phone?: string;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  // --- State ---
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "security" | "billing" | "danger">("general");
  
  // Password State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setHotel(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId]);

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hotel) return;
    const { name, value, type } = e.target;
    setHotel({
      ...hotel,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (hotel) {
            setHotel({
              ...hotel,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            alert("Location coordinates updated! Don't forget to save.");
          }
        },
        (error) => alert("Error getting location: " + error.message)
      );
    } else {
      alert("Geolocation is not supported.");
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hotel),
      });

      if (!res.ok) throw new Error("Failed to update");
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert("Update failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        alert("New passwords do not match");
        return;
    }
    setSaving(true);
    try {
        // Implement your password update API call here
        const res = await fetch(`/api/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                hotelId, 
                
                currentPassword: passwords.current, 
                newPassword: passwords.new 
            })
        });
        if(!res.ok) throw new Error("Failed to change password");
        alert("Password updated successfully");
        setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
        alert(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
      const confirmText = prompt("Type 'DELETE' to confirm account deletion. This cannot be undone.");
      if (confirmText === "DELETE") {
          try {
              const res = await fetch(`/api/hotels/${hotelId}`, { method: 'DELETE' });
              if (res.ok) {
                  alert("Account deleted. Redirecting...");
                  router.push('/');
              }
          } catch (err) {
              alert("Failed to delete account");
          }
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-rose-600" size={40} />
      </div>
    );
  }

  if (!hotel) return <div className="p-8 text-center">Hotel not found.</div>;

  // --- Render Helpers ---
  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-3 px-6 py-4 w-full text-left transition-all border-l-4
        ${activeTab === id 
          ? "bg-rose-50 border-rose-600 text-rose-700 font-bold" 
          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your hotel profile, security, and billing.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- Sidebar Navigation --- */}
          <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <nav className="flex flex-col">
              <TabButton id="general" label="General" icon={User} />
              <TabButton id="security" label="Security" icon={Lock} />
              <TabButton id="billing" label="Plan & Billing" icon={CreditCard} />
              <div className="my-2 border-t border-slate-100 mx-4"></div>
              <TabButton id="danger" label="Danger Zone" icon={ShieldAlert} />
            </nav>
          </div>

          {/* --- Main Content Area --- */}
          <div className="flex-1">
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Section: Basic Info */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building size={20} className="text-rose-500" /> Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Hotel Name</label>
                      <input 
                        name="name" 
                        value={hotel.name} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">UPI ID (For Payments)</label>
                      <input 
                        name="upiId" 
                        value={hotel.upiId} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Address</label>
                      <input 
                        name="address" 
                        value={hotel.address} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* Section: Location */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-rose-500" /> Location Settings
                  </h2>
                  
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-rose-900">Update GPS Coordinates</p>
                      <p className="text-xs text-rose-700 mt-1">Required for "Location Verified" orders.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-rose-600 text-sm font-bold rounded-lg border border-rose-200 shadow-sm hover:bg-rose-100 transition-colors"
                    >
                      <MapPin size={16} /> Detect My Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Latitude</label>
                      <input 
                        type="number" 
                        name="latitude" 
                        value={hotel.latitude} 
                        onChange={handleChange}
                        step="any"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Longitude</label>
                      <input 
                        type="number" 
                        name="longitude" 
                        value={hotel.longitude} 
                        onChange={handleChange}
                        step="any"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* 2. SECURITY TAB */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lock size={20} className="text-rose-500" /> Change Password
                </h2>
                
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {/* 3. BILLING TAB */}
            {activeTab === "billing" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Current Plan Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   
                   <div className="relative z-10 flex justify-between items-start">
                      <div>
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Plan</p>
                         <h2 className="text-3xl font-black">{hotel.plan}</h2>
                         <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-400"/> Status: {hotel.verified ? "Active" : "Inactive"}
                         </p>
                      </div>
                      <div className="text-right">
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Renews On</p>
                         <p className="text-lg font-bold">{new Date(hotel.planExpiry).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-slate-700">Table Limit</span>
                         <span className="text-sm font-bold text-rose-600">{hotel.maxTables} Tables</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                         <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Upgrade to add more tables.</p>
                   </div>
                   
                   <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-slate-700">Location Verification</span>
                         <span className="text-sm font-bold text-emerald-600">
                            {hotel.verified ? "Active" : "Inactive"}
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                         GPS verification radius: {hotel.locationVerificationRadius} meters.
                      </p>
                   </div>
                </div>

                <div className="pt-2">
                   <button className="px-6 py-3 border-2 border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors w-full sm:w-auto">
                      Upgrade Plan / Manage Payment
                   </button>
                </div>
              </div>
            )}

            {/* 4. DANGER ZONE TAB */}
            {activeTab === "danger" && (
              <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
                    <ShieldAlert size={20} /> Danger Zone
                 </h2>
                 <p className="text-red-600/80 mb-6 text-sm">
                    Deleting your account is permanent. All your data, including menu items, orders, and sales history, will be wiped immediately. This action cannot be undone.
                 </p>
                 
                 <div className="bg-white p-4 rounded-xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-slate-800">Delete Account</h3>
                        <p className="text-xs text-slate-500">Permanently remove your hotel from FoodsLinkX.</p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
                    >
                       <Trash2 size={16} /> Delete Account
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}