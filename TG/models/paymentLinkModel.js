const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  link_id: { type: String, unique: true },
  link_url: String,
  customer_id: String,
  phone: String,
  amount: Number,
  plan_id: String,
  plan_name: String,
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);
