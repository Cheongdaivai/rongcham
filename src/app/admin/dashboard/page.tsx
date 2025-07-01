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
                    <Card key={order.order_id} className="p-4 sm:p-6 bg-white border-0 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      {/* Responsive order header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4 sm:gap-0">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className="p-2 sm:p-3 bg-slate-100 rounded-lg sm:rounded-xl flex-shrink-0">
                            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Order #{order.order_number}</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                            {order.customer_note && (
                                                             <p className="text-slate-600 mt-2 text-xs sm:text-sm italic line-clamp-2">
                                 &ldquo;{order.customer_note}&rdquo;
                               </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:space-y-3 w-full sm:w-auto justify-between sm:justify-start">
                          <Badge className={`${statusConfig.color} px-2 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm border flex items-center gap-1 sm:gap-2`}>
                            <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-lg sm:text-2xl font-bold text-slate-800">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.order_items && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                          <h4 className="font-semibold mb-2 sm:mb-3 text-slate-700 flex items-center gap-2 text-sm sm:text-base">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                            Order Items:
                          </h4>
                          <div className="space-y-1 sm:space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-xs sm:text-sm bg-white p-2 sm:p-3 rounded-md sm:rounded-lg">
                                <span className="font-medium text-slate-800 truncate mr-2">
                                  {item.quantity}× {item.menu_item?.name || 'Unknown Item'}
                                </span>
                                <span className="font-semibold text-slate-800 flex-shrink-0">${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Responsive Status Controls */}
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-xs sm:text-sm px-3 sm:px-4 py-2"
                              onClick={() => handleOrderStatusUpdate(order.order_id, 'preparing')}
                            >
                              <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden xs:inline">Start </span>Preparing
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-xs sm:text-sm px-3 sm:px-4 py-2"
                              onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                            >
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-xs sm:text-sm px-3 sm:px-4 py-2"
                            onClick={() => handleOrderStatusUpdate(order.order_id, 'done')}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Mark as Done
                          </Button>
                        )}
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
              <div className="grid gap-3 sm:gap-4">
                {menuItems.map((item) => (
                  <Card key={item.menu_id} className="p-4 sm:p-6 bg-white border-0 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex gap-3 sm:gap-4 flex-1">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">{item.name}</h3>
                          <p className="text-slate-600 text-xs sm:text-sm mb-2 line-clamp-2">{item.description}</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </p>
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
