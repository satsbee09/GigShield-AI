import React, { useState, useEffect } from 'react';
import { getClaims } from '../services/api';

const STATUS_COLOR = { paid: '#00E5A0', processing: '#FFB347', rejected: '#FF5C5C', pending: '#FFB347' };
const STATUS_BG    = { paid: 'rgba(0,229,160,0.08)', processing: 'rgba(255,179,71,0.08)', rejected: 'rgba(255,92,92,0.08)', pending: 'rgba(255,179,71,0.08)' };

const TRIGGER_ICON = {
  heavy_rain:  '🌧',
  aqi:         '🌫',
  heatwave:    '🌡',
  curfew:      '🚫',
  flood:       '🌊',
  traffic:     '🚦',
};
const icon = t => TRIGGER_ICON[t] || '⚡';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cl-screen {
    background: #070E1A;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 48px 16px 32px;
    position: relative;
  }

  .cl-bg-orb {
    position: fixed;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(0,100,255,0.05) 0%, transparent 70%);
    border-radius: 50%;
    top: -40px; left: -60px;
    pointer-events: none;
  }

  .cl-inner {
    position: relative; z-index: 1;
    max-width: 420px; margin: 0 auto;
  }

  .cl-heading {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .cl-subheading {
    color: #3A5570;
    font-size: 13px;
    margin-bottom: 24px;
  }

  /* ── Summary Strip ── */
  .cl-summary {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }
  .cl-summary-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 12px 10px;
    text-align: center;
  }
  .cl-summary-val {
    font-family: 'DM Mono', monospace;
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .cl-summary-val.green { color: #00E5A0; }
  .cl-summary-label {
    color: #3A5570;
    font-size: 9px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  /* ── Section title ── */
  .cl-section-title {
    color: #3A5570;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* ── Claim Card ── */
  .cl-claim-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 10px;
    transition: border-color 0.2s;
    animation: fadeUp 0.3s ease forwards;
    opacity: 0;
  }
  .cl-claim-card:hover { border-color: rgba(255,255,255,0.1); }

  .cl-claim-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .cl-claim-left { display: flex; align-items: center; gap: 12px; }
  .cl-claim-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .cl-claim-type {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;
    margin-bottom: 2px;
    letter-spacing: -0.2px;
  }
  .cl-claim-date { color: #3A5570; font-size: 11px; }

  .cl-claim-amount {
    font-family: 'DM Mono', monospace;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.5px;
  }

  .cl-claim-divider {
    height: 1px;
    background: rgba(255,255,255,0.04);
    margin: 10px 0;
  }

  .cl-claim-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cl-status-pill {
    display: flex; align-items: center; gap: 5px;
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid;
  }
  .cl-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
  }
  .cl-payout-label { color: #3A5570; font-size: 11px; }

  /* ── Empty State ── */
  .cl-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }
  .cl-empty-icon {
    font-size: 40px;
    margin-bottom: 14px;
    opacity: 0.4;
  }
  .cl-empty-title {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 6px;
  }
  .cl-empty-sub {
    color: #3A5570;
    font-size: 13px;
    line-height: 1.5;
    max-width: 220px;
  }

  /* ── Loading ── */
  .cl-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh;
    background: #070E1A;
    font-family: 'DM Sans', sans-serif;
    color: #3A5570;
    font-size: 13px;
    letter-spacing: 0.4px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cl-animate   { animation: fadeUp 0.3s ease forwards; }
  .cl-animate-2 { animation: fadeUp 0.3s 0.06s ease both; }
`;

export default function Claims({ worker }) {
  const [claims,  setClaims]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!worker?._id) return;
    getClaims(worker._id)
      .then(res => { setClaims(res.claims || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [worker._id]);

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="cl-loading">Loading claims…</div>
      </>
    );
  }

  const paid      = claims.filter(c => c.status === 'paid');
  const total     = paid.reduce((s, c) => s + (c.payoutAmount || 0), 0);
  const pending   = claims.filter(c => c.status !== 'paid' && c.status !== 'rejected');

  return (
    <>
      <style>{css}</style>
      <div className="cl-screen">
        <div className="cl-bg-orb" />
        <div className="cl-inner">

          {/* Heading */}
          <div className="cl-animate">
            <h1 className="cl-heading">Claims</h1>
            <p className="cl-subheading">Auto-triggered · Zero filing required</p>
          </div>

          {/* Summary strip — always show */}
          <div className="cl-summary cl-animate-2">
            <div className="cl-summary-card">
              <div className="cl-summary-val">{claims.length}</div>
              <div className="cl-summary-label">Total</div>
            </div>
            <div className="cl-summary-card">
              <div className="cl-summary-val green">{paid.length}</div>
              <div className="cl-summary-label">Paid</div>
            </div>
            <div className="cl-summary-card">
              <div className="cl-summary-val green">
                ₹{total.toLocaleString('en-IN')}
              </div>
              <div className="cl-summary-label">Received</div>
            </div>
          </div>

          {/* Empty state */}
          {claims.length === 0 ? (
            <div className="cl-empty cl-animate">
              <div className="cl-empty-icon">🛡️</div>
              <div className="cl-empty-title">No claims yet</div>
              <div className="cl-empty-sub">
                When a disruption is detected, your claim will appear here automatically.
              </div>
            </div>
          ) : (
            <>
              {/* Pending */}
              {pending.length > 0 && (
                <>
                  <div className="cl-section-title">Processing</div>
                  {pending.map((c, i) => (
                    <ClaimCard key={i} claim={c} delay={i * 60} />
                  ))}
                </>
              )}

              {/* Paid */}
              {paid.length > 0 && (
                <>
                  <div className="cl-section-title" style={{ marginTop: pending.length ? 16 : 0 }}>
                    Paid out
                  </div>
                  {paid.map((c, i) => (
                    <ClaimCard key={i} claim={c} delay={i * 60} />
                  ))}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

function ClaimCard({ claim, delay = 0 }) {
  const status  = claim.status || 'pending';
  const color   = STATUS_COLOR[status] || '#7A95AA';
  const bg      = STATUS_BG[status]    || 'rgba(255,255,255,0.04)';
  const trigger = claim.triggerType || 'disruption';
  const amount  = claim.payoutAmount || 0;

  return (
    <div
      className="cl-claim-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="cl-claim-top">
        <div className="cl-claim-left">
          <div
            className="cl-claim-icon-wrap"
            style={{ background: bg }}
          >
            {icon(trigger)}
          </div>
          <div>
            <div className="cl-claim-type">
              {trigger.replace(/_/g, ' ')}
            </div>
            <div className="cl-claim-date">
              {claim.createdAt
                ? new Date(claim.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })
                : 'Recent'}
            </div>
          </div>
        </div>

        <div className="cl-claim-amount" style={{ color: status === 'paid' ? color : '#3A5570' }}>
          {status === 'paid' ? `+₹${amount.toLocaleString('en-IN')}` : '—'}
        </div>
      </div>

      <div className="cl-claim-divider" />

      <div className="cl-claim-bottom">
        <div
          className="cl-status-pill"
          style={{
            color,
            borderColor: color + '33',
            background: bg,
          }}
        >
          <span className="cl-status-dot" />
          {status}
        </div>
        <div className="cl-payout-label">
          {status === 'paid'
            ? `${claim.payoutPercent ?? '—'}% of coverage`
            : 'Verifying disruption data'}
        </div>
      </div>
    </div>
  );
}