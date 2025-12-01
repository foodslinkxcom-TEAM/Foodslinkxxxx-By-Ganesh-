"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Search, Plus, Minus, Trash2, CreditCard, 
  Banknote, ChefHat, Loader2, Table, CheckCircle, Clock 
} from "lucide-react";

// --- Types ---
interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category?: any;
  available?: boolean;
  image?: string;
  imageFileUrl?: string; 
  imageUrl?: string;
}

interface CreateInvoiceModalProps {
  hotelId: string;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

interface CartItem extends MenuItem {
  qty: number;
}

export default function CreateInvoiceModal({ hotelId, onClose, onInvoiceCreated }: CreateInvoiceModalProps) {
  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("paid");

  // Fetch Menu
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/hotels/${hotelId}/menu`);
        if (!res.ok) throw new Error("Failed to fetch menu items");
        
        const data = await res.json();
        
        // ROBUST DATA CHECK: Handle if data is array, or inside .menu / .items
        let items: MenuItem[] = [];
        if (Array.isArray(data)) items = data;
        else if (data.menu && Array.isArray(data.menu)) items = data.menu;
        else if (data.items && Array.isArray(data.items)) items = data.items;
        
        setMenuItems(items);
      } catch (err) {
        console.error(err);
        setError("Error loading menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [hotelId]);

  // --- Cart Logic ---
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const currentQty = prev[item._id]?.qty || 0;
      return {
        ...prev,
        [item._id]: { ...item, qty: currentQty + 1 }
      };
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      
      const newQty = current.qty + delta;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return {
        ...prev,
        [itemId]: { ...current, qty: newQty }
      };
    });
  };

  // --- Calculations ---
  const cartList = Object.values(cart);
  const subTotal = cartList.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subTotal * 0.05; 
  const total = subTotal + tax;

  // --- Filter Menu ---
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      (item.available !== false) // Handle undefined as true
    );
  }, [menuItems, searchQuery]);

  // --- Submit ---
  const handleCreateInvoice = async () => {
    if (cartList.length === 0) {
      alert("Please select at least one item");
      return;
    }

    // AUTOMATIC "Counter" if table number is empty
    const finalTableNo = tableNo.trim() === "" ? "Counter" : tableNo;

    setSubmitting(true);
    try {
      const itemsPayload = cartList.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      }));

      const payload = {
        table: finalTableNo,
        items: itemsPayload,
        total: total,
        status: paymentStatus, 
        paymentMethod: paymentMethod, 
        orderStatus: paymentStatus === 'paid' ? 'paid' : 'served' 
      };

      const res = await fetch(`/api/dashboard/hotels/${hotelId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create invoice");
      
      onInvoiceCreated();
    } catch (err) {
      alert("Failed to create invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Fixed container: Adds pb-20/pb-24 on mobile to avoid bottom nav overlay
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm pb-20 sm:pb-4 px-2 sm:px-4">
      
      {/* Main Card: Calculated height to fit mobile screen without overflowing */}
      <div className="bg-white w-full max-w-6xl h-[calc(100vh-6rem)] sm:h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in slide-in-from-bottom-5 fade-in zoom-in-95">
        
        {/* ================= LEFT SIDE: MENU SELECTOR ================= */}
        <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200 overflow-hidden order-1">
          
          {/* Header & Search */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ChefHat className="text-rose-600" /> New Order
              </h2>
              <button onClick={onClose} className="lg:hidden p-2 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-500" size={32}/></div>
            ) : filteredMenu.length === 0 ? (
               <div className="text-center text-slate-400 py-10">No items found</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredMenu.map((item) => {
                  const itemInCart = cart[item._id];
                  const img = item.imageFileUrl || item.imageUrl || item.image;
                  
                  return (
                    <div 
                      key={item._id} 
                      onClick={() => addToCart(item)}
                      className={`
                        relative group p-2 sm:p-3 rounded-2xl border cursor-pointer transition-all duration-200
                        ${itemInCart 
                          ? "bg-rose-50 border-rose-500 ring-1 ring-rose-500 shadow-md" 
                          : "bg-white border-slate-200 hover:border-rose-300 hover:shadow-lg"
                        }
                      `}
                    >
                      {/* Qty Badge */}
                      {itemInCart && (
                        <div className="absolute -top-2 -right-2 bg-rose-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md z-10">
                          {itemInCart.qty}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                        <div className="w-full sm:w-16 h-20 sm:h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {img ? (
                            <img src={img} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ChefHat size={20}/></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                          <p className="text-rose-600 font-bold mt-1">₹{item.price}</p>
                        </div>
                        {/* Mobile Add Button hidden to save space, relies on card click */}
                        <button className="hidden sm:block p-2 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-rose-600 ml-auto">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT SIDE: BILL & SETTINGS ================= */}
        {/* On mobile: this sits at the bottom or is scrollable. 
            Using order-2 to keep it below menu on mobile logic if needed, 
            but here Flex-col places it naturally below. */}
        <div className="w-full lg:w-[400px] bg-white flex flex-col h-[40%] lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl z-10 order-2">
          
          <div className="p-4 sm:p-6 flex-none">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Order Details</h3>
                <button onClick={onClose} className="hidden lg:block p-2 text-slate-400 hover:text-rose-600 transition-colors">
                  <X size={24} />
                </button>
             </div>

             {/* Order Settings - Compact on Mobile */}
             <div className="flex flex-col gap-3">
               {/* Table Input */}
               <div className="flex items-center gap-2">
                 <div className="flex-1">
                    <input 
                      type="text" 
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      placeholder="Table No (Default: Counter)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 text-sm font-semibold text-slate-800"
                    />
                 </div>
                 {/* Compact Payment Toggles */}
                 <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                    <button onClick={() => setPaymentMethod("cash")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${paymentMethod === 'cash' ? 'bg-white shadow' : 'text-slate-500'}`}>Cash</button>
                    <button onClick={() => setPaymentMethod("online")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${paymentMethod === 'online' ? 'bg-white shadow' : 'text-slate-500'}`}>Online</button>
                 </div>
               </div>
             </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 border-t border-slate-100 bg-slate-50/30">
             {cartList.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-50 py-4">
                  <ChefHat size={30} />
                  <span className="text-xs">Cart is empty</span>
               </div>
             ) : (
               <div className="space-y-2 py-4">
                 {cartList.map((item) => (
                   <div key={item._id} className="flex justify-between items-center bg-white p-2 sm:p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex-1 min-w-0 pr-2">
                         <p className="font-bold text-slate-800 truncate text-sm">{item.name}</p>
                         <p className="text-xs text-slate-500">₹{item.price} x {item.qty}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                         <button onClick={() => updateQty(item._id, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 shadow-sm hover:text-rose-600">
                           {item.qty === 1 ? <Trash2 size={10}/> : <Minus size={10}/>}
                         </button>
                         <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                         <button onClick={() => updateQty(item._id, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 shadow-sm hover:text-rose-600">
                           <Plus size={10}/>
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Footer Total & Action */}
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
             <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-slate-500">
                   Total <span className="text-xs">(inc. tax)</span>
                </div>
                <span className="font-black text-xl text-rose-600">₹{total.toFixed(2)}</span>
             </div>

             <button
               onClick={handleCreateInvoice}
               disabled={submitting || cartList.length === 0}
               className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-rose-600 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {submitting ? <Loader2 className="animate-spin" size={20} /> : `Generate Bill`}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}