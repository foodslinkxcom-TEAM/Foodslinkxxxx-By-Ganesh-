"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Search, Plus, Minus, Trash2, CreditCard, 
  Banknote, ChefHat, Loader2, User, Phone, 
  ArrowRight, ArrowLeft, Receipt, Percent,
  QrCode, CheckCircle, Wallet, RefreshCw,Clock
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

interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
  type: 'fixed' | 'percent';
}

export default function CreateInvoiceModal({ hotelId, onClose, onInvoiceCreated }: CreateInvoiceModalProps) {
  // --- Data State ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Workflow State ---
  const [step, setStep] = useState<1 | 2 | 3>(1); 

  // --- Order State ---
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- Checkout Form State ---
  const [tableNo, setTableNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  
  // --- Payment State ---
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  
  // --- Custom Charges State ---
  const [extraCharges, setExtraCharges] = useState<AdditionalCharge[]>([]);
  const [newChargeLabel, setNewChargeLabel] = useState("");
  const [newChargeAmount, setNewChargeAmount] = useState("");
  const [newChargeType, setNewChargeType] = useState<'fixed' | 'percent'>('fixed');


  const [qrCodeUrl, setQrCodeUrl] = useState("");
const [isQrLoading, setIsQrLoading] = useState(false);

  // Fetch Menu
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/hotels/${hotelId}/menu`);
        const data = await res.json();
        
        let items: MenuItem[] = [];
        if (Array.isArray(data)) items = data;
        else if (data.menu && Array.isArray(data.menu)) items = data.menu;
        else if (data.items && Array.isArray(data.items)) items = data.items;
        
        setMenuItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [hotelId]);

  // --- Logic Helpers ---
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const currentQty = prev[item._id]?.qty || 0;
      return { ...prev, [item._id]: { ...item, qty: currentQty + 1 } };
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
      return { ...prev, [itemId]: { ...current, qty: newQty } };
    });
  };

  const cartList = Object.values(cart);
  const itemTotal = cartList.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const chargesTotal = extraCharges.reduce((acc, charge) => {
    if (charge.type === 'percent') {
      return acc + (itemTotal * (charge.amount / 100));
    }
    return acc + charge.amount;
  }, 0);
  const grandTotal = itemTotal + chargesTotal;

  const addCustomCharge = () => {
    if (!newChargeLabel || !newChargeAmount) return;
    const amount = parseFloat(newChargeAmount);
    if (isNaN(amount) || amount <= 0) return;

    setExtraCharges([...extraCharges, {
      id: Date.now().toString(),
      label: newChargeLabel,
      amount: amount,
      type: newChargeType
    }]);
    setNewChargeLabel("");
    setNewChargeAmount("");
  };

  const removeCharge = (id: string) => {
    setExtraCharges(prev => prev.filter(c => c.id !== id));
  };

  const addPresetCharge = (label: string, amount: number, type: 'fixed' | 'percent') => {
    setNewChargeLabel(label);
    setNewChargeAmount(amount.toString());
    setNewChargeType(type);
  };

  const handleCreateInvoice = async (isPayLater = false) => {
    if (cartList.length === 0) return alert("Cart is empty");
  
    setSubmitting(true);
    try {
      const itemsPayload = cartList.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      }));
  
      // Logic: If Pay Later, status is 'pending', otherwise 'paid'
      const finalPaymentStatus = isPayLater ? "pending" : "paid";
      const finalOrderStatus = isPayLater ? "served" : "paid"; 
  
      const payload = {
        table: tableNo.trim() === "" ? "Counter" : tableNo,
        customer: { name: customerName, contact: customerContact },
        items: itemsPayload,
        subTotal: itemTotal,
        additionalCharges: extraCharges,
        total: grandTotal,
        status: finalPaymentStatus,       // Dynamic
        paymentMethod: paymentMethod, 
        orderStatus: finalOrderStatus     // Dynamic
      };
  
      const res = await fetch(`/api/dashboard/hotels/${hotelId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("Failed to create invoice");
      onInvoiceCreated();
    } catch (err) {
      alert("Failed to create invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      (item.available !== false)
    );
  }, [menuItems, searchQuery]);

  const getStepTitle = () => {
    if (step === 1) return "Select Items";
    if (step === 2) return "Details & Charges";
    return "Payment & Confirm";
  }

  useEffect(() => {
    // Only generate QR if we are on Step 3 and Method is Online
    if (step === 3 && paymentMethod === 'online') {
      
      const generateQr = async () => {
        setIsQrLoading(true);
        try {
          const res = await fetch(`/api/hotels/${hotelId}`);
          
          let upiId = "bandgarsanskar19@oksbi"; // Default Fallback
          let payeeName = "Hotel";
  
          if (res.ok) {
            const hotelData = await res.json();
            // Use Hotel UPI if available, otherwise keep fallback
            if (hotelData.upiId) upiId = hotelData.upiId; 
            if (hotelData.name) payeeName = hotelData.name;
          }
  
          // Construct standard UPI String
          // am = amount (must be 2 decimal places), pa = payee address, pn = payee name
          const amount = grandTotal.toFixed(2);
          const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
          
          // Generate QR Image URL
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
          
          setQrCodeUrl(qrUrl);
        } catch (error) {
          console.error("Error generating QR:", error);
          // Fallback QR on error
          const fallbackUpi = `upi://pay?pa=bandgarsanskar19@oksbi&am=${grandTotal.toFixed(2)}&cu=INR`;
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackUpi)}`);
        } finally {
          setIsQrLoading(false);
        }
      };
  
      generateQr();
    }
  }, [step, paymentMethod, hotelId, grandTotal]);

  return (
    // Outer Wrapper: Fixed inset with z-index.
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/90 backdrop-blur-sm transition-all">
      
      {/* Main Card Container 
         - Uses h-[100dvh] for accurate mobile height (ignoring browser bars)
         - Flex Col to stack Header, Content, Footer vertically
      */}
      <div className="bg-slate-50 w-full max-w-5xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
        
        {/* === 1. FIXED HEADER (Flex-None) === */}
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                <div className={`w-4 h-0.5 ${step >= 2 ? 'bg-rose-600' : 'bg-slate-200'}`}></div>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                <div className={`w-4 h-0.5 ${step >= 3 ? 'bg-rose-600' : 'bg-slate-200'}`}></div>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 3 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
             </div>
             <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
             <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
               {getStepTitle()}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* === 2. SCROLLABLE CONTENT (Flex-1) === */}
        {/* This area takes all remaining space and scrolls internally */}
        <div className="flex-1 overflow-y-auto w-full relative">
          
          {/* STEP 1: MENU */}
          {step === 1 && (
            <div className="min-h-full flex flex-col">
               {/* Search */}
               <div className="p-3 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 outline-none text-sm"
                    />
                  </div>
               </div>

               {/* Grid */}
               <div className="p-3 sm:p-4">
                  {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-500"/></div>
                  ) : filteredMenu.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">No items found</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredMenu.map((item) => {
                        const inCart = cart[item._id];
                        const img = item.imageFileUrl || item.imageUrl || item.image;
                        return (
                          <div 
                            key={item._id} 
                            onClick={() => addToCart(item)}
                            className={`relative p-2 rounded-xl border cursor-pointer transition-all active:scale-95 ${inCart ? "bg-rose-50 border-rose-500 ring-1 ring-rose-500" : "bg-white border-slate-200 shadow-sm"}`}
                          >
                             {inCart && <div className="absolute -top-2 -right-2 bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">{inCart.qty}</div>}
                             <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-2">
                                {img ? <img src={img} alt={item.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ChefHat size={24}/></div>}
                             </div>
                             <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.name}</h4>
                             <p className="text-rose-600 font-bold text-xs">₹{item.price}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="p-4 sm:p-8">
               <div className="max-w-2xl mx-auto space-y-5">
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide"><User size={16} className="text-rose-600"/> Customer Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="text-xs font-bold text-slate-500">Name</label>
                         <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-rose-500 outline-none" placeholder="Guest Name" />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-slate-500">Contact</label>
                         <input value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-rose-500 outline-none" placeholder="Mobile Number" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-xs font-bold text-slate-500">Table No</label>
                          <input value={tableNo} onChange={e => setTableNo(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Counter" />
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide"><Percent size={16} className="text-rose-600"/> Additional Charges</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                       <button onClick={() => addPresetCharge('GST', 5, 'percent')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg border border-slate-200">+ GST 5%</button>
                       <button onClick={() => addPresetCharge('Packing', 10, 'fixed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg border border-slate-200">+ Packing ₹10</button>
                    </div>
                    <div className="flex gap-2 mb-3">
                       <input placeholder="Label" value={newChargeLabel} onChange={e => setNewChargeLabel(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                       <div className="flex w-24 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <input placeholder="0" type="number" value={newChargeAmount} onChange={e => setNewChargeAmount(e.target.value)} className="w-full px-2 bg-transparent outline-none text-sm text-center"/>
                       </div>
                       <button onClick={addCustomCharge} className="p-2 bg-slate-900 text-white rounded-lg"><Plus size={18}/></button>
                    </div>
                    {extraCharges.map(charge => (
                      <div key={charge.id} className="flex justify-between items-center text-sm py-1 border-b border-dashed border-slate-100 last:border-0">
                         <span className="text-slate-600">{charge.label}</span>
                         <div className="flex items-center gap-2">
                            <span className="font-bold">+{charge.type === 'percent' ? (itemTotal * (charge.amount/100)).toFixed(2) : charge.amount}</span>
                            <button onClick={() => removeCharge(charge.id)} className="text-rose-500"><Trash2 size={12}/></button>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="p-4 sm:p-8">
               <div className="max-w-md mx-auto space-y-6">
                 <div className="text-center py-4">
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Total Payable Amount</p>
                    <h1 className="text-4xl font-black text-slate-900 mt-2">₹{grandTotal.toFixed(2)}</h1>
                 </div>
                 <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${paymentMethod === 'cash' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                      <Banknote size={18}/> Cash
                    </button>
                    <button onClick={() => setPaymentMethod('online')} className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${paymentMethod === 'online' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                      <QrCode size={18}/> Online (QR)
                    </button>
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[250px] flex flex-col items-center justify-center text-center">
                    {paymentMethod === 'cash' ? (
                       <div className="animate-in zoom-in duration-300">
                          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Wallet size={40} className="text-green-600"/>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">Collect Cash</h3>
                          <p className="text-slate-500 text-sm mt-1">Please collect <strong className="text-slate-900">₹{grandTotal.toFixed(2)}</strong> from the customer.</p>
                       </div>
                    ) : (
                      <div className="animate-in zoom-in duration-300 w-full flex flex-col items-center">
                      <div className="p-2 bg-white border-2 border-slate-900 rounded-xl mb-4 relative min-h-[160px] min-w-[160px] flex items-center justify-center">
                         
                         {/* Show Loader while fetching */}
                         {isQrLoading ? (
                            <Loader2 className="animate-spin text-rose-600" size={40} />
                         ) : (
                            <img 
                              src={qrCodeUrl} 
                              alt="Payment QR" 
                              className="w-40 h-40 object-contain mix-blend-multiply" 
                            />
                         )}
                
                      </div>
                      <div className="flex items-center gap-2 text-rose-600 font-bold animate-pulse text-sm">
                         <RefreshCw size={14} className="animate-spin"/> Waiting for payment...
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Scan to pay ₹{grandTotal.toFixed(2)}</p>
                   </div>
                    )}
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* === 3. FIXED FOOTER (Flex-None) === */}
        {/* This sits naturally at the bottom of the flex column. No overlap. */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-6 sm:pb-4 safe-bottom">
           <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
               
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-slate-900 leading-none">₹{grandTotal.toFixed(2)}</span>
               </div>
               
               <div className="flex gap-3">
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(prev => (prev - 1) as any)} 
                      className="px-4 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  
                  {step < 3 ? (
     <button
       onClick={() => setStep(prev => (prev + 1) as any)}
       disabled={cartList.length === 0}
       className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
     >
       Next <ArrowRight size={18}/>
     </button>
  ) : (
    <>
     {/* --- NEW: Pay Later Button --- */}
     <button
       onClick={() => handleCreateInvoice(true)} // Pass true for Pay Later
       disabled={submitting}
       className="px-4 sm:px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
     >
       <Clock size={18} />
       <span className="hidden sm:inline">Pay Later</span>
     </button>

     {/* --- Existing Pay Now Button --- */}
     <button
       onClick={() => handleCreateInvoice(false)} // Pass false for Pay Now
       disabled={submitting}
       className={`
         flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg
         ${paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'}
         disabled:opacity-70 disabled:cursor-not-allowed
       `}
     >
       {submitting ? <Loader2 className="animate-spin"/> : (
         <>
           <CheckCircle size={18}/>
           {paymentMethod === 'cash' ? 'Collected' : 'Verified'}
         </>
       )}
     </button>
    </>
  )}
               </div>
           </div>
        </div>

      </div>
    </div>
  );
}