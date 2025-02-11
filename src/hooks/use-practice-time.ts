import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface PracticeSession {
  id: string;
  userId: string;
  sessionType: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

interface PracticeStats {
  id: string;
  userId: string;
  totalDuration: number;
  weeklyDuration: number;
  lastWeekDuration: number;
  lastUpdated: Date;
}

interface UseSessionTimeReturn {
  startSession: (sessionType: string) => void;
  endSession: () => void;
  isConnected: boolean;
  isSessionActive: boolean;
  currentSession: PracticeSession | null;
  practiceStats: PracticeStats | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
}

export function usePracticeTime(): UseSessionTimeReturn {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPingTime = useRef<number>(0);
  const pingTimeout = useRef<NodeJS.Timeout | null>(null);

  const initializeSocket = useCallback(() => {
    if (!session?.user?.id) return;

    try {
      if (socketRef.current?.connected) {
        console.log('Socket already connected');
        return;
      }

      setConnectionStatus('connecting');
      setError(null);

      socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', {
        path: '/api/socket',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay,
        timeout: 10000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        startPingInterval();
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        clearPingInterval();
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, attempt to reconnect
          socketRef.current?.connect();
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionStatus('error');
        setError(`Connection error: ${error.message}`);
        handleReconnect();
      });

      socketRef.current.on('error', (error: any) => {
        console.error('Socket error:', error);
        setError(`Socket error: ${error.message}`);
      });

      socketRef.current.on('sessionStarted', (session: PracticeSession) => {
        setCurrentSession(session);
        setIsSessionActive(true);
        setError(null);
      });

      socketRef.current.on('sessionEnded', ({ session, stats }: { session: PracticeSession; stats: PracticeStats }) => {
        setCurrentSession(session);
        setPracticeStats(stats);
        setIsSessionActive(false);
        setError(null);
      });

      socketRef.current.on('pong', () => {
        lastPingTime.current = Date.now();
        if (pingTimeout.current) {
          clearTimeout(pingTimeout.current);
        }
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
      setConnectionStatus('error');
      setError(`Failed to initialize socket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      handleReconnect();
    }
  }, [session?.user?.id]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setError('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }

    reconnectAttempts.current += 1;
    console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
    
    setTimeout(() => {
      initializeSocket();
    }, reconnectDelay * reconnectAttempts.current);
  }, [initializeSocket]);

  const startPingInterval = useCallback(() => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }

    pingInterval.current = setInterval(() => {
      if (!socketRef.current?.connected) return;

      socketRef.current.emit('ping');
      lastPingTime.current = Date.now();

      // Set timeout for pong response
      if (pingTimeout.current) {
        clearTimeout(pingTimeout.current);
      }
      pingTimeout.current = setTimeout(() => {
        console.log('Ping timeout - no pong received');
        socketRef.current?.disconnect();
        handleReconnect();
      }, 5000); // 5 second timeout for pong response
    }, 25000); // Ping every 25 seconds
  }, [handleReconnect]);

  const clearPingInterval = useCallback(() => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
    if (pingTimeout.current) {
      clearTimeout(pingTimeout.current);
      pingTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    initializeSocket();

    return () => {
      clearPingInterval();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket, clearPingInterval]);

  const startSession = useCallback((sessionType: string) => {
    if (!socketRef.current?.connected || !session?.user?.id) {
      setError('Not connected to server');
      return;
    }

    try {
      socketRef.current.emit('startSession', {
        userId: session.user.id,
        sessionType,
      });
    } catch (error) {
      console.error('Error starting session:', error);
      setError(`Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [session?.user?.id]);

  const endSession = useCallback(() => {
    if (!socketRef.current?.connected || !currentSession?.id) {
      setError('Not connected to server or no active session');
      return;
    }

    try {
      socketRef.current.emit('endSession', {
        sessionId: currentSession.id,
      });
    } catch (error) {
      console.error('Error ending session:', error);
      setError(`Failed to end session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentSession?.id]);

  return {
    startSession,
    endSession,
    isConnected,
    isSessionActive,
    currentSession,
    practiceStats,
    connectionStatus,
    error,
  };
}