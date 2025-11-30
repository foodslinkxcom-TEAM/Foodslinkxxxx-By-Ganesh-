'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Utensils, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChefHat, 
  Filter,
  X,
  Check,
  Tag,
  FileText,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";

// --- Types ---
type Category = {
  _id: string;
  name: string;
};

type MenuItem = {
  _id: string;
  name: string;
  category: { _id: string; name: string } | string;
  price: number;
  available: boolean;
  image?: string;
  imageUrl?: string;
  imageFileUrl?: string;
  description?: string;
};

export default function MenuManagerPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Actions State
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null); // For Detail View
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // --- Fetch Data ---
  useEffect(() => {
    if (!hotelId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resCat, resMenu] = await Promise.all([
          fetch(`/api/hotels/${hotelId}/categories`),
          fetch(`/api/hotels/${hotelId}/menu`),
        ]);

        if (!resCat.ok || !resMenu.ok) throw new Error("Failed to fetch data");

        const catJson = await resCat.json();
        const menuJson = await resMenu.json();

        setCategories(catJson.categories || catJson);
        setMenu(menuJson.menu || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [hotelId]);

  // --- Handlers ---

  const handleToggleAvailable = async (itemId: string, current: boolean) => {
    setActionLoading(itemId);
    try {
      // In a real app, optimize this to avoid full reload
      const item = menu.find(m => m._id === itemId);
      const isEmbeddedItem = item && typeof item.category === 'string';
      const apiUrl = isEmbeddedItem
        ? `/api/hotels/${hotelId}/menu-items/${itemId}`
        : `/api/menu/status/${itemId}`;

      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !current }),
      });

      if (!res.ok) throw new Error("Failed");

      // Update local state
      setMenu((prev) => prev.map((item) => item._id === itemId ? { ...item, available: !current } : item));
      
      // Update modal state if open
      if (viewingItem && viewingItem._id === itemId) {
        setViewingItem(prev => prev ? ({ ...prev, available: !current }) : null);
      }

    } catch (error: any) {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item permanently?')) return;
    
    setActionLoading(id);
    try {
      const item = menu.find(m => m._id === id);
      const isEmbeddedItem = item && typeof item.category === 'string';
      const apiUrl = isEmbeddedItem ? `/api/hotels/${hotelId}/menu-items/${id}` : `/api/menu/${id}`;

      const res = await fetch(apiUrl, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');

      setMenu((prev) => prev.filter((item) => item._id !== id));
      if (viewingItem?._id === id) setViewingItem(null); // Close modal if open
    } catch (error: any) {
      alert("Failed to delete item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setActionLoading("cat-add");
    try {
      const res = await fetch(`/api/hotels/${hotelId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, hotelId }),
      });

      if (!res.ok) throw new Error('Failed');

      const newCategory = await res.json();
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (error) {
      alert("Failed to add category");
    } finally {
        setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this category? Items might become uncategorized.')) return;

    try {
      const res = await fetch(`/api/hotels/${hotelId}/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');

      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
      if (selectedCategory === categoryId) setSelectedCategory("all");
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  // --- Helpers ---
  const getCategoryName = (item: MenuItem) => {
    return typeof item.category === 'object' 
      ? item.category?.name 
      : (categories.find(c => c._id === item.category)?.name || "Uncategorized");
  };

  // --- Filtering ---
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemCatId = typeof item.category === 'object' ? item.category?._id : item.category;
    const matchesCategory = selectedCategory === "all" || itemCatId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2 rounded-xl text-rose-600">
                <ChefHat size={32} />
              </span>
              Menu Manager
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Manage your dishes, categories, and availability.
            </p>
          </div>

          <Link href={`/dashboard/hotels/${hotelId}/menu/create`}>
            <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95">
              <Plus size={20} />
              Add New Dish
            </button>
          </Link>
        </div>

        {/* --- Controls Bar --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Add Category Button */}
            <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-start"
            >
                <Plus size={16} /> New Category
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Filter size={18} className="text-slate-400 mr-2 flex-shrink-0" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedCategory === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`group relative px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border flex items-center gap-2 pr-8 ${selectedCategory === cat._id ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}
              >
                {cat.name}
                <span onClick={(e) => handleDeleteCategory(e, cat._id)} className={`absolute right-1 p-1 rounded-full hover:bg-black/20 transition-colors ${selectedCategory === cat._id ? 'text-white' : 'text-slate-400 hover:text-red-500'}`}>
                  <X size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Menu Grid --- */}
        {menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
             <Utensils className="text-slate-300 mb-4" size={48} />
             <h3 className="text-xl font-bold text-slate-700">No items yet</h3>
             <p className="text-slate-500 mb-6">Create your first menu item.</p>
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No items found matching filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredMenu.map((item) => (
              <div 
                key={item._id} 
                onClick={() => setViewingItem(item)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                   {(item.imageFileUrl || item.imageUrl || item.image) ? (
                     <img
                       src={item.imageFileUrl || item.imageUrl || item.image}
                       alt={item.name}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <Utensils size={40} />
                     </div>
                   )}
                   <div className="absolute top-3 right-3">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${item.available ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {item.available ? "Available" : "Hidden"}
                     </span>
                   </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{item.name}</h3>
                    <span className="font-extrabold text-rose-600">₹{item.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1">
                    <Tag size={12} /> {getCategoryName(item)}
                  </p>

                  {/* Quick Actions (Prevent card click) */}
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleAvailable(item._id, item.available)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${item.available ? "bg-slate-50 text-slate-600 hover:bg-slate-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                    >
                      {item.available ? <><EyeOff size={16} /> Hide</> : <><Eye size={16} /> Show</>}
                    </button>
                    <button onClick={() => router.push(`/dashboard/hotels/${hotelId}/menu/edit/${item._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- 1. NEW CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Category</h3>
            <input 
              type="text" 
              placeholder="e.g. Starters, Drinks"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
              <button 
                onClick={handleAddCategory} 
                disabled={!newCategoryName.trim() || actionLoading === "cat-add"}
                className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading === "cat-add" ? "Adding..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. PRODUCT DETAILS MODAL --- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setViewingItem(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col md:flex-row">
            
            {/* Image Side */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
               {(viewingItem.imageFileUrl || viewingItem.imageUrl || viewingItem.image) ? (
                 <img
                   src={viewingItem.imageFileUrl || viewingItem.imageUrl || viewingItem.image}
                   alt={viewingItem.name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                   <Utensils size={64} />
                 </div>
               )}
               <button onClick={() => setViewingItem(null)} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 md:hidden">
                 <X size={20} />
               </button>
            </div>

            {/* Info Side */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
               <div className="hidden md:flex justify-end mb-2">
                 <button onClick={() => setViewingItem(null)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                   <X size={24} />
                 </button>
               </div>

               <div className="flex-1">
                 <div className="flex justify-between items-start mb-2">
                    <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                        {getCategoryName(viewingItem)}
                    </span>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${viewingItem.available ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100'}`}>
                        {viewingItem.available ? <Check size={12} /> : <EyeOff size={12}/>}
                        {viewingItem.available ? 'Available' : 'Hidden'}
                    </div>
                 </div>

                 <h2 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{viewingItem.name}</h2>
                 <p className="text-2xl font-black text-rose-600 mb-6">₹{viewingItem.price}</p>

                 <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <FileText size={14} /> Description
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {viewingItem.description || "No description available for this item."}
                        </p>
                    </div>
                 </div>
               </div>

               {/* Actions */}
               <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => { setViewingItem(null); router.push(`/dashboard/hotels/${hotelId}/menu/edit/${viewingItem._id}`); }}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    <Edit3 size={18} /> Edit
                  </button>
                  <button 
                    onClick={() => handleToggleAvailable(viewingItem._id, viewingItem.available)}
                    className={`flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-colors text-white ${viewingItem.available ? 'bg-slate-800 hover:bg-slate-900' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {viewingItem.available ? <><EyeOff size={18} /> Hide</> : <><Eye size={18} /> Make Visible</>}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}