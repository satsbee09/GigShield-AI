// ─────────────────────────────────────────────────────
// Admin Routes  →  /api/admin/...
//
// ANALOGY: This is the backstage control room.
// Only used during the demo video.
// Lets Jansi press one button to simulate a rainstorm
// and show judges the full automated claim flow.
// ─────────────────────────────────────────────────────

const router = require('express').Router();
const Worker = require('../models/worker');
const { createAutoClaim } = require('./claims');

// ─────────────────────────────────────────────────────
// POST /api/admin/simulate
// Simulates a disruption for ALL active workers in a zone
//
// Body: { zone: 'laxmi_nagar', scenario: 'heavy_rain' }
//
// This is your DEMO BUTTON. Press it during the video.
// Shows: trigger → fraud check → payout in ~15 seconds.
// ─────────────────────────────────────────────────────
router.post('/simulate', async (req, res) => {
  const { zone, scenario } = req.body;

  const scoreMap = {
    heavy_rain: { workabilityScore: 20, payoutPercent: 60, triggerType: 'heavy_rain' },
    aqi:        { workabilityScore: 10, payoutPercent: 80, triggerType: 'aqi'        },
    curfew:     { workabilityScore: 5,  payoutPercent: 90, triggerType: 'curfew'     }
  };

  const params = scoreMap[scenario] || scoreMap['heavy_rain'];

  // Find all workers in this zone with active policies
  const workers = await Worker.find({ zone, policyActive: true });
  console.log(`🌧  Simulating ${scenario} for ${workers.length} workers in ${zone}`);

  const results = [];
  for (const worker of workers) {
    const result = await createAutoClaim({ workerId: worker._id, ...params });
    results.push({ worker: worker.name, result });
  }

  res.json({
    success: true,
    scenario,
    zone,
    workersAffected: workers.length,
    results
  });
});

// ─────────────────────────────────────────────────────
// GET /api/admin/dashboard
// Quick stats for demo — total workers, claims, payouts
// ─────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const Worker = require('../models/worker');
  const Claim  = require('../models/Claim');
  const Policy = require('../models/Policy');

  const [totalWorkers, activePolicies, totalClaims, paidClaims] = await Promise.all([
    Worker.countDocuments(),
    Policy.countDocuments({ isActive: true }),
    Claim.countDocuments(),
    Claim.countDocuments({ status: 'paid' })
  ]);

  const payoutAggregate = await Claim.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$payoutAmount' } } }
  ]);

  const totalPaidOut = payoutAggregate[0]?.total || 0;

  res.json({
    totalWorkers,
    activePolicies,
    totalClaims,
    paidClaims,
    flaggedClaims: totalClaims - paidClaims,
    totalPaidOut
  });
});

module.exports = router;