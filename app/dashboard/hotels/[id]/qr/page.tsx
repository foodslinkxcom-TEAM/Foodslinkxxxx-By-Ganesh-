"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { 
  QrCode, 
  Download, 
  ExternalLink, 
  Table, 
  Printer, 
  CheckCircle,
  Link as LinkIcon,
  Copy
} from 'lucide-react'

export default function QRPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  // State
  const [hotelData, setHotelData] = useState<any>(null)
  const [maxTables, setMaxTables] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)

  // 1. Initialize & Fetch Data
  useEffect(() => {
    // Set origin on client-side only
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }

    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`)
        if (!res.ok) throw new Error('Failed to fetch hotel data')
        const data = await res.json()
        setHotelData(data)
        setMaxTables(data.maxTables || 0)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchHotel()
  }, [hotelId])

  // --- Logic Helpers ---

  // Generate the actual URL that customers will visit
  const getMenuUrl = (tableNumber: number | string) => {
    return `${origin}/hotels/${hotelId}?table=${tableNumber}`
  }

  // Generate the QR Code Image URL (using an external API for generation)
  const getQrImageUrl = (tableNumber: number) => {
    const dataUrl = getMenuUrl(tableNumber)
    // Using simple styling: Dark Blue/Black dots on transparent/white bg
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dataUrl)}&color=0f172a&bgcolor=ffffff&margin=10`
  }

  // Handle Download (Single)
  const downloadQRCode = async (tableNumber: number) => {
    setDownloading(tableNumber)
    try {
      const qrUrl = getQrImageUrl(tableNumber)
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${hotelData?.name || 'Hotel'}-Table-${tableNumber}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Download failed:', error)
      alert("Failed to download. Try right-clicking the image.")
    } finally {
      setDownloading(null)
    }
  }

  // Handle Download (Bulk)
  const downloadAllQRCodes = () => {
    if (!confirm(`Download ${maxTables} QR code images?`)) return
    
    Array.from({ length: maxTables }, (_, i) => i + 1).forEach((tableNumber, index) => {
      setTimeout(() => downloadQRCode(tableNumber), index * 500)
    })
  }

  // Copy Master Link
  const copyMasterLink = () => {
    const url = getMenuUrl("{table_no}")
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
           <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-medium">Loading QR System...</p>
        </div>
      </div>
    )
  }

  if (error) return <div className="p-8 text-center text-rose-500 font-bold">Error: {error}</div>

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500 print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2.5 rounded-xl text-rose-600">
                <QrCode size={32} />
              </span>
              QR Management
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              {hotelData?.name}: {maxTables} Tables Configured
            </p>
          </div>
        </div>

        {/* --- Dynamic URL Banner --- */}
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center animate-in fade-in duration-500 print:hidden">
           <div className="p-3 bg-rose-50 rounded-full text-rose-600">
              <LinkIcon size={24} />
           </div>
           <div className="flex-1 w-full">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Master Menu Link Pattern</h3>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                 <code className="text-sm text-slate-600 flex-1 truncate font-mono px-2">
                    {getMenuUrl("1")} <span className="text-rose-400 font-bold">(Example)</span>
                 </code>
                 <button 
                   onClick={copyMasterLink}
                   className="p-2 hover:bg-white rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                   title="Copy Link"
                 >
                   {copied ? <CheckCircle size={18} className="text-green-500"/> : <Copy size={18} />}
                 </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                 This is the base URL pattern. Each QR code appends <code>?table=ID</code> to identify the order source.
              </p>
           </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
           <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>Ready for printing</span>
           </div>

           <div className="flex w-full md:w-auto gap-3">
              <button
                onClick={downloadAllQRCodes}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95"
              >
                <Download size={18} /> Download All
              </button>
           </div>
        </div>

        {/* --- QR Grid (This part prints) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 duration-700 print:grid-cols-3 print:gap-8">
          {Array.from({ length: maxTables }, (_, i) => i + 1).map((tableNumber) => (
            <div
              key={tableNumber}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col print:shadow-none print:border-2 print:break-inside-avoid"
            >
              {/* Card Header */}
              <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-rose-100 p-1.5 rounded-md text-rose-600">
                        <Table size={16} />
                    </div>
                    <span className="font-bold text-slate-800">Table {tableNumber}</span>
                 </div>
                 <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">
                    #{tableNumber}
                 </span>
              </div>

              {/* QR Image Area */}
              <div className="p-6 flex flex-col items-center justify-center flex-1">
                 <div className="w-48 h-48 bg-white p-1">
                    <img
                      src={getQrImageUrl(tableNumber)}
                      alt={`Table ${tableNumber} QR`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                 </div>
                 <p className="mt-2 text-xs font-bold text-rose-600 uppercase tracking-widest">Scan to Order</p>
              </div>

              {/* Action Footer (Hidden in Print) */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 print:hidden">
                 <button
                    onClick={() => downloadQRCode(tableNumber)}
                    disabled={downloading === tableNumber}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                 >
                    {downloading === tableNumber ? (
                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                       <Download size={16} />
                    )}
                    <span className="hidden sm:inline">Save</span>
                 </button>
                 
                 <a
                    href={getMenuUrl(tableNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                    title="Test Link (Open in new tab)"
                 >
                    <ExternalLink size={18} />
                 </a>
              </div>
            </div>
          ))}
        </div>

        {/* Print Styles Helper */}
        

      </div>
    </div>
  )
}