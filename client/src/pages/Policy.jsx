import React, { useEffect, useMemo, useState } from 'react';
import { createPolicy } from '../services/api';
import { getText } from '../i18n';

const PLANS = [
  {
    id: 'shield-lite',
    name: 'Shift Lite',
    coverage: 400,
    disruptionDays: 4,
    support: 'Standard review lane',
    copy: 'For workers who want a smaller weekly spend and a basic payout ceiling.',
  },
  {
    id: 'shield-core',
    name: 'Core Cover',
    coverage: 600,
    disruptionDays: 7,
    support: 'Priority claim lane',
    copy: 'Balanced weekly cover with the strongest value for mixed-risk zones.',
  },
  {
    id: 'shield-max',
    name: 'Max Buffer',
    coverage: 850,
    disruptionDays: 10,
    support: 'Priority claim lane + extended watch',
    copy: 'The widest payout window for high-disruption weeks and volatile zones.',
  },
];

const FEATURE_ROWS = [
  ['Heavy rain and flooding', 'Auto-triggered'],
  ['Heatwave and AQI spikes', 'Auto-triggered'],
  ['Traffic corridor shutdowns', 'Auto-triggered'],
  ['Manual paperwork', 'Not required'],
];

const css = `
  .pl-screen {
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(218, 93, 54, 0.1), transparent 24%),
      linear-gradient(180deg, var(--bg-app) 0%, color-mix(in srgb, var(--bg-app) 88%, #000 12%) 100%);
  }

  .pl-wrap {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    gap: 18px;
  }

  .pl-topbar,
  .pl-stage,
  .pl-modal {
    background: var(--bg-card);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
  }

  .pl-topbar {
    border-radius: 26px;
    padding: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .pl-back-btn,
  .pl-ghost-btn,
  .pl-primary-btn {
    border-radius: 16px;
    padding: 11px 15px;
    cursor: pointer;
    font-weight: 700;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }

  .pl-back-btn,
  .pl-ghost-btn {
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
  }

  .pl-primary-btn {
    border: none;
    background: var(--accent);
    color: #fff7ee;
  }

  .pl-back-btn:hover,
  .pl-ghost-btn:hover,
  .pl-primary-btn:hover {
    transform: translateY(-1px);
  }

  .pl-topbar-copy {
    min-width: 0;
  }

  .pl-kicker,
  .pl-section-kicker,
  .pl-card-kicker {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .pl-topbar-title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    margin-top: 6px;
  }

  .pl-topbar-sub {
    color: var(--text-muted);
    margin-top: 4px;
    font-size: 0.92rem;
  }

  .pl-stage {
    border-radius: 32px;
    padding: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
    gap: 18px;
  }

  .pl-title {
    font-family: var(--font-display);
    font-size: clamp(2.1rem, 4vw, 3.5rem);
    line-height: 0.96;
    letter-spacing: -0.06em;
    margin: 10px 0 14px;
    max-width: 11ch;
  }

  .pl-lead {
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 60ch;
    margin-bottom: 20px;
  }

  .pl-plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .pl-plan-card {
    border-radius: 22px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 16px;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .pl-plan-card:hover {
    transform: translateY(-2px);
  }

  .pl-plan-card.active {
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    box-shadow: 0 16px 30px rgba(218, 93, 54, 0.14);
  }

  .pl-plan-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .pl-plan-name {
    font-family: var(--font-display);
    font-size: 1.1rem;
    margin-top: 6px;
  }

  .pl-pill {
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--line);
    background: var(--bg-card);
  }

  .pl-plan-price {
    font-family: var(--font-display);
    font-size: 2rem;
    letter-spacing: -0.06em;
    margin-bottom: 6px;
  }

  .pl-plan-price span {
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--text-muted);
    margin-left: 4px;
  }

  .pl-plan-copy,
  .pl-line-copy,
  .pl-summary-copy,
  .pl-summary-list li,
  .pl-feature-copy {
    color: var(--text-muted);
    line-height: 1.5;
  }

  .pl-plan-stats {
    display: grid;
    gap: 10px;
    margin: 14px 0;
  }

  .pl-line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    font-size: 0.9rem;
  }

  .pl-line strong {
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: -0.04em;
  }

  .pl-compare {
    display: grid;
    gap: 12px;
  }

  .pl-summary {
    border-radius: 26px;
    background: var(--bg-ink);
    color: var(--text-inverse);
    padding: 20px;
    display: grid;
    gap: 16px;
  }

  .pl-summary-title {
    font-family: var(--font-display);
    font-size: 1.55rem;
    line-height: 1;
    margin-top: 8px;
  }

  .pl-summary-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
  }

  .pl-summary-card {
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.06);
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .pl-summary-value {
    font-family: var(--font-display);
    font-size: 1.6rem;
    margin: 8px 0 2px;
  }

  .pl-summary-copy,
  .pl-summary-list li {
    color: rgba(248, 244, 237, 0.75);
  }

  .pl-summary-list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 8px;
  }

  .pl-summary-actions {
    display: grid;
    gap: 10px;
  }

  .pl-summary .pl-ghost-btn {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-inverse);
  }

  .pl-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .pl-box {
    border-radius: 20px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 16px;
  }

  .pl-box-title {
    font-family: var(--font-display);
    font-size: 1.05rem;
    margin: 8px 0 12px;
  }

  .pl-feature-list {
    display: grid;
    gap: 10px;
  }

  .pl-feature-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--bg-card);
    padding: 12px;
  }

  .pl-feature-tag {
    border-radius: 999px;
    padding: 4px 8px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .pl-notice {
    font-size: 0.82rem;
    color: var(--text-faint);
  }

  .pl-loading-overlay,
  .pl-modal-backdrop {
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

  .pl-loading-overlay {
    flex-direction: column;
    gap: 12px;
    color: #fff6ee;
  }

  .pl-spinner {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 3px solid rgba(255, 255, 255, 0.16);
    border-top-color: #fff6ee;
    animation: pl-spin 0.7s linear infinite;
  }

  .pl-modal {
    width: min(480px, 100%);
    border-radius: 28px;
    padding: 22px;
  }

  .pl-modal h3 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    margin: 10px 0 8px;
  }

  .pl-modal p {
    color: var(--text-muted);
    line-height: 1.55;
    margin: 0 0 16px;
  }

  @keyframes pl-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 980px) {
    .pl-stage {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 740px) {
    .pl-screen {
      padding: 16px;
    }

    .pl-plan-grid,
    .pl-meta-grid,
    .pl-summary-grid {
      grid-template-columns: 1fr;
    }

    .pl-topbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

function getRecommendedPlanId(tier) {
  if (tier === 'low') return 'shield-lite';
  if (tier === 'medium') return 'shield-core';
  return 'shield-max';
}

export default function Policy({ worker, onSuccess, onBack, language = 'en' }) {
  const recommendedPlanId = getRecommendedPlanId(worker?.premiumTier);
  const [selectedPlanId, setSelectedPlanId] = useState(recommendedPlanId);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setSelectedPlanId(getRecommendedPlanId(worker?.premiumTier));
  }, [worker?.premiumTier]);

  useEffect(() => {
    if (notice?.type !== 'success' || !notice.worker) return undefined;
    const timer = setTimeout(() => onSuccess(notice.worker), 1500);
    return () => clearTimeout(timer);
  }, [notice, onSuccess]);

  const selectedPlan = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlanId) || PLANS[1],
    [selectedPlanId]
  );

  const forecastValue = selectedPlan.coverage * selectedPlan.disruptionDays;
  const riskScore = Math.round((worker?.riskScore || 0) * 100);

  async function buyPolicy() {
    setLoading(true);
    try {
      const data = await createPolicy({
        workerId: worker._id,
        razorpayPaymentId: 'demo_payment',
      });

      if (data.success) {
        const updatedWorker = {
          ...worker,
          policyActive: true,
          policy: data.policy,
          selectedPlan: selectedPlan.name,
        };
        localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
        setNotice({
          type: 'success',
          title: getText(language, 'policy.activationDone'),
          message: getText(language, 'policy.activationDoneText', { plan: selectedPlan.name }),
          worker: updatedWorker,
        });
      } else {
        setNotice({
          type: 'error',
          title: getText(language, 'policy.activationFail'),
          message: getText(language, 'policy.activationFailText'),
        });
      }
    } catch {
      setNotice({
        type: 'error',
        title: getText(language, 'policy.connectionError'),
        message: getText(language, 'policy.connectionErrorText'),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="pl-screen">
        {loading && (
          <div className="pl-loading-overlay">
            <div className="pl-spinner" />
            <div>{getText(language, 'policy.activating')}</div>
          </div>
        )}

        {notice && (
          <div className="pl-modal-backdrop" onClick={() => setNotice(null)}>
            <div className="pl-modal" onClick={(event) => event.stopPropagation()}>
              <div className="pl-kicker">{notice.type === 'success' ? 'Policy active' : 'Policy issue'}</div>
              <h3>{notice.title}</h3>
              <p>{notice.message}</p>
              <button
                className="pl-primary-btn"
                onClick={() => {
                  if (notice.type === 'success' && notice.worker) {
                  onSuccess(notice.worker);
                  return;
                }
                setNotice(null);
              }}
            >
                {getText(language, 'policy.continue')}
              </button>
            </div>
          </div>
        )}

        <div className="pl-wrap">
          <div className="pl-topbar">
            <div className="pl-topbar-copy">
              <div className="pl-kicker">{getText(language, 'policy.policyStudio')}</div>
              <div className="pl-topbar-title">{getText(language, 'policy.pageTitle')}</div>
              <div className="pl-topbar-sub">{getText(language, 'policy.sub', { zone: worker?.zone?.replace(/_/g, ' '), tier: worker?.premiumTier || 'active' })}</div>
            </div>
            <button className="pl-back-btn" onClick={onBack}>{getText(language, 'policy.back')}</button>
          </div>

          <div className="pl-stage">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div className="pl-section-kicker">{getText(language, 'policy.compare')}</div>
                <h1 className="pl-title">{getText(language, 'policy.title')}</h1>
                <p className="pl-lead">{getText(language, 'policy.lead')}</p>
              </div>

              <div className="pl-plan-grid">
                {PLANS.map((plan) => {
                  const isRecommended = plan.id === recommendedPlanId;
                  const isSelected = plan.id === selectedPlanId;
                  const weeklyPrice = plan.id === recommendedPlanId ? worker?.weeklyPremium || 0 : Math.max(49, Math.round((worker?.weeklyPremium || 0) * (plan.coverage / (selectedPlan.coverage || 1))));

                  return (
                    <button
                      type="button"
                      key={plan.id}
                      className={`pl-plan-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <div className="pl-plan-head">
                        <div>
                          <div className="pl-card-kicker">Weekly cover</div>
                          <div className="pl-card-kicker">{getText(language, 'policy.weeklyCover')}</div>
                          <div className="pl-plan-name">{plan.name}</div>
                        </div>
                        {isRecommended && <span className="pl-pill">{getText(language, 'policy.recommended')}</span>}
                      </div>
                      <div className="pl-plan-price">₹{weeklyPrice}<span>{getText(language, 'policy.perWeek')}</span></div>
                      <div className="pl-plan-copy">{plan.copy}</div>

                      <div className="pl-plan-stats">
                        <div className="pl-line">
                          <span className="pl-line-copy">{getText(language, 'policy.dailyPayout')}</span>
                          <strong>₹{plan.coverage}</strong>
                        </div>
                        <div className="pl-line">
                          <span className="pl-line-copy">{getText(language, 'policy.badDays')}</span>
                          <strong>{plan.disruptionDays} days</strong>
                        </div>
                        <div className="pl-line">
                          <span className="pl-line-copy">{getText(language, 'policy.supportLane')}</span>
                          <strong style={{ fontSize: '0.92rem' }}>{plan.support}</strong>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pl-meta-grid">
                <div className="pl-box">
                  <div className="pl-section-kicker">{getText(language, 'policy.triggers')}</div>
                  <div className="pl-box-title">{getText(language, 'policy.triggers')}</div>
                  <div className="pl-feature-list">
                    {FEATURE_ROWS.map(([label, status]) => (
                      <div className="pl-feature-row" key={label}>
                        <div>
                          <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{label}</div>
                        </div>
                        <span className="pl-feature-tag">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pl-box">
                  <div className="pl-section-kicker">{getText(language, 'policy.whyFit')}</div>
                  <div className="pl-box-title">{getText(language, 'policy.whyFit')}</div>
                  <div className="pl-feature-list">
                    <div className="pl-feature-row">
                      <div>
                        <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{getText(language, 'policy.zoneRisk')}</div>
                        <div className="pl-feature-copy">Based on weather, AQI, and disruption inputs for your selected zone.</div>
                      </div>
                      <span className="pl-feature-tag">{riskScore}%</span>
                    </div>
                    <div className="pl-feature-row">
                      <div>
                        <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{getText(language, 'policy.currentPlatform')}</div>
                        <div className="pl-feature-copy">Used to keep payout behavior aligned with your delivery cycle.</div>
                      </div>
                      <span className="pl-feature-tag">{worker?.platform || 'N/A'}</span>
                    </div>
                    <div className="pl-feature-row">
                      <div>
                        <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{getText(language, 'policy.opsNote')}</div>
                        <div className="pl-feature-copy">{getText(language, 'policy.simpleModeNote')}</div>
                      </div>
                      <span className="pl-feature-tag">{getText(language, 'policy.demo')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="pl-compare">
              <div className="pl-summary">
                <div>
                  <div className="pl-kicker">{getText(language, 'policy.selectedCover')}</div>
                  <div className="pl-summary-title">{selectedPlan.name}</div>
                </div>

                <div className="pl-summary-grid">
                  <div className="pl-summary-card">
                    <div className="pl-card-kicker">{getText(language, 'policy.dailyPayout')}</div>
                    <div className="pl-summary-value">₹{selectedPlan.coverage}</div>
                    <div className="pl-summary-copy">Maximum daily income protection.</div>
                  </div>
                  <div className="pl-summary-card">
                    <div className="pl-card-kicker">{getText(language, 'policy.potentialHelp')}</div>
                    <div className="pl-summary-value">₹{forecastValue}</div>
                    <div className="pl-summary-copy">If disruption lasts the full modeled window.</div>
                  </div>
                </div>

                <ul className="pl-summary-list">
                  <li>Recommended plan is based on your current zone tier and pricing returned from onboarding.</li>
                  <li>Automatic claims remain enabled across all three plans.</li>
                  <li>Backend activation still uses the existing demo purchase path.</li>
                </ul>

                <div className="pl-summary-actions">
                  <button className="pl-primary-btn" onClick={buyPolicy} disabled={loading}>
                    {loading ? getText(language, 'policy.activating') : getText(language, 'policy.activate', { amount: worker?.weeklyPremium || 0 })}
                  </button>
                  <button className="pl-ghost-btn" onClick={onBack}>{getText(language, 'policy.reviewLater')}</button>
                </div>
              </div>

              <div className="pl-box">
                <div className="pl-section-kicker">{getText(language, 'policy.planner')}</div>
                <div className="pl-box-title">{getText(language, 'policy.planner')}</div>
                <div className="pl-feature-list">
                  <div className="pl-feature-row">
                    <div>
                        <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{getText(language, 'policy.expectedDays')}</div>
                      <div className="pl-feature-copy">Modeled for {selectedPlan.disruptionDays} high-friction days in a week.</div>
                    </div>
                    <span className="pl-feature-tag">{selectedPlan.disruptionDays} days</span>
                  </div>
                  <div className="pl-feature-row">
                    <div>
                        <div className="pl-feature-copy" style={{ color: 'var(--text)' }}>{getText(language, 'policy.support')}</div>
                      <div className="pl-feature-copy">{selectedPlan.support}</div>
                    </div>
                    <span className="pl-feature-tag">Ops</span>
                  </div>
                </div>
                <p className="pl-notice">{getText(language, 'policy.simpleModeNote')}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
