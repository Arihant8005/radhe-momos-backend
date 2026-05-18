const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // The password scrambler
const jwt = require('jsonwebtoken'); // The digital ID card maker
const Admin = require('../models/Admin');

// 1. THE SETUP SHORTCUT: Run this once to create your secure admin account
router.get('/setup', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'owner' });
    if (existingAdmin) return res.send('Admin already exists!');

    // 🔒 SCRAMBLE THE PASSWORD: Never save 'secret123' directly!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);

    const newAdmin = new Admin({
      username: 'owner',
      password: hashedPassword // Saving the scrambled version
    });

    await newAdmin.save();
    res.send('✅ Admin account created! Username: owner | Password: secret123');
  } catch (error) {
    res.status(500).send('Error creating admin');
  }
});

// 2. THE BOUNCER: The route your React frontend will use to log in
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // A. Check if the user exists
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    // B. Check if the typed password matches the scrambled database password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // C. Make the Digital ID Card (JWT)
    // Note: In a real company, 'MySuperSecretKey' is hidden in your .env file!
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token: token, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;