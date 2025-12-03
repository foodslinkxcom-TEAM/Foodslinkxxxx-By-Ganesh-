import React from "react";

export default function Stats() {
  const stats = [
    { label: "Restaurants", val: "500+" },
    { label: "Food Items", val: "2.5k+" },
    { label: "Deliveries", val: "100k+" },
    { label: "Happy Users", val: "99%" },
  ];

  return (
    <section className="py-12 bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-red-500/50">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-2">
              <h3 className="text-4xl font-extrabold mb-1">{stat.val}</h3>
              <p className="text-red-100 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}