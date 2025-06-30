"use client"

import { useState, useEffect, useCallback } from "react"
import { CartProvider, useCart } from "@/contexts/CartContext"
import { StickyCart } from "@/components/StickyCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Plus, Star, Clock, Award, Minus, ShoppingCart, Sparkles, Utensils, Wine, ChefHat } from "lucide-react"
import { sampleMenuItems } from "@/data/foodItems"
import type { MenuItem } from "@/types"
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({ subsets: ["latin"] })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
      <StickyCart />
    </CartProvider>
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
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&crop=center')"
          }}
        />
        {/* Elegant dark overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-amber-900/60" />
        
        {/* Floating golden particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-2 h-2 bg-amber-400 rounded-full animate-float opacity-30" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-300 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
          <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float opacity-35" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-20 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-25" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-60 left-40 w-1 h-1 bg-amber-500 rounded-full animate-float opacity-30" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Exquisite Hero Section with Side Layout */}
        <section className="relative min-h-screen py-8 sm:py-12 lg:py-16 overflow-hidden flex items-center">
          {/* Left Side - Brand and Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center w-full">
            <div className="lg:col-span-6 text-left px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
              <div className="animate-slide-up">
                <div className="flex items-center mb-8">
                  <div className="h-px bg-gradient-to-r from-amber-400 to-transparent w-16" />
                  <Sparkles className="h-6 w-6 text-amber-400 mx-4" />
                </div>
                <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light text-white mb-8 leading-tight drop-shadow-2xl ${cormorant.className}`}>
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                    Exquisite Khmer Cuisine
                  </span>
                </h1>
                <div className="flex items-center mb-8">
                  <div className="h-px bg-gradient-to-r from-amber-400 to-transparent w-24" />
                  <div className="w-2 h-2 bg-amber-400 rounded-full mx-4" />
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-amber-50 mb-4 leading-relaxed drop-shadow-lg font-light ${cormorant.className}`}>
                  An artful symphony of authentic Cambodian flavors, meticulously crafted by our master chefs.
                </p>
                <p className={`text-lg sm:text-xl lg:text-2xl text-amber-200 mb-12 leading-relaxed ${cormorant.className}`}>
                  Where tradition meets culinary excellence.
                </p>
              </div>

              {/* Menu Indicator */}
              <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <button 
                  onClick={() => {
                    document.getElementById('menu-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 cursor-pointer group hover:bg-white/20"
                >
                  <div className="relative">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-3 h-3 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  <span className={`text-white font-medium text-base ${cormorant.className}`}>Explore our exquisite menu</span>
                  <div className="transform group-hover:translate-y-1 transition-transform duration-300">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Side - Features */}
            <div className="lg:col-span-6 space-y-8 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-500 justify-end">
                  <div className="text-right">
                    <span className={`text-white font-medium text-xl drop-shadow-md block ${cormorant.className}`}>5-Star Rating</span>
                    <span className="text-amber-200 text-sm opacity-90">Michelin Recommended</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500">
                    <Star className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-500 justify-end">
                  <div className="text-right">
                    <span className={`text-white font-medium text-xl drop-shadow-md block ${cormorant.className}`}>Master Chefs</span>
                    <span className="text-amber-200 text-sm opacity-90">Culinary Artists</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-full shadow-2xl group-hover:shadow-slate-500/30 transition-all duration-500">
                    <ChefHat className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-500 justify-end">
                  <div className="text-right">
                    <span className={`text-white font-medium text-xl drop-shadow-md block ${cormorant.className}`}>Premium Quality</span>
                    <span className="text-amber-200 text-sm opacity-90">Finest Ingredients</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-full shadow-2xl group-hover:shadow-emerald-500/30 transition-all duration-500">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Elegant Status Badge */}
              <div className="animate-slide-up flex justify-end" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg px-6 py-4 rounded-full border border-white/20 shadow-2xl">
                  <span className={`text-white font-medium text-sm ${cormorant.className}`}>Fresh • À la minute • Excellence</span>
                  <div className="relative">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-3 h-3 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  <Wine className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sophisticated Marquee Section */}
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-8 overflow-hidden border-y border-amber-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
          <div className="relative flex animate-marquee whitespace-nowrap">
            <span className={`mx-16 text-2xl font-light flex items-center gap-4 ${cormorant.className}`}>
              <Sparkles className="h-6 w-6 text-amber-300" />
              Fine Dining Excellence • Authentic Cambodian Heritage • Artisanal Culinary Craft • Premium Service
              <Sparkles className="h-6 w-6 text-amber-300" />
            </span>
            <span className={`mx-16 text-2xl font-light flex items-center gap-4 ${cormorant.className}`}>
              <Sparkles className="h-6 w-6 text-amber-300" />
              Fine Dining Excellence • Authentic Cambodian Heritage • Artisanal Culinary Craft • Premium Service
              <Sparkles className="h-6 w-6 text-amber-300" />
            </span>
          </div>
        </div>

        {/* Refined Menu Section */}
        <section id="menu-section" className="relative py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-white via-slate-50 to-amber-50">
          <div className="container">
            <div className="text-center mb-20 sm:mb-24">
              <div className="animate-slide-up">
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-32" />
                  <Utensils className="h-6 w-6 text-amber-600 mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-32" />
                </div>
                <h2 className={`text-5xl sm:text-6xl lg:text-7xl font-light text-slate-900 mb-8 ${cormorant.className}`}>
                  <span className="bg-gradient-to-r from-slate-800 via-slate-900 to-amber-800 bg-clip-text text-transparent">
                    Carte du Chef
                  </span>
                </h2>
                <p className={`text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light ${cormorant.className}`}>
                  Each dish tells a story of Cambodia's rich culinary heritage, reimagined with contemporary finesse
                </p>
                <div className="flex items-center justify-center mt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-24" />
                  <div className="w-2 h-2 bg-amber-600 rounded-full mx-4" />
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-24" />
                </div>
              </div>
            </div>

            {/* Premium Logo Display */}
            <div className="flex justify-center mb-20 sm:mb-24">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative">
                  {/* Luxurious 3D Logo */}
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-full shadow-2xl border-8 border-white/20 backdrop-blur-sm">
                      <div className="absolute inset-4 bg-gradient-to-br from-amber-500 via-amber-700 to-amber-900 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-white fill-current">
                          <rect x="10" y="70" width="80" height="8" />
                          <rect x="45" y="30" width="10" height="40" />
                          <polygon points="45,30 50,20 55,30" />
                          <rect x="25" y="45" width="8" height="25" />
                          <polygon points="25,45 29,38 33,45" />
                          <rect x="67" y="45" width="8" height="25" />
                          <polygon points="67,45 71,38 75,45" />
                          <rect x="15" y="55" width="6" height="15" />
                          <polygon points="15,55 18,50 21,55" />
                          <rect x="79" y="55" width="6" height="15" />
                          <polygon points="79,55 82,50 85,55" />
                          <rect x="5" y="75" width="90" height="3" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Elegant Glow Effects */}
                    <div className="absolute -inset-8 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 opacity-20 blur-3xl animate-pulse rounded-full"></div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-30 blur-xl animate-pulse rounded-full"></div>
                    
                    {/* Brand Typography */}
                    <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-center">
                        <div className={`text-3xl sm:text-4xl md:text-5xl font-light bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent ${cormorant.className}`}>
                          RONGJAM
                        </div>
                        <div className={`text-base sm:text-lg text-slate-600 font-light mt-2 ${cormorant.className}`}>
                          Fine Cambodian Cuisine
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elegant Menu Grid - Wider Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
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
      {/* Ultra-Premium Expanded Menu Card with Glassmorphism */}
      <div className="group relative overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] perspective-1000 min-h-[600px] sm:min-h-[650px] lg:min-h-[700px]">
        {/* Floating Glow Effect */}
        <div className="absolute -inset-8 bg-gradient-to-r from-amber-300/20 via-amber-400/30 to-amber-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
        
        {/* Main Card Container */}
        <div className="relative bg-white/85 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-amber-500/25 transition-all duration-700 overflow-hidden h-full flex flex-col">
          {/* Luxury Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #f59e0b 2px, #f59e0b 4px)`,
            }}></div>
          </div>
          
          {/* Cinematic Image Container - Larger */}
          <div className="relative h-80 sm:h-96 lg:h-[420px] overflow-hidden flex-shrink-0">
            <img
              src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 filter brightness-105 contrast-110 saturate-110"
              loading="lazy"
            />
            
            {/* Cinematic Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
            
            {/* Premium Floating Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              {/* Chef's Signature */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-3 py-1.5 text-xs font-bold tracking-wider shadow-2xl border border-amber-300/30 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="h-3 w-3" />
                  <span className={cormorant.className}>CHEF'S SIGNATURE</span>
                </div>
              </div>
              
              {/* 5-Star Rating */}
              <div className="bg-white/95 backdrop-blur-sm text-slate-900 px-3 py-1.5 shadow-xl border border-white/40">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Ultra-Premium Price Display */}
            <div className="absolute top-4 right-4">
              <div className="relative group/price">
                <div className="bg-gradient-to-br from-white via-white to-amber-50 backdrop-blur-xl px-6 py-4 shadow-2xl border-2 border-amber-200/50 relative overflow-hidden">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>
                  
                  <div className="relative z-10">
                    <div className={`text-xs text-slate-600 font-medium tracking-wider mb-1 ${cormorant.className}`}>PRICE</div>
                    <div className={`text-2xl font-bold text-slate-900 ${cormorant.className}`}>${item.price.toFixed(2)}</div>
                  </div>
                  
                  {/* Luxury shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity duration-500 group-hover/price:animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Artisan Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-slate-900/90 backdrop-blur-sm text-amber-300 px-4 py-2 text-sm font-medium shadow-xl border border-amber-300/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className={cormorant.className}>Artisan Crafted</span>
                </div>
              </div>
            </div>

            {/* Availability Overlay */}
            {!item.availability && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-30">
                <div className="text-center space-y-4">
                  <div className="bg-red-600/90 backdrop-blur-sm text-white px-8 py-4 text-lg font-bold shadow-2xl border-2 border-red-400/50">
                    <Clock className="h-6 w-6 mx-auto mb-2" />
                    <div className={cormorant.className}>Temporarily Unavailable</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sophisticated Content Section - Expanded */}
          <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 bg-gradient-to-br from-white via-white to-amber-50/30 flex-grow flex flex-col">
            {/* Title with Elegant Typography */}
            <div className="flex-shrink-0">
              <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 group-hover:text-amber-800 transition-colors duration-500 leading-tight ${cormorant.className}`}>
                {item.name}
              </h3>
              <div className="h-px bg-gradient-to-r from-amber-400 via-amber-300 to-transparent w-2/3"></div>
            </div>
            
            {/* Refined Description */}
            <div className="flex-grow">
              <p className={`text-slate-700 text-lg sm:text-xl leading-relaxed font-light ${inter.className}`}>
                {item.description}
              </p>
            </div>

            {/* Always Visible Add to Cart Button */}
            <div className="pt-6 flex-shrink-0">
              <Button
                onClick={handleAddToCartClick}
                disabled={!item.availability}
                className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-white font-bold py-6 sm:py-8 px-6 sm:px-8 text-lg sm:text-xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 border-2 border-slate-700 hover:border-amber-600 relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 group-hover/btn:animate-shimmer"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-4">
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 group-hover/btn:rotate-90 transition-transform duration-300" />
                  <span className={`${cormorant.className} tracking-wide font-bold`}>Add to Selection</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Luxurious Add to Cart Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Add to Your Selection"
      >
        <div className="space-y-8 animate-fade-in">
          {/* Premium Item Display */}
          <div className="flex gap-6 p-6 bg-gradient-to-r from-slate-50 via-white to-amber-50 border border-slate-200 shadow-inner animate-slide-up">
            <div className="w-32 h-24 overflow-hidden bg-slate-200 flex-shrink-0 shadow-lg border border-slate-300 relative">
              <img
                src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className={`text-2xl font-medium text-slate-900 mb-2 truncate ${cormorant.className}`}>{item.name}</h3>
              <p className={`text-slate-600 text-base line-clamp-2 mb-3 ${inter.className}`}>{item.description}</p>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold text-slate-900 ${cormorant.className}`}>${item.price.toFixed(2)}</p>
                <span className={`text-sm text-slate-500 bg-slate-200 px-3 py-1.5 font-medium ${inter.className}`}>
                  Per serving
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Quantity Selector */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className={`text-2xl font-medium text-slate-900 block ${cormorant.className}`}>Select Quantity</label>
            <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-slate-50 to-amber-50 py-8 border border-slate-200 shadow-inner">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-14 w-14 border-2 border-slate-300 hover:border-amber-600 hover:bg-amber-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 shadow-lg"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="flex flex-col items-center">
                <span className={`text-5xl font-medium text-slate-900 bg-white py-4 px-10 border-2 border-slate-200 min-w-[8rem] text-center shadow-lg ${cormorant.className}`}>
                  {quantity}
                </span>
                <span className={`text-sm text-slate-500 mt-3 ${inter.className}`}>Quantity</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                className="h-14 w-14 border-2 border-slate-300 hover:border-amber-600 hover:bg-amber-50 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Luxurious Total Display */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-100 p-8 border-2 border-amber-200 shadow-xl animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-transparent opacity-50"></div>
            <div className="relative flex justify-between items-center">
              <span className={`text-2xl font-medium text-slate-700 ${cormorant.className}`}>Total Amount:</span>
              <span className={`text-4xl font-bold text-slate-900 ${cormorant.className}`}>${(item.price * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Premium Action Buttons */}
          <div className="flex gap-6 pt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isAddingToCart}
              className={`flex-1 h-16 border-2 border-slate-300 hover:border-slate-600 text-lg font-medium transition-all duration-300 disabled:opacity-50 hover:scale-105 shadow-lg ${cormorant.className}`}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddToCart}
              disabled={isAddingToCart}
              className={`flex-1 h-16 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white transition-all duration-500 text-lg font-medium shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden group/btn ${cormorant.className}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
              {isAddingToCart ? (
                <div className="flex items-center gap-4 animate-bounce-in">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Adding to Selection...</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add {quantity} to Selection</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
