import React from "react";
import { MapPin, Search, ShoppingBag, Plus, CreditCard, Navigation, Clock } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Discover Nearby Spots",
      desc: "Enable your location to see a curated list of top-rated restaurants, cafes, and bistros around you instantly.",
      color: "bg-blue-50 text-blue-600",
      Visual: LocationMockup
    },
    {
      id: "02",
      title: "Customize Your Meal",
      desc: "Browse visual menus, select toppings, and customize your order. Add to cart with a single tap.",
      color: "bg-orange-50 text-orange-600",
      Visual: MenuMockup
    },
    {
      id: "03",
      title: "Live Order Tracking",
      desc: "Watch your food travel on the map in real-time. Know exactly when to set the table.",
      color: "bg-green-50 text-green-600",
      Visual: TrackingMockup
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-red-600 uppercase mb-3">Simple Process</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            From Craving to <span className="text-red-600">Dining</span>
          </h3>
          <p className="text-lg text-slate-600">
            We've optimized every step to ensure you get your food faster, hotter, and hassle-free.
          </p>
        </div>

        {/* Steps Container */}
        <div className="space-y-24 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 z-0 dashed-line"></div>

          {steps.map((step, index) => (
            <div key={step.id} className={`relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Text Side */}
              <div className="flex-1 text-center lg:text-left">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl font-bold text-2xl mb-6 shadow-sm ${step.color}`}>
                  {step.id}
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h4>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                  {step.desc}
                </p>
              </div>

              {/* Visual Side (Mockups) */}
              <div className="flex-1 w-full max-w-md lg:max-w-full flex justify-center">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-slate-200 rounded-3xl rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white border border-slate-100 p-2 rounded-3xl shadow-xl overflow-hidden w-72 h-[400px]">
                      {/* Phone Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                      
                      {/* Screen Content */}
                      <div className="w-full h-full bg-slate-50 rounded-2xl overflow-hidden relative">
                         <step.Visual />
                      </div>
                    </div>
                 </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Abstract UI Mockups (Pure CSS/Tailwind) --- */

function LocationMockup() {
  return (
    <div className="p-4 pt-10 space-y-4">
      {/* Search Bar */}
      <div className="h-10 bg-white rounded-lg shadow-sm flex items-center px-3 gap-2">
        <Search size={14} className="text-slate-400" />
        <div className="h-2 w-24 bg-slate-100 rounded"></div>
      </div>
      
      {/* Map Area */}
      <div className="h-48 bg-blue-50 rounded-xl relative overflow-hidden border border-blue-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <MapPin className="text-red-600 drop-shadow-md" size={24} fill="currentColor" />
           </div>
        </div>
        {/* Fake Map Roads */}
        <div className="absolute top-4 left-0 w-full h-2 bg-white/50 rotate-12"></div>
        <div className="absolute bottom-8 right-0 w-full h-2 bg-white/50 -rotate-6"></div>
      </div>

      {/* List Items */}
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-3 items-center bg-white p-2 rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-slate-200 rounded-md"></div>
            <div className="flex-1 space-y-1">
              <div className="h-2 w-20 bg-slate-800 rounded"></div>
              <div className="h-1.5 w-12 bg-slate-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuMockup() {
  return (
    <div className="p-4 pt-10">
      {/* Header Image */}
      <div className="h-32 bg-orange-100 rounded-xl mb-4 relative overflow-hidden">
         <div className="absolute bottom-2 left-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold">Burger King</div>
      </div>
      
      {/* Menu Categories */}
      <div className="flex gap-2 mb-4 overflow-hidden">
         {['All', 'Burgers', 'Drinks'].map(t => (
            <div key={t} className="px-3 py-1 bg-white border border-slate-100 text-[10px] rounded-full text-slate-600">{t}</div>
         ))}
      </div>

      {/* Food List */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
           <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={12} className="text-slate-400"/>
                </div>
                <div>
                   <div className="h-2 w-16 bg-slate-700 rounded mb-1"></div>
                   <div className="h-1.5 w-8 bg-slate-300 rounded"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-red-50 text-red-600 rounded flex items-center justify-center">
                 <Plus size={12} />
              </div>
           </div>
        ))}
      </div>

      {/* Checkout Button */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center shadow-lg">
          <span className="text-xs font-bold">2 Items</span>
          <span className="text-xs font-bold flex items-center gap-1">Checkout <CreditCard size={12}/></span>
      </div>
    </div>
  )
}

function TrackingMockup() {
  return (
    <div className="h-full relative bg-slate-100">
       {/* Map Background */}
       <div className="absolute inset-0 opacity-50">
          <div className="absolute top-1/4 left-0 w-full h-3 bg-white rotate-12"></div>
          <div className="absolute top-2/3 right-0 w-full h-3 bg-white -rotate-12"></div>
          <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-white"></div>
       </div>

       {/* Route Line */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
         <path d="M 140 100 Q 180 200 140 300" stroke="#EF4444" strokeWidth="3" fill="none" strokeDasharray="6 4" />
       </svg>

       {/* Driver Icon */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-500/40 text-white">
             <Navigation size={18} fill="currentColor" />
          </div>
       </div>

       {/* Bottom Status Card */}
       <div className="absolute bottom-0 w-full bg-white rounded-t-2xl p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div className="flex justify-between items-center mb-2">
             <div>
                <div className="text-xs text-slate-500">Arriving in</div>
                <div className="text-lg font-bold text-slate-900">12 Mins</div>
             </div>
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Clock size={20} />
             </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <div className="w-2/3 h-full bg-green-500 rounded-full"></div>
          </div>
       </div>
    </div>
  )
}