const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const Menu = require('../models/Menu');
const verifyToken = require('../middleware/authMiddleware');

// 🚨 ABSOLUTE PATH FIX: Forces Render to locate the root uploads directory precisely
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where and how to save uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Passes the clean absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/menu - Get all momos
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu' });
  }
});

// POST /api/menu - ADD a new Momo (Accepts an image file)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `https://radhe-momos-backend.onrender.com/uploads/${req.file.filename}` : '';

    const newItem = new Menu({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: imageUrl 
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding menu item' });
  }
});

// DELETE /api/menu/:id - DELETE a Momo
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item' });
  }
});

module.exports = router;