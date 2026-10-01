const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately before imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Core Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ArogyaBandhu Rural Health Platform API',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Connected',
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/health-records', require('./routes/healthRecordRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(` ArogyaBandhu API Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================`);
  });
}

startServer();

module.exports = app;
