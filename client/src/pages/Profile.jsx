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
  .pf-screen {
    min-height: 100%;
    padding: 24px;
  }

  .pf-stack {
    display: grid;
    gap: 16px;
  }

  .pf-hero,
  .pf-card {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 24px;
    box-shadow: var(--shadow);
  }

  .pf-hero {
    padding: 20px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
    gap: 16px;
  }

  .pf-kicker,
  .pf-card-kicker,
  .pf-label {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .pf-title {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 3rem);
    line-height: 0.98;
    letter-spacing: -0.06em;
    margin: 10px 0 12px;
  }

  .pf-lead,
  .pf-sub,
  .pf-row-copy,
  .pf-info-copy,
  .pf-help-text,
  .pf-help-item {
    color: var(--text-muted);
    line-height: 1.55;
  }

  .pf-headline {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .pf-avatar {
    width: 70px;
    height: 70px;
    border-radius: 22px;
    background: color-mix(in srgb, var(--accent) 22%, var(--bg-ink) 78%);
    color: #fff6ee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    overflow: hidden;
  }

  .pf-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pf-name {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin-top: 6px;
  }

  .pf-chip-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .pf-chip {
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .pf-chip-value {
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin: 8px 0 4px;
  }

  .pf-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
    gap: 16px;
  }

  .pf-card {
    padding: 18px;
  }

  .pf-card-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin: 6px 0 14px;
  }

  .pf-form {
    display: grid;
    gap: 12px;
  }

  .pf-field {
    display: grid;
    gap: 8px;
  }

  .pf-input,
  .pf-select {
    width: 100%;
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 12px 14px;
    outline: none;
  }

  .pf-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    padding: 14px 0;
    border-top: 1px solid var(--line);
  }

  .pf-row:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .pf-row-title {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .pf-row-value {
    text-align: right;
    font-weight: 700;
  }

  .pf-actions {
    display: grid;
    gap: 10px;
  }

  .pf-btn,
  .pf-btn-primary,
  .pf-btn-danger {
    width: 100%;
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s ease;
  }

  .pf-btn,
  .pf-btn-danger {
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
  }

  .pf-btn-primary {
    border: none;
    background: var(--accent);
    color: #fff6ee;
  }

  .pf-btn-danger {
    color: var(--danger);
  }

  .pf-btn:hover,
  .pf-btn-primary:hover,
  .pf-btn-danger:hover {
    transform: translateY(-1px);
  }

  .pf-photo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pf-photo-btn,
  .pf-photo-remove {
    border-radius: 14px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 10px 12px;
    cursor: pointer;
    font-weight: 600;
  }

  .pf-photo-remove {
    color: var(--danger);
  }

  .pf-hidden-file {
    display: none;
  }

  .pf-error {
    color: var(--danger);
    background: var(--danger-soft);
    border-radius: 14px;
    padding: 12px;
  }

  .pf-toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    background: var(--bg-ink);
    color: var(--text-inverse);
    border-radius: 999px;
    padding: 10px 14px;
    z-index: 60;
  }

  .pf-help-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(17, 22, 29, 0.42);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    z-index: 70;
  }

  .pf-help-modal {
    width: min(460px, 100%);
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 28px;
    box-shadow: var(--shadow);
    padding: 20px;
  }

  .pf-help-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    margin: 8px 0 10px;
  }

  .pf-help-list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 8px;
  }

  @media (max-width: 920px) {
    .pf-hero,
    .pf-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .pf-screen {
      padding: 16px;
    }

    .pf-chip-grid {
      grid-template-columns: 1fr;
    }

    .pf-row {
      flex-direction: column;
    }

    .pf-row-value {
      text-align: left;
    }
  }
