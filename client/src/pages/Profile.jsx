import React from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pf-screen {
    background: #070E1A;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 48px 16px 28px;
    position: relative;
  }

  .pf-bg-orb {
    position: fixed;
    width: 250px;
    height: 250px;
    right: -70px;
    bottom: -70px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .pf-inner {
    position: relative;
    z-index: 1;
    max-width: 420px;
    margin: 0 auto;
  }

  .pf-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .pf-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pf-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0,229,160,0.08);
    border: 1px solid rgba(0,229,160,0.2);
    color: #00E5A0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
  }

  .pf-name {
    color: #fff;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.3px;
    margin-bottom: 2px;
  }

  .pf-sub {
    color: #7A95AA;
    font-size: 12px;
  }

  .pf-title {
    color: #3A5570;
    font-size: 10px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .pf-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .pf-row:last-child {
    border-bottom: none;
  }

  .pf-key {
    color: #7A95AA;
    font-size: 12px;
  }

  .pf-val {
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .pf-val.mono {
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.2px;
  }

  .pf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .pf-stat {
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
    padding: 12px;
  }

  .pf-stat-val {
    color: #fff;
    font-family: 'DM Mono', monospace;
    font-size: 20px;
    margin-bottom: 3px;
  }

  .pf-stat-val.green {
    color: #00E5A0;
  }

  .pf-stat-key {
    color: #3A5570;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .pf-btn {
    width: 100%;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: #9FB2C6;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .pf-btn:hover {
    border-color: rgba(255,255,255,0.16);
    color: #fff;
  }

  .pf-btn-green {
    border-color: rgba(0,229,160,0.25);
    background: rgba(0,229,160,0.06);
    color: #00E5A0;
  }

  .pf-btn-danger {
    border-color: rgba(232,85,85,0.35);
    color: #E85555;
  }
`;

export default function Profile({ worker, onLogout, onOpenPolicy }) {
  const zoneName = worker?.zone?.replace(/_/g, ' ') || 'Not set';

  return (
    <>
      <style>{css}</style>
      <div className="pf-screen">
        <div className="pf-bg-orb" />
        <div className="pf-inner">
          <div className="pf-card">
            <div className="pf-head">
              <div className="pf-avatar">{worker?.name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div className="pf-name">{worker?.name || 'Worker'}</div>
                <div className="pf-sub">+91 {worker?.phone} · {worker?.platform}</div>
              </div>
            </div>
          </div>

          <div className="pf-grid">
            <div className="pf-stat">
              <div className="pf-stat-val">₹{worker?.weeklyPremium || 0}</div>
              <div className="pf-stat-key">Weekly premium</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-val green">{worker?.premiumTier || 'N/A'}</div>
              <div className="pf-stat-key">Risk tier</div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-title">Account details</div>
            <div className="pf-row">
              <span className="pf-key">Work zone</span>
              <span className="pf-val">{zoneName}</span>
            </div>
            <div className="pf-row">
              <span className="pf-key">Platform</span>
              <span className="pf-val">{worker?.platform || '-'}</span>
            </div>
            <div className="pf-row">
              <span className="pf-key">Contact</span>
              <span className="pf-val mono">+91 {worker?.phone || '-'}</span>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-title">Actions</div>
            <button className="pf-btn pf-btn-green" onClick={onOpenPolicy}>Manage policy</button>
            <button className="pf-btn">Help & support</button>
            <button className="pf-btn">About GigShield AI</button>
            <button className="pf-btn pf-btn-danger" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </div>
    </>
  );
}
