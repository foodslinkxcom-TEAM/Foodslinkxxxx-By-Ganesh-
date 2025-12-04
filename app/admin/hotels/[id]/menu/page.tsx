'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Search, Loader2, Image as ImageIcon, 
  Flame, UtensilsCrossed, ChefHat 
} from 'lucide-react';

// Interfaces based on your data structure
interface Category {
  _id: string;
  name: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category; // Category is an object
  available: boolean;
  imageFileUrl?:string;
  imageUrl?:string;
}

export default function MenuListPage() {
  const params = useParams();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch Logic
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/hotels/${params.id}/menu`);
        const data = await res.json();
        
        if (res.ok && data) {
          setMenuItems(data.menu || []);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [params.id]);

  // Extract Unique Categories correctly
  const categories = useMemo(() => {
    const uniqueCats: Category[] = [];
    const map = new Map();
    
    menuItems.forEach(item => {
      if (item.category && !map.has(item.category._id)) {
        map.set(item.category._id, true);
        uniqueCats.push(item.category);
      }
    });
    return uniqueCats;
  }, [menuItems]);

  // Filter Logic
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* Search & Hero Section */}
      <div className="bg-red-600 px-6 pt-8 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <UtensilsCrossed size={120} className="text-white transform rotate-12" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ChefHat size={32} />
            Menu
          </h1>
          <p className="text-red-100 mb-6 text-sm opacity-90">
            Explore {menuItems.length} delicious delicacies
          </p>

          {/* Interactive Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-red-300 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search for food..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-lg border-2 border-transparent focus:border-red-300 focus:ring-0 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        
        {/* Interactive Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-md ring-2 ring-gray-900'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all transform hover:scale-105 ${
                selectedCategory === cat._id
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-50 mt-4">
            <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
              <UtensilsCrossed className="text-red-300" size={32} />
            </div>
            <p className="text-gray-500 font-medium">No dishes match your search.</p>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item._id} 
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Image Area */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {item.imageUrl || item.imageFileUrl ? (
                  <img 
                    src={item.imageUrl || item.imageFileUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/fee2e2/991b1b?text=Food';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-200">
                    <ImageIcon size={48} />
                    <span className="text-xs font-bold uppercase mt-2">No Image</span>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg font-bold shadow-lg flex items-center gap-1">
                  <span className="text-xs text-red-600">₹</span>
                  <span className="text-lg">{item.price}</span>
                </div>

                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  item.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-800 text-white'
                }`}>
                  {item.available ? 'Available' : 'Sold Out'}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-red-600 transition-colors">
                    {item.name}
                  </h3>
                  {/* Category Tag */}
                  <span className="shrink-0 text-[10px] font-bold uppercase text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    {item.category?.name}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 h-10">
                  {item.description}
                </p>

                {/* Interactive 'Add' Button Simulation */}
                <button className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border-2 border-red-50 text-red-600 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white">
                  <Flame size={16} className={`transition-all ${item.available ? 'animate-pulse' : ''}`} />
                  {item.available ? 'View Details' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}