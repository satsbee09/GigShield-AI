import React, { useEffect, useMemo, useRef, useState } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Policy from './pages/Policy';
import Profile from './pages/Profile';
import { getClaims, getPolicy } from './services/api';

function getSavedThemeMode() {
  const saved = localStorage.getItem('gigshield_theme_mode');
  return saved === 'system' || saved === 'light' || saved === 'dark' ? saved : null;
}

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(value) {
  if (!value) return 'Not synced yet';
  return new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');

  .app-shell {
    min-height: 100vh;
    padding: 18px;
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 18px;
    position: relative;
  }

  .app-shell::before,
  .app-shell::after {
    content: '';
    position: fixed;
    inset: auto;
    pointer-events: none;
    z-index: 0;
  }

  .app-shell::before {
    width: 220px;
    height: 220px;
    top: 24px;
    right: 22px;
    background: radial-gradient(circle, rgba(218, 93, 54, 0.13) 0%, transparent 72%);
  }

  .app-shell::after {
    width: 280px;
    height: 280px;
    left: -60px;
    bottom: -40px;
    background: radial-gradient(circle, rgba(35, 89, 209, 0.12) 0%, transparent 74%);
  }

  .app-sidebar,
  .app-main,
  .app-topbar,
  .app-notif-panel,
  .app-command,
  .app-account-menu {
    position: relative;
    z-index: 1;
  }

  .app-sidebar {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 28px;
    box-shadow: var(--shadow);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 36px);
    backdrop-filter: blur(14px);
  }

  .app-mark {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
  }

  .app-mark-badge {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 42%, #ffd7b8 58%));
    color: #fff7ee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 12px 24px rgba(218, 93, 54, 0.22);
  }

  .app-mark-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .app-mark-sub {
    color: var(--text-muted);
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 2px;
  }

  .app-worker-card {
    border-radius: 22px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card-strong) 90%, var(--accent) 10%), var(--bg-card-strong));
    border: 1px solid var(--line);
    padding: 16px;
  }

  .app-worker-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .app-worker-avatar {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    overflow: hidden;
    background: color-mix(in srgb, var(--accent) 22%, var(--bg-ink) 78%);
    color: #fff5ea;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: var(--font-display);
  }

  .app-worker-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .app-worker-label {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.11em;
    font-size: 0.68rem;
  }

  .app-worker-name {
    font-size: 1rem;
    font-weight: 700;
    margin-top: 2px;
  }

  .app-worker-meta {
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .app-signal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .app-signal-card {
    border-radius: 16px;
    background: var(--bg-tint);
    border: 1px solid var(--line);
    padding: 12px;
  }

  .app-signal-k {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.64rem;
    margin-bottom: 6px;
  }

  .app-signal-v {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
  }

  .app-nav {
    display: grid;
    gap: 8px;
  }

  .app-nav-btn {
    width: 100%;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 18px;
    color: var(--text-muted);
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  }

  .app-nav-btn:hover {
    transform: translateX(2px);
    background: var(--bg-tint);
    border-color: var(--line);
    color: var(--text);
  }

  .app-nav-btn.active {
    background: var(--bg-ink);
    color: var(--text-inverse);
  }

  .app-nav-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: color-mix(in srgb, currentColor 12%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .app-nav-copy {
    min-width: 0;
  }

  .app-nav-title {
    font-weight: 700;
    font-size: 0.93rem;
  }

  .app-nav-sub {
    font-size: 0.78rem;
    color: inherit;
    opacity: 0.75;
    margin-top: 2px;
  }

  .app-side-actions {
    margin-top: auto;
    display: grid;
    gap: 8px;
  }

  .app-side-btn {
    width: 100%;
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 12px 14px;
    cursor: pointer;
    font-weight: 600;
    text-align: left;
  }

  .app-side-btn.primary {
    background: var(--accent);
    border-color: transparent;
    color: #fff6ee;
  }

  .app-main {
    min-width: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 14px;
  }

  .app-topbar {
    background: var(--bg-card);
    border: 1px solid var(--line);
    border-radius: 28px;
    box-shadow: var(--shadow);
    padding: 16px 18px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    backdrop-filter: blur(14px);
  }

  .app-topbar-copy {
    min-width: 0;
  }

  .app-topbar-label {
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
    margin-bottom: 4px;
  }

  .app-topbar-title {
    font-family: var(--font-display);
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .app-topbar-sub {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: 4px;
  }

  .app-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .app-chip-btn,
  .app-icon-btn,
  .app-account-trigger {
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    cursor: pointer;
  }

  .app-chip-btn {
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 0.84rem;
    font-weight: 600;
  }

  .app-status-chip {
    border-radius: 999px;
    padding: 10px 13px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text-muted);
  }

  .app-status-chip strong {
    color: var(--text);
    margin-left: 4px;
  }

  .app-status-chip.live strong {
    color: var(--success);
  }

  .app-status-chip.off strong {
    color: var(--warning);
  }

  .app-icon-btn {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 15px;
  }

  .app-chip-btn:hover,
  .app-icon-btn:hover,
  .app-side-btn:hover,
  .app-account-trigger:hover {
    border-color: var(--line-strong);
    transform: translateY(-1px);
  }

  .app-notif-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent);
    border: 2px solid var(--bg-card-strong);
  }

  .app-content {
    min-height: 0;
    overflow: auto;
    background: color-mix(in srgb, var(--bg-card) 88%, transparent);
    border: 1px solid var(--line);
    border-radius: 32px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
  }

  .app-notif-wrap,
  .app-account-wrap {
    position: relative;
  }

  .app-notif-panel,
  .app-account-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    background: var(--bg-card-strong);
    border: 1px solid var(--line);
    border-radius: 22px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .app-notif-panel {
    width: min(360px, calc(100vw - 48px));
  }

  .app-account-menu {
    width: min(340px, calc(100vw - 48px));
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .app-account-trigger {
    border-radius: 18px;
    padding: 7px 10px 7px 7px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .app-account-avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    overflow: hidden;
    background: color-mix(in srgb, var(--accent) 22%, var(--bg-ink) 78%);
    color: #fff6ee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: var(--font-display);
    flex-shrink: 0;
  }

  .app-account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .app-account-copy {
    min-width: 0;
    text-align: left;
  }

  .app-account-name {
    font-weight: 700;
    font-size: 0.88rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .app-account-sub {
    font-size: 0.76rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .app-account-head {
    border-radius: 18px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 14px;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .app-account-title {
    font-weight: 700;
    margin-bottom: 3px;
  }

  .app-account-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .app-account-stat {
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    padding: 12px;
  }

  .app-account-stat span {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
    margin-bottom: 6px;
  }

  .app-account-stat strong {
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: -0.03em;
  }

  .app-account-actions {
    display: grid;
    gap: 8px;
  }

  .app-account-btn {
    width: 100%;
    text-align: left;
    border-radius: 14px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    padding: 11px 12px;
    cursor: pointer;
    font-weight: 600;
  }

  .app-account-btn.danger {
    color: var(--danger);
  }

  .app-notif-head {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line);
    font-weight: 700;
  }

  .app-notif-clear {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: 0.78rem;
    cursor: pointer;
    font-weight: 700;
  }

  .app-notif-list {
    max-height: 320px;
    overflow: auto;
  }

  .app-notif-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    font-size: 0.9rem;
    line-height: 1.45;
    color: var(--text-muted);
  }

  .app-notif-item.unread {
    color: var(--text);
    background: color-mix(in srgb, var(--accent-soft) 52%, transparent);
  }

  .app-notif-empty {
    color: var(--text-muted);
    text-align: center;
    padding: 20px 16px;
  }

  .app-command-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(17, 22, 29, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 72px 18px 18px;
    z-index: 40;
  }

  .app-command {
    width: min(640px, 100%);
    background: var(--bg-card-strong);
    border: 1px solid var(--line);
    border-radius: 24px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .app-command-input {
    width: 100%;
    border: none;
    background: transparent;
    border-bottom: 1px solid var(--line);
    color: var(--text);
    padding: 16px 18px;
    outline: none;
    font-size: 0.96rem;
  }

  .app-command-list {
    padding: 10px;
    display: grid;
    gap: 8px;
    max-height: 340px;
    overflow: auto;
  }

  .app-command-item {
    width: 100%;
    text-align: left;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    color: var(--text);
    border-radius: 16px;
    padding: 12px 14px;
    cursor: pointer;
  }

  .app-command-item small {
    display: block;
    margin-top: 4px;
    color: var(--text-muted);
  }

  .app-command-empty {
    padding: 18px;
    text-align: center;
    color: var(--text-muted);
  }

  @media (max-width: 1023px) {
    .app-shell {
      grid-template-columns: 1fr;
      padding: 12px;
    }

    .app-sidebar {
      min-height: auto;
      gap: 14px;
    }
  }

  @media (max-width: 720px) {
    .app-shell {
      padding: 10px;
      gap: 10px;
    }

    .app-sidebar,
    .app-topbar,
    .app-content {
      border-radius: 24px;
    }

    .app-topbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .app-toolbar {
      width: 100%;
      justify-content: flex-start;
    }

    .app-signal-grid,
    .app-account-grid {
      grid-template-columns: 1fr;
    }

    .app-account-trigger {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [worker, setWorker] = useState(null);
  const [themeMode, setThemeMode] = useState(() => getSavedThemeMode() || 'system');
  const [theme, setTheme] = useState(() => {
    const mode = getSavedThemeMode();
    if (!mode || mode === 'system') return getSystemTheme();
    return mode;
  });
  const [tab, setTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const notifWrapRef = useRef(null);
  const accountWrapRef = useRef(null);
  const quickInputRef = useRef(null);

  const preferences = worker?.preferences || {};
  const notificationMode = preferences.notificationMode || 'all';
  const autoRefreshEnabled = preferences.autoRefresh !== false;
  const workerImage = worker?.profileImage || '';
  const workerInitial = worker?.name?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    localStorage.setItem('gigshield_theme_mode', themeMode);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
  }, [theme, themeMode]);

  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(getSystemTheme());
      return;
    }
    setTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = (event) => setTheme(event.matches ? 'dark' : 'light');
    setTheme(media.matches ? 'dark' : 'light');

    if (media.addEventListener) {
      media.addEventListener('change', applySystemTheme);
      return () => media.removeEventListener('change', applySystemTheme);
    }

    media.addListener(applySystemTheme);
    return () => media.removeListener(applySystemTheme);
  }, [themeMode]);

  useEffect(() => {
    const saved = localStorage.getItem('gigshield_worker');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    setWorker(parsed);
    setScreen('dashboard');
  }, []);

  function onRegistered(nextWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(nextWorker));
    setWorker(nextWorker);
    setTab('dashboard');
    setScreen('policy');
  }

  function onPolicyPurchased(updatedWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
    setWorker(updatedWorker);
    setTab('dashboard');
    setScreen('dashboard');
  }

  function onLogout() {
    localStorage.removeItem('gigshield_worker');
    setWorker(null);
    setScreen('onboarding');
  }

  function onUpdateProfile(updatedWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
    setWorker(updatedWorker);
  }

  function toggleTheme() {
    document.body.classList.add('theme-transition');
    window.setTimeout(() => document.body.classList.remove('theme-transition'), 320);
    setThemeMode((prev) => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  }

  const navTabs = [
    { id: 'dashboard', label: 'Overview', sub: 'Risk desk', icon: '◧' },
    { id: 'claims', label: 'Claims', sub: 'Payout history', icon: '◎' },
  ];

  const tabMeta = {
    dashboard: {
      label: 'Overview',
      description: 'Watch live disruption risk, policy health, and shift readiness.',
    },
    claims: {
      label: 'Claims',
      description: 'Track auto-generated claims, export records, and audit status.',
    },
    profile: {
      label: 'Profile',
      description: 'Manage identity, payout setup, alerts, and workspace preferences.',
    },
  };

  const quickActions = [
    { id: 'qa-home', label: 'Open dashboard', hint: 'Return to live risk overview', run: () => setTab('dashboard') },
    { id: 'qa-claims', label: 'Open claims', hint: 'Review payouts and status', run: () => setTab('claims') },
    { id: 'qa-profile', label: 'Open profile', hint: 'Manage account and preferences', run: () => setTab('profile') },
    { id: 'qa-policy', label: 'Open policy studio', hint: 'Compare cover and activate protection', run: () => setScreen('policy') },
    { id: 'qa-sync', label: 'Manual sync', hint: 'Refresh live workspace data now', run: () => setRefreshKey((prev) => prev + 1) },
    { id: 'qa-theme', label: 'Change theme mode', hint: 'Cycle system, dark, and light', run: toggleTheme },
    { id: 'qa-logout', label: 'Sign out', hint: 'Clear the local session', run: onLogout },
  ];

  const filteredQuickActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(quickQuery.trim().toLowerCase())
  );

  const activeTab = tabMeta[tab] || tabMeta.dashboard;
  const unreadNotifications = notifications.filter((notification) => !readNotifIds[notification.id]);
  const shellSignals = useMemo(() => ([
    { key: 'Zone', value: worker?.zone?.replace(/_/g, ' ') || 'Unassigned' },
    { key: 'Risk tier', value: worker?.premiumTier || 'Pending' },
  ]), [worker]);

  const payoutMethodLabel = worker?.operations?.payoutMethod || 'UPI';

  useEffect(() => {
    function onKeyDown(event) {
      const isQuickShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isQuickShortcut) {
        event.preventDefault();
        setQuickOpen(true);
      }
      if (event.key === 'Escape') {
        setQuickOpen(false);
        setNotifOpen(false);
        setAccountOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!quickOpen) {
      setQuickQuery('');
      return;
    }
    window.setTimeout(() => quickInputRef.current?.focus(), 0);
  }, [quickOpen]);

  useEffect(() => {
    if (!worker?._id) return;
    try {
      const saved = localStorage.getItem(`gigshield_read_notifications_${worker._id}`);
      if (!saved) {
        setReadNotifIds({});
        return;
      }
      const parsed = JSON.parse(saved);
      setReadNotifIds(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setReadNotifIds({});
    }
  }, [worker?._id]);

  useEffect(() => {
    if (!worker?._id) return;
    localStorage.setItem(`gigshield_read_notifications_${worker._id}`, JSON.stringify(readNotifIds));
  }, [readNotifIds, worker?._id]);

  useEffect(() => {
    if (!notifOpen || notifications.length === 0) return;
    setReadNotifIds((prev) => {
      const next = { ...prev };
      let changed = false;
      notifications.forEach((notification) => {
        if (!next[notification.id]) {
          next[notification.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [notifOpen, notifications]);

  useEffect(() => {
    if (!worker?._id) return undefined;
    let alive = true;

    async function loadNotifications() {
      const [claimsRes, policyRes] = await Promise.allSettled([
        getClaims(worker._id),
        getPolicy(worker._id),
      ]);

      if (!alive) return;

      const claims = claimsRes.status === 'fulfilled' ? claimsRes.value.claims || [] : [];
      const policy = policyRes.status === 'fulfilled' ? policyRes.value.policy : null;
      const items = [];

      if (policy) {
        items.push({
          id: `policy-${policy._id || 'active'}`,
          ts: Date.now(),
          text: `Coverage live in ${worker.zone?.replace(/_/g, ' ') || 'your zone'} until ${formatDate(policy.endDate)}.`,
          level: 'info',
        });
        if ((policy.daysLeft ?? 0) <= 2) {
          items.push({
            id: `policy-renew-${policy._id || 'active'}`,
            ts: Date.now() - 1,
            text: `Renewal window is open. ${policy.daysLeft} day(s) left on your current cover.`,
            level: 'critical',
          });
        }
      } else {
        items.push({
          id: 'policy-missing',
          ts: Date.now(),
          text: 'No active policy detected. Open Policy Studio to restore protection.',
          level: 'critical',
        });
      }

      claims
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 6)
        .forEach((claim, index) => {
          const trigger = (claim.triggerType || 'disruption').replace(/_/g, ' ');
          const status = claim.status || 'processing';
          const amount = claim.payoutAmount ? ` ₹${claim.payoutAmount}.` : '';
          const copy =
            status === 'paid'
              ? `Claim paid for ${trigger}.${amount}`
              : status === 'rejected'
                ? `Claim rejected for ${trigger}.`
                : `Claim processing for ${trigger}.`;

          items.push({
            id: `${status}-${claim._id || index}`,
            ts: new Date(claim.createdAt || Date.now()).getTime(),
            text: copy,
            level: status === 'rejected' ? 'critical' : 'info',
          });
        });

      const filteredItems = items.filter((item) => {
        if (notificationMode === 'all') return true;
        if (notificationMode === 'critical') return item.level === 'critical';
        return item.level === 'critical' && item.id === 'policy-missing';
      });

      setNotifications(filteredItems.sort((a, b) => b.ts - a.ts).slice(0, 8));
      setLastSyncAt(new Date().toISOString());
    }

    loadNotifications();
    if (!autoRefreshEnabled) return () => { alive = false; };
    const timer = setInterval(loadNotifications, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [autoRefreshEnabled, notificationMode, refreshKey, worker?._id, worker?.zone]);

  useEffect(() => {
    function handleOutside(event) {
      if (notifOpen && notifWrapRef.current && !notifWrapRef.current.contains(event.target)) setNotifOpen(false);
      if (accountOpen && accountWrapRef.current && !accountWrapRef.current.contains(event.target)) setAccountOpen(false);
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [accountOpen, notifOpen]);

  function markAllNotificationsAsRead() {
    setReadNotifIds((prev) => {
      const next = { ...prev };
      notifications.forEach((notification) => {
        next[notification.id] = true;
      });
      return next;
    });
  }

  if (screen === 'onboarding') return <Onboarding onComplete={onRegistered} />;

  if (screen === 'policy') {
    return (
      <Policy
        worker={worker}
        onSuccess={onPolicyPurchased}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  return (
    <div className="app-shell">
      <style>{css}</style>

      <aside className="app-sidebar">
        <div className="app-mark">
          <div className="app-mark-badge">GS</div>
          <div>
            <div className="app-mark-title">GigShield</div>
            <div className="app-mark-sub">Field Operations Cover</div>
          </div>
        </div>

        <div className="app-worker-card">
          <div className="app-worker-row">
            <div className="app-worker-avatar">
              {workerImage ? <img src={workerImage} alt="Profile" /> : workerInitial}
            </div>
            <div>
              <div className="app-worker-label">Active member</div>
              <div className="app-worker-name">{worker?.name || 'Worker'}</div>
              <div className="app-worker-meta">{worker?.platform || 'Platform not set'}</div>
            </div>
          </div>

          <div className="app-signal-grid">
            {shellSignals.map((signal) => (
              <div className="app-signal-card" key={signal.key}>
                <div className="app-signal-k">{signal.key}</div>
                <div className="app-signal-v">{signal.value}</div>
              </div>
            ))}
          </div>
        </div>

        <nav className="app-nav">
          {navTabs.map((item) => (
            <button
              key={item.id}
              className={`app-nav-btn ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="app-nav-icon">{item.icon}</span>
              <span className="app-nav-copy">
                <span className="app-nav-title">{item.label}</span>
                <span className="app-nav-sub">{item.sub}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="app-side-actions">
          <button className="app-side-btn primary" onClick={() => setScreen('policy')}>
            Open Policy Studio
          </button>
          <button className="app-side-btn" onClick={() => setQuickOpen(true)}>
            Command bar
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-topbar">
          <div className="app-topbar-copy">
            <div className="app-topbar-label">Operations Workspace</div>
            <div className="app-topbar-title">{activeTab.label}</div>
            <div className="app-topbar-sub">{activeTab.description}</div>
          </div>

          <div className="app-toolbar">
            <div className={`app-status-chip ${autoRefreshEnabled ? 'live' : 'off'}`}>
              Auto refresh
              <strong>{autoRefreshEnabled ? 'On' : 'Off'}</strong>
            </div>
            <div className="app-status-chip">
              Last sync
              <strong>{formatTime(lastSyncAt)}</strong>
            </div>
            <button className="app-chip-btn" onClick={() => setRefreshKey((prev) => prev + 1)}>Sync now</button>
            <button className="app-chip-btn" onClick={() => setQuickOpen(true)}>Quick actions</button>
            <button className="app-chip-btn" onClick={toggleTheme}>
              {themeMode === 'system' ? 'System mode' : themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
            </button>

            <div className="app-notif-wrap" ref={notifWrapRef}>
              <button className="app-icon-btn" aria-label="Notifications" onClick={() => setNotifOpen((value) => !value)}>
                ◔
                {unreadNotifications.length > 0 && <span className="app-notif-dot" />}
              </button>

              {notifOpen && (
                <div className="app-notif-panel">
                  <div className="app-notif-head">
                    <span>Alerts</span>
                    {unreadNotifications.length > 0 && (
                      <button className="app-notif-clear" onClick={markAllNotificationsAsRead}>
                        Mark read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="app-notif-empty">No alerts right now.</div>
                  ) : (
                    <div className="app-notif-list">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`app-notif-item ${readNotifIds[notification.id] ? 'read' : 'unread'}`}
                        >
                          {notification.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="app-account-wrap" ref={accountWrapRef}>
              <button className="app-account-trigger" onClick={() => setAccountOpen((value) => !value)}>
                <span className="app-account-avatar">
                  {workerImage ? <img src={workerImage} alt="Profile" /> : workerInitial}
                </span>
                <span className="app-account-copy">
                  <span className="app-account-name">{worker?.name || 'Worker'}</span>
                  <span className="app-account-sub">{payoutMethodLabel} payout • {notificationMode} alerts</span>
                </span>
              </button>

              {accountOpen && (
                <div className="app-account-menu">
                  <div className="app-account-head">
                    <span className="app-account-avatar">
                      {workerImage ? <img src={workerImage} alt="Profile" /> : workerInitial}
                    </span>
                    <div>
                      <div className="app-account-title">{worker?.name || 'Worker'}</div>
                      <div className="app-account-sub">{worker?.platform || 'Platform'} • {worker?.zone?.replace(/_/g, ' ') || 'Unassigned'}</div>
                    </div>
                  </div>

                  <div className="app-account-grid">
                    <div className="app-account-stat">
                      <span>Payout</span>
                      <strong>{payoutMethodLabel}</strong>
                    </div>
                    <div className="app-account-stat">
                      <span>Alerts</span>
                      <strong>{notificationMode}</strong>
                    </div>
                  </div>

                  <div className="app-account-actions">
                    <button className="app-account-btn" onClick={() => { setTab('profile'); setAccountOpen(false); }}>
                      Open profile settings
                    </button>
                    <button className="app-account-btn" onClick={() => { setScreen('policy'); setAccountOpen(false); }}>
                      Open policy studio
                    </button>
                    <button className="app-account-btn" onClick={() => { setRefreshKey((prev) => prev + 1); setAccountOpen(false); }}>
                      Run workspace sync
                    </button>
                    <button className="app-account-btn danger" onClick={onLogout}>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="app-content">
          {tab === 'dashboard' && (
            <Dashboard
              worker={worker}
              onBuyPolicy={() => setScreen('policy')}
              onOpenClaims={() => setTab('claims')}
              autoRefreshEnabled={autoRefreshEnabled}
              refreshKey={refreshKey}
              onSync={() => setLastSyncAt(new Date().toISOString())}
            />
          )}

          {tab === 'claims' && <Claims worker={worker} />}

          {tab === 'profile' && (
            <Profile
              worker={worker}
              onLogout={onLogout}
              onOpenPolicy={() => setScreen('policy')}
              onUpdateProfile={onUpdateProfile}
            />
          )}
        </div>
      </main>

      {quickOpen && (
        <div className="app-command-backdrop" onClick={() => setQuickOpen(false)}>
          <div className="app-command" onClick={(event) => event.stopPropagation()}>
            <input
              ref={quickInputRef}
              className="app-command-input"
              placeholder="Search actions"
              value={quickQuery}
              onChange={(event) => setQuickQuery(event.target.value)}
            />

            {filteredQuickActions.length === 0 ? (
              <div className="app-command-empty">No matching actions.</div>
            ) : (
              <div className="app-command-list">
                {filteredQuickActions.map((action) => (
                  <button
                    key={action.id}
                    className="app-command-item"
                    onClick={() => {
                      action.run();
                      setQuickOpen(false);
                    }}
                  >
                    {action.label}
                    <small>{action.hint}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
