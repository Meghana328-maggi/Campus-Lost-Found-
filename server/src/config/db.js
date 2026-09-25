const mongoose = require('mongoose');

let retryTimer = null;

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Error] MONGO_URI is not configured in Render environment variables!');
      console.error('[Database Error] Please go to Render Dashboard > Environment and add MONGO_URI.');
    }
    mongoUri = 'mongodb://127.0.0.1:27017/campus_lost_found';
  }

  // If using MongoDB Atlas root URI without db name, append database name and options
  if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('.mongodb.net/')) {
    mongoUri = mongoUri.replace('.mongodb.net', '.mongodb.net/campus_lost_found?retryWrites=true&w=majority');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Do not crash the entire process so Express can serve health checks and provide meaningful responses
    console.log('[Database] Retrying connection in 5 seconds...');
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB();
      }, 5000);
    }
  }
};

module.exports = connectDB;
