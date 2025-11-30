"use client"

import React, { useState, useEffect } from "react"
import { 
  CheckCircle, MapPin, CreditCard, Building, User, Mail, Phone, Key, 
  ArrowRight, ArrowLeft, Store, ShieldCheck, ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  {
    id: 0,
    title: "Restaurant Info",
    description: "Establishment details",
    icon: Store,
  },
  {
    id: 1,
    title: "Owner Details",
    description: "Admin account setup",
    icon: User,
  },
  {
    id: 2,
    title: "Review",
    description: "Confirm & Submit",
    icon: ShieldCheck,
  },
]

export default function RestaurantSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    hotelName: "",
    address: "",
    upiId: "",
    plan: "free",
    username: "",
    email: "",
    phone: "",
    password: "",
    latitude: 0,
    longitude: 0,
  })
  const [loading, setLoading] = useState(false)
  const [geoError, setGeoError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")

  // Auto-fetch location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }))
        },
        (err) => {
          console.error(err)
          setGeoError("Location access denied.")
        }
      )
    } else {
      setGeoError("Geolocation unsupported.")
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlanSelect = (plan: string) => {
    setForm((prev) => ({ ...prev, plan }))
  }

  const validateStep = () => {
    if (currentStep === 0) {
      if (!form.hotelName || !form.address || !form.upiId) {
        setError("Please fill in all restaurant details.")
        return false
      }
    }
    if (currentStep === 1) {
      if (!form.username || !form.email || !form.phone || !form.password) {
        setError("Please fill in all owner details.")
        return false
      }
    }
    setError("")
    return true
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1 && validateStep()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
        setError("")
        setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })

        const data = await response.json()

        if (!response.ok) {
            // Throw error if status is not 200-299
            throw new Error(data.message || "Registration failed")
        }

        console.log("Success:", data)
        alert("Registration Successful!")
        router.push("/dashboard/pending-verification")
        // router.push("/dashboard/pending-verification")

    } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Something went wrong. Please try again.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">
        
        {/* --- LEFT SIDEBAR (Progress) --- */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-red-700 to-orange-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Partner with FoodsLinkx</h2>
            <p className="text-red-100 text-sm mb-8">Join 500+ restaurants growing their business with us.</p>
            
            {/* Vertical Steps */}
            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={idx} className={`flex items-start gap-4 transition-all duration-300 ${idx === currentStep ? 'opacity-100 translate-x-2' : 'opacity-50'}`}>
                  <div className={`p-2 rounded-xl border border-white/20 ${idx === currentStep ? 'bg-white/20 backdrop-blur-md' : 'bg-transparent'}`}>
                    <step.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{step.title}</h3>
                    <p className="text-xs text-red-100">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
             <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-xs font-medium italic">"Since joining FoodsLinkx, our orders have increased by 40% in just two months!"</p>
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-6 h-6 rounded-full bg-white/30"></div>
                    <span className="text-xs font-bold">Pizza Hut Manager</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT (Form) --- */}
        <div className="w-full md:w-2/3 p-6 md:p-10 bg-white">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{steps[currentStep].title}</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {currentStep + 1} of 3</span>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-in slide-in-from-top-2">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 text-red-500"><ShieldCheck size={20}/></div>
                        <div className="ml-3 text-sm text-red-700 font-medium">{error}</div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex-grow space-y-5">
                
                {/* STEP 0: RESTAURANT INFO */}
                {currentStep === 0 && (
                  <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                    <InputField 
                        label="Restaurant Name" 
                        name="hotelName" 
                        icon={Store} 
                        value={form.hotelName} 
                        onChange={handleChange} 
                        placeholder="e.g. The Spicy Spoon" 
                    />
                    <InputField 
                        label="Address" 
                        name="address" 
                        icon={MapPin} 
                        value={form.address} 
                        onChange={handleChange} 
                        placeholder="Street, City, Zip Code" 
                    />
                    <InputField 
                        label="Business UPI ID" 
                        name="upiId" 
                        icon={CreditCard} 
                        value={form.upiId} 
                        onChange={handleChange} 
                        placeholder="merchant@upi" 
                    />
                    
                    {/* Location Badge */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 text-sm">
                        <div className={`p-2 rounded-full ${geoError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <MapPin size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-700">Location Detected</p>
                            {geoError ? (
                                <p className="text-red-500 text-xs">{geoError}</p>
                            ) : (
                                <p className="text-green-700 text-xs font-mono">{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
                            )}
                        </div>
                        {!geoError && <CheckCircle size={18} className="text-green-500" />}
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Partnership Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['free', 'basic', 'premium'].map((plan) => (
                                <div 
                                    key={plan}
                                    onClick={() => handlePlanSelect(plan)}
                                    className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all duration-200 ${form.plan === plan ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}
                                >
                                    <p className="capitalize font-bold text-sm text-gray-800">{plan}</p>
                                    <p className="text-xs text-gray-500 mt-1">{plan === 'free' ? '0%' : plan === 'basic' ? '2%' : '5%'} Comm.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: OWNER DETAILS */}
                {currentStep === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Username" name="username" icon={User} value={form.username} onChange={handleChange} placeholder="admin_user" />
                            <InputField label="Phone Number" name="phone" icon={Phone} value={form.phone} onChange={handleChange} placeholder="+91 98765..." />
                        </div>
                        <InputField label="Email Address" name="email" icon={Mail} value={form.email} onChange={handleChange} placeholder="owner@restaurant.com" type="email" />
                        <InputField label="Create Password" name="password" icon={Key} value={form.password} onChange={handleChange} placeholder="••••••••" type="password" />
                    </div>
                )}

                {/* STEP 2: REVIEW */}
                {currentStep === 2 && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                            
                            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                                <div>
                                    <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Establishment</h3>
                                    <p className="text-lg font-bold text-gray-900">{form.hotelName}</p>
                                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1"><MapPin size={14}/> {form.address}</p>
                                </div>
                                <div className="text-right">
                                     <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">{form.plan} Plan</span>
                                </div>
                            </div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Admin Contact</h3>
                                    <p className="text-gray-900 font-medium">{form.username}</p>
                                    <p className="text-gray-600 text-sm">{form.email}</p>
                                    <p className="text-gray-600 text-sm">{form.phone}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Payment</h3>
                                    <p className="text-gray-900 font-medium font-mono">{form.upiId}</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl flex items-start gap-3 text-sm text-yellow-800">
                                <ShieldCheck className="flex-shrink-0 mt-0.5" size={18} />
                                <p>By clicking submit, you agree to our Partner Terms & Conditions and Privacy Policy. Verification usually takes 24 hours.</p>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
                <button 
                    onClick={prevStep} 
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {currentStep === steps.length - 1 ? (
                     <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-1 disabled:opacity-70"
                     >
                        {loading ? 'Processing...' : 'Submit Application'} <CheckCircle size={18} />
                     </button>
                ) : (
                    <button 
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all hover:-translate-y-1"
                    >
                        Next Step <ArrowRight size={18} />
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component for Form Inputs
function InputField({ label, name, icon: Icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Icon size={20} />
                </div>
                <input 
                    name={name}
                    type={type}
                    value={value} 
                    onChange={onChange} 
                    required 
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all duration-200 font-medium" 
                />
            </div>
        </div>
    )
}