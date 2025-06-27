import { createClient } from './supabase/server'
import { MenuItem, Order } from '@/types'

// Server-side database functions
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

export async function getAllMenuItemsServer(businessEmail?: string): Promise<MenuItem[]> {
  const supabase = await getServerSupabaseClient()
  let query = supabase
    .from('menu_item')
    .select('*')

  // Add email filter if provided
  if (businessEmail) {
    query = query.eq('business_email', businessEmail)
  }

  const { data, error } = await query.order('name')

  if (error) {
    console.error('Error fetching all menu items:', error)
    return []
  }

  return data || []
}

export async function createMenuItemServer(menuItem: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at'>, businessEmail?: string): Promise<MenuItem | null> {
  const supabase = await getServerSupabaseClient()
  const menuItemWithEmail = {
    ...menuItem,
    business_email: businessEmail
  }
  
  const { data, error } = await supabase
    .from('menu_item')
    .insert(menuItemWithEmail)
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
export async function createOrderServer(orderItems: { menu_id: string; quantity: number }[], customerNote?: string, businessEmail?: string): Promise<Order | null> {
  try {
    const supabase = await getServerSupabaseClient()
    
    // Start a transaction by creating the order first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_note: customerNote,
        business_email: businessEmail,
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
    return await getOrderByIdServer(orderData.order_id)
  } catch (error) {
    console.error('Error in createOrder:', error)
    return null
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

export async function getAllOrdersServer(date?: string, businessEmail?: string): Promise<Order[]> {
  const supabase = await getServerSupabaseClient()
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items:order_item(
        *,
        menu_item(*)
      )
    `)

  // Add date filter if provided (expects YYYY-MM-DD format)
  if (date) {
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`
    query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
  }

  // Add business email filter if provided
  if (businessEmail) {
    query = query.eq('business_email', businessEmail)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

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
