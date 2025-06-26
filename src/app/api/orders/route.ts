import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { Order } from '@/types';

// In a real app, you would use a database
let orders: Order[] = [];

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

export async function POST(request: NextRequest) {
  try {
    const { items, total } = await request.json();
    
    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      total,
      status: 'pending',
      createdAt: new Date(),
    };
    
    orders.push(newOrder);
    
    // Emit to chef dashboard via WebSocket
    const res = NextResponse.json({ success: true, order: newOrder });
    
    // Get socket.io instance and emit new order
    const server = (global as any).server as SocketServer;
    if (server?.io) {
      server.io.emit('newOrder', newOrder);
    }
    
    return res;
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ orders });
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();
    
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    orders[orderIndex].status = status;
    
    // Emit status update via WebSocket
    const server = (global as any).server as SocketServer;
    if (server?.io) {
      server.io.emit('orderStatusUpdate', { orderId, status });
    }
    
    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
