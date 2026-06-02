// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 1. Customer Details
  customerName: {
    type: String,
    required: [true, 'Please enter customer name'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please enter a 10-digit phone number'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please enter full delivery address'],
  },

  // 2. Order Details
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu', // Links to the Menu database
        required: true
      },
      name: String, // Stored here so the receipt doesn't change if menu changes
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: { type: String, default: 'Pending' },

  // 3. Payment & Delivery Status
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Received', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Received'
  },
  paymentId: {
    type: String, // To store the Razorpay/PhonePe transaction ID later
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);