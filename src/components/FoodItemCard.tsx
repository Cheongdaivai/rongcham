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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {item.category}
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          {item.description}
        </CardDescription>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart}
          disabled={!item.available}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(menuItem);
  };

  return (    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={menuItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
          alt={menuItem.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!menuItem.availability && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{menuItem.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              Thai Food
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">
            ${menuItem.price.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          {menuItem.description}
        </CardDescription>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart}
          disabled={!menuItem.availability}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
