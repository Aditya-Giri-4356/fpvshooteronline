import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Crown, 
  Play, 
  LogOut, 
  Zap, 
  Crosshair,
  Mountain
} from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';
import { networkManager } from '../../network/colyseusClient';
import { 
  CHARACTER_CLASSES, 
  CharacterClass 
} from '@fps/shared';
import { CharacterPreviewCanvas } from '../3d/CharacterPreviewCanvas';

export const LobbyScreen: React.FC = () => {
  const {
    roomCode,
    isHost,
    players,
    localSessionId,
    selectedCharacter,
  } = useGameStore();

  const [copied, setCopied] = useState(false);
  const playerList = Object.values(players);
  const currentCharacter = CHARACTER_CLASSES[selectedCharacter] || CHARACTER_CLASSES.VANGUARD;

  const handleCopyCode = () => {
    if (navigator.clipboard && roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectCharacter = (classId: CharacterClass) => {
    networkManager.selectCharacter(classId);
  };

  const handleStartGame = () => {
    if (isHost) {
      networkManager.startGame();
    }
  };

  const handleLeaveRoom = () => {
    networkManager.leaveRoom();
  };

  return (
    <div
      className="ui-overlay ui-interactive"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '880px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 2,
        }}
      >
        {/* Top Header Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '20px 28px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Title & Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    color: 'var(--primary)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Mountain size={12} /> ALPINE RIVER VALLEY OPEN WORLD
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Staging Deck
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                OPERATIVE PREPARATION
              </h2>
            </div>

            {/* Room Code Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={handleCopyCode}
                className="room-code-badge"
                title="Click to copy room code"
              >
                <span>{roomCode}</span>
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
              </div>

              <button
                onClick={handleLeaveRoom}
                className="btn btn-secondary"
                style={{ padding: '12px 18px', fontSize: '13px' }}
              >
                <LogOut size={16} /> Leave
              </button>
            </div>
          </div>
        </div>

        {/* Center Grid: Character Selection & 3D Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          {/* Left Column: 4 Operative Classes */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
                CHOOSE COMBAT OPERATIVE
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {(Object.keys(CHARACTER_CLASSES) as CharacterClass[]).map((classKey) => {
                const c = CHARACTER_CLASSES[classKey];
                const isSelected = selectedCharacter === classKey;

                return (
                  <div
                    key={classKey}
                    onClick={() => handleSelectCharacter(classKey)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(15, 23, 42, 0.7)',
                      border: `2px solid ${isSelected ? c.accentColor : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? `0 0 16px ${c.accentColor}33` : 'none',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: c.accentColor, background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                          {c.role}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {c.description}
                      </p>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: c.accentColor,
                          color: '#090d16',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3D Live Operative Preview & Stats */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                3D OPERATIVE PREVIEW
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: currentCharacter.accentColor }}>
                {currentCharacter.name}
              </span>
            </div>

            {/* 3D Rotating Character Canvas */}
            <CharacterPreviewCanvas characterClass={selectedCharacter} />

            {/* Stat Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>MOBILITY</span>
                  <span style={{ color: currentCharacter.accentColor }}>{currentCharacter.stats.mobility}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentCharacter.stats.mobility}%`, height: '100%', background: currentCharacter.accentColor }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ARMOR</span>
                  <span style={{ color: currentCharacter.accentColor }}>{currentCharacter.stats.armor}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentCharacter.stats.armor}%`, height: '100%', background: currentCharacter.accentColor }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>WEAPON HANDLING</span>
                  <span style={{ color: currentCharacter.accentColor }}>{currentCharacter.stats.handling}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${currentCharacter.stats.handling}%`, height: '100%', background: currentCharacter.accentColor }} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Player Roster & Launch Button */}
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px' }}>
              <Users size={18} color="var(--primary)" />
              <span>STAGING ROSTER ({playerList.length}/8 PLAYERS)</span>
            </div>

            {isHost ? (
              <button
                onClick={handleStartGame}
                className="btn btn-success"
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                <Play size={18} /> DEPLOY INTO MATCH
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  animation: 'pulse-subtle 2s infinite',
                }}
              >
                <Zap size={16} /> WAITING FOR HOST TO DEPLOY...
              </div>
            )}
          </div>

          {/* Player Chips Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {playerList.map((p) => {
              const isYou = p.id === localSessionId;
              const pClass = CHARACTER_CLASSES[p.characterClass] || CHARACTER_CLASSES.VANGUARD;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isYou ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${isYou ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: pClass.accentColor,
                        boxShadow: `0 0 8px ${pClass.accentColor}`,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>
                      {p.name} {isYou && '(You)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: pClass.accentColor, background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>
                      {pClass.name}
                    </span>
                    {p.isHost && <Crown size={14} color="#f59e0b" />}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
