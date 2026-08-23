import React, { useState, useEffect } from 'react';
import { PlusCircle, LogIn, Users, Shield, Zap, Sparkles, Settings, Check } from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';
import { networkManager, getRawServerUrl, setCustomServerUrl } from '../../network/colyseusClient';
import { ROOM_CODE_LENGTH } from '@fps/shared';

export const LandingScreen: React.FC = () => {
  const { isConnecting, localPlayerName, setLocalPlayerName, setErrorMessage } = useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState(localPlayerName || `Operator-${Math.floor(100 + Math.random() * 900)}`);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  // Server URL settings modal
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getRawServerUrl() || '');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [serverPing, setServerPing] = useState<number | null>(null);

  const checkConnection = async () => {
    setServerStatus('checking');
    const res = await networkManager.checkServerHealth();
    if (res.online) {
      setServerStatus('online');
      setServerPing(res.latency || 24);
    } else {
      setServerStatus('offline');
      setServerPing(null);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveServerUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomServerUrl(serverUrlInput.trim());
    setShowServerModal(false);
    checkConnection();
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Please enter a display name.');
      return;
    }
    setLocalPlayerName(cleanName);
    try {
      await networkManager.createRoom(cleanName);
    } catch (err: any) {
      // Error handled in networkManager
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanCode = roomCodeInput.trim().toUpperCase();

    if (!cleanName) {
      setErrorMessage('Please enter a display name.');
      return;
    }
    if (!cleanCode || cleanCode.length !== ROOM_CODE_LENGTH) {
      setErrorMessage(`Please enter a valid ${ROOM_CODE_LENGTH}-character room code.`);
      return;
    }

    setLocalPlayerName(cleanName);
    try {
      await networkManager.joinRoom(cleanCode, cleanName);
    } catch (err: any) {
      // Error handled in networkManager
    }
  };

  return (
    <div className="ui-overlay ui-interactive" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      {/* Background Decorative Blur Spheres */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(6, 182, 212, 0) 70%)',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2 }}>
        
        {/* Title Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <Zap size={16} /> 3D Multiplayer FPS
          </div>
          <h1
            className="title-glow"
            style={{
              fontSize: '44px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 60%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            HYPERSHOT
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Atmospheric 3D browser multiplayer FPS combat
          </p>
        </div>

        {/* Card Box */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '28px' }}>
          
          {/* Tab Selector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '5px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(56, 189, 248, 0.12)',
            }}
          >
            <button
              onClick={() => setActiveTab('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'create' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'create' ? '#090d16' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <PlusCircle size={17} /> CREATE ROOM
            </button>
            <button
              onClick={() => setActiveTab('join')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'join' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'join' ? '#090d16' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <LogIn size={17} /> JOIN ROOM
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="create-name-input">
                  Display Callsign
                </label>
                <input
                  id="create-name-input"
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your callsign..."
                  maxLength={16}
                  autoFocus
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: '13px',
                  color: '#bae6fd',
                }}
              >
                <Sparkles size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>You will become the room host and get a 6-character code to share.</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isConnecting || !name.trim()}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {isConnecting ? 'CREATING ROOM...' : 'CREATE ROOM'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="join-name-input">
                  Display Callsign
                </label>
                <input
                  id="join-name-input"
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your callsign..."
                  maxLength={16}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="room-code-input">
                  Room Code (6 Characters)
                </label>
                <input
                  id="room-code-input"
                  type="text"
                  className="input-field input-mono"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, ROOM_CODE_LENGTH))}
                  placeholder="E.G. AB7K9X"
                  maxLength={ROOM_CODE_LENGTH}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isConnecting || !name.trim() || roomCodeInput.trim().length !== ROOM_CODE_LENGTH}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {isConnecting ? 'JOINING ROOM...' : 'JOIN ROOM'}
              </button>
            </form>
          )}

          {/* Server Connection Status Bar */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: serverStatus === 'online' ? '#10b981' : serverStatus === 'checking' ? '#f59e0b' : '#f43f5e',
                  boxShadow: `0 0 8px ${serverStatus === 'online' ? '#10b981' : '#f43f5e'}`,
                }}
              />
              <span style={{ color: serverStatus === 'online' ? '#10b981' : 'var(--text-muted)' }}>
                {serverStatus === 'online'
                  ? `Server Online (${serverPing}ms)`
                  : serverStatus === 'checking'
                  ? 'Connecting to Server...'
                  : 'Server Offline / Waking Up...'}
              </span>
            </div>

            <button
              onClick={() => setShowServerModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: 'var(--primary)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <Settings size={12} /> Server URL
            </button>
          </div>

        </div>

        {/* Feature Badges Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: 'var(--text-dim)', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} /> Ephemeral Sessions Only
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> Real-Time WebSockets
          </div>
        </div>

      </div>

      {/* Server URL Configuration Modal */}
      {showServerModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(9, 13, 22, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="glass-panel glass-panel-glow" style={{ maxWidth: '460px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Multiplayer Server URL
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Paste your Render backend URL (e.g. <code style={{ color: '#38bdf8' }}>https://fps-multiplayer-server.onrender.com</code>) to connect directly.
            </p>

            <form onSubmit={handleSaveServerUrl} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="input-field"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://your-server.onrender.com"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Check size={16} /> Save & Connect
                </button>
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
