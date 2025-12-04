'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Filter, MoreVertical, 
  Mail, Phone, Building2, User as UserIcon, 
  Trash2, Edit, Eye, Loader2, Shield 
} from 'lucide-react';

// --- Types ---
interface User {
  _id: string;
  username: string;
  name?: string;       // Added field
  email?: string;      // Added field
  phone?: string;      // Added field
  role: string;
  // hotelId can be a populated object OR just a string ID based on your prompt
  hotelId: string | { _id: string; name: string } | null; 
}

interface Hotel {
  _id: string;
  name: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [hotelMap, setHotelMap] = useState<Record<string, string>>({}); // Map ID -> Name
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- 1. Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Users and Hotels in parallel
        const [usersRes, hotelsRes] = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/admin/hotels')
        ]);

        if (usersRes.ok) {
          const userData = await usersRes.json();
          setUsers(userData || []);
        }

        // Create a Lookup Map for Hotels (ID -> Name)
        if (hotelsRes.ok) {
            const hotelData = await hotelsRes.json();
            const map: Record<string, string> = {};
            // Assuming hotelData.hotels is the array
            (hotelData.hotels || []).forEach((h: Hotel) => {
                map[h._id] = h.name;
            });
            setHotelMap(map);
        }

      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const closeMenu = () => setActiveDropdown(null);
    if (activeDropdown) document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [activeDropdown]);

  // --- 2. Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search Logic (Case insensitive, checks all fields)
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (user.username || '').toLowerCase().includes(term) ||
        (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.phone || '').includes(term) ||
        // Check dynamic hotel name
        (getHotelName(user.hotelId) || '').toLowerCase().includes(term);

      // Role Logic
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter, hotelMap]);

  // Helper to resolve Hotel Name safely
  function getHotelName(hotelId: User['hotelId']) {
    if (!hotelId) return null;
    if (typeof hotelId === 'string') return hotelMap[hotelId] || 'Unknown Hotel'; // Dynamic Lookup
    return hotelId.name; // If already populated
  }

  // --- 3. Actions ---
  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        alert("Failed to delete user");
      }
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

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-24">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform access, roles, and hotel assignments.</p>
        </div>
        <Link href="/admin/users/create">
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all active:scale-95">
            <Plus size={18} />
            <span>Create User</span>
          </button>
        </Link>
      </div>

      {/* --- Smart Filters --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        
        {/* Universal Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name, email, phone, hotel..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-red-500 outline-none appearance-none cursor-pointer hover:bg-slate-50"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hotel">Hotel Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* --- Desktop Table --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Access</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Hotel</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td></tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{user.name || user.username}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {user.email && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" /> {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" /> {user.phone}
                      </div>
                    )}
                    {!user.email && !user.phone && <span className="text-slate-400 text-sm">-</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                    user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    user.role === 'hotel' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Building2 size={16} className="text-slate-400" />
                    {getHotelName(user.hotelId) || <span className="text-slate-400 italic">No Hotel</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === user._id ? null : user._id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === user._id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => router.push(`/admin/users/view/${user._id}`)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Eye size={14} /> View
                        </button>
                        <button onClick={() => router.push(`/admin/users/edit/${user._id}`)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card View --- */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            {/* Top Row: Profile & Actions */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user.name || user.username}</h3>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'hotel' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Mobile Actions Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === user._id ? null : user._id);
                  }}
                  className="p-1 text-slate-400"
                >
                  <MoreVertical size={20} />
                </button>
                {activeDropdown === user._id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1">
                    <button onClick={() => router.push(`/admin/users/edit/${user._id}`)} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Edit size={16} /> Edit Details
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                      <Trash2 size={16} /> Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{user.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={14} className="text-slate-400 shrink-0" />
                <span className="truncate font-medium text-slate-800">
                  {getHotelName(user.hotelId) || 'Not assigned'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            No users found matching filters.
          </div>
        )}
      </div>

    </div>
  );
}