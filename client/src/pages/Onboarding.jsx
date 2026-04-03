import React, { useState, useEffect } from 'react';
import { sendOTP, verifyOTP } from '../services/api';

const ZONES = [
  { label: 'Laxmi Nagar',     value: 'laxmi_nagar',    lat: 28.6273, lon: 77.2773 },
  { label: 'Yamuna Bank',     value: 'yamuna_bank',     lat: 28.6200, lon: 77.2900 },
  { label: 'Dwarka',          value: 'dwarka',          lat: 28.5921, lon: 77.0460 },
  { label: 'Connaught Place', value: 'connaught_place', lat: 28.6315, lon: 77.2167 },
  { label: 'Gurugram',        value: 'gurugram',        lat: 28.4595, lon: 77.0266 },
  { label: 'Noida',           value: 'noida',           lat: 28.5355, lon: 77.3910 },
];
const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Amazon'];
const TIER_COLOR = { low: '#00E5A0', medium: '#FFB347', high: '#FF5C5C' };
const TIER_BG    = { low: 'rgba(0,229,160,0.08)', medium: 'rgba(255,179,71,0.08)', high: 'rgba(255,92,92,0.08)' };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gs-screen {
    background: #070E1A;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .gs-bg-orb1 {
    position: fixed;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%);
    border-radius: 50%;
    top: -80px; right: -80px;
    pointer-events: none;
  }
  .gs-bg-orb2 {
    position: fixed;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%);
    border-radius: 50%;
    bottom: 80px; left: -60px;
    pointer-events: none;
  }
  .gs-bg-grid {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .gs-inner {
    position: relative;
    z-index: 1;
    padding: 48px 24px 32px;
    max-width: 420px;
    margin: 0 auto;
  }

  .gs-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 40px;
  }
  .gs-logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #00E5A0, #00A36C);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .gs-logo-text {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.3px;
  }
  .gs-logo-text span { color: #00E5A0; }

  .gs-steps {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 32px;
  }
  .gs-step-dot {
    height: 3px;
    border-radius: 2px;
    transition: all 0.3s ease;
    background: rgba(255,255,255,0.12);
  }
  .gs-step-dot.active { background: #00E5A0; }
  .gs-step-dot.done   { background: rgba(0,229,160,0.35); }

  .gs-heading {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    line-height: 1.2;
  }
  .gs-subheading {
    color: #4A6580;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .gs-subheading b { color: #7A95AA; font-weight: 500; }

  .gs-label {
    display: block;
    color: #4A6580;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 7px;
  }

  .gs-phone-row {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .gs-prefix {
    padding: 12px 14px;
    border-radius: 11px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    color: #7A95AA;
    font-size: 14px;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
  }

  .gs-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 11px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 16px;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .gs-input:focus {
    border-color: rgba(0,229,160,0.35);
    background: rgba(0,229,160,0.03);
  }
  .gs-input::placeholder { color: #2A3F52; }

  .gs-input-mono {
    font-family: 'DM Mono', monospace;
    letter-spacing: 3px;
    font-size: 18px;
    text-align: center;
  }

  .gs-select {
    width: 100%;
    padding: 12px 14px;
    border-radius: 11px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 16px;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A6580' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .gs-select option { background: #0D1B2A; }

  .gs-platform-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
  }
  .gs-platform-chip {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    color: #4A6580;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }
  .gs-platform-chip.selected {
    border-color: rgba(0,229,160,0.4);
    background: rgba(0,229,160,0.07);
    color: #00E5A0;
  }

  .gs-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #00E5A0, #00B87A);
    color: #050E18;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.2px;
  }
  .gs-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .gs-btn:active:not(:disabled) { transform: translateY(0); }
  .gs-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .gs-link-btn {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    color: #4A6580;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 6px;
    transition: color 0.2s;
  }
  .gs-link-btn:hover { color: #7A95AA; }

  .gs-error {
    color: #FF5C5C;
    font-size: 12px;
    margin-bottom: 10px;
    padding: 8px 12px;
    background: rgba(255,92,92,0.08);
    border-radius: 8px;
    border-left: 2px solid #FF5C5C;
  }

  .gs-demo-otp {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,179,71,0.06);
    border: 1px solid rgba(255,179,71,0.2);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }
  .gs-demo-otp-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #FFB347;
    flex-shrink: 0;
  }
  .gs-demo-otp-text { color: #8A7040; font-size: 12px; }
  .gs-demo-otp-code {
    color: #FFB347;
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    margin-left: auto;
    letter-spacing: 2px;
  }

  .gs-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 20px 0;
  }

  /* Step 3 — plan card */
  .gs-plan-card {
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid;
    position: relative;
    overflow: hidden;
  }
  .gs-plan-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.02), transparent);
  }
  .gs-plan-tier {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .gs-plan-tier::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .gs-plan-price {
    font-size: 42px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
  }
  .gs-plan-price-unit {
    font-size: 14px;
    color: #4A6580;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    margin-left: 2px;
  }
  .gs-plan-subtitle {
    color: #4A6580;
    font-size: 12px;
    margin-top: 4px;
  }

  .gs-info-list {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .gs-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .gs-info-row:last-child { border-bottom: none; }
  .gs-info-key {
    color: #3A5570;
    font-size: 13px;
  }
  .gs-info-val {
    color: #fff;
    font-size: 13px;
    font-weight: 500;
  }
  .gs-info-val.green { color: #00E5A0; }

  .gs-trust-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 24px;
  }
  .gs-trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .gs-trust-icon { font-size: 18px; }
  .gs-trust-label { color: #2A3F52; font-size: 10px; letter-spacing: 0.5px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .gs-animate { animation: fadeUp 0.35s ease forwards; }
`;

function StepDots({ step }) {
  return (
    <div className="gs-steps">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`gs-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
          style={{ flex: i === step ? 3 : 1 }}
        />
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({
    phone: '', otp: '', demoOtp: '', name: '',
    platform: 'Zomato', zone: 'laxmi_nagar', avgDailyIncome: 800
  });
  const [worker, setWorker] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSendOTP() {
    if (form.phone.length !== 10) return setError('Enter a valid 10-digit number');
    setLoading(true); setError('');
    try {
      const r = await sendOTP(form.phone);
      set('demoOtp', r.demoOtp);
      setStep(2);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function handleVerify() {
    if (form.otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true); setError('');
    try {
      const zone = ZONES.find(z => z.value === form.zone);
      const r = await verifyOTP({
        phone: form.phone, otp: form.otp,
        name: form.name || 'Worker', platform: form.platform,
        zone: form.zone, zoneLat: zone?.lat || 28.6273,
        zoneLon: zone?.lon || 77.2773, avgDailyIncome: form.avgDailyIncome
      });
      setWorker(r.worker);
      setStep(3);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <>
      <style>{css}</style>
      <div className="gs-screen">
        <div className="gs-bg-orb1" />
        <div className="gs-bg-orb2" />
        <div className="gs-bg-grid" />

        <div className="gs-inner">
          {/* Logo */}
          <div className="gs-logo">
            <div className="gs-logo-icon">🛡️</div>
            <div className="gs-logo-text">GigShield <span>AI</span></div>
          </div>

          <StepDots step={step} />

          {/* ── STEP 1: Phone ── */}
          {step === 1 && (
            <div className="gs-animate">
              <h1 className="gs-heading">Your income,<br />protected.</h1>
              <p className="gs-subheading">Enter your mobile number to get started.</p>

              <label className="gs-label">Mobile number</label>
              <div className="gs-phone-row">
                <div className="gs-prefix">+91</div>
                <input
                  className="gs-input"
                  style={{ marginBottom: 0, flex: 1, fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}
                  placeholder="98765 43210"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div style={{ height: 8 }} />
              <label className="gs-label">Platform</label>
              <div className="gs-platform-grid">
                {PLATFORMS.map(p => (
                  <div
                    key={p}
                    className={`gs-platform-chip ${form.platform === p ? 'selected' : ''}`}
                    onClick={() => set('platform', p)}
                  >
                    {p}
                  </div>
                ))}
              </div>

              {error && <div className="gs-error">{error}</div>}
              <button className="gs-btn" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP →'}
              </button>

              <div className="gs-trust-row">
                {[['🔒','Secure'],['⚡','Instant'],['₹','Weekly']].map(([icon, label]) => (
                  <div key={label} className="gs-trust-item">
                    <span className="gs-trust-icon">{icon}</span>
                    <span className="gs-trust-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP + Details ── */}
          {step === 2 && (
            <div className="gs-animate">
              <h1 className="gs-heading">Verify &amp;<br />set up profile.</h1>
              <p className="gs-subheading">
                OTP sent to <b>+91 {form.phone}</b>
              </p>

              {form.demoOtp && (
                <div className="gs-demo-otp">
                  <div className="gs-demo-otp-dot" />
                  <span className="gs-demo-otp-text">Demo OTP</span>
                  <span className="gs-demo-otp-code">{form.demoOtp}</span>
                </div>
              )}

              <label className="gs-label">OTP</label>
              <input
                className={`gs-input gs-input-mono`}
                placeholder="— — — — — —"
                maxLength={6}
                value={form.otp}
                onChange={e => set('otp', e.target.value.replace(/\D/g, ''))}
              />

              <div className="gs-divider" />

              <label className="gs-label">Full name</label>
              <input
                className="gs-input"
                placeholder="Ravi Kumar"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />

              <label className="gs-label">Delivery zone</label>
              <select
                className="gs-select"
                value={form.zone}
                onChange={e => set('zone', e.target.value)}
              >
                {ZONES.map(z => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>

              <label className="gs-label">Avg daily earnings (₹)</label>
              <input
                className="gs-input"
                type="number"
                value={form.avgDailyIncome}
                onChange={e => set('avgDailyIncome', parseInt(e.target.value) || 800)}
              />

              {error && <div className="gs-error">{error}</div>}
              <button className="gs-btn" onClick={handleVerify} disabled={loading}>
                {loading ? 'Verifying…' : 'Create Account →'}
              </button>
              <button className="gs-link-btn" onClick={() => { setStep(1); setError(''); }}>
                ← Change number
              </button>
            </div>
          )}

          {/* ── STEP 3: Plan ── */}
          {step === 3 && worker && (
            <div className="gs-animate">
              <h1 className="gs-heading">Your plan<br />is ready.</h1>
              <p className="gs-subheading">
                Welcome, <b>{worker.name}</b>. AI has priced your weekly cover.
              </p>

              <div
                className="gs-plan-card"
                style={{
                  borderColor: TIER_COLOR[worker.premiumTier] + '33',
                  background: TIER_BG[worker.premiumTier],
                }}
              >
                <div className="gs-plan-tier" style={{ color: TIER_COLOR[worker.premiumTier] }}>
                  {worker.premiumTier} risk zone
                </div>
                <div className="gs-plan-price">
                  ₹{worker.weeklyPremium}
                  <span className="gs-plan-price-unit">/week</span>
                </div>
                <div className="gs-plan-subtitle">Auto-deducted · Cancel anytime</div>
              </div>

              <div className="gs-info-list">
                {[
                  ['Zone',        worker.zone?.replace(/_/g, ' '), false],
                  ['Risk score',  `${Math.round((worker.riskScore || 0) * 100)}%`, false],
                  ['Coverage',    'Up to ₹850/day', true],
                  ['Claim filing','Zero — fully automatic', true],
                  ['Payout',      'Instant UPI transfer', true],
                ].map(([k, v, green]) => (
                  <div key={k} className="gs-info-row">
                    <span className="gs-info-key">{k}</span>
                    <span className={`gs-info-val ${green ? 'green' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>

              <button className="gs-btn" onClick={() => onComplete(worker)}>
                Buy This Week's Plan →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}