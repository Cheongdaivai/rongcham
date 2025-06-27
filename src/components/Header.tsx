'use client';

import Link from 'next/link';
import { CartDrawer } from './CartDrawer';
import { Button } from './ui/button';
import { ChefHat, Utensils } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="font-bold text-xl">FoodieHub</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </Link>
          
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ChefHat className="h-4 w-4 mr-2" />
              Chef Dashboard
            </Button>
          </Link>
          
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}
