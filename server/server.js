require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// ALLOWED_ORIGINS env theke comma-separated list read kore array banano hocche
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173', // Customer frontend
        'http://localhost:5174'  // Admin dashboard
      ];

// Express app ke HTTP server e wrap kore socket.io init kortesi
const server = http.createServer(app);
initSocket(server, allowedOrigins);

server.listen(PORT, () => {
    console.log(`✅ Sandreens API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Allowed Origins: ${allowedOrigins.join(', ')}`);
});