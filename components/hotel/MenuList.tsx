"use client"

import { useState } from "react"
import { Plus, ShoppingBag } from "lucide-react"
import MenuDetailsModal from "./MenuDetailsModal"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: any
  available: boolean
  imageUrl?: string
  imageFileUrl?:string
}

interface MenuListProps {
  items: MenuItem[]
  hotelId: string
  tableId:string
}

const MenuList = ({ items, hotelId,tableId }: MenuListProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-28">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => item.available && handleSelectItem(item)}
            className={`
              group flex flex-col bg-white rounded-2xl overflow-hidden border border-rose-100/50 shadow-sm transition-all duration-300
              ${
                item.available
                  ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/10"
                  : "opacity-75 grayscale cursor-not-allowed"
              }
            `}
          >
            {/* --- Image Section --- */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={item.imageUrl ||item?.imageFileUrl || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Sold Out Overlay */}
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* --- Content Section --- */}
            <div className="flex flex-col flex-1 p-3">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight line-clamp-1 group-hover:text-rose-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-rose-50">
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-medium">Price</span>
                   <span className="text-sm md:text-base font-bold text-slate-900">₹{item.price}</span>
                </div>

                {item.available ? (
                  <button
                    className="
                      flex items-center gap-1 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg
                      text-xs font-bold uppercase tracking-wide transition-all duration-200
                      group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-rose-500/30
                      active:scale-95
                    "
                  >
                    <span>Add</span>
                    <Plus size={14} strokeWidth={3} />
                  </button>
                ) : (
                  <button disabled className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                    N/A
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <MenuDetailsModal
          item={selectedItem}
          onClose={handleCloseModal}
          hotelId={hotelId} tableId={tableId}        />
      )}
    </>
  )
}

export default MenuList