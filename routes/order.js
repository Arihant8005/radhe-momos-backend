const verifyToken = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const Order = require('../models/order'); // Connects to your order model

// POST /api/orders - This saves a new order when a customer checks out
router.post('/', async (req, res) => {
  try {
    const { customerName, phoneNumber, deliveryAddress, items, totalPrice } = req.body;

    // Create the order in the database
    const newOrder = new Order({
      customerName,
      phoneNumber,
      deliveryAddress,
      items,
      totalPrice,
      paymentStatus: 'Paid', // We will mock a successful Google Pay/PhonePe transaction for now
      paymentId: `UPI_TXN_${Math.floor(Math.random() * 100000000)}` // Generates a fake transaction ID
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder
    });

  } catch (error) {
    console.error("🚨 Order Processing Error:", error); // 🚨 ADD THIS LINE!
    res.status(500).json({ message: 'Error processing order', details: error.message });
  }
});

// GET /api/orders - Fetch all orders for the Admin Dashboard
router.get('/', verifyToken, async (req, res) => {
  try {
    // Find all orders and sort them by the newest first (-1 means descending)
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;