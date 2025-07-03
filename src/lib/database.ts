import { createClient } from './supabase/client'
import { MenuItem, Order, OrderItem } from '@/types'

// Client-side database functions
const getSupabaseClient = () => createClient()

// Helper function to get current user
async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  
  return user
}

// Menu Item CRUD Operations
export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient()
  
  // RLS policies will automatically filter to show:
  // - Items created by the current user
  // - Available public items (created_by_email IS NULL)
  const { data, error } = await supabase
    .from('menu_item')
    .select('*')
    .eq('availability', true)
    .order('name')

  if (error) {
    console.error('Error fetching menu items:', error)
    return []
  }

  return data || []
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient()
  
  // This will return only items the user has access to via RLS
  const { data, error } = await supabase
    .from('menu_item')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching all menu items:', error)
    return []
  }

  return data || []
}

export async function createMenuItem(menuItem: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at' | 'created_by_email'>): Promise<MenuItem | null> {
  try {
    // Ensure user is authenticated
    await getCurrentUser()
    
    const supabase = getSupabaseClient()
    
    // The trigger will automatically set created_by_email
    const { data, error } = await supabase
      .from('menu_item')
      .insert(menuItem)
      .select()
      .single()

    if (error) {
      console.error('Error creating menu item:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createMenuItem:', error)
    return null
  }
}

export async function updateMenuItem(menu_id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  try {
    // Ensure user is authenticated
    await getCurrentUser()
    
    const supabase = getSupabaseClient()
    
    // Remove email from updates as it should not be changeable
    const { created_by_email, ...safeUpdates } = updates
    
    // RLS policy will ensure user can only update their own items
    const { data, error } = await supabase
      .from('menu_item')
      .update(safeUpdates)
      .eq('menu_id', menu_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating menu item:', error)
      console.error('Update data:', safeUpdates)
      console.error('Menu ID:', menu_id)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateMenuItem:', error)
    return null
  }
}

export async function deleteMenuItem(menu_id: string): Promise<boolean> {
  try {
    // Ensure user is authenticated
    await getCurrentUser()
    
    const supabase = getSupabaseClient()
    
    // RLS policy will ensure user can only delete their own items
    const { error } = await supabase
      .from('menu_item')
      .delete()
      .eq('menu_id', menu_id)

    if (error) {
      console.error('Error deleting menu item:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteMenuItem:', error)
    return false
  }
}

// Order Operations
export async function createOrder(orderItems: { menu_id: string; quantity: number }[], customerNote?: string, businessEmail?: string): Promise<Order | null> {
  try {
    // Ensure user is authenticated
    const user = await getCurrentUser()
    
    const supabase = getSupabaseClient()
    
    // Get menu items to calculate prices FIRST
    const menuIds = orderItems.map(item => item.menu_id)
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_item')
      .select('menu_id, price')
      .in('menu_id', menuIds)

    if (menuError) {
      console.error('Error fetching menu items for order:', menuError)
      return null
    }

    if (!menuItems || menuItems.length === 0) {
      console.error('No menu items found for the provided IDs')
      return null
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce((total, item) => {
      const menuItem = menuItems?.find((menu: any) => menu.menu_id === item.menu_id)
      if (!menuItem) throw new Error(`Menu item not found: ${item.menu_id}`)
      return total + (menuItem.price * item.quantity)
    }, 0)

   console.log('Creating order with total amount:', totalAmount)

// Get the next order number manually
const { data: nextOrderNumber } = await supabase
  .rpc('get_next_order_number', {
    customer_email_param: businessEmail || user.email,
    order_date_param: new Date().toISOString().split('T')[0]
  })

console.log('Next order number:', nextOrderNumber)

const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .insert({
    customer_note: customerNote,
    customer_email: businessEmail || user.email,
    status: 'pending',
    total_amount: totalAmount,
    order_number: nextOrderNumber // Manually set the order number
  })
  .select()
  .single()

if (orderError) {
  console.error('Error creating order:', orderError)
  console.error('Full error details:', JSON.stringify(orderError, null, 2))
  return null
}

console.log('Order created successfully:', orderData)
console.log('Order number assigned:', orderData.order_number)


    // Create order items
    const orderItemsToInsert = orderItems.map(item => {
      const menuItem = menuItems?.find((menu: any) => menu.menu_id === item.menu_id)
      if (!menuItem) throw new Error(`Menu item not found: ${item.menu_id}`)
      
      return {
        order_id: orderData.order_id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        unit_price: menuItem.price
      }
    })

    const { error: orderItemsError } = await supabase
      .from('order_item')
      .insert(orderItemsToInsert)

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError)
      // Clean up the order if order items creation failed
      await supabase.from('orders').delete().eq('order_id', orderData.order_id)
      return null
    }

    // Fetch the complete order with items
    return await getOrderById(orderData.order_id)
  } catch (error) {
    console.error('Error in createOrder:', error)
    return null
  }
}

export async function getOrderById(order_id: number): Promise<Order | null> {
  try {
    const supabase = getSupabaseClient()
    
    // RLS policy will ensure user can only access their own orders
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_item(
          *,
          menu_item(*)
        )
      `)
      .eq('order_id', order_id)
      .single()
      

    if (error) {
      console.error('Error fetching order:', error)
      return null
    }

    return data as Order
  } catch (error) {
    console.error('Error in getOrderById:', error)
    return null
  }
}

export async function getAllOrders(includeMenuDetails = true): Promise<Order[]> {
  try {
    const supabase = getSupabaseClient()
    
    // RLS policy will ensure user can only access their own orders
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_item(
          *${includeMenuDetails ? ',\n          menu_item(*)' : ''}
        )
      `)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return data as Order[]
  } catch (error) {
    console.error('Error in getAllOrders:', error)
    return []
  }
}

// Fast query for order lists
export async function getOrdersList(): Promise<Order[]> {
  return getAllOrders(false)
}

// Detailed query for specific orders
export async function getOrdersWithDetails(): Promise<Order[]> {
  return getAllOrders(true)
}

export async function getPendingOrders(): Promise<Order[]> {
  try {
    const supabase = getSupabaseClient()
    
    // RLS policy will ensure user can only access their own orders
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_item(
          *,
          menu_item(*)
        )
      `)
      .in('status', ['pending'])
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending orders:', error)
      return []
    }

    return data as Order[]
  } catch (error) {
    console.error('Error in getPendingOrders:', error)
    return []
  }
}

export async function updateOrderStatus(order_id: number, status: Order['status']): Promise<Order | null> {
  try {
    // Ensure user is authenticated
    await getCurrentUser()
    
    const supabase = getSupabaseClient()
    
    // RLS policy will ensure user can only update their own orders
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', order_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateOrderStatus:', error)
    return null
  }
}

// Real-time subscriptions
export function subscribeToOrders(callback: (order: Order) => void) {
  const supabase = getSupabaseClient()
  return supabase
    .channel('orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload: any) => {
      const order = await getOrderById(payload.new.order_id)
      if (order) callback(order)
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async (payload: any) => {
      const order = await getOrderById(payload.new.order_id)
      if (order) callback(order)
    })
    .subscribe()
}

export function subscribeToMenuItems(callback: (menuItem: MenuItem) => void) {
  const supabase = getSupabaseClient()
  return supabase
    .channel('menu_items')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_item' }, (payload: any) => {
      callback(payload.new as MenuItem)
    })
    .subscribe()
}
