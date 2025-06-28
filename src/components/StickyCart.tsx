'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { StickyCartDrawer } from './StickyCartDrawer';

export function StickyCart() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      {/* Sticky Cart Icon */}
      <div 
        className="fixed bottom-6 right-6 z-50 cursor-pointer group"
        onClick={handleCartClick}
      >
        <div className="relative">
          <div className={`
            p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full shadow-2xl 
            hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95
            border-4 border-white backdrop-blur-sm
            ${itemCount > 0 ? 'animate-glow' : ''}
          `}>
            <ShoppingCart className={`h-7 w-7 text-white ${itemCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
          
          {/* Cart Badge */}
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 flex items-center justify-center text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white border-3 border-white shadow-lg animate-bounce-in min-w-[2rem]">
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl rounded-l-3xl">
            <StickyCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
} 