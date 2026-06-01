require('dotenv').config(); // Loads your .env settings
require('dns').setServers(['8.8.8.8', '1.1.1.1']); // 🚨 FIXES ETIMEOUT: Forces Node to use Google/Cloudflare DNS directly

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Loads your database connection
const authRoutes = require('./routes/auth');

// 👇 1. ADD THE CORE NETWORKING MODULES FOR SOCKET.IO 👇
const http = require('http');
const { Server } = require('socket.io');

// Connect to MongoDB
connectDB();

const app = express();

// 👇 2. WRAP YOUR EXPRESS APP IN A STANDARD HTTP SERVER 👇
const server = http.createServer(app);

// 👇 3. ATTACH THE SOCKET.IO SWITCHBOARD TO THE SERVER 👇
const io = new Server(server, {
  cors: {
    origin: "*", // We will lock this down to your Vercel URL later for security
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 👇 4. THIS IS CRITICAL: Let your routes access the 'io' switchboard 👇
app.set('socketio', io);

// 👇 5. LISTEN FOR INCOMING CONNECTIONS 👇
io.on('connection', (socket) => {
  console.log('⚡ A user connected to the real-time switchboard:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 A user disconnected:', socket.id);
  });
});

// Middleware (Security and formatting tools)
app.use(cors());
app.use(express.json()); // Allows your server to read JSON data

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// A simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the Radhe Momos Backend API!');
});

// Link our API Routes
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

// 👇 6. CHANGE THIS: Use server.listen() instead of app.listen() 👇
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});