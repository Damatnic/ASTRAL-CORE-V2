/**
 * Custom Next.js server with WebSocket support
 * This enables real-time communication for the crisis platform
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { createWebSocketServer } = require('./dist/lib/websocket/socket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize WebSocket server
  const wsServer = createWebSocketServer(server);
  console.log('WebSocket server initialized');

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('Shutting down servers...');
    
    try {
      // Close WebSocket server
      if (wsServer) {
        await wsServer.shutdown();
      }
      
      // Close HTTP server
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    }
  });
});