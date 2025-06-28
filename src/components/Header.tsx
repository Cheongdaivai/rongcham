'use client';

import { CartDrawer } from './CartDrawer';
import { Star, Clock } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo with Angkor Wat */}
          <div className="flex items-center gap-4">
            {/* Angkor Wat Icon */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-300">
                {/* Angkor Wat Silhouette */}
                <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current">
                  {/* Main temple structure */}
                  <rect x="10" y="70" width="80" height="8" />
                  {/* Central tower */}
                  <rect x="45" y="30" width="10" height="40" />
                  <polygon points="45,30 50,20 55,30" />
                  {/* Side towers */}
                  <rect x="25" y="45" width="8" height="25" />
                  <polygon points="25,45 29,38 33,45" />
                  <rect x="67" y="45" width="8" height="25" />
                  <polygon points="67,45 71,38 75,45" />
                  {/* Outer towers */}
                  <rect x="15" y="55" width="6" height="15" />
                  <polygon points="15,55 18,50 21,55" />
                  <rect x="79" y="55" width="6" height="15" />
                  <polygon points="79,55 82,50 85,55" />
                  {/* Base platform */}
                  <rect x="5" y="75" width="90" height="3" />
                </svg>
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl opacity-20 animate-pulse"></div>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer leading-tight">
                RONGJAM
              </h1>
              <p className="text-sm sm:text-base text-amber-700 font-medium -mt-1 opacity-80">
                Authentic Khmer Cuisine
              </p>
            </div>
          </div>

          {/* Desktop Features */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">4.9 Rating</span>
                <span className="text-xs text-slate-500">Excellent Reviews</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group">
              <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Fast Delivery</span>
                <span className="text-xs text-slate-500">30-45 Minutes</span>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="flex items-center">
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
