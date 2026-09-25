const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Database Error] MONGO_URI (or MONGODB_URI) is not configured in Render environment variables!');
        console.error('[Database Error] Please go to your Render Dashboard > Environment and add MONGO_URI with your MongoDB Atlas connection string.');
        process.exit(1);
      }
      mongoUri = 'mongodb://127.0.0.1:27017/campus_lost_found';
    }

    // If using MongoDB Atlas root URI without db name, append database name and options
    if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('.mongodb.net/')) {
      mongoUri = mongoUri.replace('.mongodb.net', '.mongodb.net/campus_lost_found?retryWrites=true&w=majority');
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
