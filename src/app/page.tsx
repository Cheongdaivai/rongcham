"use client"

import { useState, useEffect, useCallback } from "react"
import { CartProvider, useCart } from "@/contexts/CartContext"
import { Header } from "@/components/Header"
import { StickyCart } from "@/components/StickyCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Plus, Star, Clock, Award, Minus, ShoppingCart, Sparkles } from "lucide-react"
import { sampleMenuItems } from "@/data/foodItems"
import type { MenuItem } from "@/types"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Image with Minimal Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop&crop=center')"
          }}
        />
        {/* Very light overlay to ensure text readability while preserving image colors */}
        <div className="absolute inset-0 bg-white/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-white/10 to-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-slide-up">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight drop-shadow-2xl">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
                    Delicious
                  </span>
                  <br />
                  <span className="text-white drop-shadow-lg">Khmer Cuisine</span>
                </h1>
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-xl sm:text-2xl lg:text-3xl text-white max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed drop-shadow-lg">
                  Authentic Cambodian flavors crafted with passion, served with love. Experience the best of Cambodia right at your table.
                </p>
              </div>
              
              {/* Features */}
              <div className="animate-slide-up flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-10 sm:mb-12" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg drop-shadow-md">4.9 Rating</span>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg drop-shadow-md">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg drop-shadow-md">Premium Quality</span>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <span className="w-3 h-3 bg-green-500 rounded-full block animate-pulse" />
                    <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span className="text-slate-700 font-medium">Fresh ingredients • Made to order</span>
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Single Marquee Section */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white py-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="relative flex animate-marquee whitespace-nowrap">
            <span className={`mx-12 text-xl font-bold flex items-center gap-3 ${inter.className}`}>
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Authentic Khmer Cuisine • Fresh Daily Specials • Premium Quality Ingredients • Fast Delivery Service
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </span>
            <span className={`mx-12 text-xl font-bold flex items-center gap-3 ${inter.className}`}>
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Authentic Khmer Cuisine • Fresh Daily Specials • Premium Quality Ingredients • Fast Delivery Service
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </span>
          </div>
        </div>

        {/* Menu Section with Light Background */}
        <section className="relative py-20 sm:py-24 lg:py-32 bg-white/90 backdrop-blur-sm">
          <div className="container">
            <div className="text-center mb-16 sm:mb-20">
              <div className="animate-slide-up">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 font-display">
                  Our Menu
                </h2>
                <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-body">
                  Discover our carefully curated selection of authentic Khmer dishes
                </p>
              </div>
            </div>

            {/* Responsive 3D Rotating Cube with RONGJAM Logo */}
            <div className="flex justify-center mb-16 sm:mb-20">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative cube-3d-container">
                  {/* 3D Cube with 6 faces */}
                  <div className="cube-3d w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 border-4 border-white shadow-2xl cursor-pointer">
                    
                    {/* Front Face */}
                    <div className="cube-face cube-face-front bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 border-4 border-white flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white fill-current">
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

                    {/* Back Face */}
                    <div className="cube-face cube-face-back bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 border-4 border-white flex items-center justify-center">
                      <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg text-center">
                        <div>RONGJAM</div>
                        <div className="text-xs opacity-80">Restaurant</div>
                      </div>
                    </div>

                    {/* Right Face */}
                    <div className="cube-face cube-face-right bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-4 border-white flex items-center justify-center">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>

                    {/* Left Face */}
                    <div className="cube-face cube-face-left bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-4 border-white flex items-center justify-center">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>

                    {/* Top Face */}
                    <div className="cube-face cube-face-top bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-4 border-white flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-white rounded-full"></div>
                    </div>

                    {/* Bottom Face */}
                    <div className="cube-face cube-face-bottom bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 border-4 border-white flex items-center justify-center">
                      <div className="text-white font-bold text-xs sm:text-sm md:text-base">⚡</div>
                    </div>

                    {/* Decorative corners on front face */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 transform rotate-45 z-10"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 transform rotate-45 z-10"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 transform rotate-45 z-10"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 transform rotate-45 z-10"></div>
                  </div>
                  
                  {/* Enhanced Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-20 blur-2xl animate-pulse"></div>
                  
                  {/* Brand text below cube */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent font-display">
                        RONGJAM
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 font-medium font-body">
                        Authentic Khmer Cuisine
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm hover:-translate-y-2 hover:scale-105">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
          <img
            src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop"}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {!item.availability && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                Out of Stock
              </Badge>
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg text-slate-900 font-bold text-lg border border-white/20">
              ${item.price.toFixed(2)}
            </div>
          </div>
        </div>
        
        <CardHeader className="p-5">
          <CardTitle className="text-lg lg:text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors leading-tight">
            {item.name}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm lg:text-base leading-relaxed line-clamp-2">
            {item.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-5 pt-0">
          <Button
            onClick={handleAddToCartClick}
            disabled={!item.availability}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Add to Cart Modal with Rectangle Item Display */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Add to Cart"
      >
        <div className="space-y-6 animate-fade-in">
          {/* Rectangle Item Display - Like the image you showed */}
          <div className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 animate-slide-up">
            <div className="w-24 h-16 overflow-hidden bg-slate-200 flex-shrink-0 shadow-sm">
              <img
                src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1 truncate font-display">{item.name}</h3>
              <p className="text-slate-600 text-sm line-clamp-1 mb-2 font-body">{item.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-slate-900 font-body">${item.price.toFixed(2)}</p>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 font-medium font-body">
                  Per item
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selector with Enhanced Animation */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="text-lg font-semibold text-slate-900 block font-display">Select Quantity</label>
            <div className="flex items-center justify-center gap-4 bg-slate-50 py-6 border border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-12 w-12 border-2 border-slate-300 hover:border-slate-900 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-slate-900 bg-white py-3 px-8 border border-slate-200 min-w-[6rem] text-center font-body">
                  {quantity}
                </span>
                <span className="text-xs text-slate-500 mt-2 font-body">Quantity</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                className="h-12 w-12 border-2 border-slate-300 hover:border-slate-900 hover:bg-white transition-all duration-200 hover:scale-110"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Total Price Display */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-6 border border-slate-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-slate-700 font-display">Total:</span>
              <span className="text-3xl font-bold text-slate-900 font-body">${(item.price * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons with Enhanced Animation */}
          <div className="flex gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isAddingToCart}
              className="flex-1 h-14 border-2 border-slate-300 hover:border-slate-900 text-lg font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 font-body"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddToCart}
              disabled={isAddingToCart}
              className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 font-body"
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-3 animate-bounce-in">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="font-body">Adding...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-body">Add {quantity} to Cart</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
