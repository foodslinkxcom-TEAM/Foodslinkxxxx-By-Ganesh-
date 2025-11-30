'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown,
  Meh,
  Calendar,
  Smile,
  Frown
} from 'lucide-react'

// --- Types ---
interface IFeedback {
  _id: string
  table: string
  rating: number
  message: string
  createdAt: string
}

// --- Helper: Star Renderer ---
const StarRating = ({ rating, size = 16 }: { rating: number, size?: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={`${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  // State
  const [feedback, setFeedback] = useState<IFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<'all' | 'positive' | 'negative'>('all')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch Data
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20', // Fetch more for better analytics view
          ...(searchQuery && { search: searchQuery })
        })
        
        const res = await fetch(`/api/dashboard/hotels/${hotelId}/feedback?${params}`)
        if (!res.ok) throw new Error('Failed to fetch feedback')
        
        const data = await res.json()
        setFeedback(data.feedback || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalCount(data.pagination?.total || 0)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [hotelId, currentPage, searchQuery])

  // --- Analytics Calculations (Client Side for Demo) ---
  // In a production app, these stats should come from a dedicated API endpoint
  const analytics = useMemo(() => {
    if (!feedback.length) return null
    
    const total = feedback.length
    const sum = feedback.reduce((acc, curr) => acc + curr.rating, 0)
    const avg = (sum / total).toFixed(1)
    
    const distribution = [5, 4, 3, 2, 1].map(score => ({
      score,
      count: feedback.filter(f => f.rating === score).length,
      percent: (feedback.filter(f => f.rating === score).length / total) * 100
    }))

    const positiveCount = feedback.filter(f => f.rating >= 4).length
    const satisfactionRate = Math.round((positiveCount / total) * 100)

    return { avg, total, distribution, satisfactionRate }
  }, [feedback])

  // --- Filtering Logic ---
  const filteredFeedback = feedback.filter(item => {
    if (ratingFilter === 'positive') return item.rating >= 4
    if (ratingFilter === 'negative') return item.rating <= 3
    return true
  })

  // --- Helper: Sentiment Color ---
  const getSentimentStyle = (rating: number) => {
    if (rating >= 4) return { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <Smile size={18} /> }
    if (rating === 3) return { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', icon: <Meh size={18} /> }
    return { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', icon: <Frown size={18} /> }
  }

  if (loading && !feedback.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
           <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-medium">Gathering Insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="bg-rose-100 p-2.5 rounded-xl text-rose-600">
                <MessageSquare size={32} />
              </span>
              Feedback & Analytics
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              Analyze customer sentiment and reviews.
            </p>
          </div>
        </div>

        {/* --- Analytics Dashboard --- */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
            
            {/* Card 1: Overall Score */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Star size={100} className="text-amber-400" />
               </div>
               <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Overall Rating</h3>
               <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-slate-800">{analytics.avg}</span>
                  <span className="text-xl text-slate-400 font-bold mb-1">/ 5.0</span>
               </div>
               <div className="mt-3">
                  <StarRating rating={Math.round(Number(analytics.avg))} size={24} />
               </div>
               <p className="text-xs text-slate-400 mt-4 bg-slate-50 px-3 py-1 rounded-full">
                  Based on {analytics.total} reviews
               </p>
            </div>

            {/* Card 2: Rating Distribution Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center">
               <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                 <TrendingUp size={14} /> Rating Breakdown
               </h3>
               <div className="space-y-2.5">
                  {analytics.distribution.map((item) => (
                    <div key={item.score} className="flex items-center gap-3 text-xs font-medium">
                       <span className="w-3 text-slate-600">{item.score}</span>
                       <Star size={10} className="text-slate-400 fill-slate-400" />
                       <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.score >= 4 ? 'bg-emerald-400' : item.score === 3 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                            style={{ width: `${item.percent}%` }}
                          />
                       </div>
                       <span className="w-8 text-right text-slate-400">{item.count}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Card 3: Satisfaction Score */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
               <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Customer Satisfaction</h3>
               
               <div className="relative w-32 h-32 flex items-center justify-center my-2">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className={analytics.satisfactionRate > 70 ? "text-emerald-500" : "text-amber-500"}
                      strokeDasharray={`${analytics.satisfactionRate}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-3xl font-black text-slate-800">{analytics.satisfactionRate}%</span>
                  </div>
               </div>
               <p className="text-xs text-slate-400 mt-1">Positive Reviews (4★ & 5★)</p>
            </div>

          </div>
        )}

        {/* --- Controls Toolbar --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-4 z-20 flex flex-col md:flex-row gap-4 justify-between items-center">
           
           {/* Search */}
           <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
              />
           </div>

           {/* Filter Tabs */}
           <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setRatingFilter('all')}
                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${ratingFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                All
              </button>
              <button 
                onClick={() => setRatingFilter('positive')}
                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${ratingFilter === 'positive' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                <ThumbsUp size={12} /> Positive
              </button>
              <button 
                onClick={() => setRatingFilter('negative')}
                className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${ratingFilter === 'negative' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                <ThumbsDown size={12} /> Negative
              </button>
           </div>
        </div>

        {/* --- Feedback Grid --- */}
        {!loading && filteredFeedback.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <MessageSquare className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No feedback found</h3>
              <p className="text-slate-500">Try adjusting your filters.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700">
              {filteredFeedback.map((item) => {
                 const sentiment = getSentimentStyle(item.rating)
                 return (
                    <div 
                      key={item._id} 
                      className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${sentiment.border} border-l-4 border-y border-r`}
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${sentiment.bg} ${sentiment.text}`}>
                                {item.table.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Table {item.table}</h4>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                   <Calendar size={10} /> 
                                   {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                          </div>
                          
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${sentiment.bg} ${sentiment.text}`}>
                             {sentiment.icon}
                             <span>{item.rating}/5</span>
                          </div>
                       </div>

                       <div className="mb-4">
                          <StarRating rating={item.rating} />
                       </div>

                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-slate-600 text-sm leading-relaxed italic">
                             "{item.message}"
                          </p>
                       </div>
                    </div>
                 )
              })}
           </div>
        )}

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
             <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
             >
                Previous
             </button>
             <span className="text-sm font-bold text-slate-600">
                Page {currentPage} of {totalPages}
             </span>
             <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
             >
                Next
             </button>
          </div>
        )}

      </div>
    </div>
  )
}