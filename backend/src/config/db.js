const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placemate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[PlaceMate DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[PlaceMate DB] Could not connect to primary MongoDB (${uri}): ${primaryError.message}`);

    // In development mode, auto-start the real embedded MongoDB 8.2.6 engine if no external database is running
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[PlaceMate DB] Starting real local MongoDB engine (v8.2.6)...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'placemate'
          }
        });
        const fallbackUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[PlaceMate DB] Embedded Real MongoDB Active: ${conn.connection.host}/${conn.connection.name}`);
        console.log('[PlaceMate DB] Ready for queries, indexing, and user persistence.');
        return conn;
      } catch (fallbackError) {
        console.error(`[PlaceMate DB] Failed to start local MongoDB engine: ${fallbackError.message}`);
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error('[PlaceMate DB] Please check MONGODB_URI in backend/.env or start your local MongoDB daemon.');
      process.exit(1);
    }
    throw primaryError;
  }
};

module.exports = connectDB;
