'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';

export default function UserRegistration() {
  const { setNickname, isLoading, error, availableRooms } = useUser();
  const [nickname, setNicknameInput] = useState('');
  const [roomSelection, setRoomSelection] = useState('existing');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      // If creating a new room, use the new room name
      // Otherwise, use the selected existing room
      const roomId = roomSelection === 'new' 
        ? newRoomName.trim() 
        : selectedRoom;
      
      await setNickname(nickname.trim(), roomId);
    }
  };
  
  // Set the first available room as default when rooms are loaded
  React.useEffect(() => {
    if (availableRooms.length > 0 && !selectedRoom) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [availableRooms, selectedRoom]);

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-black rounded-lg shadow-xl border border-gray-800">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">Join LAN Chat</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1 text-gray-300">
            Your Nickname
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Enter a nickname"
            className="w-full p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-500 transition-all duration-200"
            disabled={isLoading}
            required
          />
        </div>
        
        {/* Room Selection */}
        <div className="space-y-3">
          <div className="flex space-x-4">
            <label className="flex items-center text-gray-300">
              <input
                type="radio"
                name="roomSelection"
                value="existing"
                checked={roomSelection === 'existing'}
                onChange={() => setRoomSelection('existing')}
                className="mr-2"
                disabled={isLoading || availableRooms.length === 0}
              />
              Join Existing Room
            </label>
            
            <label className="flex items-center text-gray-300">
              <input
                type="radio"
                name="roomSelection"
                value="new"
                checked={roomSelection === 'new'}
                onChange={() => setRoomSelection('new')}
                className="mr-2"
                disabled={isLoading}
              />
              Create New Room
            </label>
          </div>
          
          {roomSelection === 'existing' ? (
            <div>
              <label htmlFor="room" className="block text-sm font-medium mb-1 text-gray-300">
                Select Room
              </label>
              <select
                id="room"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white transition-all duration-200"
                disabled={isLoading || availableRooms.length === 0}
                required
              >
                {availableRooms.length === 0 ? (
                  <option value="">No rooms available</option>
                ) : (
                  availableRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="newRoom" className="block text-sm font-medium mb-1 text-gray-300">
                New Room Name
              </label>
              <input
                type="text"
                id="newRoom"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter a room name"
                className="w-full p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
                required={roomSelection === 'new'}
              />
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !nickname.trim() || (roomSelection === 'new' && !newRoomName.trim()) || (roomSelection === 'existing' && !selectedRoom)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {isLoading ? 'Joining...' : 'Join Chat'}
        </button>
      </form>
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        Your IP address will be used to connect you with others on the same network.
      </p>
    </div>
  );
}