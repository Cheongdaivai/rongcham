"use client"

import { useState, useEffect } from "react"
import { CartProvider, useCart } from "@/contexts/CartContext"
import { Header } from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { sampleMenuItems } from "@/data/foodItems"
import type { MenuItem } from "@/types"

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  )
}

function HomeContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch menu items from the API instead of using sample data
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu")
        if (response.ok) {
          const items = await response.json()
          setMenuItems(items)
        } else {
          console.error("Failed to fetch menu items")
          // Fallback to sample data if API fails
          setMenuItems(sampleMenuItems)
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
        // Fallback to sample data if API fails
        setMenuItems(sampleMenuItems)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-4 max-w-xl mx-auto" />
            <div className="h-6 bg-gray-100 rounded-lg animate-pulse max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white/90">
                <div className="h-56 bg-gray-100 animate-pulse" />
                <CardHeader className="pb-4 pt-6">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                </CardHeader>
                <CardContent className="pt-0 pb-8">
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20">
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-gray-900 mb-6 tracking-tight">
            Our Menu
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto mb-4 font-light">
            Authentic Thai cuisine crafted with love and the finest ingredients
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-block w-24 h-0.5 bg-gradient-to-r from-transparent via-[#bfa76a] to-transparent rounded-full" />
            <span className="text-xs text-[#bfa76a] tracking-widest font-medium uppercase">
              Fresh • Authentic • Delicious
            </span>
            <span className="inline-block w-24 h-0.5 bg-gradient-to-r from-transparent via-[#bfa76a] to-transparent rounded-full" />
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {menuItems.map((item) => (
            <MenuItemCard key={item.menu_id} item={item} />
          ))}
        </div>
      </main>
    </div>
  )
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const imageUrl = item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"

  return (
    <Card className="overflow-hidden rounded-none border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative h-48 w-full rounded-none">
        <img
          src={imageUrl}
          alt={item.name}
          className="object-cover w-full h-full rounded-none"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
          }}
        />
        {!item.availability && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <Badge variant="destructive" className="px-4 py-2 text-base font-semibold rounded-none">Out of Stock</Badge>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-white/90 text-[#bfa76a] font-bold text-lg px-4 py-1 border border-[#bfa76a]/20 rounded-none shadow">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-xl font-serif font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
          {item.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-6">
        <CardDescription className="text-gray-700 text-base leading-relaxed mb-6 min-h-[56px]">
          {item.description}
        </CardDescription>
        <AddToCartButton item={item} />
      </CardContent>
    </Card>
  )
}

function AddToCartButton({ item }: { item: MenuItem }) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!item.availability) return

    setIsAdding(true)
    try {
      addItem(item)
      // Brief delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error("Error adding item to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={!item.availability || isAdding}
      className={`w-full h-12 font-bold text-base transition-all duration-300 overflow-hidden group
        ${item.availability ? "bg-[#bfa76a] text-white hover:bg-[#a68a4d]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        ${isAdding ? "animate-pulse scale-95" : ""}`}
      size="lg"
      style={{ borderRadius: 0 }}
    >
      <Plus className="w-5 h-5 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
