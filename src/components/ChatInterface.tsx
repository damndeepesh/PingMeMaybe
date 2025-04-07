'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';

export default function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat();
  const { user, roomId } = useUser();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  if (!user || !roomId) {
    return null;
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-black rounded-lg shadow-xl overflow-hidden border border-gray-800">
      {/* Chat header */}
      <div className="bg-gray-900 p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Room: <span className="text-blue-400">{roomId}</span></h2>
        <p className="text-sm text-gray-400">Chatting as <span className="text-green-400 font-medium">{user.nickname}</span></p>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-black">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p className="text-gray-500 italic">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isCurrentUser = message.sender === user.nickname;
              // Use index as fallback if message.id is undefined
              const messageKey = message.id ? `message-${message.id}` : `message-index-${index}`;
              return (
                <div
                  key={messageKey}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-none border-l border-t border-blue-500'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none border-r border-t border-gray-700'}`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold mb-1 text-green-400">{message.sender}</p>
                    )}
                    
                    <p className="leading-relaxed">{message.content}</p>
                    
                    <p className="text-xs opacity-70 text-right mt-1 text-gray-300">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2 items-center">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}