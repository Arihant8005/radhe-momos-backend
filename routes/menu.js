const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Menu = require('../models/Menu');
const verifyToken = require('../middleware/authMiddleware');

// 🔐 Configure Cloudinary with your secure environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📦 Setup Cloudinary storage framework for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'radhe_momos_menu', // Creates a folder automatically inside your Cloudinary vault
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Automatically resizes images to keep things clean!
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

// POST /api/menu - ADD a new Momo (Uploads directly to Cloudinary cloud)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    // 🚨 CLOUD UPDATE: Multer-Storage-Cloudinary automatically gives us back a permanent cloud URL in req.file.path!
    const imageUrl = req.file ? req.file.path : '';

    const newItem = new Menu({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: imageUrl 
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("🚨 Cloudinary Upload Error:", error);
    res.status(500).json({ message: 'Error adding menu item', details: error.message });
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