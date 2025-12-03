"use client"

import { 
  Clock, 
  Utensils, 
  CheckCircle, 
  ChevronRight, 
  ChefHat
} from "lucide-react"

// Define types locally or import them
interface OrderItem {
  _id: string
  name: string
  price: number
  quantity: number
  customization?: string
}

interface Charges {
  label:string;
  amount:number;
  type:string;
}

interface Customer{
  name:string
  contact:number
}

interface Order {
  _id: string
  table: string
  items: OrderItem[]
  total: number
  status: "pending" | "cooking" | "served" | "paid"
  createdAt: string
  additionalCharges:Charges[]
  subTotal:number
  paymentMethod:string
  paymentStatus:string
  deviceId:string
  customer:Customer
}

interface OrderCardProps {
  order: Order
  hotelId: string
  onClick: (order: Order) => void
}

export default function OrderCard({ order, hotelId, onClick }: OrderCardProps) {
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200"
      case "cooking": return "bg-blue-100 text-blue-700 border-blue-200"
      case "served": return "bg-green-100 text-green-700 border-green-200"
      case "paid": return "bg-slate-100 text-slate-600 border-slate-200"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock size={14} />
      case "cooking": return <ChefHat size={14} />
      case "served": return <Utensils size={14} />
      case "paid": return <CheckCircle size={14} />
      default: return <Clock size={14} />
    }
  }
  

  return (
    <div 
      onClick={() => onClick(order)} // Notify parent instead of opening local modal
      className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Status Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
         order.status === 'pending' ? 'bg-amber-400' : 
         order.status === 'cooking' ? 'bg-blue-500' :
         order.status === 'served' ? 'bg-green-500' : 'bg-slate-400'
      }`} />

      <div className="flex justify-between items-start mb-4 pl-3">
        <div>
           <div className="flex items-center gap-2">
             <h3 className="text-xl font-bold text-slate-800">Table {order.table}</h3>
           </div>
           <p className="text-xs text-slate-400 font-medium mt-1">
             #{order._id.slice(-6).toUpperCase()}
           </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${getStatusStyle(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{order.status}</span>
        </div>
      </div>

      {/* Item Summary */}
      <div className="pl-3 mb-4 space-y-1.5">
        {order.items.slice(0, 3).map((item, i) => (
           <div key={i} className="text-sm text-slate-600 flex justify-between border-b border-dashed border-slate-100 pb-1 last:border-0">
              <span><span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}</span>
           </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-rose-500 font-bold mt-1">
            +{order.items.length - 3} more items...
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-slate-100 pt-3 pl-3">
         <span className="text-xl font-extrabold text-slate-800">₹{order.total}</span>
         <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
           View Details <ChevronRight size={14} />
         </span>
      </div>
    </div>
  )
}