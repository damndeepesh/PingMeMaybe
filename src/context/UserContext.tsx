'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

type User = {
  id: number;
  nickname: string;
  ipAddress: string;
};

type UserContextType = {
  user: User | null;
  roomId: string | null;
  isLoading: boolean;
  error: string | null;
  setNickname: (nickname: string, customRoomId?: string) => Promise<void>;
  availableRooms: string[];
};

const UserContext = createContext<UserContextType>({
  user: null,
  roomId: null,
  isLoading: true,
  error: null,
  setNickname: async () => {},
  availableRooms: [],
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const { socket } = useSocket();
  
  // Initialize loading state and fetch available rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (data.success) {
          setAvailableRooms(data.rooms);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        // Set loading to false after initialization
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, []);
  
  // Listen for room updates via socket
  useEffect(() => {
    if (!socket) return;
    
    // Request available rooms when socket connects
    socket.emit('get-available-rooms');
    
    // Listen for room updates
    const handleRoomsUpdated = (rooms: string[]) => {
      setAvailableRooms(rooms);
    };
    
    socket.on('rooms-updated', handleRoomsUpdated);
    
    return () => {
      socket.off('rooms-updated', handleRoomsUpdated);
    };
  }, [socket]);

  const setNickname = async (nickname: string, customRoomId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, customRoomId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to set nickname');
      }

      setUser(data.user);
      setRoomId(data.roomId);
      
      // If creating a new room, register it with the API
      if (customRoomId && data.roomId) {
        try {
          // Register the new room with the API
          await fetch('/api/rooms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId: data.roomId }),
          });
          
          // The socket event in the server will handle broadcasting to all clients
        } catch (roomErr) {
          console.error('Error registering new room:', roomErr);
        }
      }

      // Join the room via socket
      if (socket && data.roomId) {
        socket.emit('join-room', {
          roomId: data.roomId,
          nickname: data.user.nickname,
          ipAddress: data.ipAddress,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error setting nickname:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        roomId,
        isLoading,
        error,
        setNickname,
        availableRooms,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};