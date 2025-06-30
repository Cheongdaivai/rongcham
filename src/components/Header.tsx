'use client';

import { CartDrawer } from './CartDrawer';
import { Star, Clock, Crown, Award } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-amber-200/50 shadow-2xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Minimal Logo */}
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-500 border-4 border-white/20">
                <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current filter drop-shadow-lg">
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
              {/* Elegant glowing effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 rounded-2xl opacity-30 blur-xl animate-pulse"></div>
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
