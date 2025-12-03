import React from "react";
import { CreditCard, PhoneCall, Smile, Smartphone, User, Users } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    { icon: Users, title: "Live Tracking", desc: "Track your food in real-time from the restaurant to your doorstep." },
    { icon: Smile, title: "Super Taste", desc: "We partner only with the highest-rated chefs in your city." },
    { icon: CreditCard, title: "Easy Payments", desc: "Pay via UPI, Credit Card, or Cash on Delivery securely." },
    { icon: Smartphone, title: "Mobile App", desc: "Order on the go with our dedicated iOS and Android apps." },
    { icon: PhoneCall, title: "24/7 Support", desc: "Stuck with an order? Our support team is always awake." },
    { icon: User, title: "Personalized", desc: "Get recommendations based on your previous cravings." },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-red-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}