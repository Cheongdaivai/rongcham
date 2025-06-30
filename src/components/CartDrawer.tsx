'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SimpleCheckoutModal } from '@/components/SimpleCheckoutModal';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export function CartDrawer() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [prevItemCount, setPrevItemCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

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
    
    setIsProcessing(true);
    setOrderTotal(total); // Capture current total
    
    try {
      console.log('Starting checkout process...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Showing success modal...');
      setShowModal(true);
      
      // Clear cart after a delay
      setTimeout(() => {
        console.log('Clearing cart...');
        clearCart();
      }, 500);
      
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    console.log('Closing modal');
    setShowModal(false);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`relative bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 lg:px-6 lg:py-2 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base ${itemCount > 0 ? 'animate-glow' : ''}`}
          >
            <ShoppingCart className={`h-4 w-4 sm:h-5 sm:w-5 ${itemCount > 0 ? 'animate-bounce' : ''}`} />
            {itemCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-white shadow-lg animate-bounce-in"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
            <span className="ml-1.5 sm:ml-2 md:ml-3 hidden sm:inline">
              Cart <span className="text-slate-800 font-bold">${total.toFixed(2)}</span>
            </span>
            {itemCount > 0 && (
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500 ml-1 animate-pulse hidden md:block" />
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="left"
          className="w-full sm:max-w-lg bg-white/95 backdrop-blur-md border-r border-slate-200 shadow-2xl p-0 sm:rounded-r-3xl flex flex-col h-full"
        >
          <SheetHeader className="flex-shrink-0 border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-slate-100">
            <SheetTitle className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg sm:rounded-xl animate-float shadow-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="flex-1 text-lg sm:text-xl font-bold text-slate-800">Shopping Cart</span>
              <Badge className="bg-slate-800 text-white px-2 sm:px-3 py-1 rounded-full font-semibold animate-pulse text-xs sm:text-sm">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Badge>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto py-4 sm:py-6 px-4 sm:px-6 min-h-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-16">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 animate-float shadow-lg">
                  <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">Your cart is empty</h3>
                <p className="text-sm sm:text-base text-slate-500">Add some delicious items to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {items.map((item, index) => (
                  <div 
                    key={item.menu_id} 
                    className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 ${
                      justAdded === item.menu_id ? 'animate-bounce-in border-green-300 bg-green-50' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Responsive Item image */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md flex-shrink-0">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                      {justAdded === item.menu_id && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Responsive Item details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">${item.price.toFixed(2)} each</p>
                      
                      {/* Responsive Quantity controls */}
                      <div className="flex items-center mt-2 sm:mt-3 gap-2 sm:gap-3">
                        <div className="flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-200 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 hover:bg-white rounded-md sm:rounded-lg hover:scale-110 transition-all duration-200 text-slate-700 hover:text-slate-900"
                            onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 font-bold" />
                          </Button>
                          <span className="w-8 sm:w-10 md:w-12 text-center font-bold text-sm sm:text-base md:text-lg text-slate-800 bg-white rounded-md sm:rounded-lg mx-0.5 sm:mx-1 py-1 shadow-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 hover:bg-white rounded-md sm:rounded-lg hover:scale-110 transition-all duration-200 text-slate-700 hover:text-slate-900"
                            onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 font-bold" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md sm:rounded-lg hover:scale-110 transition-all duration-200 shadow-sm"
                          onClick={() => removeItem(item.menu_id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Responsive Item total price */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-lg sm:text-xl text-slate-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="flex-shrink-0 border-t border-slate-200 pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 bg-gradient-to-r from-slate-50 to-slate-100 animate-slide-up">
              <div className="flex justify-between items-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                <span className="text-slate-700">Total:</span>
                <span className="text-slate-800 bg-white px-3 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl shadow-lg animate-glow border border-slate-200">
                  ${total.toFixed(2)}
                </span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-12 sm:h-14 md:h-16 text-base sm:text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Success Modal */}
      <SimpleCheckoutModal
        isOpen={showModal}
        onClose={closeModal}
        orderTotal={orderTotal}
      />
    </>
  );
}
