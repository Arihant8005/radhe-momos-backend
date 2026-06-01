const verifyToken = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const Order = require('../models/order'); 

// POST /api/orders - Saves a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, phoneNumber, deliveryAddress, items, totalPrice } = req.body;

    const newOrder = new Order({
      customerName,
      phoneNumber,
      deliveryAddress,
      items,
      totalPrice,
      paymentStatus: 'Paid', 
      paymentId: `UPI_TXN_${Math.floor(Math.random() * 100000000)}` 
    });

    const savedOrder = await newOrder.save();

    // 👇 SOCKET.IO MAGIC: Shout to the Admin that a new order arrived! 👇
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newOrderPlaced', savedOrder); 
    }
    // 👆 END MAGIC 👆

    res.status(201).json({
      message: 'Order placed successfully!',
      order: savedOrder
    });

  } catch (error) {
    console.error("🚨 Order Processing Error:", error); 
    res.status(500).json({ message: 'Error processing order', details: error.message });
  }
});

// GET /api/orders - Fetch all orders for Admin
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// 👇 BRAND NEW ROUTE: Update order status (Pending -> Cooking -> Delivered) 👇
router.put('/status/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; 
    
    // 👇 THIS IS THE FIX: Tell MongoDB to return the newly updated data! 👇
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { returnDocument: 'after' } 
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

    // 🚨 SOCKET.IO MAGIC: Shout to the Customer that their order moved! 🚨
    const io = req.app.get('socketio');
    if (io) {
      io.emit('orderStatusUpdated', updatedOrder); 
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("🚨 Error updating order:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});
// 👆 END BRAND NEW ROUTE 👆

// DELETE /api/orders/:id - Mark as completed
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    
    res.json({ message: 'Order completed and removed successfully!' });
  } catch (error) {
    console.error("🚨 Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = router;