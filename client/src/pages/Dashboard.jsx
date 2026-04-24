import React, { useEffect, useMemo, useState } from 'react';
import { getClaims, getPolicy } from '../services/api';

const SCENARIO_BRIEFS = [
  { label: 'Weather', value: 'Heavy rain likely after 6 PM', tone: 'warning' },
  { label: 'Traffic', value: 'Peak corridor congestion building', tone: 'danger' },
  { label: 'Air quality', value: 'AQI expected to remain elevated', tone: 'warning' },
];

function getStatusTone(score) {
  if (score < 50) return 'danger';
  if (score < 70) return 'warning';
  return 'success';
}

function getScoreMessage(score) {
  if (score < 50) return 'Shift risk is elevated. Expect auto-claim conditions to trigger faster.';
  if (score < 70) return 'Mixed conditions. Shorter shifts and tighter route selection are safer.';
  return 'Conditions are stable. Coverage remains active if the zone worsens.';
}

const css = `
  .db-screen {
    min-height: 100%;
    padding: 24px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 84%, transparent) 0%, transparent 100%);
  }

  .db-stack {
    display: grid;
    gap: 18px;
  }

  .db-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.72fr);
    gap: 18px;
    align-items: start;
  }

  .db-main,
  .db-side {
    display: grid;
    gap: 18px;
  }

  .db-hero,
  .db-panel,
  .db-list,
  .db-brief,
  .db-checklist,
  .db-side-card {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 24px;
    box-shadow: var(--shadow);
  }

  .db-hero {
    padding: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: 18px;
  }

  .db-kicker,
  .db-section-kicker,
  .db-card-kicker {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .db-title {
    font-family: var(--font-display);
    font-size: clamp(2.1rem, 4vw, 3.6rem);
    line-height: 0.94;
    letter-spacing: -0.065em;
    margin: 10px 0 12px;
    max-width: 10ch;
  }

  .db-lead {
    color: var(--text-muted);
    max-width: 58ch;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .db-hero-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .db-btn,
  .db-outline-btn,
  .db-mini-btn {
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
  }

  .db-btn:hover,
  .db-outline-btn:hover,
  .db-mini-btn:hover {
    transform: translateY(-1px);
  }

  .db-btn {
    border: none;
    border-radius: 16px;
    background: var(--accent);
    color: #fff6ee;
    padding: 12px 16px;
    font-weight: 700;
  }

  .db-outline-btn {
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg-elevated);
    color: var(--text);
    padding: 12px 16px;
    font-weight: 700;
  }

  .db-hero-meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .db-meta-card {
    border-radius: 18px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 14px;
    min-height: 112px;
  }

  .db-meta-value {
    font-family: var(--font-display);
    font-size: 1.45rem;
    letter-spacing: -0.05em;
    margin: 8px 0 4px;
  }

  .db-meta-copy,
  .db-stat-meta,
  .db-policy-meta,
  .db-brief-copy,
  .db-check-copy,
  .db-side-copy {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .db-risk-card {
    border-radius: 22px;
    background: var(--bg-ink);
    color: var(--text-inverse);
    padding: 18px;
    display: grid;
    gap: 14px;
    min-height: 100%;
    align-content: start;
  }

  .db-risk-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .db-risk-score {
    font-family: var(--font-display);
    font-size: 3.2rem;
    line-height: 0.92;
  }

  .db-risk-score span {
    font-size: 1rem;
    opacity: 0.7;
  }

  .db-tone-pill {
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .db-tone-pill.success {
    background: var(--success-soft);
    color: var(--success);
    border-color: color-mix(in srgb, var(--success) 28%, transparent);
  }

  .db-tone-pill.warning {
    background: var(--warning-soft);
    color: var(--warning);
    border-color: color-mix(in srgb, var(--warning) 28%, transparent);
  }

  .db-tone-pill.danger {
    background: var(--danger-soft);
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 28%, transparent);
  }

  .db-risk-card .db-tone-pill.success,
  .db-risk-card .db-tone-pill.warning,
  .db-risk-card .db-tone-pill.danger {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.12);
  }

  .db-risk-text {
    color: rgba(248, 244, 237, 0.78);
    line-height: 1.55;
  }

  .db-risk-bar {
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .db-risk-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ea8058 0%, #f3d26a 50%, #63ca99 100%);
  }

  .db-risk-notes {
    display: grid;
    gap: 8px;
    margin-top: 2px;
  }

  .db-risk-note {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(248, 244, 237, 0.74);
    font-size: 0.84rem;
  }

  .db-risk-note strong {
    color: #fff;
    font-weight: 700;
  }

  .db-panel,
  .db-list,
  .db-brief,
  .db-checklist,
  .db-side-card {
    padding: 18px;
  }

  .db-panel-head,
  .db-list-head,
  .db-side-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .db-panel-title,
  .db-list-title,
  .db-side-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin-top: 6px;
  }

  .db-policy-grid,
  .db-stats-grid,
  .db-brief-grid {
    display: grid;
    gap: 12px;
  }

  .db-policy-grid,
  .db-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .db-stat-card,
  .db-policy-card,
  .db-brief-item {
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .db-stat-card,
  .db-policy-card {
    min-height: 148px;
    display: grid;
    align-content: start;
  }

  .db-stat-value,
  .db-policy-value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: -0.05em;
    margin: 8px 0 4px;
  }

  .db-policy-empty {
    border: 1px dashed var(--line-strong);
    border-radius: 18px;
    padding: 18px;
    background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  }

  .db-policy-empty h3 {
    margin: 8px 0 6px;
    font-family: var(--font-display);
    font-size: 1.2rem;
  }

  .db-policy-empty p {
    margin: 0 0 14px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .db-list-body {
    display: grid;
    gap: 10px;
  }

  .db-claim-row {
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--bg-elevated);
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .db-claim-type {
    font-weight: 700;
    margin-bottom: 4px;
    text-transform: capitalize;
  }

  .db-claim-meta {
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .db-claim-right {
    text-align: right;
    display: grid;
    gap: 8px;
    justify-items: end;
  }

  .db-claim-amount {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 500;
  }

  .db-mini-btn {
    border: none;
    background: transparent;
    color: var(--accent);
    font-weight: 700;
    padding: 0;
  }

  .db-brief-grid {
    grid-template-columns: 1fr;
  }

  .db-brief-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .db-brief-label {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .db-checklist {
    display: grid;
    gap: 10px;
  }

  .db-check-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .db-check-mark {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .db-check-title {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .db-side-card {
    display: grid;
    gap: 12px;
  }

  .db-side-list {
    display: grid;
    gap: 10px;
  }

  .db-side-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--line);
  }

  .db-side-row:first-child {
    border-top: none;
    padding-top: 0;
  }

  .db-side-label {
    font-weight: 700;
    margin-bottom: 4px;
  }

  .db-side-value {
    text-align: right;
    font-weight: 700;
  }

  .db-loading {
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: 40px;
    color: var(--text-muted);
  }

  .db-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 19, 26, 0.38);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    z-index: 60;
  }

  .db-modal {
    width: min(460px, 100%);
    background: var(--bg-card-strong);
    border: 1px solid var(--line);
    border-radius: 24px;
    padding: 20px;
    box-shadow: var(--shadow);
  }

  .db-modal h3 {
    font-family: var(--font-display);
    margin: 10px 0 8px;
    font-size: 1.4rem;
  }

  .db-modal p {
    color: var(--text-muted);
    line-height: 1.55;
    margin: 0 0 14px;
  }

  .db-modal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }

  .db-modal-card {
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--bg-elevated);
    padding: 12px;
  }

  .db-modal-card span {
    display: block;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.68rem;
    margin-bottom: 6px;
  }

  .db-modal-card strong {
    font-family: var(--font-display);
    font-size: 1.2rem;
  }

  @media (max-width: 1080px) {
    .db-shell,
    .db-hero {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .db-screen {
      padding: 16px;
    }

    .db-hero-meta,
    .db-policy-grid,
    .db-stats-grid,
    .db-modal-grid {
      grid-template-columns: 1fr;
    }

    .db-claim-row,
    .db-side-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .db-claim-right,
    .db-side-value {
      text-align: left;
      justify-items: start;
    }
  }
`;

