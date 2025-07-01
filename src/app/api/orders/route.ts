import { NextRequest, NextResponse } from 'next/server'
import { createOrderServer, getAllOrdersServer, updateOrderStatusServer } from '@/lib/database-server'

export async function GET() {
  try {
    const orders = await getAllOrdersServer()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items, customerNote } = await request.json()
    
    console.log('Received order request:', { items, customerNote })
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items:', items)
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }

    // Convert items to the format expected by createOrder
    const orderItems = items.map((item: any) => ({
      menu_id: item.menu_id || item.id,
      quantity: item.quantity
    }))

    console.log('Converted order items:', orderItems)

    const order = await createOrderServer(orderItems, customerNote)
    
    console.log('Created order result:', order)
    
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
