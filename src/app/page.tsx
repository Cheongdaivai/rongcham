'use client';

import { useState, useEffect } from 'react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { sampleMenuItems } from '@/data/foodItems';
import { MenuItem } from '@/types';

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}

function HomeContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch menu items from the API instead of using sample data
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const items = await response.json();
          setMenuItems(items);
        } else {
          console.error('Failed to fetch menu items');
          // Fallback to sample data if API fails
          setMenuItems(sampleMenuItems);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to sample data if API fails
        setMenuItems(sampleMenuItems);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading menu...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <p className="text-lg text-muted-foreground">
            Delicious Thai cuisine made fresh daily
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <MenuItemCard key={item.menu_id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-sm">NO IMAGE</span>
        {!item.availability && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
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
      
      <div className="p-6 pt-0">
        <AddToCartButton item={item} />
      </div>
    </Card>
  );
}

function AddToCartButton({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    if (!item.availability) return;
    
    setIsAdding(true);
    try {
      addItem(item);
      // Brief delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={!item.availability || isAdding}
      className="w-full"
      size="sm"
    >
      <Plus className="w-4 h-4 mr-2" />
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
