import React, { useEffect, useMemo, useState } from 'react';
import { getClaims } from '../services/api';

const FILTERS = [
  { id: 'all', label: 'All claims' },
  { id: 'processing', label: 'In review' },
  { id: 'paid', label: 'Paid' },
  { id: 'rejected', label: 'Rejected' },
];

function getStatusTone(status) {
  if (status === 'paid') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

const css = `
  .cl-screen {
    min-height: 100%;
    padding: 24px;
  }

  .cl-stack {
    display: grid;
    gap: 16px;
  }

  .cl-hero,
  .cl-panel,
  .cl-list {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 24px;
    box-shadow: var(--shadow);
  }

  .cl-hero {
    padding: 20px;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
    gap: 16px;
  }

  .cl-kicker,
  .cl-card-kicker {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .cl-title {
    font-family: var(--font-display);
    font-size: clamp(1.9rem, 4vw, 3rem);
    letter-spacing: -0.06em;
    line-height: 0.98;
    margin: 10px 0 12px;
  }

  .cl-lead {
    color: var(--text-muted);
    line-height: 1.55;
    max-width: 56ch;
  }

  .cl-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .cl-summary-card {
    border-radius: 18px;
    background: var(--bg-elevated);
    border: 1px solid var(--line);
    padding: 14px;
  }

  .cl-summary-value {
    font-family: var(--font-display);
    font-size: 1.55rem;
    letter-spacing: -0.05em;
    margin: 8px 0 4px;
  }

  .cl-summary-copy {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .cl-panel,
  .cl-list {
    padding: 18px;
  }

  .cl-panel-head,
  .cl-list-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .cl-panel-title,
  .cl-list-title {
    font-family: var(--font-display);
    font-size: 1.2rem;
    margin-top: 6px;
  }

  .cl-controls {
    display: grid;
    gap: 12px;
  }

  .cl-search {
    width: 100%;
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 12px 14px;
    outline: none;
  }

  .cl-search:focus {
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .cl-filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cl-chip,
  .cl-export-btn {
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid var(--line);
  }

  .cl-chip {
    background: var(--bg-elevated);
    color: var(--text-muted);
  }

  .cl-chip.active {
    background: var(--bg-ink);
    color: var(--text-inverse);
    border-color: transparent;
  }

  .cl-export-btn {
    background: transparent;
    color: var(--accent);
  }

  .cl-results {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .cl-claim-list {
    display: grid;
    gap: 12px;
  }

  .cl-claim-card {
    border-radius: 20px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .cl-claim-top,
  .cl-claim-bottom {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .cl-claim-type {
    font-weight: 700;
    text-transform: capitalize;
    margin-bottom: 4px;
  }

  .cl-claim-meta,
  .cl-claim-note {
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .cl-claim-amount {
    font-family: var(--font-mono);
    font-size: 1rem;
  }

  .cl-pill {
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--line);
  }

  .cl-pill.success {
    background: var(--success-soft);
    color: var(--success);
  }

  .cl-pill.warning {
    background: var(--warning-soft);
    color: var(--warning);
  }

  .cl-pill.danger {
    background: var(--danger-soft);
    color: var(--danger);
  }

  .cl-empty,
  .cl-loading {
    min-height: 220px;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--text-muted);
  }

  @media (max-width: 900px) {
    .cl-hero {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .cl-screen {
      padding: 16px;
    }

    .cl-summary {
      grid-template-columns: 1fr;
    }

    .cl-claim-top,
    .cl-claim-bottom,
    .cl-panel-head,
    .cl-list-head {
      flex-direction: column;
    }
  }
`;

export default function Claims({ worker }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!worker?._id) return;
    getClaims(worker._id)
      .then((res) => {
        setClaims(res.claims || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [worker?._id]);

  const paidClaims = claims.filter((claim) => claim.status === 'paid');
  const rejectedClaims = claims.filter((claim) => claim.status === 'rejected');
  const pendingClaims = claims.filter((claim) => claim.status !== 'paid' && claim.status !== 'rejected');
  const totalPaid = paidClaims.reduce((sum, claim) => sum + (claim.payoutAmount || 0), 0);

  const filteredClaims = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return claims.filter((claim) => {
      const status = claim.status || 'processing';
      const trigger = (claim.triggerType || 'disruption').replace(/_/g, ' ').toLowerCase();
      const matchesSearch = normalizedSearch ? trigger.includes(normalizedSearch) : true;
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'processing'
            ? status !== 'paid' && status !== 'rejected'
            : status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, claims, searchTerm]);

  function handleExportCsv() {
    if (filteredClaims.length === 0) return;
    const headers = ['id', 'trigger', 'status', 'payoutAmount', 'payoutPercent', 'createdAt'];
    const lines = [headers.join(',')];
    filteredClaims.forEach((claim) => {
      const row = [
        claim._id || '',
        (claim.triggerType || 'disruption').replace(/_/g, ' '),
        claim.status || 'processing',
        claim.payoutAmount || 0,
        claim.payoutPercent ?? '',
        claim.createdAt || '',
      ];
      lines.push(row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gigshield-claims-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="cl-loading">Loading claims log…</div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="cl-screen">
        <div className="cl-stack">
          <section className="cl-hero">
            <div>
              <div className="cl-kicker">Claims desk</div>
              <h1 className="cl-title">A cleaner payout timeline.</h1>
              <p className="cl-lead">
                Every triggered disruption lands here with a readable status trail, export option, and quick filtering so the page feels operational instead of ornamental.
              </p>
            </div>
            <div className="cl-summary">
              <div className="cl-summary-card">
                <div className="cl-card-kicker">Total claims</div>
                <div className="cl-summary-value">{claims.length}</div>
                <div className="cl-summary-copy">Auto-generated records.</div>
              </div>
              <div className="cl-summary-card">
                <div className="cl-card-kicker">Paid out</div>
                <div className="cl-summary-value">₹{totalPaid.toLocaleString('en-IN')}</div>
                <div className="cl-summary-copy">Total credited so far.</div>
              </div>
              <div className="cl-summary-card">
                <div className="cl-card-kicker">In review</div>
                <div className="cl-summary-value">{pendingClaims.length}</div>
                <div className="cl-summary-copy">Awaiting final verification.</div>
              </div>
            </div>
          </section>

          <section className="cl-panel">
            <div className="cl-panel-head">
              <div>
                <div className="cl-kicker">Controls</div>
                <div className="cl-panel-title">Filter and export</div>
              </div>
              <button className="cl-export-btn" onClick={handleExportCsv} disabled={filteredClaims.length === 0}>
                Export CSV
              </button>
            </div>

            <div className="cl-controls">
              <input
                className="cl-search"
                placeholder="Search by trigger type"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <div className="cl-filter-row">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    className={`cl-chip ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="cl-results">
                Showing {filteredClaims.length} of {claims.length} claims. {paidClaims.length} paid, {pendingClaims.length} in review, {rejectedClaims.length} rejected.
              </div>
            </div>
          </section>

          <section className="cl-list">
            <div className="cl-list-head">
              <div>
                <div className="cl-kicker">Timeline</div>
                <div className="cl-list-title">Claim activity</div>
              </div>
            </div>

            {claims.length === 0 ? (
              <div className="cl-empty">No claims yet. When a disruption crosses the payout threshold, it will appear here automatically.</div>
            ) : filteredClaims.length === 0 ? (
              <div className="cl-empty">No claims match the current filters.</div>
            ) : (
              <div className="cl-claim-list">
                {filteredClaims.map((claim, index) => {
                  const status = claim.status || 'processing';
                  const tone = getStatusTone(status);
                  const triggerLabel = (claim.triggerType || 'disruption').replace(/_/g, ' ');

                  return (
                    <article className="cl-claim-card" key={claim._id || index}>
                      <div className="cl-claim-top">
                        <div>
                          <div className="cl-claim-type">{triggerLabel}</div>
                          <div className="cl-claim-meta">
                            {new Date(claim.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <span className={`cl-pill ${tone}`}>{status}</span>
                      </div>

                      <div className="cl-claim-bottom">
                        <div className="cl-claim-note">
                          {status === 'paid' && 'This payout has been approved and credited.'}
                          {status === 'rejected' && 'This disruption did not meet the payout conditions.'}
                          {status !== 'paid' && status !== 'rejected' && 'Verification is still running against live disruption data.'}
                        </div>
                        <div className="cl-claim-amount">
                          {status === 'paid' ? `+₹${claim.payoutAmount || 0}` : claim.payoutPercent ? `${claim.payoutPercent}%` : 'Pending'}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
