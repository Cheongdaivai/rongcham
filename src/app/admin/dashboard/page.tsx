'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Order, MenuItem } from '@/types'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getAllOrders, updateOrderStatus, getAllMenuItems } from '@/lib/database'
import { User } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/admin/login')
      return
    }
    setUser(currentUser)
  }

  const fetchData = async () => {
    try {
      const [ordersData, menuData] = await Promise.all([
        getAllOrders(),
        getAllMenuItems()
      ])
      setOrders(ordersData)
      setMenuItems(menuData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const handleOrderStatusUpdate = async (orderId: number, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'done': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
            </nav>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
              {orders.length === 0 ? (
                <Card className="p-6 rounded-none border border-gray-200 shadow-sm">
                  <p className="text-gray-500 text-center">No orders yet.</p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <Card key={order.order_id} className="p-6 rounded-none border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_number}</h3>
                          <p className="text-gray-600 text-sm">
                            Created: {new Date(order.created_at).toLocaleString()}
                          </p>
                          {order.customer_note && (
                            <p className="text-gray-600 mt-1 text-sm">
                              Note: {order.customer_note}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(order.status) + ' px-3 py-1 rounded-none font-semibold text-xs text-black'}>
                            {order.status}
                          </Badge>
                          <span className="text-lg font-bold text-black">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.order_items && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-gray-800">Items:</h4>
                          <div className="space-y-1">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-black">
                                <span className="text-black">
                                  {item.quantity}x {item.menu_item?.name || 'Unknown Item'}
                                </span>
                                <span className="text-black">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Controls */}
                      <div className="flex space-x-2 mt-2">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-none text-white bg-blue-600 hover:bg-blue-700 border-blue-600 focus:ring-2 focus:ring-blue-300 flex items-center gap-2"
                              onClick={() => handleOrderStatusUpdate(order.order_id, 'preparing')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                              Start Preparing
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-none text-white bg-red-600 hover:bg-red-700 border-red-600 focus:ring-2 focus:ring-red-300 flex items-center gap-2"
                              onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            className="rounded-none text-white bg-green-600 hover:bg-green-700 border-green-600 focus:ring-2 focus:ring-green-300 flex items-center gap-2"
                            onClick={() => handleOrderStatusUpdate(order.order_id, 'done')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Mark as Done
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <Button onClick={() => {/* Add menu item modal */}}>
                  Add Menu Item
                </Button>
              </div>
              
              {menuItems.length === 0 ? (
                <Card className="p-6 rounded-none border border-gray-200 shadow-sm">
                  <p className="text-gray-500 text-center">No menu items yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.menu_id} className="p-4 rounded-none border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={(item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + ' px-3 py-1 rounded-none font-semibold text-xs'}>
                            {item.availability ? 'Available' : 'Unavailable'}
                          </Badge>
                          <Button size="sm" variant="outline" className="rounded-none">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-none">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
