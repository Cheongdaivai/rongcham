'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FoodItem, MenuItem } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Plus } from 'lucide-react';

interface FoodItemCardProps {
  item: FoodItem;
}

interface MenuItemCardProps {
  menuItem: MenuItem;
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Convert FoodItem to MenuItem format for cart
    const menuItem: MenuItem = {
      menu_id: item.id,
      name: item.name,
      price: item.price,
      availability: item.available,
      description: item.description,
      image_url: item.image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addItem(menuItem);
  };

  return (
    <Card className="card card-hover overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-video">
        <Image
          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
          alt={item.name}
          fill
          className="img-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {!item.available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <Badge className="badge badge-primary px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">
              Out of Stock
            </Badge>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm text-slate-800 font-bold text-sm sm:text-base px-3 py-1 rounded-full shadow-lg border border-white/20 animate-pulse">
            ${item.price.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-slate-900 transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {item.description}
        </p>
        <Button
          onClick={handleAddToCart}
          disabled={!item.available}
          className={`btn w-full ${
            item.available 
              ? "btn-primary" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(menuItem);
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={menuItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
          alt={menuItem.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {!menuItem.availability && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <Badge className="px-4 py-2 text-base font-semibold rounded-full bg-red-500 text-white border-0">
              Out of Stock
            </Badge>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm text-slate-800 font-bold text-lg px-4 py-2 rounded-full shadow-lg border border-white/20">
            ${menuItem.price.toFixed(2)}
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {menuItem.name}
            </CardTitle>
            <Badge variant="outline" className="mt-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">
              Khmer Food
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {menuItem.description}
        </CardDescription>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart}
          disabled={!menuItem.availability}
          className={`w-full h-12 font-semibold text-base transition-all duration-300 rounded-xl
            ${menuItem.availability 
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105" 
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
