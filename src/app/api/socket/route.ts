import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer } from 'ws';
import { prisma } from '@/lib/prisma';

interface ExtendedIncomingMessage extends IncomingMessage {
  _query: Record<string, string>;
  res?: ServerResponse<IncomingMessage>;
  cleanup?: () => void;
  websocket?: any;
}

let io: Server;

type MessageHandler = (message: any) => void;

interface WebSocketConnection {
  socket: WebSocket;
  handlers: Map<string, MessageHandler>;
}

export async function GET(req: NextRequest) {
  try {
    if (!io) {
      // Create HTTP server
      const httpServer = createServer();
      
      // Create WebSocket server for upgrade handling
      new WebSocketServer({ 
        server: httpServer,
        path: '/api/socket'
      });

      // Initialize Socket.IO
      io = new Server(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        transports: ['websocket'],
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true
        },
      });

      // Handle Socket.IO events
      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('startSession', async ({ userId, sessionType }) => {
          try {
            const session = await prisma.practiceSession.create({
              data: {
                userId,
                sessionType,
                startTime: new Date(),
              },
            });
            socket.emit('sessionStarted', session);
          } catch (error) {
            console.error('Error starting session:', error);
            socket.emit('error', { message: 'Failed to start session' });
          }
        });

        socket.on('endSession', async ({ sessionId }) => {
          try {
            const endTime = new Date();
            const existingSession = await prisma.practiceSession.findUnique({
              where: { id: sessionId },
              select: { startTime: true }
            });

            if (!existingSession) {
              throw new Error('Session not found');
            }

            const session = await prisma.practiceSession.update({
              where: { id: sessionId },
              data: { 
                endTime,
                duration: {
                  set: (endTime.getTime() - existingSession.startTime.getTime()) / 1000
                }
              },
            });

            // Update practice stats
            const userId = session.userId;
            const now = new Date();
            
            const stats = await prisma.practiceStats.upsert({
              where: { userId },
              create: {
                userId,
                totalDuration: session.duration || 0,
                weeklyDuration: session.duration || 0,
                lastWeekDuration: 0,
                lastUpdated: now,
              },
              update: {
                totalDuration: {
                  increment: session.duration || 0
                },
                weeklyDuration: {
                  increment: session.duration || 0
                },
                lastUpdated: now,
              },
            });

            socket.emit('sessionEnded', { session, stats });
          } catch (error) {
            console.error('Error ending session:', error);
            socket.emit('error', { message: 'Failed to end session' });
          }
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      // Start the server
      httpServer.listen(0);
    }

    // Handle WebSocket upgrade
    const upgrade = req.headers.get('upgrade');
    if (upgrade?.toLowerCase() === 'websocket') {
      const { socket: ws } = req as any;
      if (ws) {
        const reqAsIncoming = new IncomingMessage(ws) as ExtendedIncomingMessage;
        Object.assign(reqAsIncoming, {
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
          method: req.method,
          _query: Object.fromEntries(new URL(req.url).searchParams.entries()),
        });
        
        io.engine.handleUpgrade(reqAsIncoming, ws, Buffer.from([]));
        return new Response(null, { status: 101 });
      }
    }

    return new Response('WebSocket connection required', { status: 426 });
  } catch (error) {
    console.error('WebSocket error:', error);
    return new Response('WebSocket connection failed', { status: 500 });
  }
} 