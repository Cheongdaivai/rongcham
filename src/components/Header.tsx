'use client';

import Link from 'next/link';
import { CartDrawer } from './CartDrawer';
import { Button } from './ui/button';
import { ChefHat, Utensils } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-2 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Utensils className="h-6 w-6 text-gray-700 group-hover:text-black transition-colors duration-200" aria-hidden="true" />
          <span className="font-bold text-xl tracking-tight text-gray-900 font-serif">
            FoodieHub
          </span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-medium text-gray-700 hover:text-black">
              Menu
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="font-medium flex items-center text-gray-700 hover:text-black">
              <ChefHat className="h-4 w-4 mr-2 text-gray-500 group-hover:text-black transition-colors duration-200" aria-hidden="true" />
              Chef Dashboard
            </Button>
          </Link>
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
