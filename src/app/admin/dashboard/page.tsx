'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Order, MenuItem } from '@/types'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getAllOrders, updateOrderStatus, getAllMenuItems, subscribeToOrders, subscribeToMenuItems } from '@/lib/database'
import { EnhancedVoiceControl } from '@/components/EnhancedVoiceControl'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { User } from '@supabase/supabase-js'
import MenuItemModal from '@/components/MenuItemModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Package, 
  DollarSign,
  Settings,
  Mic,
  Volume2,
  Brain,
  Utensils,
  MessageSquare,
  Activity,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'menu' | 'analytics' | 'voice'>('orders')
  const [loading, setLoading] = useState(true)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null)
  const [menuActionLoading, setMenuActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()

    // Set up real-time subscriptions
    const ordersSubscription = subscribeToOrders((newOrder) => {
      setOrders(prevOrders => {
        const existingIndex = prevOrders.findIndex(order => order.order_id === newOrder.order_id)
        if (existingIndex >= 0) {
          const updatedOrders = [...prevOrders]
          updatedOrders[existingIndex] = newOrder
          return updatedOrders
        } else {
          return [newOrder, ...prevOrders]
        }
      })
    })

    const menuSubscription = subscribeToMenuItems((menuItem) => {
      setMenuItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.menu_id === menuItem.menu_id)
        if (existingIndex >= 0) {
          const updatedItems = [...prevItems]
          updatedItems[existingIndex] = menuItem
          return updatedItems
        } else {
          return [...prevItems, menuItem]
        }
      })
    })

    return () => {
      ordersSubscription?.unsubscribe()
      menuSubscription?.unsubscribe()
    }
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

  const handleVoiceCommandResult = () => {
    fetchData()
  }


  // Additional handler functions
  const handleSaveMenuItem = async (menuItemData: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at' | 'created_by_email'>) => {
    setMenuActionLoading(true)
    try {
      if (editingMenuItem) {
        const response = await fetch('/api/menu', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menu_id: editingMenuItem.menu_id,
            ...menuItemData
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update menu item')
        }
        
        const updatedItem = await response.json()
        setMenuItems(items => items.map(item => 
          item.menu_id === editingMenuItem.menu_id ? updatedItem : item
        ))
      } else {
        const response = await fetch('/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(menuItemData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create menu item')
        }
        
        const newItem = await response.json()
        setMenuItems(items => [...items, newItem])
      }
      setIsMenuModalOpen(false)
      setEditingMenuItem(null)
    } catch (error) {
      console.error('Error in handleSaveMenuItem:', error)
      alert(`Failed to ${editingMenuItem ? 'update' : 'create'} menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setMenuActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMenuItem) return
    
    setMenuActionLoading(true)
    try {
      const response = await fetch(`/api/menu?menu_id=${deletingMenuItem.menu_id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete menu item')
      }

      if (deletingMenuItem.image_url && deletingMenuItem.image_url.includes('/storage/v1/object/public/menu-images/')) {
        try {
          const urlParts = deletingMenuItem.image_url.split('/')
          const fileName = urlParts[urlParts.length - 1]?.split('?')[0]
          
          if (fileName) {
            await fetch(`/api/upload-image?fileName=${encodeURIComponent(fileName)}`, {
              method: 'DELETE',
            })
          }
        } catch (imageError) {
          console.error('Failed to delete image, but menu item was deleted:', imageError)
        }
      }
      
      setMenuItems(items => items.filter(item => item.menu_id !== deletingMenuItem.menu_id))
      setIsDeleteModalOpen(false)
      setDeletingMenuItem(null)
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert(`Failed to delete menu item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      setMenuActionLoading(false)
    }
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total_amount : sum, 0
  )
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const completedOrders = orders.filter(order => order.status === 'done').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <div className="text-xl font-semibold text-slate-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your restaurant operations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-black font-medium">
                  {user.email}
                </div>
              )}
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed Orders</p>
                <p className="text-3xl font-bold">{completedOrders}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {[
              { key: 'orders', label: 'Orders', icon: Package },
              { key: 'history', label: 'History', icon: Clock },
              { key: 'voice', label: 'Voice AI', icon: Mic },
              { key: 'menu', label: 'Menu', icon: Settings },
              { key: 'analytics', label: 'Analytics', icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'orders' | 'history' | 'voice' | 'menu' | 'analytics')}
                className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Receive Orders</h2>
                <p className="text-gray-600">New incoming orders</p>
              </div>
              <Badge className="bg-amber-500 text-white border-0 px-3 py-1 rounded-full">
                {pendingOrders} pending orders
              </Badge>
            </div>

            {orders.filter(order => order.status === 'pending').length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 rounded-2xl shadow-sm">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending orders</h3>
                <p className="text-gray-500">New orders will appear here when customers place them.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders
                  .filter(order => order.status === 'pending')
                  .map((order) => (
                    <Card key={order.order_id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h3>
                          <p className="text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Pending
                          </Badge>
                        </div>
                      </div>
                      
                      {order.order_items && (
                        <div className="space-y-2 mb-4">
                          {order.order_items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <span className="font-medium text-gray-900">{item.menu_item?.name || 'Unknown Item'}</span>
                                <span className="text-gray-600 ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleOrderStatusUpdate(order.order_id, 'done')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Done
                        </Button>
                        <Button
                          onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Order History</h2>
              <p className="text-gray-600">View all completed and cancelled orders</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Completed Orders Section */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-600 rounded-xl">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-800">Completed Orders</h3>
                      <p className="text-green-700">Successfully fulfilled orders</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-semibold">
                        {orders.filter(order => order.status === 'done').length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orders.filter(order => order.status === 'done').length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                        <p className="text-green-600 font-medium">No completed orders yet</p>
                        <p className="text-green-500 text-sm">Completed orders will appear here</p>
                      </div>
                    ) : (
                      orders
                        .filter(order => order.status === 'done')
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((order) => (
                          <Card key={order.order_id} className="p-4 bg-white border border-green-200 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h4>
                                <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                                {order.order_items && order.order_items.length > 0 && (
                                  <p className="text-green-700 text-sm mt-1">
                                    {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))
                    )}
                  </div>
                </Card>
              </div>

              {/* Cancelled Orders Section */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-600 rounded-xl">
                      <XCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-800">Cancelled Orders</h3>
                      <p className="text-red-700">Orders that were cancelled</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-red-600 text-white px-4 py-2 text-lg font-semibold">
                        {orders.filter(order => order.status === 'cancelled').length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orders.filter(order => order.status === 'cancelled').length === 0 ? (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-red-300 mx-auto mb-3" />
                        <p className="text-red-600 font-medium">No cancelled orders</p>
                        <p className="text-red-500 text-sm">Cancelled orders will appear here</p>
                      </div>
                    ) : (
                      orders
                        .filter(order => order.status === 'cancelled')
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((order) => (
                          <Card key={order.order_id} className="p-4 bg-white border border-red-200 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h4>
                                <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                                {order.order_items && order.order_items.length > 0 && (
                                  <p className="text-red-700 text-sm mt-1">
                                    {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                                <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancelled
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Summary Stats */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg rounded-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Order Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status !== 'pending').length}</div>
                  <div className="text-gray-600 text-sm">Total Processed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{orders.filter(order => order.status === 'done').length}</div>
                  <div className="text-gray-600 text-sm">Completed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">{orders.filter(order => order.status === 'cancelled').length}</div>
                  <div className="text-gray-600 text-sm">Cancelled</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
                <p className="text-gray-600">Manage your restaurant menu items</p>
              </div>
              <Button
                onClick={() => {
                  setEditingMenuItem(null)
                  setIsMenuModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>

            {menuItems.length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 rounded-2xl shadow-sm">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No menu items yet</h3>
                <p className="text-gray-500">Create your first menu item using the button above.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {menuItems.map((item) => (
                  <Card key={item.menu_id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {item.image_url && (
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden mb-4 float-right ml-4">
                            <Image 
                              src={item.image_url} 
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 mt-2">{item.description}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <p className="text-2xl font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                          <Badge 
                            className={item.availability 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {item.availability ? 'Available' : 'Unavailable'}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            Total ordered: {item.total_ordered || 0}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingMenuItem(item)
                            setIsMenuModalOpen(true)
                          }}
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setDeletingMenuItem(item)
                            setIsDeleteModalOpen(true)
                          }}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={menuActionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <span>ID: {item.menu_id}</span>
                        <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                        {item.created_by_email && (
                          <span className="sm:col-span-2">Created by: {item.created_by_email}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Voice AI Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">AI Voice Control Center</h2>
                  <p className="text-gray-600 text-lg">Manage your restaurant with intelligent voice commands</p>
                </div>
              </div>
            </div>

            {/* Pending Orders Section for Voice Commands */}
            <div className="max-w-6xl mx-auto">
              <Card className="p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Voice Command Orders</h3>
                    <p className="text-gray-600">Use voice commands to manage these pending orders</p>
                  </div>
                  <Badge className="bg-amber-500 text-white border-0 px-4 py-2 rounded-full text-sm font-semibold">
                    {pendingOrders} pending orders
                  </Badge>
                </div>

                {orders.filter(order => order.status === 'pending').length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">No pending orders</h4>
                    <p className="text-gray-500">New orders will appear here for voice command management.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders
                      .filter(order => order.status === 'pending')
                      .map((order) => (
                        <Card key={order.order_id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h4>
                              <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</p>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                Pending
                              </Badge>
                            </div>
                          </div>
                          
                          {order.order_items && (
                            <div className="space-y-1 mb-3">
                              {order.order_items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-1 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-900">{item.menu_item?.name || 'Unknown Item'}</span>
                                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                  </div>
                                  <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Voice Command Examples for this order */}
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <p className="text-xs font-semibold text-blue-800 mb-2">Voice Commands for this order:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="bg-green-50 rounded px-2 py-1 border border-green-200">
                                <span className="font-mono text-green-700">&quot;System, mark order {order.order_number} as done. Over.&quot;</span>
                              </div>
                              <div className="bg-red-50 rounded px-2 py-1 border border-red-200">
                                <span className="font-mono text-red-700">&quot;System, cancel order {order.order_number}. Over.&quot;</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Clean Voice Control Container */}
            <div className="max-w-6xl mx-auto">
              <Card className="p-8 lg:p-12 bg-gradient-to-br from-white via-gray-50 to-blue-50 border-2 border-gray-100 shadow-xl">
                {/* Voice Control Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                  {/* Left: Voice Control Interface */}
                  <div className="space-y-6">
                    <div className="text-center lg:text-left">
                      <div className="inline-flex items-center gap-3 p-4 bg-purple-100 rounded-2xl mb-6">
                        <div className="p-3 bg-purple-600 rounded-xl">
                          <Mic className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Voice Command Center</h3>
                          <p className="text-purple-700 font-medium">Speak naturally to control your restaurant</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Voice Control Component */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <EnhancedVoiceControl 
                        onCommandProcessed={handleVoiceCommandResult} 
                        autoStart={false}
                      />
                    </div>
                  </div>

                  {/* Right: Voice Command Examples */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Voice Command Examples</h3>
                        <p className="text-sm text-gray-600">Try these example commands</p>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Order Management Examples */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Order Management</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-blue-600 font-bold">System</span>, how many pending orders? <span className="text-blue-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-green-600 font-bold">System</span>, mark order 7 as done. <span className="text-green-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-l-4 border-red-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-red-600 font-bold">System</span>, cancel order 5. <span className="text-red-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Analytics Examples */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm">
                              <Activity className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Analytics & Reports</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-purple-600 font-bold">System</span>, what are our popular items? <span className="text-purple-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-l-4 border-orange-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-orange-600 font-bold">System</span>, show today&apos;s revenue. <span className="text-orange-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border-l-4 border-teal-500 hover:shadow-sm transition-shadow">
                              <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                                &quot;<span className="text-teal-600 font-bold">System</span>, how many completed orders? <span className="text-teal-600 font-bold">Over.</span>&quot;
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-indigo-500 rounded-lg flex-shrink-0">
                              <Utensils className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-indigo-800 text-sm mb-1">Pro Tip:</h5>
                              <p className="text-xs text-indigo-700 leading-relaxed">
                                Speak clearly and pause briefly between &quot;System&quot; and your command, then pause before saying &quot;Over&quot; for best results.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How it Works - Bottom Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left: How it Works Instructions */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Volume2 className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">How Voice Commands Work</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                          <h4 className="font-semibold text-gray-800 mb-2">Say &quot;System&quot;</h4>
                          <p className="text-sm text-gray-600">Activate command mode</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                          <h4 className="font-semibold text-gray-800 mb-2">Speak Command</h4>
                          <p className="text-sm text-gray-600">Give your instruction</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                          <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                          <h4 className="font-semibold text-gray-800 mb-2">Say &quot;Over&quot;</h4>
                          <p className="text-sm text-gray-600">Complete the command</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-500 rounded-lg">
                            <Utensils className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-yellow-800 mb-1">Important:</h5>
                            <p className="text-sm text-yellow-700">Always start with &quot;System&quot; and end with &quot;Over&quot; for accurate recognition. Speak clearly and wait for responses.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Status Cards */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                          <div className="text-center">
                            <Mic className="h-10 w-10 mx-auto mb-3 text-purple-200" />
                            <p className="text-purple-100 text-sm font-medium">Voice Status</p>
                            <p className="text-2xl font-bold">Ready</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                          <div className="text-center">
                            <Brain className="h-10 w-10 mx-auto mb-3 text-green-200" />
                            <p className="text-green-100 text-sm font-medium">AI Status</p>
                            <p className="text-2xl font-bold">Online</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional helpful info */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="text-center">
                          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                          <p className="text-blue-100 text-sm font-medium">Commands Available</p>
                          <p className="text-2xl font-bold">24/7</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Features Overview */}
            <div className="max-w-6xl mx-auto">
              <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">🚀 Voice AI Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="p-4 bg-green-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Natural Language</h4>
                    <p className="text-gray-600">Speak naturally - our AI understands context and intent perfectly</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="p-4 bg-blue-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Real-time Updates</h4>
                    <p className="text-gray-600">Changes reflect immediately across your entire dashboard</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="p-4 bg-purple-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Smart Responses</h4>
                    <p className="text-gray-600">Get intelligent feedback and confirmations from the AI</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <MenuItemModal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false)
          setEditingMenuItem(null)
        }}
        onSave={async (data) => {
          await handleSaveMenuItem(data)
        }}
        editingItem={editingMenuItem}
        isLoading={menuActionLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingMenuItem(null)
        }}
        onConfirm={handleConfirmDelete}
        item={deletingMenuItem}
        isLoading={menuActionLoading}
      />
    </div>
  )
}
