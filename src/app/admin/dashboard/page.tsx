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
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

export default function AdminDashboard() {
  const [, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')
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

  const handleAddMenuItem = () => {
    setEditingMenuItem(null)
    setIsMenuModalOpen(true)
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setIsMenuModalOpen(true)
  }

  const handleDeleteMenuItem = (item: MenuItem) => {
    setDeletingMenuItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleSaveMenuItem = async (menuItemData: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at' | 'created_by_email'>) => {
    setMenuActionLoading(true)
    try {
      console.log('handleSaveMenuItem called with:', menuItemData)
      console.log('editingMenuItem:', editingMenuItem)
      
      if (editingMenuItem) {
        // Update existing item via API
        console.log('Updating menu item with ID:', editingMenuItem.menu_id)
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
        console.log('Update result:', updatedItem)
        
        setMenuItems(items => items.map(item => 
          item.menu_id === editingMenuItem.menu_id ? updatedItem : item
        ))
      } else {
        // Create new item via API
        console.log('Creating new menu item')
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
        console.log('Create result:', newItem)
        
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
      // First, delete the menu item from database
      const response = await fetch(`/api/menu?menu_id=${deletingMenuItem.menu_id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete menu item')
      }

      // If the item has an image from our storage, try to delete it
      if (deletingMenuItem.image_url && deletingMenuItem.image_url.includes('/storage/v1/object/public/menu-images/')) {
        try {
          // Extract filename from URL
          const urlParts = deletingMenuItem.image_url.split('/')
          const fileName = urlParts[urlParts.length - 1]?.split('?')[0]
          
          if (fileName) {
            // Delete the image (don't fail the whole operation if this fails)
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

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock,
          label: 'Pending'
        }
      case 'preparing': 
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: ChefHat,
          label: 'Preparing'
        }
      case 'done': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle,
          label: 'Done'
        }
      case 'cancelled': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: XCircle,
          label: 'Cancelled'
        }
      default: 
        return { 
          color: 'bg-slate-100 text-slate-800 border-slate-200', 
          icon: Clock,
          label: 'Unknown'
        }
    }
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total_amount : sum, 0
  )
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const completedOrders = orders.filter(order => order.status === 'done').length

  // Calculate menu item statistics
  const getMenuItemStats = (menuId: string) => {
    let totalOrdered = 0
    let totalRevenue = 0
    let orderCount = 0

    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.order_items) {
        order.order_items.forEach(item => {
          if (item.menu_item?.menu_id === menuId) {
            totalOrdered += item.quantity
            totalRevenue += item.subtotal
            orderCount++
          }
        })
      }
    })

    return { totalOrdered, totalRevenue, orderCount }
  }

  // Calculate total items in an order
  const getTotalItemsInOrder = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-slate-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Responsive Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl sm:rounded-2xl">
                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-slate-500">Manage your restaurant operations</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              size="sm"
              className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 rounded-lg sm:rounded-xl font-semibold text-sm px-3 sm:px-4"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Responsive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-200" />
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm font-medium">Pending Orders</p>
                <p className="text-2xl sm:text-3xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-200" />
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-xl sm:rounded-2xl shadow-lg sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm font-medium">Completed Orders</p>
                <p className="text-2xl sm:text-3xl font-bold">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-200" />
            </div>
          </Card>
        </div>

        {/* Responsive Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === 'menu'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Menu</span>
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            {orders.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center bg-white border-0 rounded-xl sm:rounded-2xl shadow-sm">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-slate-500">Orders will appear here when customers place them.</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <Card key={order.order_id} className="group relative overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                      {/* Simple status indicator */}
                      <div className={`absolute top-0 left-0 w-full h-1 ${
                        order.status === 'pending' ? 'bg-amber-400' :
                        order.status === 'preparing' ? 'bg-blue-500' :
                        order.status === 'done' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>

                      <div className="p-6">
                        {/* Clean order header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-slate-100 rounded-lg flex-shrink-0">
                              <Package className="h-6 w-6 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-slate-900">
                                  Order #{order.order_number}
                                </h3>
                                <Badge className={`${statusConfig.color} px-3 py-1 rounded-md font-medium text-sm border flex items-center gap-2`}>
                                  <StatusIcon className="h-4 w-4" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                                <Clock className="h-4 w-4" />
                                {new Date(order.created_at).toLocaleString()}
                              </div>
                              {order.customer_note && (
                                <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-blue-400 mt-3">
                                  <p className="text-slate-700 text-sm">
                                    <span className="font-medium text-slate-800">Note:</span> {order.customer_note}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                              <div className="text-right">
                                <div className="text-xl font-bold">${order.total_amount.toFixed(2)}</div>
                                <div className="text-slate-300 text-xs">Total</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Simple Order Items */}
                        {order.order_items && (
                          <div className="mb-6">
                            {/* Clean items header */}
                            <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Package className="h-5 w-5 text-slate-600" />
                                  <div>
                                    <h4 className="font-semibold text-slate-800">Order Items</h4>
                                    <p className="text-slate-600 text-sm">Items in this order</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium">
                                    {order.order_items.length} {order.order_items.length === 1 ? 'Type' : 'Types'}
                                  </span>
                                  <span className="px-3 py-1 bg-slate-800 text-white rounded-md text-sm font-medium">
                                    {getTotalItemsInOrder(order.order_items)} {getTotalItemsInOrder(order.order_items) === 1 ? 'Item' : 'Items'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Clean items list */}
                            <div className="space-y-3">
                              {order.order_items.map((item, index) => (
                                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      {/* Simple quantity */}
                                      <div className="w-10 h-10 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center">
                                        <span className="text-slate-700 font-semibold">{item.quantity}</span>
                                      </div>
                                      
                                      {/* Item details */}
                                      <div className="flex-1">
                                        <h5 className="font-medium text-slate-900 mb-1">
                                          {item.menu_item?.name || 'Unknown Item'}
                                        </h5>
                                        {item.menu_item?.price && (
                                          <p className="text-slate-500 text-sm">
                                            ${item.menu_item.price.toFixed(2)} each
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Simple price */}
                                    <div className="text-right">
                                      <div className="bg-slate-800 text-white px-3 py-2 rounded-lg">
                                        <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Simple total summary */}
                            <div className="mt-4 p-4 bg-slate-800 text-white rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Order Total</span>
                                <span className="text-xl font-bold">${order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Simple Status Controls */}
                        <div className="border-t border-slate-200 pt-4 mt-6">
                          <div className="flex flex-col sm:flex-row gap-3">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-colors"
                                  onClick={() => handleOrderStatusUpdate(order.order_id, 'preparing')}
                                >
                                  <ChefHat className="w-4 h-4 mr-2" />
                                  Start Preparing
                                </Button>
                                <Button
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 font-medium transition-colors"
                                  onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </Button>
                              </>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition-colors"
                                onClick={() => handleOrderStatusUpdate(order.order_id, 'done')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Complete
                              </Button>
                            )}
                            {order.status === 'done' && (
                              <div className="w-full bg-green-50 border border-green-200 rounded-lg py-3 px-4">
                                <div className="flex items-center justify-center gap-2 text-green-700">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="font-medium">Order Completed</span>
                                </div>
                              </div>
                            )}
                            {order.status === 'cancelled' && (
                              <div className="w-full bg-red-50 border border-red-200 rounded-lg py-3 px-4">
                                <div className="flex items-center justify-center gap-2 text-red-700">
                                  <XCircle className="w-5 h-5" />
                                  <span className="font-medium">Order Cancelled</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Menu Management</h2>
                <p className="text-sm sm:text-base text-slate-600">Manage your restaurant's menu items</p>
              </div>
              <Button 
                onClick={handleAddMenuItem}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
            
            {menuItems.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center bg-white border-0 rounded-xl sm:rounded-2xl shadow-sm">
                <Settings className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">No menu items</h3>
                <p className="text-sm sm:text-base text-slate-500">Add your first menu item to get started.</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {menuItems.map((item, index) => (
                  <Card key={item.menu_id} className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 transform hover:scale-[1.02]">
                    {/* Modern Card Layout */}
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Image Section */}
                      <div className="relative lg:w-80 h-48 lg:h-auto flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center text-white/80">
                                <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-60" />
                                <p className="text-sm font-medium">No Image</p>
                              </div>
                            </div>
                          )}
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>
                        
                        {/* Image badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                            <span className="text-xs font-bold text-slate-800">#{index + 1}</span>
                          </div>
                          <Badge className={`${
                            item.availability 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-red-500 hover:bg-red-600'
                          } text-white border-0 px-3 py-1.5 rounded-full font-semibold text-xs shadow-lg`}>
                            {item.availability ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Available
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <XCircle className="h-3 w-3" />
                                Unavailable
                              </div>
                            )}
                          </Badge>
                        </div>

                        {/* Price badge */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-2xl font-bold text-green-600">{item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-3 w-full sm:w-auto">
                        <Badge className={`${item.availability ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm border`}>
                          {item.availability ? 'Available' : 'Unavailable'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditMenuItem(item)}
                            className="rounded-lg sm:rounded-xl border-slate-300 hover:border-blue-300 hover:text-blue-600 text-xs px-2 sm:px-3"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleDeleteMenuItem(item)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl text-xs px-2 sm:px-3"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden xs:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Hover accent line */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false)
          setEditingMenuItem(null)
        }}
        onSave={handleSaveMenuItem}
        editingItem={editingMenuItem}
        isLoading={menuActionLoading}
      />

      {/* Delete Confirmation Modal */}
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
  