`;

export default function Profile({ worker, onLogout, onOpenPolicy, onUpdateProfile }) {
  const zoneName = worker?.zone?.replace(/_/g, ' ') || 'Not set';
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile saved');
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
    if (!showToast) return undefined;
    const timer = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(timer);
  }, [showToast]);

  function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image should be under 2MB.');
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
    if (!/^\d{10}$/.test(phone)) {
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
    setToastMessage('Profile saved');
    setShowToast(true);
  }

  function handleCopySupportEmail() {
    const supportEmail = 'support@gigshield.ai';
    navigator.clipboard?.writeText(supportEmail).catch(() => {});
    setToastMessage('Support email copied');
    setShowToast(true);
  }

  return (
    <>
      <style>{css}</style>
      <div className="pf-screen">
        <div className="pf-stack">
          <section className="pf-hero">
            <div>
              <div className="pf-kicker">Profile studio</div>
              <h1 className="pf-title">Personal settings without the demo-app feel.</h1>
              <p className="pf-lead">
                This screen now behaves more like an operations profile: clean identity details, editable field data, and support shortcuts that feel deliberate instead of filler.
              </p>
            </div>

            <div className="pf-card" style={{ boxShadow: 'none', margin: 0 }}>
              <div className="pf-headline">
                <div className="pf-avatar">
                  {worker?.profileImage ? <img src={worker.profileImage} alt="Profile" /> : worker?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="pf-card-kicker">Member</div>
                  <div className="pf-name">{worker?.name || 'Worker'}</div>
                  <div className="pf-sub">+91 {worker?.phone} • {worker?.platform}</div>
                </div>
              </div>

              <div className="pf-chip-grid" style={{ marginTop: 16 }}>
                <div className="pf-chip">
                  <div className="pf-card-kicker">Weekly premium</div>
                  <div className="pf-chip-value">₹{worker?.weeklyPremium || 0}</div>
                  <div className="pf-sub">Current plan cost</div>
                </div>
                <div className="pf-chip">
                  <div className="pf-card-kicker">Risk tier</div>
                  <div className="pf-chip-value">{worker?.premiumTier || 'N/A'}</div>
                  <div className="pf-sub">Zone-based pricing tier</div>
                </div>
              </div>
            </div>
          </section>

          <section className="pf-grid">
            <div className="pf-card">
              <div className="pf-kicker">Identity</div>
              <div className="pf-card-title">{isEditing ? 'Edit profile details' : 'Account details'}</div>

              {!isEditing ? (
                <>
                  <div className="pf-row">
                    <div>
                      <div className="pf-row-title">Work zone</div>
                      <div className="pf-row-copy">Current monitoring region for risk and claims.</div>
                    </div>
                    <div className="pf-row-value">{zoneName}</div>
                  </div>
                  <div className="pf-row">
                    <div>
                      <div className="pf-row-title">Platform</div>
                      <div className="pf-row-copy">Used for payout planning and account context.</div>
                    </div>
                    <div className="pf-row-value">{worker?.platform || '-'}</div>
                  </div>
                  <div className="pf-row">
                    <div>
                      <div className="pf-row-title">Contact</div>
                      <div className="pf-row-copy">Primary mobile for sign-in and alerts.</div>
                    </div>
                    <div className="pf-row-value">+91 {worker?.phone || '-'}</div>
                  </div>
                </>
              ) : (
                <div className="pf-form">
                  <div className="pf-photo-row">
                    <div className="pf-avatar">
                      {form.profileImage ? <img src={form.profileImage} alt="Preview" /> : form.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <label className="pf-photo-btn" htmlFor="profile-photo-input">Upload photo</label>
                    {form.profileImage && (
                      <button className="pf-photo-remove" onClick={() => setForm((prev) => ({ ...prev, profileImage: '' }))}>
                        Remove
                      </button>
                    )}
                    <input
                      id="profile-photo-input"
                      className="pf-hidden-file"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                    />
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Full name</label>
                    <input
                      className="pf-input"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Phone number</label>
                    <input
                      className="pf-input"
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    />
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Platform</label>
                    <select
                      className="pf-select"
                      value={form.platform}
                      onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
                    >
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pf-field">
                    <label className="pf-label">Zone</label>
                    <select
                      className="pf-select"
                      value={form.zone}
                      onChange={(event) => setForm((prev) => ({ ...prev, zone: event.target.value }))}
                    >
                      {ZONES.map((zone) => (
                        <option key={zone.value} value={zone.value}>{zone.label}</option>
                      ))}
                    </select>
                  </div>

                  {error && <div className="pf-error">{error}</div>}

                  <div className="pf-actions">
                    <button className="pf-btn-primary" onClick={handleSaveProfile}>Save profile</button>
                    <button className="pf-btn" onClick={() => { setIsEditing(false); setError(''); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="pf-stack">
              <div className="pf-card">
                <div className="pf-kicker">New feature</div>
                <div className="pf-card-title">Safety and support</div>
                <div className="pf-row">
                  <div>
                    <div className="pf-row-title">Support contact</div>
                    <div className="pf-row-copy">Quick access when claims or location sync look off.</div>
                  </div>
                  <div className="pf-row-value">support@gigshield.ai</div>
                </div>
                <div className="pf-row">
                  <div>
                    <div className="pf-row-title">Monitoring region</div>
                    <div className="pf-row-copy">Claims depend on this zone staying accurate.</div>
                  </div>
                  <div className="pf-row-value">{zoneName}</div>
                </div>
              </div>

              <div className="pf-card">
                <div className="pf-kicker">Actions</div>
                <div className="pf-card-title">Workspace controls</div>
                <div className="pf-actions">
                  <button className="pf-btn-primary" onClick={() => setIsEditing(true)}>
                    {isEditing ? 'Editing active' : 'Edit profile'}
                  </button>
                  <button className="pf-btn" onClick={onOpenPolicy}>Open policy studio</button>
                  <button className="pf-btn" onClick={() => setHelpOpen(true)}>Help and support</button>
                  <button className="pf-btn-danger" onClick={onLogout}>Sign out</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {helpOpen && (
        <div className="pf-help-backdrop" onClick={() => setHelpOpen(false)}>
          <div className="pf-help-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pf-kicker">Support</div>
            <div className="pf-help-title">Quick checks before raising a ticket</div>
            <p className="pf-help-text">
              These are the three most common causes of confusing payout behavior in the demo environment.
            </p>
            <ul className="pf-help-list">
              <li className="pf-help-item">Make sure the backend and AI engine are both running before you test disruptions.</li>
              <li className="pf-help-item">Keep your work zone updated so location-based claim triggers stay aligned.</li>
              <li className="pf-help-item">If a payout looks delayed, refresh the claims screen after the next polling cycle.</li>
            </ul>
            <div className="pf-actions" style={{ marginTop: 16 }}>
              <button className="pf-btn-primary" onClick={handleCopySupportEmail}>Copy support email</button>
              <button className="pf-btn" onClick={() => setHelpOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="pf-toast">{toastMessage}</div>}
    </>
  );
}
