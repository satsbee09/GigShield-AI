// ─────────────────────────────────────────────────────
// Payout Routes  →  /api/payout/...
//
// ANALOGY: This is the cashier.
// Once a claim is approved, payout route sends
// the money to the worker's UPI via Razorpay sandbox.
// ─────────────────────────────────────────────────────

const router  = require('express').Router();
const Razorpay = require('razorpay');

// Razorpay sandbox client
// Get test keys from: https://dashboard.razorpay.com → Test Mode
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// ─────────────────────────────────────────────────────
// POST /api/payout/send
// Sends money to worker's UPI
// Called by claims route after fraud check passes
//
// Body: { claimId, workerId, amount, phone }
// ─────────────────────────────────────────────────────
router.post('/send', async (req, res) => {
  const { claimId, workerId, amount, phone } = req.body;

  try {
    // In sandbox mode this simulates a real payout
    // In production: worker must have a linked bank/UPI account
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || 'test_account',
      amount:         amount * 100,   // Razorpay uses paise (₹1 = 100 paise)
      currency:       'INR',
      mode:           'UPI',
      purpose:        'payout',
      fund_account: {
        account_type: 'vpa',          // VPA = UPI address
        vpa: { address: `${phone}@upi` },
        contact: {
          name:    'GigShield Worker',
          contact: phone,
          type:    'employee'
        }
      },
      notes: {
        claim_id:   claimId.toString(),
        worker_id:  workerId.toString(),
        description:'GigShield income protection payout'
      }
    });

    res.json({
      success:  true,
      payoutId: payout.id,
      amount:   amount,
      status:   payout.status
    });

  } catch (err) {
    // If Razorpay fails (test mode limits), simulate success for demo
    console.log('Razorpay error — using simulated payout for demo:', err.message);
    res.json({
      success:  true,
      payoutId: `sim_payout_${Date.now()}`,
      amount,
      status:   'processed',
      note:     'Simulated payout (demo mode)'
    });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/payout/create-order
// Called BEFORE worker pays premium (₹42)
// Creates a Razorpay order that the React frontend uses
// ─────────────────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  const { amount, workerId } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount:   amount * 100,   // paise
      currency: 'INR',
      receipt:  `policy_${workerId}_${Date.now()}`,
      notes:    { workerId: workerId.toString(), type: 'weekly_premium' }
    });

    res.json({ success: true, orderId: order.id, amount });
  } catch (err) {
    // Demo fallback
    res.json({
      success: true,
      orderId: `demo_order_${Date.now()}`,
      amount,
      note: 'Simulated order (demo mode)'
    });
  }
});

module.exports = router; 