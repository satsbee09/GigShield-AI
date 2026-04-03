import React, { useState } from 'react';

const TIER_COLOR = { low: '#00E5A0', medium: '#FFB347', high: '#FF5C5C' };
const TIER_BG    = { low: 'rgba(0,229,160,0.06)', medium: 'rgba(255,179,71,0.06)', high: 'rgba(255,92,92,0.06)' };
const TIER_BORDER= { low: 'rgba(0,229,160,0.18)', medium: 'rgba(255,179,71,0.18)', high: 'rgba(255,92,92,0.18)' };
const COVERAGE   = { low: 400, medium: 600, high: 850 };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pl-screen {
    background: #070E1A;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 48px 20px 40px;
    position: relative;
    overflow: hidden;
  }

  .pl-bg-orb {
    position: fixed;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%);
    border-radius: 50%;
    bottom: -60px; right: -60px;
    pointer-events: none;
  }
  .pl-bg-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .pl-inner {
    position: relative; z-index: 1;
    max-width: 420px; margin: 0 auto;
  }

  .pl-back-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none;
    color: #3A5570; font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 0;
    margin-bottom: 32px;
    transition: color 0.2s;
  }
  .pl-back-btn:hover { color: #7A95AA; }

  .pl-heading {
    color: #fff;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.6px;
    line-height: 1.15;
    margin-bottom: 6px;
  }
  .pl-subheading {
    color: #3A5570;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* ── Price Card ── */
  .pl-price-card {
    border-radius: 18px;
    padding: 22px;
    margin-bottom: 14px;
    border: 1px solid;
    position: relative;
    overflow: hidden;
  }
  .pl-price-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
    opacity: 0.3;
  }
  .pl-tier-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .pl-tier-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .pl-price-row {
    display: flex; align-items: flex-end;
    gap: 2px; margin-bottom: 6px;
  }
  .pl-price-amount {
    font-family: 'DM Mono', monospace;
    font-size: 48px;
    font-weight: 500;
    color: #fff;
    letter-spacing: -2px;
    line-height: 1;
  }
  .pl-price-unit {
    font-size: 14px;
    color: #3A5570;
    font-weight: 400;
    margin-bottom: 6px;
    margin-left: 3px;
  }
  .pl-price-note {
    color: #3A5570;
    font-size: 12px;
  }

  /* ── Info List ── */
  .pl-info-list {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .pl-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pl-info-row:last-child { border-bottom: none; }
  .pl-info-key { color: #3A5570; font-size: 13px; }
  .pl-info-val { color: #fff; font-size: 13px; font-weight: 500; }
  .pl-info-val.green { color: #00E5A0; }
  .pl-info-val.mono  { font-family: 'DM Mono', monospace; }

  /* ── What's covered ── */
  .pl-covered-list {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .pl-covered-header {
    padding: 10px 16px 6px;
    color: #3A5570;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pl-covered-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pl-covered-item:last-child { border-bottom: none; }
  .pl-covered-icon { font-size: 15px; }
  .pl-covered-text { color: #7A95AA; font-size: 13px; }

  /* ── Buttons ── */
  .pl-btn-primary {
    width: 100%;
    padding: 15px;
    border-radius: 13px;
    border: none;
    background: linear-gradient(135deg, #00E5A0, #00B87A);
    color: #050E18;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-bottom: 10px;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: -0.2px;
  }
  .pl-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .pl-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .pl-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .pl-btn-secondary {
    width: 100%;
    padding: 13px;
    border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.07);
    background: transparent;
    color: #3A5570;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .pl-btn-secondary:hover { color: #7A95AA; border-color: rgba(255,255,255,0.14); }

  .pl-disclaimer {
    text-align: center;
    color: #1E3045;
    font-size: 11px;
    margin-top: 14px;
    line-height: 1.5;
  }

  /* loading state overlay */
  .pl-loading-overlay {
    position: fixed; inset: 0;
    background: rgba(7,14,26,0.85);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 100; gap: 14px;
  }
  .pl-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(0,229,160,0.15);
    border-top-color: #00E5A0;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pl-loading-text { color: #3A5570; font-size: 13px; letter-spacing: 0.3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pl-animate   { animation: fadeUp 0.3s ease forwards; }
  .pl-animate-2 { animation: fadeUp 0.3s 0.08s ease both; }
  .pl-animate-3 { animation: fadeUp 0.3s 0.16s ease both; }
`;

export default function Policy({ worker, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);

  const tier     = worker?.premiumTier || 'high';
  const color    = TIER_COLOR[tier];
  const coverage = COVERAGE[tier] || 600;

  const buyPolicy = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/policy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker._id,
          razorpayPaymentId: 'demo_payment'
        })
      });

      const data = await res.json();

      if (data.success) {
        const updatedWorker = {
          ...worker,
          policyActive: true,
          policy: data.policy
        };
        localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
        onSuccess(updatedWorker);
      } else {
        alert('Failed to buy policy. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error. Make sure the server is running.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="pl-screen">
        <div className="pl-bg-orb" />
        <div className="pl-bg-grid" />

        {loading && (
          <div className="pl-loading-overlay">
            <div className="pl-spinner" />
            <div className="pl-loading-text">Processing your policy…</div>
          </div>
        )}

        <div className="pl-inner">

          {/* Back */}
          <button className="pl-back-btn" onClick={onBack}>
            ← Back
          </button>

          {/* Heading */}
          <div className="pl-animate">
            <h1 className="pl-heading">Weekly<br />income shield.</h1>
            <p className="pl-subheading">
              AI-priced cover for {worker?.zone?.replace(/_/g, ' ')} · {tier} risk zone
            </p>
          </div>

          {/* Price Card */}
          <div
            className="pl-price-card pl-animate-2"
            style={{
              background: TIER_BG[tier],
              borderColor: TIER_BORDER[tier],
              color,
            }}
          >
            <div className="pl-tier-label">
              <span className="pl-tier-dot" />
              {tier} risk · AI-calculated
            </div>
            <div className="pl-price-row">
              <div className="pl-price-amount">₹{worker?.weeklyPremium}</div>
              <div className="pl-price-unit">/week</div>
            </div>
            <div className="pl-price-note">Auto-renews · Cancel anytime</div>
          </div>

          {/* Policy Details */}
          <div className="pl-info-list pl-animate-2">
            {[
              ['Policyholder',   worker?.name,                    false, false],
              ['Zone',           worker?.zone?.replace(/_/g,' '), false, false],
              ['Max daily payout', `₹${coverage}`,               true,  true ],
              ['Claim process',  'Zero filing — automatic',       true,  false],
              ['Payout method',  'Instant UPI',                   true,  false],
              ['Coverage period','7 days',                        false, true ],
            ].map(([k, v, green, mono]) => (
              <div key={k} className="pl-info-row">
                <span className="pl-info-key">{k}</span>
                <span className={`pl-info-val ${green ? 'green' : ''} ${mono ? 'mono' : ''}`}>{v}</span>
              </div>
            ))}
          </div>

          {/* What's covered */}
          <div className="pl-covered-list pl-animate-3">
            <div className="pl-covered-header">What triggers a payout</div>
            {[
              ['🌧', 'Heavy rain & flooding'],
              ['🌫', 'Extreme AQI / air pollution'],
              ['🌡', 'Dangerous heatwave'],
              ['🚫', 'Curfew or area lockdown'],
              ['🚦', 'Severe traffic disruption'],
            ].map(([icon, text]) => (
              <div key={text} className="pl-covered-item">
                <span className="pl-covered-icon">{icon}</span>
                <span className="pl-covered-text">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pl-animate-3">
            <button className="pl-btn-primary" onClick={buyPolicy} disabled={loading}>
              {loading ? 'Processing…' : `Activate for ₹${worker?.weeklyPremium} →`}
            </button>
            <button className="pl-btn-secondary" onClick={onBack}>
              Not now
            </button>
            <p className="pl-disclaimer">
              Demo mode · Simulation only · No real payment processed
            </p>
          </div>

        </div>
      </div>
    </>
  );
}