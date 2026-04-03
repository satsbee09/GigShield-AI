// ─────────────────────────────────────────────────────
// Policy Model
//
// ANALOGY: This is the insurance certificate.
// When Ravi pays ₹42, we create one of these for him.
// It is valid for exactly 7 days.
// ─────────────────────────────────────────────────────

const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  worker:         { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },

  // Financial details
  weeklyPremium:  { type: Number, required: true },   // ₹ paid by worker
  coverageAmount: { type: Number, required: true },   // ₹ max payout per disruption day
  riskTier:       { type: String },                   // low / medium / high

  // Validity
  startDate:      { type: Date, default: Date.now },
  endDate:        { type: Date, required: true },     // startDate + 7 days
  isActive:       { type: Boolean, default: true },

  // Payment proof
  razorpayPaymentId: { type: String },                // from Razorpay sandbox

  createdAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Policy', PolicySchema);