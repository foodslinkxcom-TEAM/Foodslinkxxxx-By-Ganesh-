import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: number | string // Updated to allow formatted strings (e.g. "₹500")
  color: "yellow" | "blue" | "green" | "purple"
}

export default function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  
  // Mapping color names to specific Tailwind Gradient & Shadow classes
  const colorStyles = {
    yellow: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30",
    blue:   "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30",
    green:  "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30",
    purple: "bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-purple-500/30",
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 
        shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        ${colorStyles[color]}
      `}
    >
      {/* Content */}
      <div className="relative z-10 text-white">
        <p className="text-sm font-medium opacity-90 mb-1 tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold drop-shadow-sm">
          {value}
        </p>
      </div>

      {/* Decorative Background Icon */}
      <div className="absolute -right-4 -bottom-4 text-white opacity-20 transform rotate-12">
        <Icon size={80} strokeWidth={1.5} />
      </div>

      {/* Glassy Shine Effect (Optional) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  )
}