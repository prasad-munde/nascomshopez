const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopez_trading';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[MongoDB Warning] Primary connection failed on ${primaryUri}: ${primaryError.message}`);

    // If 127.0.0.1 failed, try localhost (or vice versa for IPv4 / IPv6 fallback)
    let fallbackUri = null;
    if (primaryUri.includes('127.0.0.1')) {
      fallbackUri = primaryUri.replace('127.0.0.1', 'localhost');
    } else if (primaryUri.includes('localhost')) {
      fallbackUri = primaryUri.replace('localhost', '127.0.0.1');
    }

    if (fallbackUri) {
      try {
        console.log(`[MongoDB] Attempting fallback connection to: ${fallbackUri}`);
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[MongoDB] Connected successfully via fallback: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (fallbackError) {
        console.error(`[MongoDB Fallback Failed]: ${fallbackError.message}`);
      }
    }

    console.error(`\n[MongoDB Connection Error] Could not connect to MongoDB server.`);
    console.error(`Please ensure your MongoDB service is running (e.g., 'net start MongoDB' or check MongoDB Atlas in .env).`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});

module.exports = connectDB;
