// ─────────────────────────────────────────────────────
// Claims Routes  →  /api/claims/...
//
// ANALOGY: This is the most important counter.
// No worker walks here manually.
// The system creates claims AUTOMATICALLY.
//
// Flow:
//   triggerMonitor detects rain
//   → calls createAutoClaim()
//   → fraud checks run
//   → payout fired
//   → worker gets ₹ in 60s
// ─────────────────────────────────────────────────────

const router  = require('express').Router();
const Worker  = require('../models/worker');
const Policy  = require('../models/Policy');
const Claim   = require('../models/Claim');
const axios   = require('axios');

// ─────────────────────────────────────────────────────
// createAutoClaim()
// Called by triggerMonitor (not by worker)
// This is the CORE FUNCTION of GigShield
// ─────────────────────────────────────────────────────
async function createAutoClaim({ workerId, workabilityScore, payoutPercent, triggerType }) {
  const worker = await Worker.findById(workerId);
  if (!worker || !worker.policyActive) return null;

  const policy = await Policy.findOne({
    worker:   workerId,
    isActive: true,
    endDate:  { $gt: new Date() }
  });
  if (!policy) return null;

  // ── FRAUD CHECK 1: Duplicate claim prevention ───────
  // Did this worker already get a claim today?
  if (worker.lastClaimDate) {
    const hoursSinceLast = (Date.now() - worker.lastClaimDate) / (1000 * 60 * 60);
    if (hoursSinceLast < 20) {
      console.log(`⚠️  Duplicate claim blocked for worker ${workerId}`);
      return null;
    }
  }

  // ── CALCULATE PAYOUT ────────────────────────────────
  // payoutPercent = (50 - W) / 50 * 100
  // e.g. W=20 → payout 60% of expected daily earnings
  const expectedEarnings = worker.avgDailyIncome;
  const payoutAmount     = Math.round(expectedEarnings * (payoutPercent / 100));

  // ── CREATE CLAIM RECORD ──────────────────────────────
  const claim = await Claim.create({
    worker:           workerId,
    policy:           policy._id,
    triggerType:      triggerType || 'heavy_rain',
    workabilityScore,
    payoutPercent,
    expectedEarnings,
    payoutAmount,
    status:           'fraud_check',
    fraudFlags: {
      gpsInZone:      true,   // simplified — full GPS check in Phase 3
      duplicateCheck: true,   // passed (checked above)
      apiConfirmed:   true    // triggerMonitor only calls us if 2+ APIs confirmed
    }
  });

  // ── AUTO APPROVE (basic fraud passed) ───────────────
  await Claim.findByIdAndUpdate(claim._id, { status: 'approved' });

  // ── INITIATE PAYOUT ─────────────────────────────────
  try {
    const payoutResult = await axios.post('http://localhost:5000/api/payout/send', {
      claimId:    claim._id,
      workerId,
      amount:     payoutAmount,
      phone:      worker.phone
    });

    await Claim.findByIdAndUpdate(claim._id, {
      status:          'paid',
      razorpayPayoutId: payoutResult.data.payoutId
    });

    // Update worker's last claim date (prevents duplicate in 20h window)
    await Worker.findByIdAndUpdate(workerId, { lastClaimDate: new Date() });

    console.log(`✅ Claim paid: ₹${payoutAmount} to worker ${worker.name}`);
    return { success: true, claimId: claim._id, amount: payoutAmount };

  } catch (err) {
    console.error('Payout failed:', err.message);
    await Claim.findByIdAndUpdate(claim._id, { status: 'flagged' });
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────
// GET /api/claims/:workerId
// Returns all claims for a worker (for dashboard display)
// ─────────────────────────────────────────────────────
router.get('/:workerId', async (req, res) => {
  try {

    // ✅ DEMO MODE
    if (process.env.USE_DB !== "true") {
      return res.json({
        success: true,
        claims: [
          {
            id: "claim_1",
            amount: 500,
            status: "paid",
            date: new Date(),
            reason: "Heavy rain disruption"
          }
        ]
      });
    }

    // 🟢 DB MODE (your original code)
    const claims = await Claim.find({ worker: req.params.workerId });

    res.json({ success: true, claims });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ─────────────────────────────────────────────────────
// POST /api/claims/manual-trigger
// For demo only — lets Jansi manually fire a claim
// Body: { workerId, scenario: 'heavy_rain' | 'aqi' | 'curfew' }
// ─────────────────────────────────────────────────────
router.post('/manual-trigger', async (req, res) => {
  try {
    const { workerId, scenario } = req.body;

    const scenarios = {
      heavy_rain: { workabilityScore: 20, payoutPercent: 60, triggerType: 'heavy_rain' },
      aqi:        { workabilityScore: 15, payoutPercent: 70, triggerType: 'aqi' },
      curfew:     { workabilityScore: 5,  payoutPercent: 90, triggerType: 'curfew' }
    };

    const params = scenarios[scenario];
    if (!params) return res.status(400).json({ error: 'Unknown scenario' });

    // ✅ DEMO MODE (NO DB)
    if (process.env.USE_DB !== "true") {
      return res.json({
        success: true,
        message: "Claim triggered (demo mode)",
        claim: {
          id: "claim_" + Date.now(),
          workerId,
          amount: Math.round(850 * (params.payoutPercent / 100)),
          payoutPercent: params.payoutPercent,
          triggerType: params.triggerType,
          status: "paid",
          createdAt: new Date()
        }
      });
    }

    // 🟢 DB MODE (original)
    const result = await createAutoClaim({ workerId, ...params });

    res.json(result || {
      success: false,
      message: 'Claim not created (check logs)'
    });

  } catch (err) {
    console.error("❌ manual-trigger error:", err);
    res.status(500).json({ error: "Server error" });
  }

});

module.exports = router;
router.createAutoClaim = createAutoClaim;