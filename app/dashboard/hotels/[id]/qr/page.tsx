"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Download, 
  ExternalLink, 
  Printer, 
  UtensilsCrossed,
  ScanLine,
  Smartphone
} from 'lucide-react'

export default function QRPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  const [hotelData, setHotelData] = useState<any>(null)
  const [maxTables, setMaxTables] = useState(0)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)

    // Mock Fetch
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`)
        if (res.ok) {
           const data = await res.json()
           setHotelData(data?.hotel)
           setMaxTables(data?.hotel?.maxTables || 0)
        }
      } catch (err) { console.error(err) } 
      finally { setLoading(false) }
    }
    fetchHotel()
  }, [hotelId])

  const getMenuUrl = (tableNumber: number | string) => {
    return `${origin}/hotels/${hotelId}/${tableNumber}`
  }

  // API URL for Image: Using ecc=H (High) to allow center coverage, color=1e293b (Slate-800)
  const getQrImageUrl = (tableNumber: number) => {
    const dataUrl = getMenuUrl(tableNumber)
    return `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(dataUrl)}&color=1e293b&bgcolor=ffffff&ecc=H&margin=2`
  }

  // --- THE ARTIST: Canvas Generator for "Designed" Downloads ---
  const generateDesignedQR = async (tableNumber: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('No context')

      const size = 1200 // High Resolution
      canvas.width = size
      canvas.height = size + 200 // Extra space for footer

      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = getQrImageUrl(tableNumber)

      img.onload = () => {
        // 1. Background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 2. Decorative Outer Border
        ctx.strokeStyle = '#e11d48' // Rose-600
        ctx.lineWidth = 20
        ctx.strokeRect(40, 40, size - 80, size + 120)

        // 3. Draw QR
        const qrPadding = 100
        ctx.drawImage(img, qrPadding, qrPadding, size - (qrPadding*2), size - (qrPadding*2))

        // 4. Center Badge (White Circle + Red Ring)
        const centerX = size / 2
        const centerY = size / 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, 140, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.lineWidth = 15
        ctx.strokeStyle = '#e11d48'
        ctx.stroke()

        // 5. Table Number (Inside Badge)
        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 140px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${tableNumber}`, centerX, centerY + 15)
        
        // Label "TABLE" above number
        ctx.fillStyle = '#64748b'
        ctx.font = 'bold 30px Arial, sans-serif'
        ctx.fillText('TABLE', centerX, centerY - 80)

        // 6. Footer Text
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 50px Arial, sans-serif'
        ctx.fillText('Powered by foodslink.com', centerX, size + 80)

        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
    })
  }

  const handleDownload = async (tableNumber: number) => {
    setDownloading(tableNumber)
    try {
      const url = await generateDesignedQR(tableNumber)
      const link = document.createElement('a')
      link.href = url
      link.download = `Table-${tableNumber}-Designed.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      alert('Error generating image')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-rose-500 font-bold">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                 QR Manager
              </h1>
              <p className="text-slate-500 font-medium">
                 {hotelData?.name || 'Restaurant'} • {maxTables} Active Tables
              </p>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                 <Printer size={18} /> Print All
              </button>
           </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
          {Array.from({ length: maxTables }, (_, i) => i + 1).map((tableNum) => (
            
            // === THE CARD DESIGN START ===
            <div key={tableNum} className="group relative">
              
              {/* Card Container (Visual Only) */}
              <div className="relative bg-white rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(225,29,72,0.15)]">
                
                {/* Decorative Top Bar */}
                <div className="h-3 bg-gradient-to-r from-rose-500 to-orange-400 w-full" />

                {/* Card Content */}
                <div className="p-8 flex flex-col items-center">
                  
                  {/* Top Icon */}
                  <div className="mb-4 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full">
                     <UtensilsCrossed size={14} />
                     <span className="text-[10px] font-black tracking-widest uppercase">Scan To Order</span>
                  </div>

                  {/* QR Wrapper */}
                  <div className="relative w-52 h-52">
                    {/* The QR Image */}
                    <img 
                      src={getQrImageUrl(tableNum)}
                      alt="QR"
                      className="w-full h-full object-contain mix-blend-multiply opacity-90"
                      crossOrigin="anonymous"
                    />
                    
                    {/* The Center Badge Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-[3px] border-rose-500 flex flex-col items-center justify-center shadow-lg">
                       <span className="text-[8px] font-bold text-slate-400 uppercase">Table</span>
                       <span className="text-2xl font-black text-slate-800 leading-[0.8]">{tableNum}</span>
                    </div>
                  </div>

                  {/* Hotel Name */}
                  <h3 className="mt-4 font-bold text-slate-800 text-lg text-center leading-tight">
                    {hotelData?.name || 'Restaurant'}
                  </h3>

                  {/* Divider */}
                  <div className="w-full border-t border-dashed border-slate-200 my-4 relative">
                     <div className="absolute -left-10 -top-2 w-4 h-4 bg-slate-100 rounded-full" />
                     <div className="absolute -right-10 -top-2 w-4 h-4 bg-slate-100 rounded-full" />
                  </div>

                  {/* Footer */}
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Powered by
                    </p>
                    <p className="text-sm font-bold text-rose-600 flex items-center justify-center gap-1">
                      Foodslink.com
                    </p>
                  </div>
                </div>

                {/* Hover Actions (Overlay) */}
                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                   <button 
                     onClick={() => handleDownload(tableNum)}
                     disabled={downloading === tableNum}
                     className="bg-white text-rose-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                     title="Download Image"
                   >
                      {downloading === tableNum ? (
                        <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                      ) : (
                        <Download size={20} />
                      )}
                   </button>
                   <a 
                     href={getMenuUrl(tableNum)} 
                     target="_blank"
                     className="bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                     title="Test Link"
                   >
                      <ExternalLink size={20} />
                   </a>
                </div>

              </div>
              {/* === THE CARD DESIGN END === */}
              <div className='flex justify-between items-center gap-3 mt-4'>
              <button 
                     onClick={() => handleDownload(tableNum)}
                     disabled={downloading === tableNum}
                     className="bg-white text-rose-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                     title="Download Image"
                   >
                      {downloading === tableNum ? (
                        <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download size={20} /> Download Qr
                        </>
                      )}
                   </button>
                   <a 
                     href={getMenuUrl(tableNum)} 
                     target="_blank"
                     className="bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                     title="Test Link"
                   >
                      <ExternalLink size={20} /> Visit now
                   </a>
              </div>
            </div>
          ))}
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body { background: white; -webkit-print-color-adjust: exact; }
            .shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] { box-shadow: none !important; border: 1px solid #ddd; }
            button, a { display: none !important; }
          }
        `}</style>

      </div>
    </div>
  )
}
