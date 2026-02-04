const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/error.middleware');
const { apiRateLimiter } = require('./middleware/rate-limit.middleware');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting for all API routes
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
const authRoutes = require('./routes/auth.routes');
const foodItemsRoutes = require('./routes/food-items.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const documentsRoutes = require('./routes/documents.routes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/food-items', foodItemsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;
