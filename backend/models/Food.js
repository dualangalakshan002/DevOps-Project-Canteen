const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true }, // For today/tomorrow
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Food', foodSchema);