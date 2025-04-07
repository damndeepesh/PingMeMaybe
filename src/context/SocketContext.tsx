'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    // Use window.location to dynamically determine the host
    // This ensures it works both locally and on the network
    const host = window.location.hostname;
    // If hostname is localhost or 127.0.0.1 and we're not in development,
    // try to use the local network IP instead
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const port = window.location.port || '3000';
    const socketUrl = `http://${host}:${port}`;
    
    console.log('Connecting to socket at:', socketUrl);
    
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};