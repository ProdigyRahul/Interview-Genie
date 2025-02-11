import type { Server as NetServer } from 'http';
import type { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '@/lib/prisma';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | null = null;

export const initSocket = (server: any) => {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      pingInterval: 10000, // Send ping every 10 seconds
      pingTimeout: 5000,   // Wait 5 seconds for pong response
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
    });

    io.on('connection', async (socket) => {
      console.log('Client connected:', socket.id);

      // Verify user session on connection
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        console.error('No userId provided in socket connection');
        socket.disconnect();
        return;
      }

      socket.on('startSession', async ({ userId, sessionType }) => {
        try {
          console.log(`Starting ${sessionType} session for user ${userId}`);
          
          // Create new practice session
          const session = await prisma.practiceSession.create({
            data: {
              userId,
              sessionType,
              startTime: new Date(),
            },
          });

          console.log('Session created:', session.id);
          socket.emit('sessionStarted', session);
        } catch (error) {
          console.error('Error starting session:', error);
          socket.emit('error', { message: 'Failed to start session' });
        }
      });

      socket.on('endSession', async ({ sessionId }) => {
        try {
          console.log(`Ending session ${sessionId}`);
          
          const endTime = new Date();
          
          // Get existing session
          const existingSession = await prisma.practiceSession.findUnique({
            where: { id: sessionId },
            select: { startTime: true, userId: true }
          });

          if (!existingSession) {
            throw new Error('Session not found');
          }

          // Calculate duration in seconds
          const durationInSeconds = Math.round(
            (endTime.getTime() - existingSession.startTime.getTime()) / 1000
          );

          console.log(`Session duration: ${durationInSeconds} seconds`);

          // Update session with end time and duration
          const session = await prisma.practiceSession.update({
            where: { id: sessionId },
            data: { 
              endTime,
              duration: durationInSeconds
            },
          });

          // Update practice stats
          const userId = existingSession.userId;
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(now.getDate() - now.getDay()); // Start of current week

          const stats = await prisma.practiceStats.upsert({
            where: { userId },
            create: {
              userId,
              totalDuration: durationInSeconds,
              weeklyDuration: durationInSeconds,
              lastWeekDuration: 0,
              lastUpdated: now,
            },
            update: {
              totalDuration: {
                increment: durationInSeconds
              },
              weeklyDuration: {
                increment: durationInSeconds
              },
              lastUpdated: now,
            },
          });

          console.log('Practice stats updated:', {
            totalDuration: stats.totalDuration,
            weeklyDuration: stats.weeklyDuration
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

      // Handle ping/pong to keep connection alive
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    // Log all Socket.IO events for debugging
    io.engine.on('connection_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });

    io.engine.on('headers', (_headers, _req) => {
      console.log('Socket.IO handshake headers:', _headers);
    });
  }

  return io;
}; 