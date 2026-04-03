import React, { useState, useEffect } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Policy from './pages/Policy';

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
    setScreen('policy');
  }

  // After buying policy
  function onPolicyPurchased(updatedWorker) {
    localStorage.setItem('gigshield_worker', JSON.stringify(updatedWorker));
    setWorker(updatedWorker);
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0B1628' }}>
      
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'dashboard' && (
          <Dashboard
            worker={worker}
            onBuyPolicy={() => setScreen('policy')}
          />
        )}

        {tab === 'claims' && <Claims worker={worker} />}

        {tab === 'profile' && (
          <div style={{ padding: 24, color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
              {worker?.name}
            </div>

            <div style={{ color: '#8BAAB8', marginBottom: 16 }}>
              +91 {worker?.phone} · {worker?.platform}
            </div>

            <div style={{ color: '#8BAAB8', marginBottom: 4 }}>
              Zone: {worker?.zone?.replace(/_/g, ' ')}
            </div>

            <div style={{ color: '#8BAAB8', marginBottom: 4 }}>
              Premium: ₹{worker?.weeklyPremium}/week
            </div>

            <div style={{ color: '#8BAAB8', marginBottom: 24 }}>
              Risk tier: {worker?.premiumTier}
            </div>

            <div style={{ fontSize: 11, color: '#00C896', marginBottom: 4 }}>
              ByteBrigade · GigShield AI
            </div>

            <div style={{ fontSize: 10, color: '#3A5570', marginBottom: 20 }}>
              Guidewire DEVTrails 2026
            </div>

            <button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '1px solid rgba(232,85,85,0.4)',
                background: 'transparent',
                color: '#E85555',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', background: '#0D1E30', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px 0 12px' }}>
        {[
          ['dashboard', 'Home'],
          ['claims', 'Claims'],
          ['profile', 'Profile']
        ].map(([id, label]) => (
          <div
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              textAlign: 'center',
              cursor: 'pointer',
              color: tab === id ? '#00C896' : '#8BAAB8',
              fontSize: 11,
              paddingTop: 4
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}