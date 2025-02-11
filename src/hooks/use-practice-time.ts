import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface PracticeSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  sessionType: string;
}

interface PracticeStats {
  id: string;
  userId: string;
  totalDuration: number;
  weeklyDuration: number;
  lastWeekDuration: number;
  lastUpdated: Date;
}

interface UsePracticeTimeReturn {
  currentSession: PracticeSession | null;
  stats: PracticeStats | null;
  startSession: (sessionType: string) => void;
  endSession: () => void;
  isConnected: boolean;
  error: string | null;
}

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function usePracticeTime(): UsePracticeTimeReturn {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const connectSocket = () => {
      if (socket?.connected) return;

      console.log('Connecting to WebSocket server...');
      
      socket = io(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', {
        path: '/api/socket',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        auth: {
          userId: session.user.id
        }
      });

      function onConnect() {
        console.log('Socket connected:', socket?.id);
        setIsConnected(true);
        setError(null);
        reconnectAttempts = 0;

        // Start ping interval
        const pingInterval = setInterval(() => {
          if (socket?.connected) {
            socket.emit('ping');
          } else {
            clearInterval(pingInterval);
          }
        }, 5000);

        return () => clearInterval(pingInterval);
      }

      function onDisconnect(reason: string) {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          socket?.connect();
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
          setTimeout(connectSocket, 1000 * reconnectAttempts);
        } else {
          setError('Unable to connect to server after multiple attempts');
        }
      }

      function onConnectError(error: Error) {
        console.error('Socket connection error:', error);
        setError(`Connection error: ${error.message}`);
      }

      function onError(error: { message: string }) {
        console.error('Socket error:', error);
        setError(error.message);
      }

      function onSessionStarted(session: PracticeSession) {
        console.log('Session started:', session);
        setCurrentSession(session);
        setError(null);
      }

      function onSessionEnded({ session, stats }: { session: PracticeSession; stats: PracticeStats }) {
        console.log('Session ended:', session);
        setCurrentSession(null);
        setStats(stats);
        setError(null);
      }

      function onPong() {
        console.log('Received pong from server');
      }

      // Set up event listeners
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);
      socket.on('error', onError);
      socket.on('sessionStarted', onSessionStarted);
      socket.on('sessionEnded', onSessionEnded);
      socket.on('pong', onPong);

      // Connect if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Cleanup function
      return () => {
        socket?.off('connect', onConnect);
        socket?.off('disconnect', onDisconnect);
        socket?.off('connect_error', onConnectError);
        socket?.off('error', onError);
        socket?.off('sessionStarted', onSessionStarted);
        socket?.off('sessionEnded', onSessionEnded);
        socket?.off('pong', onPong);
        socket?.disconnect();
      };
    };

    const cleanup = connectSocket();
    return () => {
      cleanup?.();
      socket?.disconnect();
      socket = null;
    };
  }, [session?.user?.id]);

  const startSession = (sessionType: string) => {
    if (!socket?.connected || !session?.user?.id) {
      setError('Not connected to server');
      return;
    }

    console.log('Starting session:', { userId: session.user.id, sessionType });
    socket.emit('startSession', {
      userId: session.user.id,
      sessionType,
    });
  };

  const endSession = () => {
    if (!socket?.connected || !currentSession) {
      setError('No active session to end');
      return;
    }

    console.log('Ending session:', currentSession.id);
    socket.emit('endSession', {
      sessionId: currentSession.id,
    });
  };

  return {
    currentSession,
    stats,
    startSession,
    endSession,
    isConnected,
    error,
  };
}