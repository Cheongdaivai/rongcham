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

export default function Home() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  )
}

function MainApp() {
  const { isCheckoutModalOpen, checkoutOrderTotal, hideCheckoutModal } = useCart();

  return (
    <>
      <HomeContent />
      <StickyCart />
      
      {/* Global Checkout Modal - displays on the page level */}
      <SimpleCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={hideCheckoutModal}
        orderTotal={checkoutOrderTotal}
      />
    </>
  )
}

function HomeContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems)

  const fetchMenuItems = useCallback(async () => {
    try {
      console.log('🔄 Fetching menu items...')
      // Add timestamp to prevent caching
      const response = await fetch(`/api/menu?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const items = await response.json()
        console.log('📦 Received items:', items.length, 'items')
        console.log('🖼️ First item image_url:', items[0]?.image_url)
        
        if (items && items.length > 0) {
          setMenuItems(items)
          console.log('✅ Menu items updated successfully')
        } else {
          console.log('⚠️ No items received, keeping current items')
        }
      } else {
        console.error('❌ Response not ok:', response.status)
      }
    } catch (error) {
      console.error("❌ Error fetching menu items:", error)
      console.log("Using sample data")
    }
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  // Refetch when window regains focus (returning from admin)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focus detected - refreshing menu items')
      fetchMenuItems()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visibility changed - refreshing menu items')
        fetchMenuItems()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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
        {/* Elegant dark overlay for sophistication - responsive opacity */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-amber-900/65 sm:from-slate-900/80 sm:via-slate-800/70 sm:to-amber-900/60" />
        
        {/* Floating golden particles - responsive sizing and positioning */}
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
        {/* Responsive Hero Section */}
        <section className="relative min-h-screen py-4 sm:py-8 md:py-12 lg:py-16 overflow-hidden flex items-center">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center w-full gap-8 lg:gap-0">
            {/* Left Side - Brand and Description */}
            <div className="lg:col-span-6 text-center lg:text-left px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
              <div className="animate-slide-up">
                <div className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6 md:mb-8">
                  <div className="h-px bg-gradient-to-r from-amber-400 to-transparent w-8 sm:w-12 md:w-16" />
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-400 mx-2 sm:mx-3 md:mx-4" />
                </div>
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-white mb-4 sm:mb-6 md:mb-8 leading-tight drop-shadow-2xl ${cormorant.className}`}>
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                    Exquisite Khmer Cuisine
                  </span>
                </h1>
                <div className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6 md:mb-8">
                  <div className="h-px bg-gradient-to-r from-amber-400 to-transparent w-12 sm:w-16 md:w-24" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mx-2 sm:mx-3 md:mx-4" />
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-amber-50 mb-2 sm:mb-3 md:mb-4 leading-relaxed drop-shadow-lg font-light ${cormorant.className}`}>
                  An artful symphony of authentic Cambodian flavors, meticulously crafted by our master chefs.
                </p>
                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-amber-200 mb-6 sm:mb-8 md:mb-12 leading-relaxed ${cormorant.className}`}>
                  Where tradition meets culinary excellence.
                </p>
              </div>

              {/* Responsive Menu Indicator */}
              <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <button 
                  onClick={() => {
                    document.getElementById('menu-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/10 backdrop-blur-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full border border-white/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 cursor-pointer group hover:bg-white/20 mx-auto lg:mx-0"
                >
                  <div className="relative">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  <span className={`text-white font-medium text-sm sm:text-base ${cormorant.className}`}>Explore our exquisite menu</span>
                  <div className="transform group-hover:translate-y-1 transition-transform duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Side - Responsive Features */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 group hover:scale-105 transition-all duration-500 justify-center lg:justify-end">
                  <div className="text-center lg:text-right">
                    <span className={`text-white font-medium text-lg sm:text-xl drop-shadow-md block ${cormorant.className}`}>5-Star Rating</span>
                    <span className="text-amber-200 text-xs sm:text-sm opacity-90">Michelin Recommended</span>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 group hover:scale-105 transition-all duration-500 justify-center lg:justify-end">
                  <div className="text-center lg:text-right">
                    <span className={`text-white font-medium text-lg sm:text-xl drop-shadow-md block ${cormorant.className}`}>Master Chefs</span>
                    <span className="text-amber-200 text-xs sm:text-sm opacity-90">Culinary Artists</span>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-full shadow-2xl group-hover:shadow-slate-500/30 transition-all duration-500">
                    <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 group hover:scale-105 transition-all duration-500 justify-center lg:justify-end">
                  <div className="text-center lg:text-right">
                    <span className={`text-white font-medium text-lg sm:text-xl drop-shadow-md block ${cormorant.className}`}>Premium Quality</span>
                    <span className="text-amber-200 text-xs sm:text-sm opacity-90">Finest Ingredients</span>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-full shadow-2xl group-hover:shadow-emerald-500/30 transition-all duration-500">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Admin Login Button */}
              <div className="animate-slide-up flex justify-center lg:justify-end" style={{ animationDelay: '0.7s' }}>
                <button 
                  onClick={() => window.location.href = '/admin/login'}
                  className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/10 backdrop-blur-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full border border-white/20 shadow-2xl hover:bg-white/20 hover:shadow-white/30 transition-all duration-500 cursor-pointer group"
                >
                  <span className={`text-white font-medium text-xs sm:text-sm ${cormorant.className}`}>Sign up / Login</span>
                  <div className="relative">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  <Wine className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Marquee Section */}
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-4 sm:py-6 md:py-8 overflow-hidden border-y border-amber-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
          <div className="relative flex animate-marquee whitespace-nowrap">
            <span className={`mx-8 sm:mx-12 md:mx-16 text-lg sm:text-xl md:text-2xl font-light flex items-center gap-2 sm:gap-3 md:gap-4 ${cormorant.className}`}>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-300" />
              Fine Dining Excellence • Authentic Cambodian Heritage • Artisanal Culinary Craft • Premium Service
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-300" />
            </span>
            <span className={`mx-8 sm:mx-12 md:mx-16 text-lg sm:text-xl md:text-2xl font-light flex items-center gap-2 sm:gap-3 md:gap-4 ${cormorant.className}`}>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-300" />
              Fine Dining Excellence • Authentic Cambodian Heritage • Artisanal Culinary Craft • Premium Service
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-300" />
            </span>
          </div>
        </div>

        {/* Menu Section - Moved to Top with No Spacing */}
        <section id="menu-section" className="relative py-0 menu-section-enhanced">
          {/* Video Background */}
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
            {/* Overlay for better content visibility */}
            <div className="video-overlay" />
          </div>
          
          <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto menu-grid-container relative z-10 py-8 sm:py-12 md:py-16">
            {/* Cart Summary Indicator at Top */}
            <CartSummaryIndicator />
            
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <div className="animate-slide-up">
                <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                  <Utensils className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 mx-2 sm:mx-3 md:mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                </div>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl ${cormorant.className}`}>
                  <span className="text-white">
                    Our Menu
                  </span>
                </h2>
                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed font-light px-4 drop-shadow-lg ${cormorant.className}`}>
                  Each dish tells a story of Cambodia&apos;s rich culinary heritage, reimagined with contemporary finesse
                </p>
                <div className="flex items-center justify-center mt-3 sm:mt-4 md:mt-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-12 sm:w-16 md:w-24" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-600 rounded-full mx-2 sm:mx-3 md:mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-12 sm:w-16 md:w-24" />
                </div>
              </div>
            </div>
            
                        {/* Narrower Cards with Larger Images - More Spacing */}
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
          </div>
        </section>
      </div>
    </div>
  )
}
