'use client';

import { CartDrawer } from './CartDrawer';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-amber-200/50 shadow-2xl">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 lg:h-24">
          {/* Responsive Logo */}
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-500 border-2 sm:border-3 md:border-4 border-white/20">
                <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white fill-current filter drop-shadow-lg">
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
              {/* Responsive glowing effect */}
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 rounded-xl sm:rounded-2xl opacity-20 sm:opacity-30 blur-lg sm:blur-xl animate-pulse"></div>
            </div>
            
            {/* Responsive Brand Text - Hidden on mobile, visible on larger screens */}
            <div className="hidden md:flex flex-col ml-3 lg:ml-4">
              <div className="text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent">
                RONGJAM
              </div>
              <div className="text-xs lg:text-sm text-slate-600 font-medium -mt-1">
                Cambodian Cuisine
              </div>
            </div>
          </div>

          {/* Responsive Navigation & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Mobile brand text - visible only on small screens */}
            <div className="flex md:hidden flex-col text-right mr-2">
              <div className="text-sm font-bold bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent">
                RONGJAM
              </div>
              <div className="text-xs text-slate-600 font-medium -mt-0.5">
                Fine Dining
              </div>
            </div>
            
            {/* Cart Drawer */}
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
