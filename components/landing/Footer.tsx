import React from "react";
import { ChefHat, CreditCard, MapPin, PhoneCall } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-2xl">
            <ChefHat className="text-red-600" /> FoodsLinkx
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Connecting food lovers with the best restaurants in town. Fresh, fast, and delicious.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-3 text-sm">
            {['About Us', 'Team', 'Careers', 'Blog'].map(item => (
                <li key={item}><a href="#" className="hover:text-red-500 transition">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><MapPin size={16} className="text-red-600"/> Baramati, Maharashtra</li>
            <li className="flex items-center gap-2"><PhoneCall size={16} className="text-red-600"/> +91 98765 43210</li>
            <li className="flex items-center gap-2"><CreditCard size={16} className="text-red-600"/> support@foodslinkx.com</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-xs text-gray-500 mb-4">Subscribe to get special offers.</p>
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
  );
}