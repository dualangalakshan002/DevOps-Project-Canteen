const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Food = require('../models/Food');
const { auth, roleAuth } = require('../middleware/auth');

// Place order (student)
router.post('/', auth, roleAuth(['student']), async (req, res) => {
  try {
    const { items } = req.body; // items: [{ foodId, quantity, size?, note? }]
    let total = 0;
    const orderItems = [];

    for (let item of items) {
      const food = await Food.findById(item.foodId);
      if (!food) return res.status(404).json({ msg: 'Food not found' });

      // calculate price considering size (half = 0.5)
      const multiplier = item.size === 'half' ? 0.5 : 1;
      const linePrice = food.price * multiplier;
      total += linePrice * item.quantity;

      orderItems.push({
        foodId: item.foodId,
        quantity: item.quantity,
        size: item.size || 'full',
        note: item.note || '',
        price: food.price // store base price
      });
    }

    const order = new Order({
      studentId: req.user._id,
      items: orderItems,
      total
    });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get student's orders
router.get('/my', auth, roleAuth(['student']), async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user._id }).populate('items.foodId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all orders (staff)
router.get('/', auth, roleAuth(['staff']), async (req, res) => {
  try {
    const orders = await Order.find().populate('studentId items.foodId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update order status (staff)
router.put('/:id', auth, roleAuth(['staff']), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

module.exports = router;