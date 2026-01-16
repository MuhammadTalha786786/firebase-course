require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - simplified for serverless
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database connection with error handling
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    console.log('Creating new database connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = db;
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    env: {
      mongoConfigured: !!process.env.MONGODB_URI,
      jwtConfigured: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV || 'not set'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API endpoint is working'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({ 
      status: 'ok',
      message: 'Database connection successful',
      dbState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Load and use routes BEFORE the database middleware
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Connect to DB middleware (after routes are registered)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}