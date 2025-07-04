import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/lib/auth-server'
import { SupabaseClient } from '@supabase/supabase-js'

export interface DailyRevenue {
  date: string
  revenue: number
  orderCount: number
  avgOrderValue: number
}

export interface MenuItemAnalytics {
  menu_id: string
  name: string
  total_ordered: number
  revenue: number
  avgPrice: number
}

export interface AnalyticsData {
  dailyRevenue: DailyRevenue[]
  topMenuItems: MenuItemAnalytics[]
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  periodStart: string
  periodEnd: string
}

async function getDailyRevenue(supabase: Awaited<ReturnType<typeof createClient>>, startDate: string, endDate: string, businessEmail?: string): Promise<DailyRevenue[]> {
  const supabaseClient = supabase
  let query = supabaseClient
    .from('orders')
    .select('created_at, total_amount')
    .eq('status', 'done') // Only completed orders count toward revenue
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (businessEmail) {
    query = query.eq('customer_email', businessEmail)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching daily revenue:', error)
    return []
  }

  // Group by date and calculate revenue
  const revenueByDate = new Map<string, { revenue: number; count: number }>()
  
  data.forEach((order: Record<string, unknown>) => {
    const date = new Date(order.created_at as string).toISOString().split('T')[0]
    const existing = revenueByDate.get(date) || { revenue: 0, count: 0 }
    
    revenueByDate.set(date, {
      revenue: existing.revenue + parseFloat(order.total_amount as string),
      count: existing.count + 1
    })
  })

  // Convert to array and sort by date (descending)
  return Array.from(revenueByDate.entries())
    .map(([date, stats]) => ({
      date,
      revenue: stats.revenue,
      orderCount: stats.count,
      avgOrderValue: stats.revenue / stats.count
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function getMenuItemAnalytics(supabase: Awaited<ReturnType<typeof createClient>>, startDate: string, endDate: string, businessEmail?: string): Promise<MenuItemAnalytics[]> {
  const supabaseClient = supabase
  let query = supabaseClient
    .from('order_item')
    .select(`
      quantity,
      unit_price,
      subtotal,
      menu_item!inner(menu_id, name${businessEmail ? ', created_by_email' : ''}),
      orders!inner(created_at, status)
    `)
    .eq('orders.status', 'done')
    .gte('orders.created_at', startDate)
    .lte('orders.created_at', endDate)

  if (businessEmail) {
    query = query.eq('menu_item.created_by_email', businessEmail)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching menu item analytics:', error)
    return []
  }

  // Group by menu item and calculate stats
  const itemStats = new Map<string, { name: string; totalOrdered: number; revenue: number; totalPrice: number; orderCount: number }>()
  
  data.forEach((item: Record<string, unknown>) => {
    const menuItem = item.menu_item as Record<string, unknown>
    const menuId = menuItem.menu_id as string
    const existing = itemStats.get(menuId) || { 
      name: menuItem.name as string, 
      totalOrdered: 0, 
      revenue: 0, 
      totalPrice: 0,
      orderCount: 0
    }
    
    itemStats.set(menuId, {
      name: existing.name,
      totalOrdered: existing.totalOrdered + (item.quantity as number),
      revenue: existing.revenue + parseFloat(item.subtotal as string),
      totalPrice: existing.totalPrice + parseFloat(item.unit_price as string),
      orderCount: existing.orderCount + 1
    })
  })

  // Convert to array and sort by total ordered (descending)
  return Array.from(itemStats.entries())
    .map(([menu_id, stats]) => ({
      menu_id,
      name: stats.name,
      total_ordered: stats.totalOrdered,
      revenue: stats.revenue,
      avgPrice: stats.totalPrice / stats.orderCount
    }))
    .sort((a, b) => b.total_ordered - a.total_ordered)
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const businessEmail = searchParams.get('businessEmail')
    const days = parseInt(searchParams.get('days') || '30')

    // Default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Format dates for SQL
    const startDateStr = start.toISOString()
    const endDateStr = end.toISOString()

    const supabase = await createClient()

    // Get analytics data
    const [dailyRevenue, topMenuItems] = await Promise.all([
      getDailyRevenue(supabase, startDateStr, endDateStr, businessEmail || undefined),
      getMenuItemAnalytics(supabase, startDateStr, endDateStr, businessEmail || undefined)
    ])

    // Calculate totals
    const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0)
    const totalOrders = dailyRevenue.reduce((sum, day) => sum + day.orderCount, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const analyticsData: AnalyticsData = {
      dailyRevenue,
      topMenuItems,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString()
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get analytics for a specific date
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, businessEmail } = await request.json()
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get orders for specific date
    const startOfDay = new Date(date).toISOString().split('T')[0] + 'T00:00:00.000Z'
    const endOfDay = new Date(date).toISOString().split('T')[0] + 'T23:59:59.999Z'

    let orderQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items:order_item(
          *,
          menu_item(*)
        )
      `)
      .eq('status', 'done')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false })

    if (businessEmail) {
      orderQuery = orderQuery.eq('customer_email', businessEmail)
    }

    const { data: orders, error } = await orderQuery

    if (error) {
      console.error('Error fetching date-specific orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Calculate daily stats
    const totalRevenue = orders.reduce((sum: number, order: Record<string, unknown>) => sum + parseFloat(order.total_amount as string), 0)
    const orderCount = orders.length

    return NextResponse.json({
      date,
      orders,
      totalRevenue,
      orderCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
    })

  } catch (error) {
    console.error('Date-specific analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}