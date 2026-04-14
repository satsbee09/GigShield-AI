import React, { useEffect, useState } from 'react';

const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Amazon'];
const ZONES = [
  { label: 'Laxmi Nagar', value: 'laxmi_nagar', lat: 28.6273, lon: 77.2773 },
  { label: 'Yamuna Bank', value: 'yamuna_bank', lat: 28.62, lon: 77.29 },
  { label: 'Dwarka', value: 'dwarka', lat: 28.5921, lon: 77.046 },
  { label: 'Connaught Place', value: 'connaught_place', lat: 28.6315, lon: 77.2167 },
  { label: 'Gurugram', value: 'gurugram', lat: 28.4595, lon: 77.0266 },
  { label: 'Noida', value: 'noida', lat: 28.5355, lon: 77.391 },
];

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

  .pf-input,
  .pf-select {
    width: 100%;
    margin-top: 6px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
    color: #fff;
    padding: 10px 11px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
  }

  .pf-input:focus,
  .pf-select:focus {
    border-color: rgba(0,229,160,0.3);
    background: rgba(0,229,160,0.03);
  }

  .pf-select option {
    background: #0D1B2A;
  }

  .pf-form-row {
    margin-bottom: 12px;
  }

  .pf-label {
    color: #7A95AA;
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .pf-form-actions {
    display: flex;
    gap: 8px;
    margin-top: 6px;
  }

  .pf-save-btn,
  .pf-cancel-btn {
    flex: 1;
    border-radius: 10px;
    padding: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .pf-save-btn {
    border: 1px solid rgba(0,229,160,0.25);
    background: rgba(0,229,160,0.08);
    color: #00E5A0;
  }

  .pf-cancel-btn {
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: #9FB2C6;
  }

  .pf-error {
    margin-top: 2px;
    margin-bottom: 10px;
    color: #FF6F6F;
    font-size: 12px;
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

export default function Profile({ worker, onLogout, onOpenPolicy, onUpdateProfile }) {
  const zoneName = worker?.zone?.replace(/_/g, ' ') || 'Not set';
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    platform: worker?.platform || PLATFORMS[0],
    zone: worker?.zone || ZONES[0].value,
  });

  useEffect(() => {
    setForm({
      name: worker?.name || '',
      phone: worker?.phone || '',
      platform: worker?.platform || PLATFORMS[0],
      zone: worker?.zone || ZONES[0].value,
    });
  }, [worker]);

  function handleSaveProfile() {
    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name) {
      setError('Name is required.');
      return;
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    const selectedZone = ZONES.find((zone) => zone.value === form.zone);

    onUpdateProfile({
      ...worker,
      name,
      phone,
      platform: form.platform,
      zone: form.zone,
      zoneLat: selectedZone?.lat ?? worker?.zoneLat,
      zoneLon: selectedZone?.lon ?? worker?.zoneLon,
    });

    setError('');
    setIsEditing(false);
  }

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
            {!isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <div className="pf-form-row">
                  <div className="pf-label">Full name</div>
                  <input
                    className="pf-input"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="pf-form-row">
                  <div className="pf-label">Phone number</div>
                  <input
                    className="pf-input"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="10-digit phone number"
                  />
                </div>

                <div className="pf-form-row">
                  <div className="pf-label">Platform</div>
                  <select
                    className="pf-select"
                    value={form.platform}
                    onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                <div className="pf-form-row">
                  <div className="pf-label">Work zone</div>
                  <select
                    className="pf-select"
                    value={form.zone}
                    onChange={(e) => setForm((prev) => ({ ...prev, zone: e.target.value }))}
                  >
                    {ZONES.map((zone) => (
                      <option key={zone.value} value={zone.value}>{zone.label}</option>
                    ))}
                  </select>
                </div>

                {error && <div className="pf-error">{error}</div>}

                <div className="pf-form-actions">
                  <button className="pf-cancel-btn" onClick={() => { setIsEditing(false); setError(''); }}>
                    Cancel
                  </button>
                  <button className="pf-save-btn" onClick={handleSaveProfile}>
                    Save profile
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="pf-card">
            <div className="pf-title">Actions</div>
            <button className="pf-btn" onClick={() => setIsEditing(true)}>
              {isEditing ? 'Editing profile...' : 'Set up profile'}
            </button>
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
