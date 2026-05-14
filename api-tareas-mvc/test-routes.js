const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const googleAuthRoutes = require('./src/routes/googleAuth.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Test the routes
  console.log('\n=== Testing Google Auth Routes ===');
  
  // Simulate a request to /api/auth/google/login
  const mockReq = { method: 'GET', url: '/api/auth/google/login' };
  console.log('Mock request to:', mockReq.url);
  
  // Check if routes are properly mounted
  app._router.stack.forEach((middleware, i) => {
    if (middleware.route) {
      console.log(`Route ${i}: ${middleware.route.path} - ${JSON.stringify(middleware.route.methods)}`);
    } else if (middleware.name === 'router') {
      console.log(`Router ${i}: ${middleware.regexp}`);
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((subMiddleware, j) => {
          if (subMiddleware.route) {
            console.log(`  Sub-route ${i}.${j}: ${subMiddleware.route.path} - ${JSON.stringify(subMiddleware.route.methods)}`);
          }
        });
      }
    }
  });
});
