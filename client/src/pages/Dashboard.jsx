import React, { useState, useEffect } from 'react';
import { getPolicy, getClaims } from '../services/api';

const wColor = w => w < 50 ? '#FF5C5C' : w < 70 ? '#FFB347' : '#00E5A0';
const wLabel = w => w < 50 ? 'Disruption active — claim processing' : w < 70 ? 'Moderate risk conditions' : 'Safe to work';
const wBg    = w => w < 50 ? 'rgba(255,92,92,0.06)' : w < 70 ? 'rgba(255,179,71,0.06)' : 'rgba(0,229,160,0.06)';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .db-screen {
    background: #070E1A;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 0 0 24px;
    position: relative;
  }

  .db-bg-orb {
    position: fixed;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%);
    border-radius: 50%;
    top: -60px; right: -60px;
    pointer-events: none;
    z-index: 0;
  }

  .db-header {
    position: relative;
    z-index: 1;
    padding: 48px 20px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .db-greeting { color: #3A5570; font-size: 12px; margin-bottom: 3px; letter-spacing: 0.3px; }
  .db-name     { color: #fff; font-size: 20px; font-weight: 600; letter-spacing: -0.4px; }

  .db-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 600;
    color: #00E5A0;
  }

  .db-scroll {
    position: relative; z-index: 1;
    padding: 0 16px;
  }

  /* ── Policy Banner ── */
  .db-policy-active {
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 12px;
    background: rgba(0,229,160,0.05);
    border: 1px solid rgba(0,229,160,0.15);
    position: relative;
    overflow: hidden;
  }
  .db-policy-active::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,229,160,0.4), transparent);
  }
  .db-policy-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .db-policy-tag {
    font-size: 10px;
    font-weight: 600;
    color: #00E5A0;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .db-policy-zone {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.2px;
  }
  .db-policy-expiry {
    color: #3A5570;
    font-size: 11px;
    margin-top: 2px;
  }
  .db-live-pill {
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.25);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 10px;
    color: #00E5A0;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 5px;
  }
  .db-live-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #00E5A0;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.8); }
  }
  .db-policy-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 12px 0;
  }
  .db-policy-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }
  .db-policy-row-key { color: #3A5570; font-size: 12px; }
  .db-policy-row-val { color: #fff; font-size: 13px; font-weight: 500; }
  .db-policy-row-val.green { color: #00E5A0; }

  .db-no-policy {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    margin-bottom: 12px;
  }
  .db-no-policy-title { color: #fff; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .db-no-policy-sub   { color: #3A5570; font-size: 12px; margin-bottom: 14px; }

  .db-btn-green {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #00E5A0, #00B87A);
    color: #050E18;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  .db-btn-green:hover { opacity: 0.9; transform: translateY(-1px); }
  .db-btn-green:active { transform: translateY(0); }

  /* ── Workability Card ── */
  .db-w-card {
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    transition: background 0.5s;
  }
  .db-w-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 12px;
  }
  .db-w-label { color: #3A5570; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
  .db-w-score {
    font-family: 'DM Mono', monospace;
    font-size: 36px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -1px;
  }
  .db-w-unit { font-size: 13px; color: #3A5570; font-weight: 400; margin-left: 1px; }
  .db-w-bar-track {
    height: 5px;
    border-radius: 3px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
    margin-bottom: 8px;
  }
  .db-w-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease, background 0.5s;
  }
  .db-w-status { font-size: 12px; }

  /* ── Stats Grid ── */
  .db-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .db-stat-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 14px;
  }
  .db-stat-label { color: #3A5570; font-size: 10px; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 8px; }
  .db-stat-value {
    font-family: 'DM Mono', monospace;
    font-size: 24px;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .db-stat-sub { font-size: 10px; color: #3A5570; }
  .db-stat-sub.green { color: #00E5A0; }

  /* ── Claim Card ── */
  .db-claim-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 12px;
  }
  .db-claim-header { color: #3A5570; font-size: 10px; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 12px; }
  .db-claim-row { display: flex; justify-content: space-between; align-items: center; }
  .db-claim-type { color: #fff; font-size: 13px; font-weight: 500; text-transform: capitalize; margin-bottom: 2px; }
  .db-claim-date { color: #3A5570; font-size: 11px; }
  .db-claim-amount { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 500; }

  /* ── Simulate Button ── */
  .db-sim-btn {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: 1px solid rgba(255,179,71,0.2);
    background: rgba(255,179,71,0.04);
    color: #FFB347;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-bottom: 12px;
    transition: background 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .db-sim-btn:hover {
    background: rgba(255,179,71,0.08);
    border-color: rgba(255,179,71,0.35);
  }

  .db-section-title {
    color: #3A5570;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .db-loading {
    background: #070E1A;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3A5570;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .db-animate { animation: fadeUp 0.3s ease forwards; }
  .db-animate-2 { animation: fadeUp 0.3s 0.08s ease both; }
  .db-animate-3 { animation: fadeUp 0.3s 0.16s ease both; }
  .db-animate-4 { animation: fadeUp 0.3s 0.24s ease both; }
`;

export default function Dashboard({ worker, onBuyPolicy }) {
  const [policy,  setPolicy]  = useState(null);
  const [claims,  setClaims]  = useState([]);
  const [wScore,  setWScore]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [simming, setSimming] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [pr, cr] = await Promise.all([
          getPolicy(worker._id),
          getClaims(worker._id)
        ]);
        setPolicy(pr.policy);
        setClaims(cr.claims || []);
        const wr = await fetch(
          `http://localhost:8000/workability?lat=${worker.zoneLat || 28.6273}&lon=${worker.zoneLon || 77.2773}&zone=${worker.zone}`
        );
        const wd = await wr.json();
        setWScore(wd.workabilityScore);
      } catch {
        setWScore(75);
      }
      setLoading(false);
    }
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [worker._id]);

  async function handleSimulate() {
    setSimming(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/workability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rainfall_mm: 120, temperature: 42, aqi: 450, traffic_index: 0.9 })
      });
      const data = await res.json();
      setWScore(data.workabilityScore ?? 20);
      alert(`⚡ Disruption detected!\n\nWorkability: ${data.workabilityScore}/100\nPayout: ${data.payoutPercent}%`);
    } catch {
      alert('Could not reach AI engine — make sure FastAPI is running on port 8000.');
    }
    setSimming(false);
  }

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="db-loading">Loading dashboard…</div>
      </>
    );
  }

  const paid  = claims.filter(c => c.status === 'paid');
  const total = paid.reduce((s, c) => s + (c.payoutAmount || 0), 0);
  const color = wScore !== null ? wColor(wScore) : '#3A5570';

  return (
    <>
      <style>{css}</style>
      <div className="db-screen">
        <div className="db-bg-orb" />

        {/* Header */}
        <div className="db-header db-animate">
          <div>
            <div className="db-greeting">Good day,</div>
            <div className="db-name">{worker.name}</div>
          </div>
          <div className="db-avatar">{worker.name?.[0]?.toUpperCase()}</div>
        </div>

        <div className="db-scroll">

          {/* Policy Banner */}
          <div className="db-animate-2">
            {policy ? (
              <div className="db-policy-active">
                <div className="db-policy-top">
                  <div>
                    <div className="db-policy-tag">Active coverage</div>
                    <div className="db-policy-zone">
                      {worker.zone?.replace(/_/g, ' ')} · {policy.riskTier} risk
                    </div>
                    <div className="db-policy-expiry">
                      Expires {new Date(policy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {policy.daysLeft}d left
                    </div>
                  </div>
                  <div className="db-live-pill">
                    <div className="db-live-dot" /> LIVE
                  </div>
                </div>
                <div className="db-policy-divider" />
                <div className="db-policy-row">
                  <span className="db-policy-row-key">Weekly premium</span>
                  <span className="db-policy-row-val">₹{policy.weeklyPremium}/week</span>
                </div>
                <div className="db-policy-row" style={{ marginTop: 6 }}>
                  <span className="db-policy-row-key">Max payout</span>
                  <span className="db-policy-row-val green">₹{policy.coverageAmount}/day</span>
                </div>
              </div>
            ) : (
              <div className="db-no-policy">
                <div className="db-no-policy-title">No active policy</div>
                <div className="db-no-policy-sub">Buy this week's plan to get covered</div>
                <button className="db-btn-green" onClick={onBuyPolicy}>
                  Buy Plan — ₹{worker.weeklyPremium}/week
                </button>
              </div>
            )}
          </div>

          {/* Workability Score */}
          {wScore !== null && (
            <div className="db-w-card db-animate-3" style={{ background: wBg(wScore), borderColor: color + '22' }}>
              <div className="db-w-top">
                <div>
                  <div className="db-w-label">Live workability</div>
                </div>
                <div className="db-w-score" style={{ color }}>
                  {wScore}<span className="db-w-unit">/100</span>
                </div>
              </div>
              <div className="db-w-bar-track">
                <div
                  className="db-w-bar-fill"
                  style={{ width: `${wScore}%`, background: color }}
                />
              </div>
              <div className="db-w-status" style={{ color }}>{wLabel(wScore)}</div>
            </div>
          )}

          {/* Stats */}
          <div className="db-stats db-animate-3">
            <div className="db-stat-card">
              <div className="db-stat-label">Earnings protected</div>
              <div className="db-stat-value">₹{total.toLocaleString('en-IN')}</div>
              <div className="db-stat-sub">this month</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">Claims paid</div>
              <div className="db-stat-value">{paid.length}</div>
              <div className="db-stat-sub green">auto-approved</div>
            </div>
          </div>

          {/* Latest Claim */}
          {claims[0] && (
            <div className="db-claim-card db-animate-4">
              <div className="db-claim-header">Latest claim</div>
              <div className="db-claim-row">
                <div>
                  <div className="db-claim-type">
                    {claims[0].triggerType?.replace(/_/g, ' ')}
                  </div>
                  <div className="db-claim-date">
                    {new Date(claims[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div
                  className="db-claim-amount"
                  style={{ color: claims[0].status === 'paid' ? '#00E5A0' : '#FFB347' }}
                >
                  {claims[0].status === 'paid'
                    ? `+₹${claims[0].payoutAmount}`
                    : 'Processing'}
                </div>
              </div>
            </div>
          )}

          {/* Simulate Disruption */}
          <button className="db-sim-btn" onClick={handleSimulate} disabled={simming}>
            <span>🌧</span>
            {simming ? 'Simulating…' : 'Simulate extreme weather'}
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ fontSize: 10, color: '#1A2E40', letterSpacing: '0.5px' }}>
              GIGSHIELD AI · GUIDEWIRE DEVTRAILS 2026
            </div>
          </div>

        </div>
      </div>
    </>
  );
}