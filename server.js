const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  // Track online users by room
  const onlineUsers = new Map();

  // Track available rooms
  let availableRooms = [];

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    let userRoomId = null;
    let userInfo = null;
    
    // Join a room based on IP subnet
    socket.on('join-room', ({ roomId, nickname, ipAddress }) => {
      // Store user's room for later reference
      userRoomId = roomId;
      userInfo = { nickname, ipAddress };
      
      // Add user to room
      socket.join(roomId);
      console.log(`User ${nickname} joined room ${roomId}`);
      
      // Add to online users for this room
      if (!onlineUsers.has(roomId)) {
        onlineUsers.set(roomId, new Map());
      }
      onlineUsers.get(roomId).set(socket.id, { nickname, ipAddress });
      
      // Add room to available rooms if not already there
      if (!availableRooms.includes(roomId)) {
        availableRooms.push(roomId);
        // Broadcast room update to all connected clients
        io.emit('rooms-updated', availableRooms);
      }
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', { nickname, ipAddress });
    });

    // Handle request for online users
    socket.on('get-online-users', ({ roomId }) => {
      if (onlineUsers.has(roomId)) {
        const users = Array.from(onlineUsers.get(roomId).values());
        socket.emit('online-users', users);
      } else {
        socket.emit('online-users', []);
      }
    });
    
    // Handle request for available rooms
    socket.on('get-available-rooms', () => {
      socket.emit('rooms-updated', availableRooms);
    });

    // Handle chat messages
    socket.on('send-message', async (messageData) => {
      const { roomId, sender, content } = messageData;
      
      // Broadcast to everyone in the room
      io.to(roomId).emit('new-message', messageData);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      
      // Remove user from online users and notify others
      if (userRoomId && onlineUsers.has(userRoomId)) {
        const roomUsers = onlineUsers.get(userRoomId);
        roomUsers.delete(socket.id);
        
        // Notify others that user has left
        if (userInfo) {
          socket.to(userRoomId).emit('user-left', { ipAddress: userInfo.ipAddress });
        }
        
        // Clean up empty rooms
        if (roomUsers.size === 0) {
          onlineUsers.delete(userRoomId);
        }
      }
    });
  });

  // Get network interfaces to find the local IP address
  const { networkInterfaces } = require('os');
  
  // Function to get all local IP addresses
  const getLocalIpAddresses = () => {
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (loopback) addresses
        if (net.family === 'IPv4' && !net.internal) {
          results.push({
            name: name,
            address: net.address
          });
        }
      }
    }
    
    return results.length > 0 ? results : [{ name: 'localhost', address: '127.0.0.1' }];
  };

  const localIps = getLocalIpAddresses();
  
  // Ensure server listens on all network interfaces
  server.listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
    console.log('> Network access available at:');
    localIps.forEach(ip => {
      console.log(`  - http://${ip.address}:3000 (${ip.name})`);
    });
    console.log('> Make sure your firewall allows connections on port 3000');
  });


});