'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface StickyCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StickyCartDrawer({ isOpen, onClose }: StickyCartDrawerProps) {
  const { items, updateQuantity, removeItem, total, itemCount, createOrder } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [prevItemCount, setPrevItemCount] = useState(0);

  // Animation when items are added
  useEffect(() => {
    if (itemCount > prevItemCount && items.length > 0) {
      const latestItem = items[items.length - 1];
      setJustAdded(latestItem.menu_id);
      setTimeout(() => setJustAdded(null), 2000);
    }
    setPrevItemCount(itemCount);
  }, [itemCount, items, prevItemCount]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      const order = await createOrder();
      
      if (order) {
        alert('Order placed successfully!');
        onClose();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 px-6 py-6 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl animate-float shadow-lg">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <span className="flex-1 text-xl font-bold text-slate-800">Shopping Cart</span>
          <Badge className="bg-slate-800 text-white px-3 py-1 rounded-full font-semibold animate-pulse">
            {itemCount} items
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-slate-200 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto py-6 px-6 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-6 animate-float shadow-lg">
              <ShoppingCart className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Your cart is empty</h3>
            <p className="text-slate-500">Add some delicious items to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div 
                key={item.menu_id} 
                className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 ${
                  justAdded === item.menu_id ? 'animate-bounce-in border-green-300 bg-green-50' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Item image */}
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md flex-shrink-0">
                  <Image
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="80px"
                  />
                  {justAdded === item.menu_id && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-green-600 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium">${item.price.toFixed(2)} each</p>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center mt-3 gap-3">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-white rounded-lg hover:scale-110 transition-all duration-200 text-slate-700 hover:text-slate-900"
                        onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                      >
                        <Minus className="h-5 w-5 font-bold" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-slate-800 bg-white rounded-lg mx-1 py-1 shadow-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-white rounded-lg hover:scale-110 transition-all duration-200 text-slate-700 hover:text-slate-900"
                        onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                      >
                        <Plus className="h-5 w-5 font-bold" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg hover:scale-110 transition-all duration-200 shadow-sm"
                      onClick={() => removeItem(item.menu_id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Item total price */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-xl text-slate-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {items.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-200 pt-6 pb-6 px-6 bg-gradient-to-r from-slate-50 to-slate-100 animate-slide-up">
          <div className="flex justify-between items-center text-2xl font-bold mb-6">
            <span className="text-slate-700">Total:</span>
            <span className="text-slate-800 bg-white px-4 py-2 rounded-xl shadow-lg animate-glow border border-slate-200">
              ${total.toFixed(2)}
            </span>
          </div>
          
          <Button 
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            size="lg"
          >
            {isCheckingOut ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-3" />
                Proceed to Checkout
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 