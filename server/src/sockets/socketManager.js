const jwt = require('jsonwebtoken');

const onlineUsers = new Map(); // userId -> Set of socketIds

const initSocketIO = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'campus_lost_found_dev_jwt_secret_key_3847294829348923'
        );
        socket.userId = decoded.id;
        return next();
      } catch (err) {
        console.warn('[Socket.IO Auth]: Invalid token provided by client.');
      }
    }
    // Allow connection as guest if no token, but restricted
    socket.userId = null;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    if (userId) {
      // Add socket to online user tracking
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Join personal room for notifications & direct messages
      socket.join(userId.toString());

      // Broadcast user online status
      io.emit('user_status_changed', { userId, status: 'online' });
      // Send currently online user list to newly connected client
      socket.emit('online_users_list', Array.from(onlineUsers.keys()));
    }

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    // Real-time typing indicators
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
      });
      if (receiverId) {
        socket.to(receiverId.toString()).emit('user_typing', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      socket.to(`conv_${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId,
      });
      if (receiverId) {
        socket.to(receiverId.toString()).emit('user_stop_typing', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
};

module.exports = {
  initSocketIO,
  onlineUsers,
};
