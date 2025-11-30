'use client'

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Utensils, 
  DollarSign, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  Link as LinkIcon,
  Check,
  X,
  Save,
  Loader2
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;
  const menuId = params.menuId as string; // Assuming route is /menu/edit/[menuId]

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  
  // Image State
  const [imageType, setImageType] = useState<"current" | "file" | "url">("current");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  const [linkTarget, setLinkTarget] = useState("");
  const [available, setAvailable] = useState(true);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Fetch Data on Mount ---
  useEffect(() => {
    if (!hotelId || !menuId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, menuRes] = await Promise.all([
            fetch(`/api/hotels/${hotelId}/categories`),
            // Adjust endpoint based on your API structure. 
            // It might be /api/menu/[id] or /api/hotels/[id]/menu-items/[menuId]
            fetch(`/api/menu/${menuId}`) 
        ]);

        if (!catRes.ok) throw new Error("Failed to fetch categories");
        if (!menuRes.ok) throw new Error("Failed to fetch menu item details");

        const catData = await catRes.json();
        const menuData = await menuRes.json();
        console.log(menuData,"menuData")
        
        // 1. Set Categories
        const cats = catData.categories || catData;
        setCategories(cats);

        // 2. Set Form Data
        const item = menuData.item || menuData; // Handle nested response if any
        setName(item.name);
        setDescription(item.description || "");
        setPrice(item.price);
        setAvailable(item.available);
        setLinkTarget(item.linkTarget || "");

        // Handle Category (could be populated object or string ID)
        if (typeof item.category === 'object' && item.category !== null) {
            setCategory(item.category._id);
        } else {
            setCategory(item.category || (cats.length > 0 ? cats[0]._id : ""));
        }

        // Handle Image
        const existingImg = item.imageFileUrl || item.imageUrl || item.image;
        if (existingImg) {
            setCurrentImage(existingImg);
            setImagePreview(existingImg);
            setImageType("current");
        } else {
            setImageType("file");
        }

      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId, menuId]);

  // --- Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setImagePreview(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (val: string) => {
    setImageUrl(val);
    setImagePreview(val);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      // formData.append('hotelId', hotelId); // Usually not needed for update, but depends on API
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price.toString());
      formData.append('category', category);
      formData.append('available', available.toString());
      
      // Only append image data if changed
      if (imageType === 'file' && imageFile) {
        formData.append('imageFile', imageFile);
      } else if (imageType === 'url' && imageUrl) {
        formData.append('imageUrl', imageUrl);
      }
      
      if (linkTarget) formData.append('linkTarget', linkTarget);

      // Adjust endpoint to your specific update route
      const res = await fetch(`/api/menu/${menuId}`, {
        method: "PUT", // or PATCH
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update menu item");
      }

      router.push(`/dashboard/hotels/${hotelId}/menu`);
    } catch (err: any) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-rose-600" size={40} />
                <p className="text-slate-500 font-medium">Loading details...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors mb-4 font-medium"
                >
                    <ArrowLeft size={18} />
                    <span>Cancel</span>
                </button>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Menu Item</h1>
                <p className="text-slate-500 mt-1">Update details for <span className="font-semibold text-slate-800">{name}</span></p>
            </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                
                {/* --- Section 1: Basic Details --- */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Utensils size={16} className="text-rose-500"/> Item Name
                            </label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" 
                                required 
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <DollarSign size={16} className="text-rose-500"/> Price (₹)
                            </label>
                            <input 
                                type="number" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" 
                                required 
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText size={16} className="text-rose-500"/> Description
                        </label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all min-h-[100px] resize-y" 
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Tag size={16} className="text-rose-500"/> Category
                        </label>
                        <div className="relative">
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none" 
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                            {/* Chevron Icon */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Section 2: Media --- */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Item Image
                    </h3>

                    {/* Image Source Selection */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                        {currentImage && (
                            <button
                                type="button"
                                onClick={() => { setImageType("current"); setImagePreview(currentImage); }}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${imageType === "current" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Keep Current
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setImageType("file")}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${imageType === "file" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Upload New
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageType("url")}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${imageType === "url" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Paste URL
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Input Area */}
                        <div className="md:col-span-2 space-y-4">
                            
                            {imageType === 'current' && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-500">Using existing image. Switch tabs to change.</p>
                                </div>
                            )}

                            {imageType === 'file' && (
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <UploadCloud size={32} className="mx-auto text-slate-400 mb-2 group-hover:text-rose-500 transition-colors" />
                                    <p className="text-sm font-medium text-slate-600">
                                        {imageFile ? imageFile.name : "Click or Drag to Upload New Image"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (Max 5MB)</p>
                                </div>
                            )}

                            {imageType === 'url' && (
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600">External Image URL</label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={imageUrl}
                                            onChange={(e) => handleUrlChange(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                                        />
                                    </div>
                                </div>
                            )}

                             {/* Optional Link Target */}
                             <div className="space-y-2 pt-2">
                                <label className="text-sm text-slate-500 flex items-center gap-1">
                                    Target URL <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-400">Optional</span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={linkTarget}
                                    onChange={(e) => setLinkTarget(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500"
                                />
                             </div>
                        </div>

                        {/* Preview Box */}
                        <div className="bg-slate-100 rounded-xl border border-slate-200 h-48 flex items-center justify-center overflow-hidden relative">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-slate-400 p-4">
                                    <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">No image preview</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Section 3: Settings --- */}
                <div className="pt-2">
                     <div 
                        onClick={() => setAvailable(!available)}
                        className={`
                          flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${available 
                             ? "border-green-500 bg-green-50/50" 
                             : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }
                        `}
                     >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${available ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                {available ? <Check size={20} /> : <X size={20} />}
                            </div>
                            <div>
                                <p className={`font-bold ${available ? 'text-green-800' : 'text-slate-700'}`}>
                                    {available ? "Available for Ordering" : "Currently Unavailable"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {available ? "Customers can see and order this item." : "This item will be hidden from the menu."}
                                </p>
                            </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${available ? 'bg-green-500' : 'bg-slate-300'}`}>
                             <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${available ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                     </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                        <X size={16} /> {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 text-lg font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="flex-[2] py-4 bg-rose-600 text-white text-lg font-bold rounded-xl hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                               <Loader2 className="animate-spin" size={20} />
                               Updating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Update Menu Item
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}