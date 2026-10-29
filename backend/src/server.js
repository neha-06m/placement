const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start HTTP listener
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[PlaceMate Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[PlaceMate Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('[PlaceMate Server] Failed to connect to MongoDB on startup:', err.message);
    // Allow server to run with warning so frontend can connect and see connection status
    app.listen(PORT, () => {
      console.log(`[PlaceMate Server] Started with database warning on port ${PORT}`);
    });
  });
