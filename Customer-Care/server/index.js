require('dotenv').config();
const app = require('./server');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
const startServer = async () => {
  // Connect to MongoDB in background (will automatically fallback to JSON-db if it fails)
  connectDB();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`💻 API URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
};

startServer();
