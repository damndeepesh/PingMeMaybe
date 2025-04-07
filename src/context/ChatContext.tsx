'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';

type Message = {
  id: number;
  roomId: string;
  sender: string;
  content: string;
  type: string; // "text"
  timestamp: string;
};

type ChatContextType = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
};

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isLoading: false,
  error: null,
  sendMessage: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user, roomId } = useUser();

  // Fetch message history when room changes
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/messages?roomId=${roomId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch messages');
        }

        setMessages(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Check if this message was sent by the current user (to avoid duplicates)
      // We compare by content, sender, and timestamp to identify duplicates
      setMessages((prevMessages) => {
        // Check if message already exists in the state
        const messageExists = prevMessages.some(
          (msg) => 
            msg.sender === message.sender && 
            msg.content === message.content && 
            Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
        );
        
        // Only add the message if it doesn't already exist
        return messageExists ? prevMessages : [...prevMessages, message];
      });
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  // Send a text message
  const sendMessage = (content: string) => {
    if (!socket || !user || !roomId || !content.trim()) return;

    const timestamp = new Date().toISOString();
    const tempId = Date.now(); // Temporary ID until we get the real one from the database
    const newMessage = {
      id: tempId,
      roomId,
      sender: user.nickname,
      content,
      type: 'text',
      timestamp,
    };

    // Add message to local state immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Emit to socket
    socket.emit('send-message', {
      roomId,
      sender: user.nickname,
      content,
      type: 'text',
      timestamp,
    });

    // Also save to database via API
    fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        sender: user.nickname,
        content,
        type: 'text',
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.message) {
        // Replace the temporary message with the one from the database
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempId ? data.message : msg
          )
        );
      }
    })
    .catch((err) => {
      console.error('Error saving message:', err);
      // Even if there's an error, ensure the message still has a valid ID
      // This prevents the 'message-undefined' key error
    });
  };



  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};