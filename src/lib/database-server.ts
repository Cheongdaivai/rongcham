import { createClient } from './supabase/server'
import { MenuItem, Order } from '@/types'

// Server-side  functions
async function getServerSupabaseClient() {
  return await createClient()
}

// Menu Item CRUD Operations (Server-side)
export async function getMenuItemsServer(): Promise<MenuItem[]> {
  const supabase = await getServerSupabaseClient()
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

export async function getAllMenuItemsServer(): Promise<MenuItem[]> {
  const supabase = await getServerSupabaseClient()
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

export async function createMenuItemServer(menuItem: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at'>): Promise<MenuItem | null> {
  const supabase = await getServerSupabaseClient()
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

export async function updateMenuItemServer(menu_id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  const supabase = await getServerSupabaseClient()
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

export async function deleteMenuItemServer(menu_id: string): Promise<boolean> {
  const supabase = await getServerSupabaseClient()
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

// Order Operations (Server-side)
export async function createOrderServer(orderItems: { menu_id: string; quantity: number }[], customerNote?: string): Promise<Order | null> {
  try {
    console.log('Creating order with items:', orderItems, 'customerNote:', customerNote)
    const supabase = await getServerSupabaseClient()
    
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
      throw new Error(` error creating order: ${orderError.message}`)
    }

    console.log('Order created successfully:', orderData)

    // Get menu items to calculate prices
    const menuIds = orderItems.map(item => item.menu_id)
    console.log('Fetching menu items for IDs:', menuIds)
    
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_item')
      .select('menu_id, price')
      .in('menu_id', menuIds)

    if (menuError) {
      console.error('Error fetching menu items for order:', menuError)
      throw new Error(` error fetching menu items: ${menuError.message}`)
    }

    console.log('Fetched menu items:', menuItems)

    if (!menuItems || menuItems.length === 0) {
      throw new Error('No menu items found for the provided IDs')
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

    console.log('Inserting order items:', orderItemsToInsert)

    const { error: orderItemsError } = await supabase
      .from('order_item')
      .insert(orderItemsToInsert)

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError)
      // Clean up the order if order items creation failed
      await supabase.from('orders').delete().eq('order_id', orderData.order_id)
      throw new Error(` error creating order items: ${orderItemsError.message}`)
    }

    console.log('Order items created successfully')

    // Fetch the complete order with items
    const finalOrder = await getOrderByIdServer(orderData.order_id)
    console.log('Final order with items:', finalOrder)
    return finalOrder
  } catch (error) {
    console.error('Error in createOrderServer:', error)
    throw error
  }
}

export async function getOrderByIdServer(order_id: number): Promise<Order | null> {
  const supabase = await getServerSupabaseClient()
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

export async function getAllOrdersServer(): Promise<Order[]> {
  const supabase = await getServerSupabaseClient()
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

export async function updateOrderStatusServer(order_id: number, status: Order['status']): Promise<Order | null> {
  const supabase = await getServerSupabaseClient()
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
