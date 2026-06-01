const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const Admin = require('../models/Admin');

// 🚨 TEMPORARY ROUTE: We will delete this after the password changes!
router.get('/setup', async (req, res) => {
  try {
    // 👇 PUT THE SHOP OWNER'S NEW PASSWORD HERE 👇
    const newPassword = 'Arihant@123'; 

    // Scramble the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Find the 'owner' account and overwrite the password
    const updatedAdmin = await Admin.findOneAndUpdate(
      { username: 'owner' }, 
      { password: hashedPassword },
      { new: true } 
    );

    if (!updatedAdmin) {
       return res.send('❌ Could not find an account named owner! Did you create it yet?');
    }

    res.send('✅ Admin password successfully updated in the live database!');
  } catch (error) {
    res.status(500).send('Error updating password');
  }
});

// THE BOUNCER: The route your React frontend will use to log in
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token: token, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;