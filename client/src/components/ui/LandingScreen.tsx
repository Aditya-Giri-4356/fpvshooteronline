import React, { useState } from 'react';
import { PlusCircle, LogIn, Users, Shield, Zap, Sparkles } from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';
import { networkManager } from '../../network/colyseusClient';
import { ROOM_CODE_LENGTH } from '@fps/shared';

export const LandingScreen: React.FC = () => {
  const { isConnecting, localPlayerName, setLocalPlayerName, setErrorMessage } = useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState(localPlayerName || `Operator-${Math.floor(100 + Math.random() * 900)}`);
  const [roomCodeInput, setRoomCodeInput] = useState('');

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

      <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2 }}>
        
        {/* Title Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <Zap size={16} /> 3D Multiplayer FPS Foundation
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
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Atmospheric 3D sandbox & multiplayer room foundation
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
              marginBottom: '24px',
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
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="create-name-input">
                  Temporary Display Name
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
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontSize: '13px',
                  color: '#bae6fd',
                }}
              >
                <Sparkles size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>You will become the room host and receive a unique 6-character code to share.</span>
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
            <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="join-name-input">
                  Temporary Display Name
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
    </div>
  );
};