export default function Dashboard({ worker, onBuyPolicy, onOpenClaims, autoRefreshEnabled = true, refreshKey = 0, onSync }) {
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [wScore, setWScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simming, setSimming] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!worker?._id) return undefined;

    async function load() {
      try {
        const [policyRes, claimsRes] = await Promise.all([
          getPolicy(worker._id),
          getClaims(worker._id),
        ]);
        setPolicy(policyRes.policy || null);
        setClaims(claimsRes.claims || []);

        const workabilityRes = await fetch(
          `http://localhost:8000/workability?lat=${worker.zoneLat || 28.6273}&lon=${worker.zoneLon || 77.2773}&zone=${worker.zone}`
        );
        const workabilityData = await workabilityRes.json();
        setWScore(workabilityData.workabilityScore ?? 72);
        onSync?.();
      } catch {
        setWScore(72);
        onSync?.();
      } finally {
        setLoading(false);
      }
    }

    load();
    if (!autoRefreshEnabled) return undefined;
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled, onSync, refreshKey, worker?._id, worker?.zone, worker?.zoneLat, worker?.zoneLon]);

  async function handleSimulate() {
    setSimming(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/workability/simulate?rainfall_mm=120&temp_c=42&aqi=450', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('simulate_failed');
      const data = await res.json();
      setWScore(data.workabilityScore ?? 20);
      setNotice({
        type: 'disruption',
        title: 'Stress test complete',
        message: 'The engine simulated severe conditions. If this pattern appears live, GigShield can auto-generate a claim.',
        score: data.workabilityScore ?? 20,
        payout: data.payoutPercent ?? 0,
      });
    } catch {
      setNotice({
        type: 'error',
        title: 'Engine unavailable',
        message: 'The AI engine on port 8000 could not be reached, so the simulation could not run.',
      });
    } finally {
      setSimming(false);
    }
  }

  const paidClaims = claims.filter((claim) => claim.status === 'paid');
  const pendingClaims = claims.filter((claim) => claim.status !== 'paid' && claim.status !== 'rejected');
  const totalPaid = paidClaims.reduce((sum, claim) => sum + (claim.payoutAmount || 0), 0);
  const recentClaims = claims.slice(0, 4);
  const scoreTone = getStatusTone(wScore ?? 72);
  const zoneName = worker?.zone?.replace(/_/g, ' ') || 'your zone';

  const readinessItems = useMemo(() => {
    return [
      {
        title: 'Policy status',
        copy: policy ? `Protected in ${zoneName} until ${new Date(policy.endDate).toLocaleDateString('en-IN')}.` : 'No active policy detected for the current cycle.',
      },
      {
        title: 'Claims queue',
        copy: pendingClaims.length > 0 ? `${pendingClaims.length} claim(s) are still being reviewed.` : 'No claims are currently waiting for verification.',
      },
      {
        title: 'Field note',
        copy: (wScore ?? 72) < 60 ? 'Keep routes short and avoid low-visibility corridors this evening.' : 'Current conditions support a normal shift with routine caution.',
      },
    ];
  }, [pendingClaims.length, policy, wScore, zoneName]);

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="db-loading">Loading live operations view…</div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="db-screen">
        <div className="db-stack">
          <section className="db-hero">
            <div>
              <div className="db-kicker">Live desk</div>
              <h1 className="db-title">A cleaner command view for your shift.</h1>
              <p className="db-lead">
                GigShield keeps the important things in one place: how risky the zone feels right now, whether your cover is active, and what claims are moving through the pipeline.
              </p>

              <div className="db-hero-actions">
                <button className="db-btn" onClick={policy ? onOpenClaims : onBuyPolicy}>
                  {policy ? 'Review claim activity' : 'Activate cover'}
                </button>
                <button className="db-outline-btn" onClick={handleSimulate} disabled={simming}>
                  {simming ? 'Running test…' : 'Run disruption simulation'}
                </button>
              </div>

              <div className="db-hero-meta">
                <div className="db-meta-card">
                  <div className="db-card-kicker">Zone</div>
                  <div className="db-meta-value" style={{ fontSize: '1.2rem' }}>{zoneName}</div>
                  <div className="db-meta-copy">Live monitoring region tied to pricing and claims.</div>
                </div>
                <div className="db-meta-card">
                  <div className="db-card-kicker">Risk tier</div>
                  <div className="db-meta-value">{worker?.premiumTier || 'Pending'}</div>
                  <div className="db-meta-copy">Current tier assigned to your profile.</div>
                </div>
                <div className="db-meta-card">
                  <div className="db-card-kicker">Claims in review</div>
                  <div className="db-meta-value">{pendingClaims.length}</div>
                  <div className="db-meta-copy">Open cases still being verified.</div>
                </div>
              </div>
            </div>

            <div className="db-risk-card">
              <div className="db-risk-top">
                <div>
                  <div className="db-card-kicker">Workability index</div>
                  <div className="db-risk-score">{wScore ?? 72}<span>/100</span></div>
                </div>
                <span className={`db-tone-pill ${scoreTone}`}>
                  {scoreTone === 'success' ? 'Stable' : scoreTone === 'warning' ? 'Watch' : 'Critical'}
                </span>
              </div>

              <div className="db-risk-bar">
                <div className="db-risk-fill" style={{ width: `${wScore ?? 72}%` }} />
              </div>

              <div className="db-risk-text">{getScoreMessage(wScore ?? 72)}</div>

              <div className="db-risk-notes">
                <div className="db-risk-note">
                  <span>Zone watch</span>
                  <strong>{zoneName}</strong>
                </div>
                <div className="db-risk-note">
                  <span>Coverage</span>
                  <strong>{policy ? 'Active now' : 'Inactive'}</strong>
                </div>
                <div className="db-risk-note">
                  <span>Latest queue</span>
                  <strong>{pendingClaims.length} open</strong>
                </div>
              </div>
            </div>
          </section>

          <div className="db-shell">
            <div className="db-main">
              <section className="db-panel">
                <div className="db-panel-head">
                  <div>
                    <div className="db-section-kicker">Coverage status</div>
                    <div className="db-panel-title">Policy snapshot</div>
                  </div>
                  <span className={`db-tone-pill ${policy ? 'success' : 'warning'}`}>
                    {policy ? 'Active' : 'Needs action'}
                  </span>
                </div>

                {policy ? (
                  <div className="db-policy-grid">
                    <div className="db-policy-card">
                      <div className="db-card-kicker">Weekly premium</div>
                      <div className="db-policy-value">₹{policy.weeklyPremium}</div>
                      <div className="db-policy-meta">Current billed amount for this protection cycle.</div>
                    </div>
                    <div className="db-policy-card">
                      <div className="db-card-kicker">Daily cover</div>
                      <div className="db-policy-value">₹{policy.coverageAmount}</div>
                      <div className="db-policy-meta">Maximum payout available on disruption days.</div>
                    </div>
                    <div className="db-policy-card">
                      <div className="db-card-kicker">Zone</div>
                      <div className="db-policy-value" style={{ fontSize: '1.2rem' }}>{zoneName}</div>
                      <div className="db-policy-meta">{policy.riskTier} risk tier with live monitoring enabled.</div>
                    </div>
                    <div className="db-policy-card">
                      <div className="db-card-kicker">Renews / expires</div>
                      <div className="db-policy-value">{policy.daysLeft}d</div>
                      <div className="db-policy-meta">Coverage window ends on {new Date(policy.endDate).toLocaleDateString('en-IN')}.</div>
                    </div>
                  </div>
                ) : (
                  <div className="db-policy-empty">
                    <div className="db-section-kicker">No active protection</div>
                    <h3>This shift cycle is uncovered.</h3>
                    <p>Open Policy Studio to compare your cover and turn protection back on before the next disruption window.</p>
                    <button className="db-btn" onClick={onBuyPolicy}>Open Policy Studio</button>
                  </div>
                )}
              </section>

              <section className="db-list">
                <div className="db-list-head">
                  <div>
                    <div className="db-section-kicker">Activity</div>
                    <div className="db-list-title">Recent claim movement</div>
                  </div>
                  <button className="db-mini-btn" onClick={onOpenClaims}>See all claims</button>
                </div>

                <div className="db-list-body">
                  {recentClaims.length === 0 ? (
                    <div className="db-policy-empty">
                      <div className="db-section-kicker">Quiet cycle</div>
                      <h3>No claims yet.</h3>
                      <p>When a disruption crosses the threshold, the claim feed will appear here automatically.</p>
                    </div>
                  ) : (
                    recentClaims.map((claim, index) => {
                      const status = claim.status || 'processing';
                      const tone = status === 'paid' ? 'success' : status === 'rejected' ? 'danger' : 'warning';
                      return (
                        <div className="db-claim-row" key={claim._id || index}>
                          <div>
                            <div className="db-claim-type">{(claim.triggerType || 'disruption').replace(/_/g, ' ')}</div>
                            <div className="db-claim-meta">
                              {new Date(claim.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          <div className="db-claim-right">
                            <div className="db-claim-amount">{status === 'paid' ? `+₹${claim.payoutAmount || 0}` : 'Under review'}</div>
                            <span className={`db-tone-pill ${tone}`}>{status}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            <aside className="db-side">
              <section className="db-side-card">
                <div className="db-side-head">
                  <div>
                    <div className="db-section-kicker">Numbers</div>
                    <div className="db-side-title">Protection metrics</div>
                  </div>
                </div>

                <div className="db-stats-grid">
                  <div className="db-stat-card">
                    <div className="db-card-kicker">Paid out</div>
                    <div className="db-stat-value">₹{totalPaid.toLocaleString('en-IN')}</div>
                    <div className="db-stat-meta">Claims received this cycle.</div>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-card-kicker">Claims paid</div>
                    <div className="db-stat-value">{paidClaims.length}</div>
                    <div className="db-stat-meta">Completed automatic payouts.</div>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-card-kicker">In review</div>
                    <div className="db-stat-value">{pendingClaims.length}</div>
                    <div className="db-stat-meta">Claim(s) still being verified.</div>
                  </div>
                  <div className="db-stat-card">
                    <div className="db-card-kicker">Tier</div>
                    <div className="db-stat-value" style={{ fontSize: '1.2rem' }}>{worker?.premiumTier || 'Pending'}</div>
                    <div className="db-stat-meta">Risk tier linked to your home zone.</div>
                  </div>
                </div>
              </section>

              <section className="db-brief">
                <div className="db-section-kicker">Shift brief</div>
                <div className="db-panel-title">Today’s signals</div>
                <div className="db-brief-grid" style={{ marginTop: 14 }}>
                  {SCENARIO_BRIEFS.map((brief) => (
                    <div className="db-brief-item" key={brief.label}>
                      <div>
                        <div className="db-brief-label">{brief.label}</div>
                        <div className="db-brief-copy">{brief.value}</div>
                      </div>
                      <span className={`db-tone-pill ${brief.tone}`}>{brief.tone}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="db-checklist">
                <div className="db-section-kicker">Readiness</div>
                <div className="db-panel-title">Pre-shift checklist</div>
                {readinessItems.map((item) => (
                  <div className="db-check-item" key={item.title}>
                    <div className="db-check-mark">+</div>
                    <div>
                      <div className="db-check-title">{item.title}</div>
                      <div className="db-check-copy">{item.copy}</div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="db-side-card">
                <div className="db-side-head">
                  <div>
                    <div className="db-section-kicker">New summary</div>
                    <div className="db-side-title">Operations note</div>
                  </div>
                </div>

                <div className="db-side-list">
                  <div className="db-side-row">
                    <div>
                      <div className="db-side-label">Current zone</div>
                      <div className="db-side-copy">Primary area tied to monitoring and claim automation.</div>
                    </div>
                    <div className="db-side-value">{zoneName}</div>
                  </div>
                  <div className="db-side-row">
                    <div>
                      <div className="db-side-label">Coverage posture</div>
                      <div className="db-side-copy">Quick summary of whether this week is protected.</div>
                    </div>
                    <div className="db-side-value">{policy ? 'Protected' : 'Uncovered'}</div>
                  </div>
                  <div className="db-side-row">
                    <div>
                      <div className="db-side-label">Recommended action</div>
                      <div className="db-side-copy">Simple next step based on live state.</div>
                    </div>
                    <div className="db-side-value">{policy ? 'Monitor queue' : 'Buy cover'}</div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

        {notice && (
          <div className="db-modal-backdrop" onClick={() => setNotice(null)}>
            <div className="db-modal" onClick={(event) => event.stopPropagation()}>
              <span className={`db-tone-pill ${notice.type === 'error' ? 'danger' : 'warning'}`}>
                {notice.type === 'error' ? 'Issue' : 'Simulation'}
              </span>
              <h3>{notice.title}</h3>
              <p>{notice.message}</p>

              {notice.type === 'disruption' && (
                <div className="db-modal-grid">
                  <div className="db-modal-card">
                    <span>Workability</span>
                    <strong>{notice.score}/100</strong>
                  </div>
                  <div className="db-modal-card">
                    <span>Projected payout</span>
                    <strong>{notice.payout}%</strong>
                  </div>
                </div>
              )}

              <button className="db-btn" onClick={() => setNotice(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
