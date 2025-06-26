import { createClient } from './supabase/client'
import { MenuItem, Order, OrderItem } from '@/types'

// Client-side database functions
const getSupabaseClient = () => createClient()

// Menu Item CRUD Operations
export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient()
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

export async function createMenuItem(menuItem: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> {
  const supabase = getSupabaseClient()
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
}

export async function updateMenuItem(menu_id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('menu_item')
    .update(updates)
    .eq('menu_id', menu_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating menu item:', error)
    return null
  }

  return data
}

export async function deleteMenuItem(menu_id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('menu_item')
    .delete()
    .eq('menu_id', menu_id)

  if (error) {
    console.error('Error deleting menu item:', error)
    return false
  }

  return true
}

// Order Operations
export async function createOrder(orderItems: { menu_id: string; quantity: number }[], customerNote?: string): Promise<Order | null> {
  try {
    const supabase = getSupabaseClient()
    
    // Start a transaction by creating the order first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_note: customerNote,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return null
    }

    // Get menu items to calculate prices
    const menuIds = orderItems.map(item => item.menu_id)
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_item')
      .select('menu_id, price')
      .in('menu_id', menuIds)

    if (menuError) {
      console.error('Error fetching menu items for order:', menuError)
      return null
    }

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
  const supabase = getSupabaseClient()
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
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_item(
        *,
        menu_item(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data as Order[]
}

export async function getPendingOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_item(
        *,
        menu_item(*)
      )
    `)
    .in('status', ['pending', 'preparing'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending orders:', error)
    return []
  }

  return data as Order[]
}

export async function updateOrderStatus(order_id: number, status: Order['status']): Promise<Order | null> {
  const supabase = getSupabaseClient()
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
