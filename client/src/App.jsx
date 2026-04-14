import React, { useState, useEffect, useRef } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Policy from './pages/Policy';
import Profile from './pages/Profile';
import { getClaims, getPolicy } from './services/api';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0B1628;
    font-family: 'DM Sans', sans-serif;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
  }

  .app-topbar {
    height: 60px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: #0D1E30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    flex-shrink: 0;
  }

  .app-topbar-left {
    min-width: 0;
  }

  .app-topbar-brand {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
    margin-bottom: 1px;
  }

  .app-topbar-brand span {
    color: #00C896;
  }

  .app-topbar-sub {
    color: #6D879F;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .app-topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .app-top-btn {
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.02);
    color: #9AB0C3;
    border-radius: 10px;
    padding: 7px 10px;
    font-size: 11px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .app-top-btn:hover {
    border-color: rgba(255,255,255,0.18);
    color: #fff;
  }

  .app-top-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.02);
    color: #9AB0C3;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s, color 0.2s;
  }

  .app-top-icon-btn:hover {
    border-color: rgba(255,255,255,0.18);
    color: #fff;
  }

  .app-notif-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #FFB347;
    border: 1px solid #0D1E30;
    position: absolute;
    top: 6px;
    right: 6px;
  }

  .app-notif-wrap {
    position: relative;
  }

  .app-notif-panel {
    position: absolute;
    right: 0;
    top: 42px;
    width: min(340px, calc(100vw - 24px));
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(180deg, rgba(14,28,46,0.98) 0%, rgba(10,21,36,0.98) 100%);
    box-shadow: 0 14px 38px rgba(0,0,0,0.42);
    z-index: 40;
    overflow: hidden;
  }

  .app-notif-head {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .app-notif-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .app-notif-item {
    padding: 11px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: #9FB2C6;
    font-size: 12px;
    line-height: 1.45;
  }

  .app-notif-item:last-child {
    border-bottom: none;
  }

  .app-notif-empty {
    padding: 20px 12px;
    color: #6D879F;
    font-size: 12px;
    text-align: center;
  }

  .app-top-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(0,200,150,0.25);
    background: rgba(0,200,150,0.1);
    color: #00C896;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .app-top-avatar:hover {
    opacity: 0.9;
  }

  .app-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: #0D1E30;
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 8px 8px 12px;
    gap: 6px;
  }

  .app-nav-btn {
    border: none;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #8BAAB8;
    padding: 6px 4px;
    transition: background 0.2s, color 0.2s;
  }

  .app-nav-btn.active {
    color: #00C896;
    background: rgba(0,200,150,0.08);
  }

  .app-nav-icon {
    font-size: 14px;
    line-height: 1;
  }

  .app-nav-label {
    font-size: 11px;
    line-height: 1;
    letter-spacing: 0.2px;
  }
