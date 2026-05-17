const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food item name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
    default: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=500&q=60' // Default momo placeholder
  },
  category: {
    type: String,
    enum: ['Steamed Momos', 'Fried Momos', 'Kurkure Momos', 'Beverages'],
    default: 'Steamed Momos'
  },
  isAvailable: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

module.exports = mongoose.model('Menu', menuSchema);