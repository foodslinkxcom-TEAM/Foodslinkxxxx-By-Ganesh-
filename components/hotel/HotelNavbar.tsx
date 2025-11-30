"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, ChefHat } from "lucide-react"

interface HotelNavbarProps {
  hotelName: string
  onSearch: (query: string) => void
}

export default function HotelNavbar({ hotelName, onSearch }: HotelNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  const handleCloseSearch = () => {
    setSearchOpen(false)
    setQuery("")
    onSearch("") // Reset parent search
  }

  return (
    <>
      {/* Fixed Navbar 
        z-50 ensures it stays above everything else
      */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          
          {/* --- Logo / Hotel Name Section --- 
              Hidden on mobile when search is open to make room for input 
          */}
          <div 
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              searchOpen ? "-translate-x-full opacity-0 absolute md:relative md:translate-x-0 md:opacity-100" : "translate-x-0 opacity-100"
            }`}
          >
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-1.5 rounded-lg text-white shadow-md shadow-rose-200">
              <ChefHat size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg md:text-xl font-bold truncate text-slate-800 tracking-tight">
              {hotelName}
            </h1>
          </div>

          {/* --- Search Section --- */}
          <div className={`flex items-center justify-end transition-all duration-300 ${searchOpen ? "w-full md:w-auto" : "w-auto"}`}>
            
            {/* Expanded Search Bar */}
            <div 
              className={`
                flex items-center bg-rose-50 rounded-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${searchOpen ? "w-full md:w-64 opacity-100 pr-2 border border-rose-200 shadow-inner" : "w-0 opacity-0 border-none"}
              `}
            >
              <div className="pl-3 pr-2 text-rose-400">
                <Search size={16} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search dishes..."
                onChange={handleSearchChange}
                className="w-full py-2 bg-transparent text-sm text-slate-700 placeholder-rose-300/70 focus:outline-none"
              />
              {query && (
                 <button 
                   onClick={() => { setQuery(""); onSearch(""); inputRef.current?.focus(); }} 
                   className="p-1 hover:bg-rose-100 rounded-full transition-colors"
                 >
                   <X size={14} className="text-rose-400" />
                 </button>
              )}
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center gap-2 ml-2">
              {searchOpen ? (
                <button
                  onClick={handleCloseSearch}
                  className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full text-rose-600 hover:bg-rose-50 hover:shadow-sm transition-all duration-200 active:scale-95"
                  aria-label="Open search"
                >
                  <Search size={22} strokeWidth={2.5} />
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content hiding behind fixed nav */}
      <div className="h-16" />
    </>
  )
}