"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

export default function FeaturedRestaurants() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated Fetch
    const fetchHotels = async () => {
      try {
        // Replace with your actual API call
        // const res = await fetch('/api/hotels');
        // const data = await res.json();
        
        // Mock Data
        const data = [
          { _id: 1, name: "The Red Dragon", address: "Downtown Spice St.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" },
          { _id: 2, name: "Burger Bliss", address: "Market Square", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
          { _id: 3, name: "Sushi Master", address: "Ocean Drive", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800" },
          { _id: 4, name: "Pasta House", address: "Little Italy", image: "https://images.unsplash.com/photo-1481931041525-496883552d51?auto=format&fit=crop&q=80&w=800" },
        ];
        setHotels(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h2 className="text-red-600 font-bold tracking-wide uppercase text-sm mb-2">
            Top Restaurants
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
            Order From the Best
          </h3>
        </div>
        <Link href="/restaurants" className="group flex items-center gap-2 text-red-600 font-semibold mt-4 md:mt-0">
          View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading
          ? [1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))
          : hotels.map((hotel) => (
              <RestaurantCard key={hotel._id} hotel={hotel} />
            ))}
      </div>
    </section>
  );
}

function RestaurantCard({ hotel }: { hotel: any }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
          <Star size={12} className="text-yellow-400 fill-current" /> 4.8
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
          {hotel.name}
        </h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={14} className="mr-1" />
          {hotel.address}
        </div>
      </div>
    </div>
  );
}