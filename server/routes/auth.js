// ─────────────────────────────────────────────────────
// Auth Routes  →  /api/auth/...
// ─────────────────────────────────────────────────────

const router  = require('express').Router();
const Worker  = require('../models/worker');
const axios   = require('axios');

// Temporary OTP store (demo only)
const otpStore = {};

// ─────────────────────────────────────────────────────
// SEND OTP
// ─────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  const otp     = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;

  otpStore[phone] = { otp, expires };

  console.log(`📱 OTP for ${phone}: ${otp}`);

  res.json({
    success: true,
    message: 'OTP sent',
    demoOtp: otp // ⚠️ remove in production
  });
});


// ─────────────────────────────────────────────────────
// VERIFY OTP + REGISTER WORKER
// ─────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const {
      phone,
      otp,
      name,
      platform,
      zone,
      zoneLat,
      zoneLon,
      avgDailyIncome
    } = req.body;

    // ── STEP 1: OTP VALIDATION ─────────────────────────
    const stored = otpStore[phone];

    if (!stored)
      return res.status(400).json({ error: 'OTP not found. Request a new one.' });

    if (Date.now() > stored.expires)
      return res.status(400).json({ error: 'OTP expired. Request a new one.' });

    if (stored.otp !== otp)
      return res.status(400).json({ error: 'Wrong OTP.' });

    delete otpStore[phone];

    // ── STEP 2: DEMO MODE ──────────────────────────────
    if (process.env.USE_DB !== "true") {
      return res.json({
        success: true,
        mode: "demo",
        worker: {
          _id: "demo_" + Date.now(),
          phone,
          name,
          platform,
          zone,
          weeklyPremium: 34,
          premiumTier: "high",
          policyActive: false
        }
      });
    }

    // ── STEP 3: DB MODE ────────────────────────────────
    let worker = await Worker.findOneAndUpdate(
      { phone },
      {
        phone,
        name,
        platform,
        zone,
        zoneLat,
        zoneLon,
        avgDailyIncome
      },
      { new: true, upsert: true }
    );

    // ── STEP 4: CALL AI ENGINE ─────────────────────────
    try {
      const aiResponse = await axios.post('http://localhost:8000/risk-score', {
        zone,
        platform,
        lat: zoneLat,
        lon: zoneLon
      });

      const { riskScore, premiumTier, weeklyPremium } = aiResponse.data;

      worker = await Worker.findByIdAndUpdate(
        worker._id,
        { riskScore, premiumTier, weeklyPremium },
        { new: true }
      );

    } catch (err) {
      console.log('⚠️ AI engine not reachable, using defaults');
    }

    // ── STEP 5: RESPONSE ───────────────────────────────
    res.json({
      success: true,
      mode: "db",
      worker: {
        _id: worker._id,
        name: worker.name,
        phone: worker.phone,
        zone: worker.zone,
        riskScore: worker.riskScore,
        weeklyPremium: worker.weeklyPremium,
        premiumTier: worker.premiumTier
      }
    });

  } catch (err) {
    console.error("❌ verify-otp error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ─────────────────────────────────────────────────────
// GET WORKER BY PHONE
// ─────────────────────────────────────────────────────
router.get('/worker/:phone', async (req, res) => {
  try {
    const worker = await Worker.findOne({ phone: req.params.phone });

    if (!worker)
      return res.status(404).json({ error: 'Worker not found' });

    res.json({ success: true, worker });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ─────────────────────────────────────────────────────
module.exports = router;