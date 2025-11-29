"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Smile,
  CreditCard,
  PhoneCall,
  User,
  ChefHat,
  Utensils,
  Clock,
  MapPin,
  Star,
  Smartphone,
  ArrowRight,
  Menu,
  X,
  Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Logic
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch('/api/hotels');
        if (!res.ok) throw new Error('Failed to fetch hotels');
        const data = await res.json();
        setHotels(data.slice(0, 4));
      } catch (error) {
        console.error(error);
        // Fallback dummy data for preview purposes if API fails
        setHotels([
          { _id: 1, name: "The Red Dragon", address: "Downtown Spice St.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" },
          { _id: 2, name: "Burger Bliss", address: "Market Square", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
          { _id: 3, name: "Sushi Master", address: "Ocean Drive", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800" },
          { _id: 4, name: "Pasta House", address: "Little Italy", image: "https://images.unsplash.com/photo-1481931041525-496883552d51?auto=format&fit=crop&q=80&w=800" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  return (
    <main className="min-h-screen flex flex-col font-sans text-gray-900 relative overflow-hidden bg-orange-50/30 selection:bg-red-200 selection:text-red-900">
      
      {/* Custom Styles for Animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-red-50 -z-20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- HEADER --- */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <ChefHat size={24} />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
              FoodsLinkx
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
            {/* Defined Navigation Items */}
{[
  { name: 'About Us', href: 'https://foodslinkx.com/about' },
  { name: 'Pricing', href: 'https://foodslinkx.com/pricing' },
  { name: 'Blog', href: 'https://blog.foodslinkx.com' } // External link example
].map((item) => (
  <Link 
    key={item.name} 
    href={item.href} 
    className="hover:text-red-600 transition-colors relative group"
  >
    {item.name}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
  </Link>
))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
              <Search size={20} />
            </button> */}
            <Link href="/auth/login" className="text-gray-900 font-semibold hover:text-red-600 transition-colors">
              Log in
            </Link>
            <Link href="/auth/register" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg shadow-red-200 transition-all hover:shadow-red-300 hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden flex flex-col p-6 space-y-4 animate-in slide-in-from-top-5">
            {['About Us', 'Menu', 'Pricing', 'Blog'].map((item) => (
              <a key={item} href="#" className="text-lg font-medium text-gray-700 hover:text-red-600">
                {item}
              </a>
            ))}
            <hr />
            <Link href="/auth/login" className="text-center py-3 w-full border border-gray-200 rounded-lg font-semibold">Log in</Link>
            <Link href="/auth/register" className="text-center py-3 w-full bg-red-600 text-white rounded-lg font-semibold">Sign Up Free</Link>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text */}
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              #1 Food Delivery Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Satisfy Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                Cravings
              </span> Today
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Order from top local restaurants with the click of a button. Fresh ingredients, fast delivery, and the best culinary experiences in town.
            </p>
            
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex rounded-full shadow-xl shadow-red-100 p-1.5 bg-white border border-gray-100 max-w-md w-full">
                <input 
                  type="text" 
                  placeholder="Enter your delivery location..." 
                  className="flex-1 px-4 outline-none text-gray-700 bg-transparent"
                />
                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold transition-colors">
                  Find Food
                </button>
              </div>
            </div> */}
            
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-gray-900 font-bold">50k+</span> happy customers</p>
            </div>
          </div>

          {/* Right: Image composition */}
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center">
             {/* Decorative Circles */}
             <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-orange-100 rounded-full opacity-30 transform scale-90 blur-2xl"></div>
             
             {/* Main Hero Image */}
             <div className="relative w-full max-w-lg aspect-square animate-float">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1000" 
                  alt="Delicious Food" 
                  className="w-full h-full object-cover rounded-full shadow-2xl shadow-orange-200 border-8 border-white"
                />
                
                {/* Floating Badge 1 */}
                <div className="absolute top-10 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">Delivery</p>
                    <p className="text-sm font-bold text-gray-900">30 Mins</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute bottom-20 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">Rating</p>
                    <p className="text-sm font-bold text-gray-900">4.9/5</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-10 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-red-500/50">
          {[
            { label: "Restaurants", val: "500+" },
            { label: "Food Items", val: "2,500+" },
            { label: "Deliveries", val: "100k+" },
            { label: "Happy Users", val: "99%" },
          ].map((stat, idx) => (
            <div key={idx} className="p-2">
              <h3 className="text-3xl md:text-4xl font-bold mb-1">{stat.val}</h3>
              <p className="text-red-100 text-sm uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURED PARTNERS --- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-red-600 font-bold tracking-wide uppercase text-sm mb-2">Top Restaurants</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Order From the Best</h3>
          </div>
          <Link href="/restaurants" className="group flex items-center gap-2 text-red-600 font-semibold mt-4 md:mt-0">
            View All Restaurants <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(n => <div key={n} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {hotels.map((hotel, index) => (
              <div
                key={hotel._id || index}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hotel.image || '/placeholder.svg'}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold shadow-sm">
                    <Star size={14} className="text-yellow-400 fill-current" /> 4.8
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{hotel.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin size={14} className="mr-1" />
                    {hotel.address || "Unknown Location"}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded">Fast Delivery</span>
                    <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-50 skew-x-12 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How <span className="text-red-600">FoodsLinkx</span> Works</h2>
            <p className="text-gray-600 text-lg">Getting your favorite food delivered is easy as pie. Just follow these three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-red-200 via-orange-200 to-red-200 border-t-2 border-dashed border-red-300 z-0"></div>

            <StepCard 
              number="01" 
              title="Select Location" 
              desc="Enter your destination to see restaurants available in your area." 
              icon={MapPin}
            />
            <StepCard 
              number="02" 
              title="Choose Menu" 
              desc="Browse the extensive menu and choose what your taste buds desire." 
              icon={BookOpen}
            />
            <StepCard 
              number="03" 
              title="Fast Delivery" 
              desc="Our delivery partner knocks on your door with hot food in no time." 
              icon={Utensils}
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Users} title="Live Tracking" description="Track your food in real-time from the restaurant to your doorstep." />
            <FeatureCard icon={Smile} title="Super Taste" description="We partner only with the highest-rated chefs in your city." />
            <FeatureCard icon={CreditCard} title="Easy Payments" description="Pay via UPI, Credit Card, or Cash on Delivery securely." />
            <FeatureCard icon={Smartphone} title="Mobile App" description="Order on the go with our dedicated iOS and Android apps." />
            <FeatureCard icon={PhoneCall} title="24/7 Support" description="Stuck with an order? Our support team is always awake." />
            <FeatureCard icon={User} title="Personalized" description="Get recommendations based on your previous cravings." />
          </div>
        </div>
      </section>

      {/* --- APP DOWNLOAD CTA --- */}
      {/* <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl shadow-red-200">
          
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="z-10 text-white max-w-xl space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold">Download the Mobile App</h2>
            <p className="text-red-100 text-lg">Get 20% off your first order when you download the FoodsLinkx app. Available on iOS and Android.</p>
            <div className="flex justify-center md:justify-start gap-4 pt-4">
              <button className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                <Smartphone size={24} /> App Store
              </button>
              <button className="flex items-center gap-3 bg-red-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-900 transition shadow-lg ring-1 ring-white/30">
                <Smartphone size={24} /> Google Play
              </button>
            </div>
          </div>
          
          <div className="relative z-10 mt-10 md:mt-0 w-full max-w-sm">
             <img src="/Assets/app-mockup.png" onError={(e) => e.currentTarget.src='https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400'} alt="App Preview" className="mx-auto rounded-3xl shadow-2xl rotate-3 border-4 border-white/20" />
          </div>
        </div>
      </section> */}

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-2xl">
              <ChefHat className="text-red-500" /> FoodsLinkx
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting food lovers with the best restaurants in town. Fresh, fast, and delicious.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-red-500 transition">About Us</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Team</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Careers</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin size={16}/> Baramati, Maharashtra</li>
              <li className="flex items-center gap-2"><PhoneCall size={16}/> +91 98765 43210</li>
              <li className="flex items-center gap-2"><CreditCard size={16}/> support@foodslinkx.com</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-xs text-gray-500 mb-4">Subscribe to get special offers and coupons.</p>
            <div className="flex">
              <input type="email" placeholder="Email" className="bg-gray-800 border-none outline-none text-white px-4 py-2 rounded-l-lg w-full focus:ring-1 focus:ring-red-500" />
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg font-bold">GO</button>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-600 text-sm mt-16 pt-8 border-t border-gray-800">
          &copy; {new Date().getFullYear()} FoodsLinkx. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

// Helper Components

function StepCard({ number, title, desc, icon: Icon }: any) {
  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 z-10 text-center group">
      <div className="w-16 h-16 mx-auto bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
        <Icon size={32} />
      </div>
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full border-4 border-white">
        STEP {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all duration-300 group">
      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}