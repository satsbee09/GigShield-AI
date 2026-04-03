// ─────────────────────────────────────────────────────
// Worker Model
//
// ANALOGY: This is like a KYC form at a bank.
// Every delivery partner who signs up creates one of these.
// ─────────────────────────────────────────────────────

const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  phone:        { type: String, required: true, unique: true },
  platform:     { type: String, enum: ['Zomato', 'Swiggy', 'Zepto', 'Amazon'], required: true },
  zone:         { type: String, required: true },   // e.g. "laxmi_nagar"
  zoneLat:      { type: Number },                   // GPS latitude of zone
  zoneLon:      { type: Number },                   // GPS longitude of zone
  avgDailyIncome: { type: Number, default: 800 },   // ₹ per day (worker tells us)

  // Risk profile — set by AI engine after registration
  riskScore:    { type: Number, default: 0 },       // 0.0 to 1.0
  premiumTier:  { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  weeklyPremium:{ type: Number, default: 28 },      // ₹ per week

  // Policy status
  policyActive: { type: Boolean, default: false },
  policyExpiry: { type: Date },

  // Claim tracking (prevents duplicate claims)
  lastClaimDate:{ type: Date },

  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', WorkerSchema);