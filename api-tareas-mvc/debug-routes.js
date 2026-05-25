import app from './src/app.js';
import googleAuthRoutes from './src/routes/googleAuth.routes.js';

console.log('=== DEBUG ROUTES ===');
console.log('App router stack:');
app._router.stack.forEach((middleware, i) => {
  if (middleware.route) {
    console.log(`${i}: Route ${middleware.route.path} - ${JSON.stringify(middleware.route.methods)}`);
  } else if (middleware.name === 'router') {
    console.log(`${i}: Router middleware - ${middleware.regexp}`);
    // Check sub-routes
    if (middleware.handle.stack) {
      middleware.handle.stack.forEach((subMiddleware, j) => {
        if (subMiddleware.route) {
          console.log(`  ${i}.${j}: Sub-route ${subMiddleware.route.path} - ${JSON.stringify(subMiddleware.route.methods)}`);
        }
      });
    }
  } else {
    console.log(`${i}: Other middleware - ${middleware.name || 'unnamed'}`);
  }
});

// Test specific route
console.log('\n=== TESTING GOOGLE AUTH ROUTE ===');
try {
  console.log('Google auth routes loaded successfully');
  console.log('Route stack:', googleAuthRoutes.stack.map(r => r.route?.path || 'N/A'));
} catch (e) {
  console.error('Error testing google auth routes:', e.message);
}
