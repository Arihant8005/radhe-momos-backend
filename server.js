require('dotenv').config(); // Loads your .env settings
require('dns').setServers(['8.8.8.8', '1.1.1.1']); // 🚨 FIXES ETIMEOUT: Forces Node to use Google/Cloudflare DNS directly

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Loads your database connection
const authRoutes = require('./routes/auth');

// Connect to MongoDB
connectDB();

const app = express();

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});