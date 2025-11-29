"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { setWithExpiry, getWithExpiry } from "@/lib/utils/localStorageWithExpiry"

export interface CartItem {
  deviceId: string
  hotelId: string
  menuItemId: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image?: string
  _id?:string
  quantity: number
  customization?: string
}

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  addItem: (item: CartItem) => void
  removeItem: (_id: string) => void
  updateQuantity: (_id: string, quantity: number) => void
  updateCustomization: (_id: string, customization: string) => void
  clearCart: () => void
  placingOrder: boolean
  placeOrderError: string | null
  placeOrder: () => Promise<any>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "cartItems"
const TABLE_ID_KEY = "tableId"
const HOTEL_ID = "hotelId"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [tableId,setTableId] = useState(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null)
  const [hotelId,setHotelId] = useState(null)

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    const storedTableId = getWithExpiry(TABLE_ID_KEY)
    const storedHotelId = getWithExpiry(HOTEL_ID)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
        setTableId(storedTableId)
        setHotelId(storedHotelId)
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [])

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === item.menuItemId)
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      }
      return [...prevItems, item]
    })
  }, [])

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId))
  }, [])

  const updateQuantity = useCallback(
    (_id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(_id)
        return
      }
      setItems((prevItems) => prevItems.map((i) => (i.menuItemId === _id ? { ...i, quantity } : i)))
    },
    [removeItem],
  )

  const updateCustomization = useCallback((menuItemId: string, customization: string) => {
    setItems((prevItems) => prevItems.map((i) => (i.menuItemId === menuItemId ? { ...i, customization } : i)))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Async place order function
  const placeOrder = useCallback(async (): Promise<any> => {
    if (items.length === 0) {
      setPlaceOrderError("Cart is empty")
      return null
    }

    setPlacingOrder(true)
    setPlaceOrderError(null)

    try {
      // Build payload
      const deviceId = items[0]?.deviceId || ""
      const subtotal = total
      const finalTotal = subtotal

      const payload = {
        hotelId,
        deviceId,
        table:tableId,
        items,
        totalAmount: subtotal,
        finalTotal,
        status: "pending",
        placedAt: new Date().toISOString(),
      }
      console.log(payload)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setPlaceOrderError(errorData.message || "Failed to place order")
        console.log(errorData)
        return null
      }

      const order = await response.json()
      clearCart()
      return order
    } catch (error: any) {
      setPlaceOrderError(error.message || "Something went wrong")
      console.log(error)
      return null
    } finally {
      setPlacingOrder(false)
    }
  }, [items, total, clearCart])

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomization,
        clearCart,
        placingOrder,
        placeOrderError,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
