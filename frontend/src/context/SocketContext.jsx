import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, isConnected: false };
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔍 SocketProvider: Checking auth status');
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 User:', user?.email);
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Token value:', token ? token.substring(0, 20) + '...' : 'null');

    if (!isAuthenticated || !user || !token) {
      console.log('❌ SocketProvider: Not authenticated, skipping connection');
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('✅ SocketProvider: Authenticated, creating socket connection');
    
    // Force disconnect any existing socket
    if (socket) {
      socket.disconnect();
    }

    const SOCKET_URL = 'http://localhost:5000';
    console.log('🔌 SocketProvider: Connecting to', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('✅✅✅ SocketProvider: CONNECTED! Socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌❌❌ SocketProvider: Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 SocketProvider: Disconnected, reason:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 SocketProvider: Cleaning up');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token, isAuthenticated]);

  console.log('📤 SocketProvider: Providing socket, connected:', isConnected);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};