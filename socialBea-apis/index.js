require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);

// Health check routes
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

// Only listen on port in development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;