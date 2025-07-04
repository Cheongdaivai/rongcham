"use client"

import { useState, useEffect, useCallback } from "react"
import { CartProvider, useCart } from "@/contexts/CartContext"
import { StickyCart } from "@/components/StickyCart"
import { SimpleCheckoutModal } from "@/components/SimpleCheckoutModal"
import { Sparkles, Utensils, Wine, ChefHat, Award, Star, ShoppingCart } from "lucide-react"
import { sampleMenuItems } from "@/data/foodItems"
import type { MenuItem } from "@/types"
import { Cormorant_Garamond } from "next/font/google"
import MenuItemCard from "@/components/MenuItemCard"

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

interface PageProps {
  params: {
    email: string
  }
}

// Cart Summary Indicator Component
function CartSummaryIndicator() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="menu-grid-cart-summary">
      <div className={`cart-summary has-items ${cormorant.className}`}>
        <ShoppingCart className="cart-icon" />
        <span>Cart: </span>
        <span className="cart-count">{itemCount}</span>
        <span>• ${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function BusinessMenuPage({ params }: PageProps) {
  return (
    <CartProvider>
      <MainApp email={params.email} />
    </CartProvider>
  )
}

function MainApp({ email }: { email: string }) {
  const { isCheckoutModalOpen, checkoutOrderTotal, hideCheckoutModal } = useCart();

  return (
    <>
      <MenuContent businessEmail={decodeURIComponent(email)} />
      <StickyCart />
      
      {/* Global Checkout Modal */}
      <SimpleCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={hideCheckoutModal}
        orderTotal={checkoutOrderTotal}
      />
    </>
  )
}

function MenuContent({ businessEmail }: { businessEmail: string }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching menu items for business:', businessEmail)
      
      const url = `/api/menu/${encodeURIComponent(businessEmail)}?_t=${Date.now()}`
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const items = await response.json()
        console.log('📦 Received items:', items.length, 'items')
        
        if (items && items.length > 0) {
          setMenuItems(items)
          console.log('✅ Menu items updated successfully')
        } else {
          console.log('⚠️ No items found for this business')
          setError(`No menu items found for ${businessEmail}`)
        }
      } else {
        console.error('❌ Response not ok:', response.status)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        setError(`Failed to load menu: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching menu items:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [businessEmail])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 relative overflow-hidden">
      {/* Luxurious Background Overlay */}
      <div className="fixed inset-0 z-0">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 sm:opacity-50 md:opacity-60"
          style={{ backgroundColor: '#1e293b' }}
        >
          <source src="/video-image/angkor.mp4" type="video/mp4" />
        </video>
        {/* Elegant dark overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-amber-900/65 sm:from-slate-900/80 sm:via-slate-800/70 sm:to-amber-900/60" />
        
        {/* Floating golden particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-1 h-1 sm:w-2 sm:h-2 bg-amber-400 rounded-full animate-float opacity-30" style={{ animationDelay: '0s' }} />
          <div className="absolute top-20 right-16 sm:top-40 sm:right-32 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-300 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
          <div className="absolute top-30 left-1/4 sm:top-60 sm:left-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-300 rounded-full animate-float opacity-35" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-10 sm:bottom-40 sm:right-20 w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-float opacity-25" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-30 left-20 sm:bottom-60 sm:left-40 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-amber-500 rounded-full animate-float opacity-30" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Business Header Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <div className="animate-slide-up">
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-16 sm:w-24 md:w-32" />
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-3 sm:mx-4" />
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-16 sm:w-24 md:w-32" />
              </div>
              
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl ${cormorant.className}`}>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                  {businessEmail.split('@')[0]}'s Kitchen
                </span>
              </h1>
              
              <div className="inline-flex items-center gap-3 bg-amber-600/20 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-400/30 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className={`text-amber-100 text-lg ${cormorant.className}`}>
                  {businessEmail}
                </span>
              </div>
              
              <p className={`text-xl sm:text-2xl md:text-3xl text-amber-50 mb-8 leading-relaxed drop-shadow-lg font-light max-w-4xl mx-auto ${cormorant.className}`}>
                Discover authentic Cambodian flavors crafted with passion and tradition
              </p>
              
              {/* Navigation */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 cursor-pointer group"
                >
                  <span className={`text-white font-medium text-sm ${cormorant.className}`}>← Back to Home</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/admin/login'}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 cursor-pointer group"
                >
                  <span className={`text-white font-medium text-sm ${cormorant.className}`}>Admin Login</span>
                  <Wine className="h-4 w-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="relative py-0 menu-section-enhanced">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="video-background opacity-50 sm:opacity-60 md:opacity-70"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <source src="/video-image/smoke.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay" />
          </div>
          
          <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto menu-grid-container relative z-10 py-8 sm:py-12 md:py-16">
            <CartSummaryIndicator />
            
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <div className="animate-slide-up">
                <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                  <Utensils className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 mx-2 sm:mx-3 md:mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                </div>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl ${cormorant.className}`}>
                  <span className="text-white">Our Menu</span>
                </h2>
                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed font-light px-4 drop-shadow-lg ${cormorant.className}`}>
                  Each dish tells a story of Cambodia's rich culinary heritage, reimagined with contemporary finesse
                </p>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className={`text-white text-xl ${cormorant.className}`}>Loading menu...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-20">
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-8 max-w-md mx-auto">
                  <p className={`text-red-200 text-lg mb-4 ${cormorant.className}`}>{error}</p>
                  <button 
                    onClick={fetchMenuItems}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {/* Menu Items */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-12 lg:gap-16 xl:gap-20">
                {menuItems.map((item, index) => (
                  <div 
                    key={item.menu_id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <MenuItemCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
