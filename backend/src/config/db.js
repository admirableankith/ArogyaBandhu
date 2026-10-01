const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/arogyabandhu';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
