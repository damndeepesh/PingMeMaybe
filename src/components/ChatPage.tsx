'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';
import UserRegistration from './UserRegistration';
import ChatInterface from './ChatInterface';
import OnlineUsers from './OnlineUsers';

export default function ChatPage() {
  const { user, roomId, isLoading } = useUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show registration form if user is not registered
  if (!user || !roomId) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-black">
        <UserRegistration />
      </div>
    );
  }

  // Show chat interface if user is registered
  return (
    <div className="container mx-auto p-4 min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400 tracking-tight">LAN Chat</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Online users sidebar */}
        <div className="lg:col-span-1">
          <OnlineUsers />
        </div>
        
        {/* Chat interface */}
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}