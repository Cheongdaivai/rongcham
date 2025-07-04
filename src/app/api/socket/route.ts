import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer, createServer } from 'http';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

export async function GET() {
  const server = (global as Record<string, unknown>).server as SocketServer;
  
  if (!server?.io) {
    console.log('Initializing Socket.IO server...');
    const httpServer = createServer();
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Store the io instance globally
    (global as Record<string, unknown>).server = httpServer;
    ((global as Record<string, unknown>).server as SocketServer).io = io;
    
    // Start the server on port 3001 for WebSocket
    httpServer.listen(3001, () => {
      console.log('Socket.IO server running on port 3001');
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
