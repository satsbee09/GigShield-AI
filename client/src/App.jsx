import React, { useState, useEffect } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Policy from './pages/Policy';
import Profile from './pages/Profile';

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

  // Main app (Dashboard + Tabs)
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'claims', label: 'Claims', icon: '📄' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];
  const activeTabLabel = tabs.find((item) => item.id === tab)?.label || 'Home';
  const workerInitial = worker?.name?.[0]?.toUpperCase() || 'U';

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
            onOpenProfile={() => setTab('profile')}
            showHeader={false}
          />
        )}

        {tab === 'claims' && <Claims worker={worker} />}

        {tab === 'profile' && (
          <Profile
            worker={worker}
            onLogout={onLogout}
            onOpenPolicy={() => setScreen('policy')}
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