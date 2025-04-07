'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useUser } from '@/context/UserContext';

type OnlineUser = {
  nickname: string;
  ipAddress: string;
};

export default function OnlineUsers() {
  const { socket } = useSocket();
  const { user, roomId } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Request current online users when joining
    socket.emit('get-online-users', { roomId });

    // Listen for online users list
    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    // Listen for new user joining
    const handleUserJoined = (newUser: OnlineUser) => {
      setOnlineUsers((prev) => {
        // Check if user already exists
        if (prev.some((u) => u.ipAddress === newUser.ipAddress)) {
          return prev;
        }
        return [...prev, newUser];
      });
    };

    // Listen for user leaving
    const handleUserLeft = (leftUser: { ipAddress: string }) => {
      setOnlineUsers((prev) => 
        prev.filter((u) => u.ipAddress !== leftUser.ipAddress)
      );
    };

    socket.on('online-users', handleOnlineUsers);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('online-users', handleOnlineUsers);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, roomId]);

  if (!user || !roomId) {
    return null;
  }

  return (
    <div className="bg-black rounded-lg shadow-xl overflow-hidden border border-gray-800">
      <div className="bg-gray-900 p-3 border-b border-gray-800">
        <h3 className="font-semibold text-white">Online Users</h3>
      </div>
      <div className="p-4 bg-black">
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No other users online</p>
        ) : (
          <ul className="space-y-3">
            {onlineUsers.map((onlineUser) => (
              <li 
                key={onlineUser.ipAddress}
                className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-900"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  {onlineUser.nickname}
                  {onlineUser.ipAddress === user.ipAddress ? 
                    <span className="ml-1 text-blue-400 font-medium">(You)</span> : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}