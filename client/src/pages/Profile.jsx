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
    background:
      radial-gradient(circle at 85% 15%, rgba(25,215,165,0.12), transparent 28%),
      radial-gradient(circle at 10% 80%, rgba(79,140,255,0.12), transparent 26%),
      linear-gradient(180deg, #050b14 0%, #07111f 52%, #081423 100%);
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
    background: radial-gradient(circle, rgba(25,215,165,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .pf-inner {
    position: relative;
    z-index: 1;
    max-width: 420px;
    margin: 0 auto;
  }

  .pf-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
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
    background: linear-gradient(135deg, rgba(25,215,165,0.16), rgba(79,140,255,0.12));
    border: 1px solid rgba(25,215,165,0.22);
    color: #66f0c9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    overflow: hidden;
    flex-shrink: 0;
  }

  .pf-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pf-name {
    color: #fff;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.3px;
    margin-bottom: 2px;
  }

  .pf-sub {
    color: #8ea3bc;
    font-size: 12px;
  }

  .pf-title {
    color: #8ea3bc;
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
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .pf-row:last-child {
    border-bottom: none;
  }

  .pf-key {
    color: #8ea3bc;
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
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    color: #fff;
    padding: 10px 11px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
  }

  .pf-input:focus,
  .pf-select:focus {
    border-color: rgba(25,215,165,0.3);
    background: rgba(25,215,165,0.04);
    box-shadow: 0 0 0 4px rgba(25,215,165,0.08);
  }

  .pf-select option {
    background: #0D1B2A;
  }

  .pf-form-row {
    margin-bottom: 12px;
  }

  .pf-label {
    color: #8ea3bc;
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
    border-radius: 12px;
    padding: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .pf-save-btn {
    border: 1px solid rgba(25,215,165,0.25);
    background: rgba(25,215,165,0.08);
    color: #66f0c9;
  }

  .pf-cancel-btn {
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: #b0bfd0;
  }

  .pf-error {
    margin-top: 2px;
    margin-bottom: 10px;
    color: #ff7b7b;
    font-size: 12px;
  }

  .pf-photo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .pf-photo-btn {
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.04);
    color: #b0bfd0;
    border-radius: 12px;
    padding: 8px 11px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .pf-photo-btn:hover {
    border-color: rgba(255,255,255,0.22);
    color: #fff;
  }

  .pf-photo-remove {
    border: 1px solid rgba(255,107,107,0.35);
    background: transparent;
    color: #ff7b7b;
    border-radius: 12px;
    padding: 8px 11px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .pf-photo-remove:hover {
    border-color: rgba(232,85,85,0.55);
  }

  .pf-hidden-file {
    display: none;
  }

  .pf-toast {
    position: fixed;
    left: 50%;
    bottom: 82px;
    transform: translateX(-50%);
    z-index: 60;
    border-radius: 10px;
    border: 1px solid rgba(25,215,165,0.25);
    background: rgba(25,215,165,0.08);
    color: #66f0c9;
    font-size: 12px;
    padding: 9px 13px;
    white-space: nowrap;
  }

  .pf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .pf-stat {
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    padding: 12px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .pf-stat-val {
    color: #fff;
    font-family: 'DM Mono', monospace;
    font-size: 20px;
    margin-bottom: 3px;
  }

  .pf-stat-val.green {
    color: #66f0c9;
  }

  .pf-stat-key {
    color: #8ea3bc;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .pf-btn {
    width: 100%;
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #b0bfd0;
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
    border-color: rgba(25,215,165,0.25);
    background: rgba(25,215,165,0.08);
    color: #66f0c9;
  }

  .pf-btn-danger {
    border-color: rgba(255,107,107,0.35);
    color: #ff7b7b;
  }

  .pf-help-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 8, 16, 0.74);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    z-index: 90;
  }

  .pf-help-modal {
    width: min(420px, 100%);
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(180deg, rgba(11,22,38,0.98) 0%, rgba(7,15,27,0.98) 100%);
    box-shadow: 0 20px 48px rgba(0,0,0,0.44);
    overflow: hidden;
  }

  .pf-help-head {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pf-help-title {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }

  .pf-help-close {
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.04);
    color: #b0bfd0;
    border-radius: 10px;
    font-size: 11px;
    font-family: 'DM Sans', sans-serif;
    padding: 5px 10px;
    cursor: pointer;
  }

  .pf-help-body {
    padding: 14px 16px 16px;
  }

  .pf-help-text {
    color: #9db0c4;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .pf-help-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
    margin-bottom: 14px;
  }

  .pf-help-item {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    padding: 10px 11px;
    color: #d4e0ee;
    font-size: 12px;
  }

  .pf-help-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .pf-help-btn {
    border: 1px solid rgba(79,140,255,0.28);
    background: rgba(79,140,255,0.1);
    color: #b9d5ff;
    border-radius: 10px;
    padding: 9px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .pf-help-btn.secondary {
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.03);
    color: #b0bfd0;
  }
`;

export default function Profile({ worker, onLogout, onOpenPolicy, onUpdateProfile }) {
  const zoneName = worker?.zone?.replace(/_/g, ' ') || 'Not set';
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile saved successfully');
  const [helpOpen, setHelpOpen] = useState(false);
  const [form, setForm] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    platform: worker?.platform || PLATFORMS[0],
    zone: worker?.zone || ZONES[0].value,
    profileImage: worker?.profileImage || '',
  });

  useEffect(() => {
    setForm({
      name: worker?.name || '',
      phone: worker?.phone || '',
      platform: worker?.platform || PLATFORMS[0],
      zone: worker?.zone || ZONES[0].value,
      profileImage: worker?.profileImage || '',
    });
  }, [worker]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(timer);
  }, [showToast]);

  function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: typeof reader.result === 'string' ? reader.result : '' }));
      setError('');
    };
    reader.readAsDataURL(file);
  }

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
      profileImage: form.profileImage,
    });

    setError('');
    setIsEditing(false);
    setToastMessage('Profile saved successfully');
    setShowToast(true);
  }

  function handleCopySupportEmail() {
    const supportEmail = 'support@gigshield.ai';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(supportEmail).catch(() => {});
    }
    setToastMessage('Support email copied');
    setShowToast(true);
  }

  return (
    <>
      <style>{css}</style>
      <div className="pf-screen">
        <div className="pf-bg-orb" />
        <div className="pf-inner">
          <div className="pf-card">
            <div className="pf-head">
              <div className="pf-avatar">
                {worker?.profileImage ? (
                  <img src={worker.profileImage} alt="Profile" className="pf-avatar-img" />
                ) : (
                  worker?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
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
                <div className="pf-photo-row">
                  <div className="pf-avatar">
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile preview" className="pf-avatar-img" />
                    ) : (
                      form.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <label className="pf-photo-btn" htmlFor="pf-photo-input">
                    Upload photo
                  </label>
                  {form.profileImage && (
                    <button
                      className="pf-photo-remove"
                      onClick={() => setForm((prev) => ({ ...prev, profileImage: '' }))}
                    >
                      Remove
                    </button>
                  )}
                  <input
                    id="pf-photo-input"
                    className="pf-hidden-file"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                  />
                </div>

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
            <button className="pf-btn" onClick={() => setHelpOpen(true)}>Help & support</button>
            <button className="pf-btn">About GigShield AI</button>
            <button className="pf-btn pf-btn-danger" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </div>
      {helpOpen && (
        <div className="pf-help-backdrop" onClick={() => setHelpOpen(false)}>
          <div className="pf-help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-help-head">
              <div className="pf-help-title">Help & Support</div>
              <button className="pf-help-close" onClick={() => setHelpOpen(false)}>Close</button>
            </div>
            <div className="pf-help-body">
              <p className="pf-help-text">
                Quick checks before raising support: keep policy active, ensure location access, and allow auto-refresh for claims.
              </p>
              <ul className="pf-help-list">
                <li className="pf-help-item">Claims are generated automatically when disruption thresholds are crossed.</li>
                <li className="pf-help-item">Policy status refreshes every minute on the dashboard.</li>
                <li className="pf-help-item">If payouts are delayed, verify server and AI engine are both running.</li>
              </ul>
              <div className="pf-help-actions">
                <button className="pf-help-btn" onClick={handleCopySupportEmail}>Copy support email</button>
                <button className="pf-help-btn secondary" onClick={() => setHelpOpen(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showToast && <div className="pf-toast">{toastMessage}</div>}
    </>
  );
}
