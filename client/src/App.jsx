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
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(25,215,165,0.12), transparent 30%),
      radial-gradient(circle at top right, rgba(79,140,255,0.14), transparent 28%),
      linear-gradient(180deg, #060d18 0%, #081423 48%, #0a1728 100%);
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  .app-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
    opacity: 0.55;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 12px;
    position: relative;
    z-index: 1;
  }

  .app-topbar {
    height: 68px;
    margin: 10px 10px 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(9, 18, 32, 0.76);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.24);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .app-topbar-left {
    min-width: 0;
  }

  .app-topbar-brand {
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.35px;
    margin-bottom: 2px;
  }

  .app-topbar-brand span {
    color: #00C896;
  }

  .app-topbar-sub {
    color: #93a8bc;
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
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: #c7d4e4;
    border-radius: 12px;
    padding: 8px 11px;
    font-size: 11px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, transform 0.2s, background 0.2s;
  }

  .app-top-btn:hover {
    border-color: rgba(255,255,255,0.18);
    color: #fff;
    background: rgba(255,255,255,0.06);
    transform: translateY(-1px);
  }

  .app-top-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: #c7d4e4;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s, color 0.2s, transform 0.2s, background 0.2s;
  }

  .app-top-icon-btn:hover {
    border-color: rgba(255,255,255,0.18);
    color: #fff;
    background: rgba(255,255,255,0.06);
    transform: translateY(-1px);
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
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.09);
    background: linear-gradient(180deg, rgba(16,27,45,0.96) 0%, rgba(9,18,32,0.98) 100%);
    box-shadow: 0 20px 48px rgba(0,0,0,0.42);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 40;
    overflow: hidden;
  }

  .app-notif-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .app-notif-clear {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.03);
    color: #bcd0e3;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 500;
    padding: 4px 8px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .app-notif-clear:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.06);
  }

  .app-notif-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .app-notif-item {
    padding: 11px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: #afc0d2;
    font-size: 12px;
    line-height: 1.45;
    transition: background 0.2s, color 0.2s;
  }

  .app-notif-item.unread {
    background: rgba(25,215,165,0.05);
    color: #d5e9fb;
  }

  .app-notif-item.read {
    color: #94a9bc;
  }

  .app-notif-item:last-child {
    border-bottom: none;
  }

  .app-notif-empty {
    padding: 20px 12px;
    color: #7f93a8;
    font-size: 12px;
    text-align: center;
  }

  .app-top-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(25,215,165,0.28);
    background: linear-gradient(135deg, rgba(25,215,165,0.18), rgba(79,140,255,0.12));
    color: #66f0c9;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,0.16);
  }

  .app-top-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .app-top-avatar:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  .app-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0 10px 10px;
    background: rgba(9, 18, 32, 0.74);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.24);
    padding: 8px;
    gap: 8px;
    position: relative;
    z-index: 2;
  }

  .app-nav-btn {
    border: none;
    background: transparent;
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #91a7bc;
    padding: 8px 4px;
    transition: background 0.2s, color 0.2s, transform 0.2s;
  }

  .app-nav-btn.active {
    color: #19d7a5;
    background: rgba(25,215,165,0.1);
  }

  .app-nav-btn:hover {
    transform: translateY(-1px);
    color: #fff;
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
  const [readNotifIds, setReadNotifIds] = useState({});
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
  const workerImage = worker?.profileImage || '';
  const unreadNotifications = notifications.filter((notification) => !readNotifIds[notification.id]);
  const showNotifDot = unreadNotifications.length > 0 && !notifOpen;

  useEffect(() => {
    if (!worker?._id) return;
    try {
      const saved = localStorage.getItem(`gigshield_read_notifications_${worker._id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setReadNotifIds(parsed);
          return;
        }
      }
    } catch {
      // no-op
    }
    setReadNotifIds({});
  }, [worker?._id]);

  useEffect(() => {
    if (!worker?._id) return;
    localStorage.setItem(`gigshield_read_notifications_${worker._id}`, JSON.stringify(readNotifIds));
  }, [worker?._id, readNotifIds]);

  useEffect(() => {
    if (!notifOpen || notifications.length === 0) return;
    setReadNotifIds((prev) => {
      let changed = false;
      const next = { ...prev };
      notifications.forEach((notification) => {
        if (!next[notification.id]) {
          next[notification.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [notifOpen, notifications]);

  function markAllNotificationsAsRead() {
    if (notifications.length === 0) return;
    setReadNotifIds((prev) => {
      const next = { ...prev };
      notifications.forEach((notification) => {
        next[notification.id] = true;
      });
      return next;
    });
  }

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
                <div className="app-notif-head">
                  <span>Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <button className="app-notif-clear" onClick={markAllNotificationsAsRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="app-notif-empty">No new messages.</div>
                ) : (
                  <div className="app-notif-list">
                    {notifications.map((notification) => (
                      <div
                        className={`app-notif-item ${readNotifIds[notification.id] ? 'read' : 'unread'}`}
                        key={notification.id}
                      >
                        {notification.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="app-top-avatar" onClick={() => setTab('profile')}>
            {workerImage ? (
              <img src={workerImage} alt="Profile" className="app-top-avatar-img" />
            ) : (
              workerInitial
            )}
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