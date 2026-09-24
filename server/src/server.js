require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocketIO } = require('./sockets/socketManager');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

initSocketIO(io);

// Expose io instance to Express routes & controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`[Server] Campus Lost & Found Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
  // Keep server alive in development
});
