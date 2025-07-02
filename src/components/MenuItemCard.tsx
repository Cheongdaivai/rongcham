'use client'

import { useState, useCallback } from "react"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Plus, Clock, Minus, ShoppingCart, Star, ChefHat } from "lucide-react"
import type { MenuItem } from "@/types"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { detectImageFormat, handleImageError } from "@/lib/image-format-utils"

const inter = Inter({ subsets: ["latin"] })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

interface MenuItemCardProps {
  item: MenuItem
}

// Helper function to get container classes based on image format
function getContainerClasses(url: string): string {
  if (!url) return 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
  
  const format = detectImageFormat(url)
  
  if (format.supportsTransparency) {
    // For PNG, WebP, SVG - transparent container
    return 'bg-transparent'
  }
  
  // For JPEG and other formats - subtle background
  return 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
}

// Enhanced image classes for full circular fill
function getOptimizedImageClasses(url: string): string {
  const format = detectImageFormat(url)
  
  const baseClasses = 'w-full h-full object-cover transition-all duration-300'
  
  if (format.supportsTransparency) {
    // For PNG, WebP, SVG, GIF - images with potential transparency
    return `${baseClasses} transparent-image`
  }
  
  // For JPEG and other formats without transparency
  return `${baseClasses} solid-image`
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [itemAdded, setItemAdded] = useState(false)
  const { addItem, items } = useCart()

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
    if (isAddingToCart) return
    
    try {
      setIsAddingToCart(true)
      
      for (let i = 0; i < quantity; i++) {
        addItem(item)
      }
      
      // Show visual feedback
      setItemAdded(true)
      setTimeout(() => setItemAdded(false), 2000)
      
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

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageErrorCustom = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true)
    handleImageError(e)
  }

  // Check if this item is in cart
  const itemInCart = items.find(cartItem => cartItem.menu_id === item.menu_id)
  const cartQuantity = itemInCart?.quantity || 0

  return (
    <>
      {/* Larger Card Design with Circular Image - No Border Radius */}
      <div className={`group relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-visible border border-slate-200 ${itemAdded ? 'item-added' : ''}`}>
        
        {/* Responsive Circular Image Container - Mobile Optimized */}
        <div className="flex justify-center mb-4 relative -mt-12 sm:-mt-16 z-20">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
            {item.image_url ? (
              <>
                {/* Loading placeholder */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-100">
                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Circular Image */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className={`w-full h-full object-cover ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-300 hover:scale-110`}
                  loading="lazy"
                  onLoad={handleImageLoad}
                  onError={handleImageErrorCustom}
                />
              </>
            ) : (
              // Fallback for no image
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-400 text-2xl">🍽️</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">No Image</p>
                </div>
              </div>
            )}
            
            {/* Cart Quantity Badge */}
            {cartQuantity > 0 && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce-in">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-bold text-sm">{cartQuantity}</span>
                </div>
              </div>
            )}

            {/* Availability Overlay on Image */}
            {!item.availability && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-full">
                <div className="text-center bg-red-600 text-white px-3 py-1 rounded-lg">
                  <Clock className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Unavailable</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Animated Line Separator - Responsive Mobile */}
        <div className="absolute left-0 right-0 top-16 xs:top-18 sm:top-20 md:top-24 lg:top-28 xl:top-32 px-2 sm:px-4 z-5">
          <div className="relative card-line-separator">
            <div className="h-0.5 sm:h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full"></div>
            <div className="absolute inset-0 h-0.5 sm:h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full animate-line-shimmer"></div>
          </div>
        </div>

        {/* Content Section - Mobile Safe Spacing */}
        <div className="px-3 sm:px-4 pb-4 pt-3 sm:pt-2 space-y-2 sm:space-y-2">{/* Extra top padding on mobile */}
          {/* Title */}
          <h3 className={`text-base sm:text-lg font-bold text-slate-900 text-center line-clamp-2 leading-tight ${cormorant.className}`}>
            {item.name}
          </h3>
          
          {/* Description */}
          <p className={`text-xs text-slate-600 text-center line-clamp-2 min-h-[2rem] leading-relaxed ${inter.className}`}>
            {item.description}
          </p>

          {/* Price - Smaller */}
          <div className="flex justify-center py-1">
            <div className="bg-amber-600 text-white px-3 py-1.5 font-bold text-base">
              ${item.price.toFixed(2)}
            </div>
          </div>

          {/* Rating and Signature */}
          <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < (item.rating || 5)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs">{item.rating || 5}.0</span>
            </div>

            {/* Chef Signature */}
            <div className="flex items-center gap-1">
              <ChefHat className="w-3 h-3 text-amber-600" />
              <span className="italic text-xs">Chef&apos;s Special</span>
            </div>
          </div>

          {/* Add to Cart Button - No Border Radius */}
          <Button
            onClick={handleAddToCartClick}
            disabled={!item.availability}
            className="w-full bg-slate-900 hover:bg-amber-700 text-white font-semibold py-2 text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
          >
            <div className="flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Add to Cart</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="Add to Your Selection"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Item Display */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-r from-slate-50 via-white to-amber-50 border border-slate-200 shadow-inner">
            <div className={`w-full sm:w-32 h-32 sm:h-24 overflow-hidden flex-shrink-0 shadow-lg border border-slate-300 relative ${getContainerClasses(item.image_url || '')}`}>
              <div className="w-full h-full">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"}
                  alt={item.name}
                  className={`${getOptimizedImageClasses(item.image_url || '')} brightness-110 contrast-115 saturate-120`}
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
              </div>
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

          {/* Quantity Selector */}
          <div className="space-y-3 sm:space-y-4">
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

          {/* Total Section */}
          <div className="bg-gradient-to-r from-slate-50 to-amber-50 p-4 sm:p-6 border border-slate-200 shadow-inner">
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
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
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