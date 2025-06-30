"use client"

import { useState, useEffect, useCallback } from "react"
import { CartProvider, useCart } from "@/contexts/CartContext"
import { StickyCart } from "@/components/StickyCart"
import { SimpleCheckoutModal } from "@/components/SimpleCheckoutModal"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Plus, Star, Clock, Award, Minus, ShoppingCart, Sparkles, Utensils, Wine, ChefHat } from "lucide-react"
import { sampleMenuItems } from "@/data/foodItems"
import type { MenuItem } from "@/types"
import { Inter, Cormorant_Garamond } from "next/font/google"
import AnimatedLogo from "@/components/AnimatedLogo"

const inter = Inter({ subsets: ["latin"] })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

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

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu")
        if (response.ok) {
          const items = await response.json()
          if (items && items.length > 0) {
            setMenuItems(items)
          }
        }
      } catch {
        console.log("Using sample data")
      }
    }

    fetchMenuItems()
  }, [])

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

              {/* Responsive Status Badge */}
              <div className="animate-slide-up flex justify-center lg:justify-end" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-white/10 backdrop-blur-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full border border-white/20 shadow-2xl">
                  <span className={`text-white font-medium text-xs sm:text-sm ${cormorant.className}`}>Fresh • À la minute • Excellence</span>
                  <div className="relative">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  <Wine className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-amber-400 animate-pulse" />
                </div>
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

        {/* Responsive Menu Section */}
        <section id="menu-section" className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 2xl:py-40 bg-gradient-to-br from-white via-slate-50 to-amber-50">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
              <div className="animate-slide-up">
                <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                  <Utensils className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600 mx-2 sm:mx-3 md:mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-16 sm:w-24 md:w-32" />
                </div>
                <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-slate-900 mb-4 sm:mb-6 md:mb-8 ${cormorant.className}`}>
                  <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-amber-800 bg-clip-text text-transparent">
                    Our Menu
                  </span>
                </h2>
                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light px-4 ${cormorant.className}`}>
                  Each dish tells a story of Cambodia&apos;s rich culinary heritage, reimagined with contemporary finesse
                </p>
                <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-12 sm:w-16 md:w-24" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-600 rounded-full mx-2 sm:mx-3 md:mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-12 sm:w-16 md:w-24" />
                </div>
              </div>
            </div>

            {/* Responsive Logo Display */}
            <div className="flex justify-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative">
                  {/* Responsive Animated 3D Logo */}
                  <div className="flex justify-center">
                    <AnimatedLogo size="lg" className="scale-75 sm:scale-90 md:scale-100" />
                  </div>
                    
                  {/* Responsive Brand Typography */}
                  <div className="absolute -bottom-16 sm:-bottom-18 md:-bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="text-center">
                      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent ${cormorant.className}`}>
                        RONGJAM
                      </div>
                      <div className={`text-sm sm:text-base md:text-lg text-slate-600 font-light mt-1 sm:mt-2 ${cormorant.className}`}>
                        Fine Cambodian Cuisine
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Responsive Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              {menuItems.map((item, index) => (
                <div 
                  key={item.menu_id} 
                  className="animate-slide-up hover-lift"
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

function MenuItemCard({ item }: { item: MenuItem }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCart()

  const handleAddToCartClick = useCallback(() => {
    if (!item.availability) return
    try {
      setIsModalOpen(true)
      setQuantity(1)
    } catch (error) {
      console.error('Error opening modal:', error)
    }
  }, [item.availability])

  const handleCloseModal = useCallback(() => {
    try {
      setIsModalOpen(false)
      setQuantity(1)
      setIsAddingToCart(false)
    } catch (error) {
      console.error('Error closing modal:', error)
    }
  }, [])

  const handleConfirmAddToCart = useCallback(async () => {
    if (isAddingToCart) return // Prevent double clicks
    
    try {
      setIsAddingToCart(true)
      
      // Add items to cart based on quantity - instant, no waiting
      for (let i = 0; i < quantity; i++) {
        addItem(item)
      }
      
      // Close modal immediately
      handleCloseModal()
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }, [isAddingToCart, quantity, addItem, item, handleCloseModal])

  const incrementQuantity = useCallback(() => {
    setQuantity(prev => prev + 1)
  }, [])

  const decrementQuantity = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1))
  }, [])

  return (
    <>
      {/* Premium Menu Card */}
      <div className="group relative overflow-hidden h-[480px]">
        {/* Main Card Container */}
        <div className="relative bg-white backdrop-blur-xl border border-slate-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
          {/* Luxury Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #f59e0b 2px, #f59e0b 4px)`,
            }}></div>
          </div>
          
          {/* High-Quality Image Container */}
          <div className="relative h-56 overflow-hidden flex-shrink-0 bg-slate-100">
            <img
              src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"}
              alt={item.name}
              className="w-full h-full object-cover filter brightness-110 contrast-115 saturate-120"
              loading="lazy"
            />
            
            {/* Cinematic Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60" />
            
            {/* Responsive Premium Floating Badges */}
            <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 space-y-1 sm:space-y-2">
              {/* Chef's Signature */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold tracking-wider shadow-2xl border border-amber-300/30 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <ChefHat className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className={`text-xs sm:text-xs ${cormorant.className}`}>CHEF&apos;S SIGNATURE</span>
                </div>
              </div>
              
              {/* 5-Star Rating */}
              <div className="bg-white/95 backdrop-blur-sm text-slate-900 px-2 sm:px-3 py-1 sm:py-1.5 shadow-xl border border-white/40">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Responsive Ultra-Premium Price Display */}
            <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
              <div className="relative group/price">
                <div className="bg-gradient-to-br from-white via-white to-amber-50 backdrop-blur-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 shadow-2xl border-2 border-amber-200/50 relative overflow-hidden">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-amber-400"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-amber-400"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-amber-400"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-amber-400"></div>
                  
                  <div className="relative z-10">
                    <div className={`text-xs text-slate-600 font-medium tracking-wider mb-0.5 sm:mb-1 ${cormorant.className}`}>PRICE</div>
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold text-slate-900 ${cormorant.className}`}>${item.price.toFixed(2)}</div>
                  </div>
                  
                  {/* Luxury shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent opacity-20"></div>
                </div>
              </div>
            </div>

            {/* Responsive Artisan Badge */}
            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4">
              <div className="bg-slate-900/90 backdrop-blur-sm text-amber-300 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium shadow-xl border border-amber-300/30">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={cormorant.className}>Artisan Crafted</span>
                </div>
              </div>
            </div>

            {/* Availability Overlay */}
            {!item.availability && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-30">
                <div className="text-center space-y-2 sm:space-y-4">
                  <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-base sm:text-lg font-bold shadow-2xl border-2 border-red-400/50">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto mb-1 sm:mb-2" />
                    <div className={`text-sm sm:text-base ${cormorant.className}`}>Temporarily Unavailable</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Responsive Content Section */}
          <div className="relative p-4 space-y-3 bg-gradient-to-br from-white via-white to-amber-50/30 flex-grow flex flex-col">
            {/* Title with Responsive Typography */}
            <div className="flex-shrink-0">
              <h3 className={`text-xl font-bold text-slate-900 mb-2 leading-tight ${cormorant.className}`}>
                {item.name}
              </h3>
              <div className="h-px bg-gradient-to-r from-amber-400 via-amber-300 to-transparent w-2/3"></div>
            </div>
            
            {/* Description */}
            <div className="flex-grow">
              <p className={`text-slate-700 text-sm leading-relaxed font-light line-clamp-3 ${inter.className}`}>
                {item.description}
              </p>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4 flex-shrink-0">
              <Button
                onClick={handleAddToCartClick}
                disabled={!item.availability}
                className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-white font-bold py-4 px-6 text-base shadow-xl hover:shadow-amber-500/30 transition-all duration-300 border-2 border-slate-700 hover:border-amber-600 relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span className={`${cormorant.className} tracking-wide font-bold`}>Add to Selection</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Add to Your Selection"
      >
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Premium Item Display - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-slate-50 via-white to-amber-50 border border-slate-200 shadow-inner animate-slide-up">
            <div className="w-full sm:w-32 h-32 sm:h-24 overflow-hidden bg-slate-100 flex-shrink-0 shadow-lg border border-slate-300 relative">
              <img
                src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"}
                alt={item.name}
                className="w-full h-full object-cover filter brightness-110 contrast-115 saturate-120"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className={`text-lg sm:text-xl font-medium text-slate-900 mb-1 sm:mb-2 truncate ${cormorant.className}`}>{item.name}</h3>
              <p className={`text-slate-600 text-sm sm:text-base line-clamp-2 mb-2 sm:mb-3 ${inter.className}`}>{item.description}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className={`text-lg sm:text-xl font-bold text-slate-900 ${cormorant.className}`}>${item.price.toFixed(2)}</p>
                <span className={`text-xs sm:text-sm text-slate-500 bg-slate-200 px-2 sm:px-3 py-1 sm:py-1.5 font-medium ${inter.className}`}>
                  Per serving
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selector - Responsive */}
          <div className="space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className={`text-lg sm:text-xl font-medium text-slate-900 block ${cormorant.className}`}>Select Quantity</label>
            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-slate-50 to-amber-50 py-4 sm:py-6 border border-slate-200 shadow-inner">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-300 hover:border-amber-600 hover:bg-amber-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex flex-col items-center">
                <span className={`text-2xl sm:text-3xl md:text-4xl font-medium text-slate-900 bg-white py-2 sm:py-3 px-4 sm:px-6 md:px-8 border-2 border-slate-200 min-w-[4rem] sm:min-w-[5rem] md:min-w-[7rem] text-center shadow-lg ${cormorant.className}`}>
                  {quantity}
                </span>
                <span className={`text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 ${inter.className}`}>Quantity</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-300 hover:border-amber-600 hover:bg-amber-50 transition-all duration-300 shadow-lg"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Total Section - Responsive */}
          <div className="bg-gradient-to-r from-slate-50 to-amber-50 p-4 sm:p-6 border border-slate-200 shadow-inner animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              <span className={`text-slate-700 ${cormorant.className}`}>Total:</span>
              <span className={`text-slate-900 bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-lg border border-slate-200 ${cormorant.className}`}>
                ${(item.price * quantity).toFixed(2)}
              </span>
            </div>
            
            <Button
              onClick={handleConfirmAddToCart}
              disabled={isAddingToCart}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-white shadow-xl hover:shadow-amber-500/30 transition-all duration-300 border-2 border-slate-700 hover:border-amber-600 relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className={cormorant.className}>Adding to Cart...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-4 w-4 sm:w-5 sm:h-5" />
                  <span className={`${cormorant.className} tracking-wide font-bold`}>
                    Add {quantity} {quantity > 1 ? 'items' : 'item'} to Cart
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
