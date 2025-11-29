"use client"

import { ReactNode, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { setWithExpiry, getWithExpiry } from "@/lib/utils/localStorageWithExpiry"

interface Props {
  children: ReactNode
}

export default function HotelOrderLayout({ children }: Props) {
  const searchParams = useSearchParams()
  const [userLocation, setUserLocation] = useState<{
    latitude: number | undefined
    longitude: number | undefined
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [requiresTable, setRequiresTable] = useState(true)
  const id = searchParams.get("table")

  useEffect(() => {
    // Check if current path requires table verification
    const pathname = window.location.pathname
    setRequiresTable(!pathname.includes('/invoice/') && !pathname.includes('/pay'))
  }, [])

  useEffect(() => {
    if (!requiresTable) {
      setLoading(false)
      return
    }

    const storedTableId = getWithExpiry("tableId")

    // If a valid tableId exists in localStorage, use it
    if (storedTableId) {
      setTableId(storedTableId)
      setLoading(false)
      return
    }

    // Otherwise, get from URL params
    if (!id) {
      alert("Table ID is missing. Please scan the QR code on your table.")
      setError("Table ID is missing. Please scan the QR code on your table.")
      setLoading(false)
      return
    }

    setTableId(id)

    // Store for 2 hours
    setWithExpiry("tableId", id, 2 * 60 * 60 * 1000)
    setLoading(false)
  }, [searchParams, requiresTable, id])

  // useEffect(() => {
  //   if (!navigator.geolocation) {
  //     setError("Geolocation is not supported by your browser.")
  //     setLoading(false)
  //     return
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setUserLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //       })
  //       setLoading(false)
  //     },
  //     (geoError) => {
  //       let errorMessage = "An unknown error occurred while getting your location."
  //       switch (geoError.code) {
  //         case geoError.PERMISSION_DENIED:
  //           errorMessage = "Location permission denied. Please enable it in your browser settings to continue."
  //           break
  //         case geoError.POSITION_UNAVAILABLE:
  //           errorMessage = "Location information is unavailable."
  //           break
  //         case geoError.TIMEOUT:
  //           errorMessage = "The request to get user location timed out."
  //           break
  //       }
  //       setError(errorMessage)
  //       setLoading(false)
  //     }
  //   )
  // }, [])

  // Verify user location with server once userLocation and tableId are set
  // useEffect(() => {
  //   if (!userLocation || !tableId) return

  //   setLoading(true)
  //   fetch("/api/verify-location", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       latitude: userLocation.latitude,
  //       longitude: userLocation.longitude,
  //       tableId: tableId,
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.isCorrectLocation) {
  //         setError(null)
  //       } else {
  //         setError(
  //           "You are not at the correct location for this table. Please ensure you have scanned the correct QR code and your location services are accurate."
  //         )
  //       }
  //     })
  //     .catch(() => {
  //       setError("Failed to verify your location with the server.")
  //     })
  //     .finally(() => setLoading(false))
  // }, [tableId, userLocation])

  
  // Optional: Show loading spinner or error UI only if table is required
  if (requiresTable && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent mx-auto mb-5"></div>
          <p className="text-lg text-primary font-medium">Verifying your table...</p>
        </div>
      </div>
    )
  }

  if (requiresTable && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-lg shadow-md border border-destructive/30">
          <h1 className="text-3xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  

  // Render children if tableId and location verified or ignoring loading/error UI
  return <>{children}</>
}
