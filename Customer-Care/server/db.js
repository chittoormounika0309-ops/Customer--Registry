const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure mock database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const mockFiles = {
  User: path.join(DATA_DIR, 'users.json'),
  Complaint: path.join(DATA_DIR, 'complaints.json'),
  Message: path.join(DATA_DIR, 'messages.json'),
};

// Initialize empty mock DB files if they don't exist
Object.entries(mockFiles).forEach(([name, filePath]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
});

// JSON DB Helper functions
const jsonDb = {
  read: (modelName) => {
    try {
      const data = fs.readFileSync(mockFiles[modelName], 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  },
  write: (modelName, data) => {
    try {
      fs.writeFileSync(mockFiles[modelName], JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing mock ${modelName}:`, e);
    }
  }
};

// Connect to MongoDB
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer-care';
  console.log(`Connecting to MongoDB at: ${mongoURI}`);
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI);
    isConnected = true;
    console.log('MongoDB database connected successfully.');
  } catch (err) {
    console.warn('\n⚠️  MongoDB connection failed! Falling back to local JSON file-based database. ⚠️');
    console.warn(`Error detail: ${err.message}\n`);
    isConnected = false;
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  jsonDb,
};