`;

export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [worker, setWorker] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gigshield_worker');
    if (saved) {
      const parsed = JSON.parse(saved);
      setWorker(parsed);
      setScreen('dashboard');
    }
  }, []);

  // After onboarding
  function onRegistered(w) {
    localStorage.setItem('gigshield_worker', JSON.stringify(w));
    setWorker(w);
    setTab('dashboard');
    setScreen('policy');
  }

  // After buying policy
  function onPolicyPurchased(updatedWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
    setWorker(updatedWorker);
    setTab('dashboard');
    setScreen('dashboard');
  }

  // Logout
  function onLogout() {
    localStorage.removeItem('gigshield_worker');
    setWorker(null);
    setScreen('onboarding');
  }

  function onUpdateProfile(updatedWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
    setWorker(updatedWorker);
  }

  // Main app (Dashboard + Tabs)
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'claims', label: 'Claims', icon: '📄' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];
  const activeTabLabel = tabs.find((item) => item.id === tab)?.label || 'Home';
  const workerInitial = worker?.name?.[0]?.toUpperCase() || 'U';
  const showNotifDot = notifications.length > 0 && !notifOpen;

  useEffect(() => {
    if (!worker?._id) return;

    let alive = true;

    async function loadNotifications() {
      const [claimsRes, policyRes] = await Promise.allSettled([
        getClaims(worker._id),
        getPolicy(worker._id),
      ]);

      if (!alive) return;

      const claims = claimsRes.status === 'fulfilled' ? (claimsRes.value.claims || []) : [];
      const policy = policyRes.status === 'fulfilled' ? policyRes.value.policy : null;

      const messages = [];

      if (policy) {
        if ((policy.daysLeft ?? 0) <= 2) {
          messages.push({
            id: `policy-expiry-${policy._id || 'active'}`,
            ts: Date.now(),
            text: `Policy reminder: your current coverage expires in ${policy.daysLeft} day(s).`,
          });
        } else {
          messages.push({
            id: `policy-active-${policy._id || 'active'}`,
            ts: Date.now() - 1,
            text: `Coverage active: ₹${policy.coverageAmount}/day protection is running for your zone.`,
          });
        }
      } else {
        messages.push({
          id: 'policy-missing',
          ts: Date.now() - 2,
          text: 'No active policy right now. Buy a plan to keep disruption protection enabled.',
        });
      }

      const sortedClaims = [...claims]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8);

      sortedClaims.forEach((claim, index) => {
        const status = claim.status || 'processing';
        const trigger = (claim.triggerType || 'disruption').replace(/_/g, ' ');
        const time = new Date(claim.createdAt || Date.now()).getTime();

        if (status === 'paid') {
          messages.push({
            id: `claim-paid-${claim._id || index}`,
            ts: time,
            text: `Payout update: ₹${claim.payoutAmount || 0} credited for ${trigger}.`,
          });
          return;
        }

        if (status === 'rejected') {
          messages.push({
            id: `claim-rejected-${claim._id || index}`,
            ts: time,
            text: `Claim update: ${trigger} claim was reviewed and marked rejected.`,
          });
          return;
        }

        messages.push({
          id: `claim-processing-${claim._id || index}`,
          ts: time,
          text: `Disruption alert: ${trigger} detected. Claim verification is in progress.`,
        });
      });

      setNotifications(
        messages
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 8)
      );
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [worker?._id]);

  useEffect(() => {
    function handleOutside(event) {
      if (!notifOpen) return;
      if (notifWrapRef.current && !notifWrapRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  // Screens
  if (screen === 'onboarding') {
    return <Onboarding onComplete={onRegistered} />;
  }

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

      <div className="app-topbar">
        <div className="app-topbar-left">
          <div className="app-topbar-brand">GigShield <span>AI</span></div>
          <div className="app-topbar-sub">{activeTabLabel}</div>
        </div>
        <div className="app-topbar-actions">
          <button className="app-top-btn" onClick={() => setScreen('policy')}>Policy</button>
          <div className="app-notif-wrap" ref={notifWrapRef}>
            <button className="app-top-icon-btn" onClick={() => setNotifOpen(v => !v)} aria-label="Notifications">
              🔔
              {showNotifDot && <span className="app-notif-dot" />}
            </button>
            {notifOpen && (
              <div className="app-notif-panel">
                <div className="app-notif-head">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="app-notif-empty">No new messages.</div>
                ) : (
                  <div className="app-notif-list">
                    {notifications.map((notification) => (
                      <div className="app-notif-item" key={notification.id}>
                        {notification.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="app-top-avatar" onClick={() => setTab('profile')}>
            {workerInitial}
          </button>
        </div>
      </div>

      <div className="app-content">
        {tab === 'dashboard' && (
          <Dashboard
            worker={worker}
            onBuyPolicy={() => setScreen('policy')}
            onOpenClaims={() => setTab('claims')}
            showHeader={false}
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

      <div className="app-nav">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`app-nav-btn ${tab === tabItem.id ? 'active' : ''}`}
          >
            <span className="app-nav-icon">{tabItem.icon}</span>
            <span className="app-nav-label">{tabItem.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}