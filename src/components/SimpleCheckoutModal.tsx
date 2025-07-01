'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Heart, Sparkles, Star, Gift, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number;
  autoClose?: boolean;
}

export function SimpleCheckoutModal({ isOpen, onClose, orderTotal, autoClose = true }: SimpleCheckoutModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [sketchPhase, setSketchPhase] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      // Start the combined unfolding + sketch animation sequence
      setIsAnimating(true);
      
      // Sketch animation phases
      setTimeout(() => setSketchPhase(1), 100);  // Start border sketch
      setTimeout(() => setSketchPhase(2), 300);  // Content area sketch
      setTimeout(() => setSketchPhase(3), 500);  // Icon sketch
      setTimeout(() => setShowContent(true), 700); // Content appears
      
      if (autoClose) {
        console.log('SimpleCheckoutModal opened with sketch+unfold animation, will auto-close in 5 seconds');
        const timer = setTimeout(() => {
          console.log('Auto-closing SimpleCheckoutModal');
          onClose();
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
      setShowContent(false);
      setSketchPhase(0);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${
      isAnimating ? 'bg-black/70 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
    }`}>
      
      {/* Sketch Pen Animation */}
      <div className={`absolute transition-all duration-1000 ${
        sketchPhase >= 1 ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`absolute pointer-events-none transition-all duration-2000 ease-out ${
          sketchPhase >= 1 ? 'translate-x-0 translate-y-0 opacity-60' : '-translate-x-96 -translate-y-96 opacity-0'
        }`}>
          <Pen className="h-6 w-6 text-slate-600 transform rotate-45 animate-pulse" />
        </div>
      </div>

      {/* Combined Unfolding + Sketch Modal Container */}
      <div className={`relative w-full max-w-lg my-auto mx-auto max-h-[95vh] flex flex-col transform transition-all duration-700 ease-out ${
        isAnimating 
          ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
          : 'scale-0 opacity-0 translate-y-32 rotate-12'
      }`}>
        
        {/* Sketch Border Animation - Draws the modal outline */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-4 transition-all duration-1000 ease-out ${
          sketchPhase >= 1 
            ? 'border-slate-300 opacity-100 scale-100' 
            : 'border-transparent opacity-0 scale-95'
        }`} 
        style={{
          background: sketchPhase >= 2 ? 'white' : 'transparent',
          boxShadow: sketchPhase >= 2 ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
          transition: 'all 1000ms ease-out'
        }}>
          
          {/* Sketch Lines Effect - Animated drawing lines */}
          <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-1500 ${
            sketchPhase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Top border sketch line */}
            <div className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-slate-400 to-slate-600 transition-all duration-800 ${
              sketchPhase >= 1 ? 'w-full' : 'w-0'
            }`}></div>
            {/* Right border sketch line */}
            <div className={`absolute top-0 right-0 w-1 bg-gradient-to-b from-slate-400 to-slate-600 transition-all duration-800 delay-200 ${
              sketchPhase >= 1 ? 'h-full' : 'h-0'
            }`}></div>
            {/* Bottom border sketch line */}
            <div className={`absolute bottom-0 right-0 h-1 bg-gradient-to-l from-slate-400 to-slate-600 transition-all duration-800 delay-400 ${
              sketchPhase >= 1 ? 'w-full' : 'w-0'
            }`}></div>
            {/* Left border sketch line */}
            <div className={`absolute bottom-0 left-0 w-1 bg-gradient-to-t from-slate-400 to-slate-600 transition-all duration-800 delay-600 ${
              sketchPhase >= 1 ? 'h-full' : 'h-0'
            }`}></div>
          </div>
        </div>
        
        {/* Magical Sketch Effect Background */}
        <div className={`absolute inset-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-50/30 via-blue-50/30 to-purple-50/30 transition-all duration-1500 ${
          sketchPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'
        }`}></div>
        
        {/* Content Container with Sketch Reveal */}
        <div className={`relative p-6 overflow-y-auto flex-1 transition-all duration-1000 ${
          sketchPhase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-center py-8 px-4">
            
            {/* Sketch + Unfolding Success Icon */}
            <div className="relative mb-8">
              
              {/* Sketch Circle Drawing Animation */}
              <div className={`absolute inset-0 mx-auto w-24 h-24 rounded-full border-4 border-green-400 transition-all duration-1200 ease-out ${
                sketchPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`} 
              style={{
                strokeDasharray: sketchPhase >= 3 ? '0' : '150',
                strokeDashoffset: sketchPhase >= 3 ? '0' : '150',
                animation: sketchPhase >= 3 ? 'drawCircle 1.5s ease-out forwards' : 'none'
              }}></div>
              
              {/* Main Success Circle with Sketch Effect */}
              <div className={`mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-1000 ease-out relative ${
                showContent ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
              }`}>
                
                {/* Sketchy outline */}
                <div className={`absolute inset-0 rounded-full border-2 border-green-300 transition-all duration-800 ${
                  showContent ? 'opacity-40 scale-110' : 'opacity-0 scale-100'
                }`}></div>
                
                <CheckCircle className={`h-12 w-12 text-white transition-all duration-1200 ${
                  showContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`} />
              </div>
              
              {/* Sketch Paper Texture Overlay */}
              <div className={`absolute inset-0 mx-auto w-28 h-28 -top-2 -left-2 bg-white/10 rounded-full transition-all duration-1500 ${
                showContent ? 'opacity-30 scale-100' : 'opacity-0 scale-0'
              }`} 
              style={{
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 70% 70%, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                backgroundSize: '10px 10px'
              }}></div>
              
              {/* Expanding Sketch Rings */}
              <div className={`absolute inset-0 mx-auto w-24 h-24 bg-green-200 rounded-full transition-all duration-1200 ${
                showContent ? 'animate-ping opacity-25 scale-100' : 'opacity-0 scale-0'
              }`}></div>
              <div className={`absolute inset-0 mx-auto w-32 h-32 -top-4 -left-4 border-2 border-green-100 rounded-full transition-all duration-1400 delay-200 ${
                showContent ? 'animate-pulse opacity-30 scale-100' : 'opacity-0 scale-0'
              }`}></div>
              
              {/* Sketch-style Floating Elements */}
              <div className={`absolute -top-2 -right-2 transition-all duration-900 delay-500 ${
                showContent ? 'animate-float opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-4'
              }`}>
                <div className="relative">
                  <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                  <div className="absolute inset-0 h-8 w-8 border border-red-300 rounded-sm transform rotate-12 opacity-30"></div>
                </div>
              </div>
              
              <div className={`absolute -bottom-2 -left-2 transition-all duration-900 delay-700 ${
                showContent ? 'animate-float opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-4'
              }`} style={{ animationDelay: '0.5s' }}>
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <div className="absolute inset-0 h-6 w-6 border border-yellow-300 rounded-sm transform -rotate-12 opacity-30"></div>
                </div>
              </div>
              
              <div className={`absolute -top-1 -left-3 transition-all duration-900 delay-600 ${
                showContent ? 'animate-float opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-4'
              }`} style={{ animationDelay: '1s' }}>
                <div className="relative">
                  <Star className="h-5 w-5 text-blue-500 fill-blue-500" />
                  <div className="absolute inset-0 h-5 w-5 border border-blue-300 rounded-full opacity-30"></div>
                </div>
              </div>
              
              <div className={`absolute -bottom-1 -right-3 transition-all duration-900 delay-800 ${
                showContent ? 'animate-float opacity-100 scale-100' : 'opacity-0 scale-0 translate-y-4'
              }`} style={{ animationDelay: '1.5s' }}>
                <div className="relative">
                  <Gift className="h-5 w-5 text-purple-500" />
                  <div className="absolute inset-0 h-5 w-5 border border-purple-300 rounded-sm transform rotate-45 opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Sketch-style Cascading Text */}
            <div className="space-y-4">
              <h2 className={`text-3xl md:text-4xl font-bold text-slate-800 font-serif transform transition-all duration-1000 delay-300 relative ${
                showContent ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
              }`}>
                Thank You!
                {/* Hand-drawn underline effect */}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-green-400 transition-all duration-1200 delay-800 ${
                  showContent ? 'w-24 opacity-60' : 'w-0 opacity-0'
                }`} style={{
                  background: 'linear-gradient(90deg, transparent 0%, #4ade80 20%, #4ade80 80%, transparent 100%)',
                  transform: 'translateX(-50%) rotate(-1deg)'
                }}></div>
              </h2>
              
              <div className={`text-lg text-slate-600 transform transition-all duration-1000 delay-500 relative ${
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}>
                Your order has been placed successfully
                {/* Sketch highlight */}
                <div className={`absolute inset-0 bg-yellow-200/30 -skew-x-12 transition-all duration-800 delay-1000 ${
                  showContent ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}></div>
              </div>
              
              {/* Sketch-style Order Total Card */}
              <div className={`bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 transform transition-all duration-1000 delay-700 relative ${
                showContent ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
              }`}>
                {/* Sketch border overlay */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-slate-300 transform rotate-1 transition-all duration-1000 delay-900 ${
                  showContent ? 'opacity-20 scale-100' : 'opacity-0 scale-95'
                }`}></div>
                
                <p className="text-sm text-slate-500 mb-2 relative z-10">Order Total</p>
                <p className={`text-2xl font-bold text-slate-800 transform transition-all duration-800 delay-900 relative z-10 ${
                  showContent ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                }`}>${orderTotal.toFixed(2)}</p>
              </div>
              
              <p className={`text-sm text-slate-500 transform transition-all duration-1000 delay-900 ${
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                We&apos;ll prepare your delicious meal with love and care. 
                <br />
                Estimated preparation time: 15-20 minutes
              </p>
            </div>

            {/* Sketch-style Action Button */}
            <div className={`flex flex-col sm:flex-row gap-3 mt-8 transform transition-all duration-1000 delay-1000 ${
              showContent ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
            }`}>
              <Button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <span className="relative z-10">Continue Shopping</span>
                {/* Sketch button overlay */}
                <div className={`absolute inset-0 border-2 border-white/20 rounded-xl transform -rotate-1 transition-all duration-500 ${
                  showContent ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </Button>
            </div>

            {/* Sketch-style Decorative Particles */}
            <div className={`absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full transition-all duration-1200 delay-1100 ${
              showContent ? 'animate-ping opacity-60 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="absolute inset-0 w-3 h-3 border border-yellow-300 rounded-full -top-0.5 -left-0.5 opacity-30"></div>
            </div>
            <div className={`absolute top-8 right-6 w-1.5 h-1.5 bg-blue-400 rounded-full transition-all duration-1200 delay-1300 ${
              showContent ? 'animate-ping opacity-60 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="absolute inset-0 w-2.5 h-2.5 border border-blue-300 rounded-sm transform rotate-45 -top-0.5 -left-0.5 opacity-30"></div>
            </div>
            <div className={`absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full transition-all duration-1200 delay-1500 ${
              showContent ? 'animate-ping opacity-60 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="absolute inset-0 w-2 h-2 border border-green-300 rounded-full -top-0.5 -left-0.5 opacity-30"></div>
            </div>
            <div className={`absolute top-1/2 left-2 w-1.5 h-1.5 bg-purple-400 rounded-full transition-all duration-1200 delay-1400 ${
              showContent ? 'animate-ping opacity-60 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="absolute inset-0 w-2.5 h-2.5 border border-purple-300 rounded-sm transform -rotate-12 -top-0.5 -left-0.5 opacity-30"></div>
            </div>
            <div className={`absolute top-1/3 right-4 w-1 h-1 bg-pink-400 rounded-full transition-all duration-1200 delay-1200 ${
              showContent ? 'animate-ping opacity-60 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="absolute inset-0 w-2 h-2 border border-pink-300 rounded-full -top-0.5 -left-0.5 opacity-30"></div>
            </div>
          </div>
        </div>
        
        {/* Magical Sketch Shimmer Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/20 to-transparent skew-x-12 transition-all duration-2500 ${
          showContent ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'
        }`}></div>
      </div>
    </div>
  );
} 