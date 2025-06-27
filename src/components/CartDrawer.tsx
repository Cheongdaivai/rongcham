'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export function CartDrawer() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart, createOrder } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      // Use the createOrder function from CartContext instead of manual API call
      const order = await createOrder();
      
      if (order) {
        alert('Order placed successfully!');
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-primary/30">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-none p-0 flex items-center justify-center text-xs border border-white shadow"
            >
              {itemCount}
            </Badge>
          )}
          <span className="ml-2 hidden sm:inline font-semibold">
            Cart <span className="text-primary">${total.toFixed(2)}</span>
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg rounded-none bg-white border-l border-gray-200 shadow-xl p-0">
        <SheetHeader className="border-b border-gray-200 px-6 py-4">
          <SheetTitle className="text-xl font-bold tracking-tight text-gray-900">Shopping Cart <span className="text-gray-400 font-normal">({itemCount} items)</span></SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto py-4 px-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">                {items.map((item) => (
                  <div key={item.menu_id} className="flex items-center gap-4 border-b border-gray-100 pb-5 last:border-b-0">
                    <div className="relative h-16 w-16 rounded-none overflow-hidden bg-gray-100 border border-gray-200">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-none"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      <div className="flex items-center mt-2 gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-gray-300"
                          onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-gray-300"
                          onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.menu_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-6 pb-8 px-6 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-gray-700">Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full h-12 text-lg font-bold bg-primary text-white hover:bg-primary/90 transition-colors duration-200 shadow-none border-none"
                size="lg"
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
