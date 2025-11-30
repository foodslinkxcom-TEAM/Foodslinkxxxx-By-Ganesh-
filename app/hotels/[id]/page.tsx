"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import MainLayout from "@/components/layout/MainLayout"
import MenuList from "@/components/hotel/MenuList"
import MenuDetailsModal from "@/components/hotel/MenuDetailsModal"
import HotelNavbar from "@/components/hotel/HotelNavbar"
import { setWithExpiry, getWithExpiry } from "@/lib/utils/localStorageWithExpiry"
import { UtensilsCrossed, MapPin } from "lucide-react"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: any
  available: boolean
  image?: string
}

interface Hotel {
  _id: string
  name: string
}

interface Category {
  _id: string
  name: string
}

export default function HotelMenuPage() {
  const params = useParams()
  const hotelId = params.id as string
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const storedTableId = getWithExpiry("tableId")

  useEffect(() => {
    setWithExpiry("hotelId", hotelId, 2 * 60 * 60 * 1000)
    const fetchHotelData = async () => {
      if (!hotelId) return
      try {
        const [hotelRes, menuRes, categoriesRes] = await Promise.all([
          fetch(`/api/hotels/${hotelId}`),
          fetch(`/api/hotels/${hotelId}/menu`),
          fetch(`/api/hotels/${hotelId}/categories`),
        ])

        if (hotelRes.ok) {
          const data = await hotelRes.json()
          setHotel(data)
        }
        if (menuRes.ok) {
          const data = await menuRes.json()
          setMenu(data.menu || [])
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotelData()
  }, [hotelId])

  // --- Filtering Logic ---
  const categoryNames = ["all", ...categories.map((c) => c.name)]
  
  const categoryNameToIdMap = categories.reduce((acc, category) => {
    acc[category.name] = category._id
    return acc
  }, {} as Record<string, string>)

  const filteredMenu = menu.filter((item) => {
    const selectedCategoryId = categoryNameToIdMap[selectedCategory]
    // Check if category matches (handling both string ID and populated object)
    const itemCatId = typeof item.category === 'object' ? item.category?._id : item.category;
    
    const matchesCategory =
      selectedCategory === "all" || itemCatId === selectedCategoryId

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // --- Loading Skeleton ---
  if (loading) {
    return (
      <MainLayout hotelId={hotelId}>
        <div className="space-y-6 animate-pulse p-4">
           {/* Header Skeleton */}
          <div className="h-16 bg-slate-200 rounded-xl w-full mb-4"></div>
           {/* Category Skeleton */}
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-slate-200 rounded-full flex-shrink-0"></div>
            ))}
          </div>
          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!hotel) {
    return (
      <MainLayout hotelId={hotelId}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <UtensilsCrossed size={48} className="mb-4 text-slate-300" />
          <p className="text-lg font-medium">Hotel not found</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout hotelId={hotelId}>
      {/* Search & Navbar */}
      <HotelNavbar hotelName={hotel.name} onSearch={setSearchQuery} />

      <div className="relative">
        
        {/* --- Top Info Bar --- */}
        <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800">Menu</span>
                <span className="text-xs font-medium bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                    {filteredMenu.length} items
                </span>
            </div>

            {storedTableId && (
                <div className="flex items-center gap-1.5 bg-white border border-rose-100 shadow-sm px-3 py-1.5 rounded-lg">
                    <MapPin size={14} className="text-rose-500" />
                    <span className="text-xs font-semibold text-slate-600">
                        Table {storedTableId}
                    </span>
                </div>
            )}
        </div>

        {/* --- Sticky Category Filter --- */}
        <div className="sticky top-[64px] z-30 bg-slate-50/95 backdrop-blur-sm py-2 mb-2 border-b border-slate-200/50">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth snap-x">
            {categoryNames.map((categoryName) => {
               const isActive = selectedCategory === categoryName;
               return (
                <button
                  key={categoryName}
                  onClick={() => setSelectedCategory(categoryName)}
                  className={`
                    px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 snap-start
                    ${
                      isActive
                        ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 scale-105"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-rose-200 hover:text-rose-500"
                    }
                  `}
                >
                  {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* --- Main Grid --- */}
        <div className="px-0">
            {filteredMenu.length > 0 ? (
                 <MenuList items={filteredMenu} hotelId={hotelId} />
            ) : (
                // --- Empty State ---
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="bg-rose-50 p-4 rounded-full mb-4">
                         <UtensilsCrossed size={32} className="text-rose-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No dishes found</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        We couldn't find anything matching "{searchQuery}" in {selectedCategory}.
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                        className="mt-6 text-rose-600 text-sm font-bold hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* --- Details Modal --- */}
      {selectedMenuItem && (
        <MenuDetailsModal 
            item={selectedMenuItem} 
            onClose={() => setSelectedMenuItem(null)} 
            hotelId={hotelId} 
        />
      )}
    </MainLayout>
  )
}