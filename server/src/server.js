// Safely load environment variables from .env file if dotenv is available.
// In production (Render, Heroku, etc.), variables are supplied directly via platform environment variables.
try {
  const path = require('path');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  dotenv.config(); // Fallback to current working directory
} catch (err) {
  // Dotenv is optional in production where environment variables are injected into process.env
}
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocketIO } = require('./sockets/socketManager');
const { isOriginAllowed } = require('./config/corsOptions');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with cross-origin support
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for Socket.IO origin'));
      }
    },
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
