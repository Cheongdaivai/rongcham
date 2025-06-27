import { NextRequest, NextResponse } from 'next/server'
import { createOrderServer, getAllOrdersServer, updateOrderStatusServer } from '@/lib/database-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const businessEmail = searchParams.get('businessEmail')
    
    const orders = await getAllOrdersServer(date || undefined, businessEmail || undefined)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items, customerNote, businessEmail } = await request.json()
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }

    if (!businessEmail) {
      return NextResponse.json({ error: 'Business email is required to identify which business the order belongs to' }, { status: 400 })
    }

    // Convert items to the format expected by createOrder
    const orderItems = items.map((item: any) => ({
      menu_id: item.menu_id || item.id,
      quantity: item.quantity
    }))

    const order = await createOrderServer(orderItems, customerNote, businessEmail)
    
    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
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
