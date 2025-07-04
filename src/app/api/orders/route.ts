import { NextRequest, NextResponse } from 'next/server'
import { createOrderServer, getAllOrdersServer, updateOrderStatusServer } from '@/lib/database-server'
import { getServerUser } from '@/lib/auth-server'

export async function GET() {
  try {
    // The RLS policies will automatically filter orders to the authenticated user
    const orders = await getAllOrdersServer()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for creating orders
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, customerNote } = await request.json()
    
    console.log('Received order request:', { items, customerNote })
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items:', items)
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }
    const CustomerEmail = user.email

    if (!CustomerEmail) {
      return NextResponse.json({ error: 'Business email is required to identify which business the order belongs to' }, { status: 400 })
    }

    // Convert items to the format expected by createOrder
    const orderItems = items
      .map((item: { menu_id?: string; id?: string; quantity: number }) => ({
        menu_id: item.menu_id || item.id,
        quantity: item.quantity
      }))
      .filter((item): item is { menu_id: string; quantity: number } => !!item.menu_id)

    console.log('Converted order items:', orderItems)

    const order = await createOrderServer(orderItems, customerNote, CustomerEmail)
    
    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication for updating orders
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const updatedOrder = await updateOrderStatusServer(parseInt(orderId), status)
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
