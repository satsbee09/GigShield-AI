// ─────────────────────────────────────────────────────
// Policy Routes  →  /api/policy/...
// ─────────────────────────────────────────────────────

const router = require('express').Router();
const Worker = require('../models/worker');
const Policy = require('../models/Policy');

// Map risk tier to coverage amount
const COVERAGE = { low: 400, medium: 600, high: 850 };


// ─────────────────────────────────────────────────────
// POST /api/policy/create
// ─────────────────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    const { workerId, razorpayPaymentId } = req.body;

    // ✅ DEMO MODE (NO DB)
    if (process.env.USE_DB !== "true") {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      return res.json({
        success: true,
        message: 'Policy created (demo mode)',
        policy: {
          id: "policy_" + Date.now(),
          coverageAmount: 850,
          weeklyPremium: 34,
          riskTier: "high",
          startDate,
          endDate
        }
      });
    }

    // 🟢 DB MODE
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Expire old policies
    await Policy.updateMany(
      { worker: workerId, isActive: true },
      { isActive: false }
    );

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const policy = await Policy.create({
      worker: workerId,
      weeklyPremium: worker.weeklyPremium,
      coverageAmount: COVERAGE[worker.premiumTier] || 600,
      riskTier: worker.premiumTier,
      startDate,
      endDate,
      razorpayPaymentId
    });

    await Worker.findByIdAndUpdate(workerId, {
      policyActive: true,
      policyExpiry: endDate
    });

    res.json({
      success: true,
      message: 'Policy created. You are now covered!',
      policy: {
        id: policy._id,
        coverageAmount: policy.coverageAmount,
        weeklyPremium: policy.weeklyPremium,
        startDate: policy.startDate,
        endDate: policy.endDate,
        riskTier: policy.riskTier
      }
    });

  } catch (err) {
    console.error("❌ policy create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ─────────────────────────────────────────────────────
// GET /api/policy/active/:workerId
// ─────────────────────────────────────────────────────
router.get('/active/:workerId', async (req, res) => {
  try {

    // ✅ DEMO MODE
    if (process.env.USE_DB !== "true") {
      return res.json({
        success: true,
        policy: {
          id: "policy_demo",
          coverageAmount: 850,
          weeklyPremium: 34,
          riskTier: "high",
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          daysLeft: 6
        }
      });
    }

    // 🟢 DB MODE
    const policy = await Policy.findOne({
      worker: req.params.workerId,
      isActive: true,
      endDate: { $gt: new Date() }
    });

    if (!policy) {
      return res.json({ success: true, policy: null });
    }

    const msLeft = policy.endDate - new Date();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      policy: {
        id: policy._id,
        coverageAmount: policy.coverageAmount,
        weeklyPremium: policy.weeklyPremium,
        riskTier: policy.riskTier,
        endDate: policy.endDate,
        daysLeft
      }
    });

  } catch (err) {
    console.error("❌ policy fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ─────────────────────────────────────────────────────
// POST /api/policy/expire-old
// ─────────────────────────────────────────────────────
router.post('/expire-old', async (req, res) => {
  try {

    // ✅ DEMO MODE
    if (process.env.USE_DB !== "true") {
      return res.json({
        success: true,
        expiredCount: 0
      });
    }

    // 🟢 DB MODE
    const result = await Policy.updateMany(
      { endDate: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );

    const expiredPolicies = await Policy.find({ isActive: false });

    for (const p of expiredPolicies) {
      await Worker.findByIdAndUpdate(p.worker, { policyActive: false });
    }

    res.json({
      success: true,
      expiredCount: result.modifiedCount
    });

  } catch (err) {
    console.error("❌ expire error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;