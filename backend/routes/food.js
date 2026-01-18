const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { auth, roleAuth } = require('../middleware/auth');

// Get today's food (GET /api/food/today)
router.get('/today', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const foods = await Food.find({ date: { $gte: today, $lt: tomorrow }, available: true });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get tomorrow's food (GET /api/food/tomorrow)
router.get('/tomorrow', async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  try {
    const foods = await Food.find({ date: { $gte: tomorrow, $lt: dayAfter }, available: true });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// CRUD for staff (protected)
router.use(auth);
router.use(roleAuth(['staff']));

// Create food
router.post('/', async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.json(food);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Get all food (for staff view)
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update food
router.put('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ msg: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Delete food
router.delete('/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ msg: 'Food not found' });
    res.json({ msg: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;