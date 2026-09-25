/**
 * Centralized CORS configuration for Express and Socket.IO
 * Supports Vercel production & preview domains, Render backend, and local development.
 */

const defaultAllowedOrigins = [
  'https://campus-lost-found.vercel.app',
  'https://campus-lost-and-found-server.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

/**
 * Checks if an incoming request origin is permitted
 * @param {string|undefined} origin 
 * @returns {boolean}
 */
const isOriginAllowed = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
  if (!origin) return true;

  // Normalize origin by removing any trailing slash
  const cleanOrigin = origin.replace(/\/+$/, '');

  // Extract custom origins from CLIENT_URL (supports comma-separated list)
  const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const allAllowed = [...defaultAllowedOrigins, ...envOrigins];

  // Direct match
  if (allAllowed.includes(cleanOrigin)) {
    return true;
  }

  // Allow all Vercel deployment and preview subdomains (*.vercel.app)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(cleanOrigin)) {
    return true;
  }

  // Allow Render services (*.onrender.com)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*onrender\.com$/.test(cleanOrigin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

module.exports = {
  isOriginAllowed,
  corsOptions,
};
