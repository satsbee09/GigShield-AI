// ─────────────────────────────────────────────────────
// Claim Model
//
// ANALOGY: This is the receipt for every payout.
// Created AUTOMATICALLY when a disruption is detected.
// Worker never touches this — system creates it.
// ─────────────────────────────────────────────────────

const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  worker:   { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  policy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },

  // What triggered this claim
  triggerType:       { type: String, enum: ['heavy_rain', 'aqi', 'heat', 'curfew', 'manual_sim'] },
  workabilityScore:  { type: Number },    // W score at time of trigger (e.g. 20)
  payoutPercent:     { type: Number },    // e.g. 60 (meaning 60% of expected earnings)

  // Payout details
  expectedEarnings:  { type: Number },    // what worker would have earned
  payoutAmount:      { type: Number },    // actual ₹ transferred
  razorpayPayoutId:  { type: String },    // proof of transfer

  // Status flow: pending → fraud_check → approved / flagged → paid
  status: {
    type: String,
    enum: ['pending', 'fraud_check', 'approved', 'flagged', 'paid'],
    default: 'pending'
  },

  // Fraud check results
  fraudFlags: {
    gpsInZone:      { type: Boolean },   // was worker in disrupted zone?
    duplicateCheck: { type: Boolean },   // claimed in last 24h?
    apiConfirmed:   { type: Boolean },   // at least 2 APIs confirmed disruption?
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', ClaimSchema);