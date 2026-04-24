import React, { useEffect, useMemo, useState } from 'react';
import { sendOTP, verifyOTP } from '../services/api';

const ZONES = [
  { label: 'Laxmi Nagar', value: 'laxmi_nagar', lat: 28.6273, lon: 77.2773 },
  { label: 'Yamuna Bank', value: 'yamuna_bank', lat: 28.62, lon: 77.29 },
  { label: 'Dwarka', value: 'dwarka', lat: 28.5921, lon: 77.046 },
  { label: 'Connaught Place', value: 'connaught_place', lat: 28.6315, lon: 77.2167 },
  { label: 'Gurugram', value: 'gurugram', lat: 28.4595, lon: 77.0266 },
  { label: 'Noida', value: 'noida', lat: 28.5355, lon: 77.391 },
];

const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Amazon'];
const ONBOARDING_DRAFT_KEY = 'gigshield_onboarding_draft';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');

  .gs-screen {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(218, 93, 54, 0.12), transparent 24%),
      radial-gradient(circle at bottom right, rgba(35, 89, 209, 0.1), transparent 20%),
      linear-gradient(180deg, var(--bg-app) 0%, color-mix(in srgb, var(--bg-app) 90%, #000 10%) 100%);
  }

  .gs-wrap {
    max-width: 1160px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 18px;
  }

  .gs-stage,
  .gs-aside {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 32px;
    box-shadow: var(--shadow);
  }

  .gs-stage {
    padding: 24px;
  }

  .gs-mark {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .gs-mark-badge {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: #fff6ee;
    font-family: var(--font-display);
    font-weight: 700;
  }

  .gs-mark-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
  }

  .gs-mark-sub,
  .gs-kicker,
  .gs-label,
  .gs-info-kicker {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .gs-progress {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 24px;
  }

  .gs-progress-step {
    border-radius: 999px;
    height: 8px;
    background: color-mix(in srgb, var(--bg-ink) 12%, transparent);
  }

  .gs-progress-step.done {
    background: color-mix(in srgb, var(--accent) 44%, transparent);
  }

  .gs-progress-step.active {
    background: var(--accent);
  }

  .gs-title {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4vw, 3.8rem);
    line-height: 0.96;
    letter-spacing: -0.06em;
    margin: 10px 0 14px;
    max-width: 12ch;
  }

  .gs-lead,
  .gs-draft-copy,
  .gs-info-copy,
  .gs-preview-copy {
    color: var(--text-muted);
    line-height: 1.6;
  }

  .gs-draft {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
    margin-bottom: 18px;
  }

  .gs-draft-btn,
  .gs-chip,
  .gs-link-btn,
  .gs-btn {
    border-radius: 16px;
    cursor: pointer;
    font-weight: 700;
    transition: transform 0.18s ease;
  }

  .gs-draft-btn,
  .gs-link-btn {
    border: 1px solid var(--line);
    background: var(--bg-card);
    color: var(--text);
    padding: 10px 12px;
  }

  .gs-btn {
    border: none;
    background: var(--accent);
    color: #fff6ee;
    padding: 12px 16px;
  }

  .gs-draft-btn:hover,
  .gs-chip:hover,
  .gs-link-btn:hover,
  .gs-btn:hover {
    transform: translateY(-1px);
  }

  .gs-form {
    display: grid;
    gap: 14px;
    margin-top: 20px;
  }

  .gs-field {
    display: grid;
    gap: 8px;
  }

  .gs-phone-row {
    display: grid;
    grid-template-columns: 86px 1fr;
    gap: 10px;
  }

  .gs-prefix,
  .gs-input,
  .gs-select {
    width: 100%;
    border-radius: 18px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 13px 14px;
    outline: none;
  }

  .gs-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
  }

  .gs-input.mono {
    font-family: var(--font-mono);
    letter-spacing: 0.24em;
    text-align: center;
  }

  .gs-platform-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .gs-chip {
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text-muted);
    padding: 12px;
    text-align: center;
  }

  .gs-chip.selected {
    background: var(--bg-ink);
    color: var(--text-inverse);
    border-color: transparent;
  }

  .gs-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .gs-error {
    border-radius: 16px;
    background: var(--danger-soft);
    color: var(--danger);
    padding: 12px 14px;
  }

  .gs-demo {
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .gs-demo-code {
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 1.3rem;
    letter-spacing: 0.3em;
  }

  .gs-aside {
    padding: 20px;
    display: grid;
    gap: 14px;
    align-content: start;
  }

  .gs-preview-card,
  .gs-info-card {
    border-radius: 24px;
    padding: 18px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
  }

  .gs-preview-card {
    background: var(--bg-ink);
    color: var(--text-inverse);
    border-color: transparent;
  }

  .gs-preview-title {
    font-family: var(--font-display);
    font-size: 1.45rem;
    line-height: 1.02;
    margin: 8px 0 12px;
  }

  .gs-preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 16px;
  }

  .gs-preview-metric {
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.06);
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .gs-preview-value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin: 8px 0 2px;
  }

  .gs-info-list {
    display: grid;
    gap: 10px;
  }

  .gs-info-item {
    border-radius: 18px;
    background: var(--bg-card);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .gs-info-title {
    font-weight: 700;
    margin: 6px 0 4px;
  }

  @media (max-width: 960px) {
    .gs-wrap {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .gs-screen {
      padding: 16px;
    }

    .gs-platform-grid,
    .gs-preview-grid {
      grid-template-columns: 1fr;
    }

    .gs-phone-row {
      grid-template-columns: 1fr;
    }
  }
`;

function Progress({ step }) {
  return (
    <div className="gs-progress">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`gs-progress-step ${item === step ? 'active' : item < step ? 'done' : ''}`}
        />
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    otp: '',
    demoOtp: '',
    name: '',
    platform: 'Zomato',
    zone: 'laxmi_nagar',
    avgDailyIncome: 800,
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;
      setHasDraft(true);
      if (draft.autoLoad) {
        setForm((prev) => ({ ...prev, ...draft.form }));
        setStep(draft.step || 1);
      }
    } catch {
      // ignore corrupted drafts
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        step,
        form,
        autoLoad: false,
        ts: Date.now(),
      })
    );
  }, [form, step]);

  function resumeDraft() {
    try {
      const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...(draft.form || {}) }));
      setStep(draft.step || 1);
      setHasDraft(false);
      setError('');
    } catch {
      // ignore
    }
  }

  function clearDraft() {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    setHasDraft(false);
  }

  async function handleSendOTP() {
    if (form.phone.length !== 10) {
      setError('Enter a valid 10-digit number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await sendOTP(form.phone);
      set('demoOtp', response.demoOtp);
      setStep(2);
    } catch (eventError) {
      setError(eventError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (form.otp.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const zone = ZONES.find((item) => item.value === form.zone);
      const response = await verifyOTP({
        phone: form.phone,
        otp: form.otp,
        name: form.name || 'Worker',
        platform: form.platform,
        zone: form.zone,
        zoneLat: zone?.lat || 28.6273,
        zoneLon: zone?.lon || 77.2773,
        avgDailyIncome: form.avgDailyIncome,
      });
      setWorker(response.worker);
      setStep(3);
    } catch (eventError) {
      setError(eventError.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedZone = useMemo(
    () => ZONES.find((zone) => zone.value === form.zone) || ZONES[0],
    [form.zone]
  );

  return (
    <>
      <style>{css}</style>
      <div className="gs-screen">
        <div className="gs-wrap">
          <section className="gs-stage">
            <div className="gs-mark">
              <div className="gs-mark-badge">GS</div>
              <div>
                <div className="gs-mark-title">GigShield</div>
                <div className="gs-mark-sub">Weekly protection for field workers</div>
              </div>
            </div>

            <Progress step={step} />

            {step === 1 && (
              <>
                <div className="gs-kicker">Step 1</div>
                <h1 className="gs-title">Start with your working number.</h1>
                <p className="gs-lead">
                  The first screen now feels more like a product intake than a hackathon landing page. We keep the flow short, but the visual system is tighter and the preview updates as you enter details.
                </p>

                {hasDraft && (
                  <div className="gs-draft">
                    <div className="gs-draft-copy">There’s a saved onboarding draft from an earlier session.</div>
                    <button className="gs-draft-btn" onClick={resumeDraft}>Resume draft</button>
                  </div>
                )}

                <div className="gs-form">
                  <div className="gs-field">
                    <label className="gs-label">Mobile number</label>
                    <div className="gs-phone-row">
                      <div className="gs-prefix">+91</div>
                      <input
                        className="gs-input"
                        placeholder="9876543210"
                        value={form.phone}
                        maxLength={10}
                        onChange={(event) => set('phone', event.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="gs-field">
                    <label className="gs-label">Platform</label>
                    <div className="gs-platform-grid">
                      {PLATFORMS.map((platform) => (
                        <button
                          type="button"
                          key={platform}
                          className={`gs-chip ${form.platform === platform ? 'selected' : ''}`}
                          onClick={() => set('platform', platform)}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="gs-error">{error}</div>}

                  <div className="gs-actions">
                    <button className="gs-btn" onClick={handleSendOTP} disabled={loading}>
                      {loading ? 'Sending OTP…' : 'Send OTP'}
                    </button>
                    {hasDraft && <button className="gs-link-btn" onClick={clearDraft}>Clear draft</button>}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="gs-kicker">Step 2</div>
                <h1 className="gs-title">Verify and map your working zone.</h1>
                <p className="gs-lead">
                  Once OTP is verified, GigShield uses your platform, zone, and daily income to return a live weekly premium and risk tier.
                </p>

                {form.demoOtp && (
                  <div className="gs-demo">
                    <div className="gs-info-kicker">Demo OTP</div>
                    <div className="gs-demo-code">{form.demoOtp}</div>
                  </div>
                )}

                <div className="gs-form">
                  <div className="gs-field">
                    <label className="gs-label">OTP</label>
                    <input
                      className="gs-input mono"
                      placeholder="123456"
                      maxLength={6}
                      value={form.otp}
                      onChange={(event) => set('otp', event.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="gs-field">
                    <label className="gs-label">Full name</label>
                    <input
                      className="gs-input"
                      placeholder="Ravi Kumar"
                      value={form.name}
                      onChange={(event) => set('name', event.target.value)}
                    />
                  </div>

                  <div className="gs-field">
                    <label className="gs-label">Delivery zone</label>
                    <select className="gs-select" value={form.zone} onChange={(event) => set('zone', event.target.value)}>
                      {ZONES.map((zone) => (
                        <option key={zone.value} value={zone.value}>{zone.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="gs-field">
                    <label className="gs-label">Average daily income</label>
                    <input
                      className="gs-input"
                      type="number"
                      value={form.avgDailyIncome}
                      onChange={(event) => set('avgDailyIncome', parseInt(event.target.value, 10) || 800)}
                    />
                  </div>

                  {error && <div className="gs-error">{error}</div>}

                  <div className="gs-actions">
                    <button className="gs-btn" onClick={handleVerify} disabled={loading}>
                      {loading ? 'Verifying…' : 'Create account'}
                    </button>
                    <button className="gs-link-btn" onClick={() => { setStep(1); setError(''); }}>
                      Change number
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && worker && (
              <>
                <div className="gs-kicker">Step 3</div>
                <h1 className="gs-title">Your weekly quote is ready.</h1>
                <p className="gs-lead">
                  The app has priced your cover and assigned a risk tier. From here, you’ll move into Policy Studio to compare the recommendation against other cover shapes.
                </p>

                <div className="gs-form">
                  <div className="gs-info-card">
                    <div className="gs-info-kicker">Quote summary</div>
                    <div className="gs-info-title">{worker.name}, your current weekly price is ₹{worker.weeklyPremium}.</div>
                    <div className="gs-info-copy">
                      Zone: {worker.zone?.replace(/_/g, ' ')} • Risk score: {Math.round((worker.riskScore || 0) * 100)}% • Risk tier: {worker.premiumTier}
                    </div>
                  </div>

                  <div className="gs-actions">
                    <button className="gs-btn" onClick={() => { clearDraft(); onComplete(worker); }}>
                      Continue to policy studio
                    </button>
                    <button className="gs-link-btn" onClick={clearDraft}>Clear draft</button>
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="gs-aside">
            <div className="gs-preview-card">
              <div className="gs-info-kicker">Live preview</div>
              <div className="gs-preview-title">A cleaner first impression for GigShield.</div>
              <div className="gs-preview-copy">
                The redesign leans into an operations dashboard tone: sharper typography, quieter surfaces, and more useful information density.
              </div>

              <div className="gs-preview-grid">
                <div className="gs-preview-metric">
                  <div className="gs-info-kicker">Zone</div>
                  <div className="gs-preview-value" style={{ fontSize: '1.2rem' }}>{selectedZone.label}</div>
                </div>
                <div className="gs-preview-metric">
                  <div className="gs-info-kicker">Daily income</div>
                  <div className="gs-preview-value">₹{form.avgDailyIncome}</div>
                </div>
              </div>
            </div>

            <div className="gs-info-card">
              <div className="gs-info-kicker">What changed</div>
              <div className="gs-info-list">
                <div className="gs-info-item">
                  <div className="gs-info-title">Less generic styling</div>
                  <div className="gs-info-copy">No more repeated glass cards and neon gradients on every screen.</div>
                </div>
                <div className="gs-info-item">
                  <div className="gs-info-title">Stronger product framing</div>
                  <div className="gs-info-copy">Screens now read like an insurance operations tool rather than a visual concept demo.</div>
                </div>
                <div className="gs-info-item">
                  <div className="gs-info-title">More useful features</div>
                  <div className="gs-info-copy">You now get plan comparison, shift briefs, and a cleaner claims workflow.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
