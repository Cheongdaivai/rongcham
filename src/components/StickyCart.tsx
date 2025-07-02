'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
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
      <div className="sticky-cart-enhanced cart-button" onClick={handleCartClick}>
        <div className="relative">
          <div className={`sticky-cart-button cart-transition ${itemCount > 0 ? 'has-items' : ''}`}>
            <ShoppingCart className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white ${itemCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
          
          {/* Responsive Cart Badge */}
          {itemCount > 0 && (
            <div className="cart-badge animate-bounce-in">
              {itemCount > 99 ? '99+' : itemCount}
            </div>
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