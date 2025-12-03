import { ChefHat, QrCode, Smartphone, BarChart3 } from "lucide-react";

export default function Services() {
  const services = [
    {
      title: "Smart QR Menu",
      desc: "Contactless ordering for the modern era. Update prices instantly without reprinting paper menus.",
      icon: QrCode,
      image: "https://images.unsplash.com/photo-1595079676339-1534827d8c18?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Kitchen Display System (KDS)",
      desc: "Send orders directly from the table to the kitchen. Reduce errors and speed up service.",
      icon: ChefHat,
      image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Advanced Analytics",
      desc: "Track sales, popular items, and customer retention. Make data-driven decisions to grow profits.",
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Our Services</h2>
          <p className="text-slate-500 mt-4">Everything you need to run a successful food business.</p>
        </div>

        <div className="space-y-24">
          {services.map((service, idx) => (
            <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
              {/* Text Side */}
              <div className="flex-1 space-y-6">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                  <service.icon size={32} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{service.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{service.desc}</p>
                <ul className="space-y-3">
                  {['Instant Setup', '24/7 Support', 'Cloud Sync'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-red-600 rounded-3xl rotate-3 opacity-10 group-hover:rotate-6 transition-transform"></div>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="relative rounded-3xl shadow-xl w-full object-cover h-80 lg:h-96 border border-slate-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}