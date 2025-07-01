'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { StickyCartDrawer } from './StickyCartDrawer';

export function StickyCart() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Add animation when items are added to cart
  useEffect(() => {
    if (itemCount > 0) {
      const cartButton = document.querySelector('.cart-button');
      if (cartButton) {
        cartButton.classList.add('item-add-animation');
        setTimeout(() => {
          cartButton.classList.remove('item-add-animation');
        }, 600);
      }
    }
  }, [itemCount]);

  return (
    <>
      {/* Enhanced Sticky Cart Icon */}
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 cursor-pointer group cart-button"
        onClick={handleCartClick}
      >
        <div className="relative">
          <div className={`
            p-3 sm:p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full shadow-xl sm:shadow-2xl 
            hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95
            border-2 sm:border-4 border-white backdrop-blur-sm cart-transition
            ${itemCount > 0 ? 'animate-glow' : ''}
          `}>
            <ShoppingCart className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white ${itemCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
          
          {/* Responsive Cart Badge */}
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full p-0 flex items-center justify-center text-xs sm:text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white border-2 sm:border-3 border-white shadow-lg animate-bounce-in min-w-[1.5rem] sm:min-w-[1.75rem] md:min-w-[2rem]">
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </div>
        
        {/* Responsive Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 sm:mb-3 px-2 sm:px-3 py-1 sm:py-2 bg-slate-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}
          <div className="absolute top-full right-3 sm:right-4 w-0 h-0 border-l-3 sm:border-l-4 border-r-3 sm:border-r-4 border-t-3 sm:border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>

      {/* Enhanced Cart Drawer with Responsive Animation */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop with fade animation */}
          <div 
            className={`absolute inset-0 cart-backdrop transition-opacity duration-300 ease-out ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleCloseCart}
          />
          {/* Responsive Cart Drawer */}
          <div 
            className={`
              absolute bg-white shadow-2xl transform transition-transform duration-500 ease-out
              
              /* Mobile - Slide up from bottom */
              bottom-0 left-0 right-0 w-full h-[85vh] max-h-[600px] rounded-t-3xl
              ${isClosing ? 'translate-y-full' : 'translate-y-0'}
              
              /* Desktop - Slide in from right */
              sm:top-0 sm:right-0 sm:bottom-auto sm:left-auto sm:h-full sm:w-full sm:max-w-sm sm:max-h-none
              md:max-w-md lg:max-w-lg
              ${isClosing ? 'sm:translate-x-full sm:translate-y-0' : 'sm:translate-x-0 sm:translate-y-0'}
              sm:rounded-l-3xl sm:rounded-t-none
            `}
          >
            <StickyCartDrawer isOpen={isCartOpen} onClose={handleCloseCart} />
          </div>
        </div>
      )}
    </>
  );
} 