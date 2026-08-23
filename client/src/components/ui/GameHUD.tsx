import React, { useState, useEffect } from 'react';
import { Users, Wifi, MousePointer, LogOut, Crown, Shield, Skull } from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';
import { networkManager } from '../../network/colyseusClient';
import { MobileControlsHUD } from './MobileControlsHUD';

export const GameHUD: React.FC = () => {
  const {
    roomCode,
    players,
    localSessionId,
    isPointerLocked,
    ping,
    health,
    maxHealth,
    kills,
    deaths,
    isDead,
    isShielded,
    respawnCountdown,
    eliminatedBy,
    killFeed,
    hitmarker,
    damageFlash,
  } = useGameStore();

  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showHitmarkerVisual, setShowHitmarkerVisual] = useState(false);

  // Trigger hitmarker visual pulse
  useEffect(() => {
    if (hitmarker) {
      setShowHitmarkerVisual(true);
      const timer = setTimeout(() => setShowHitmarkerVisual(false), 140);
      return () => clearTimeout(timer);
    }
  }, [hitmarker]);

  // Tab key for scoreboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const playerList = Object.values(players).sort((a, b) => (b.kills || 0) - (a.kills || 0));
  const healthPercent = Math.max(0, Math.min(1.0, health / maxHealth));

  const handleLeaveGame = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    networkManager.leaveRoom();
  };

  return (
    <div className="ui-overlay">
      
      {/* 1. Screen Damage Flash Vignette */}
      {damageFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0) 30%, rgba(239, 68, 68, 0.65) 100%)',
            zIndex: 15,
            animation: 'flashVignette 0.18s ease-out',
          }}
        />
      )}

      {/* 2. FPS Dynamic Crosshair & Hitmarker */}
      {!isDead && (
        <div className="crosshair">
          <div className="crosshair-dot" />

          {/* Hitmarker Diagonal Ticks */}
          {showHitmarkerVisual && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '32px',
                height: '32px',
                pointerEvents: 'none',
              }}
            >
              {/* Top-Left */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  width: '9px',
                  height: '2px',
                  background: hitmarker?.isHeadshot ? '#f43f5e' : '#ffffff',
                  transform: 'rotate(45deg)',
                  boxShadow: `0 0 6px ${hitmarker?.isHeadshot ? '#f43f5e' : '#38bdf8'}`,
                }}
              />
              {/* Top-Right */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '9px',
                  height: '2px',
                  background: hitmarker?.isHeadshot ? '#f43f5e' : '#ffffff',
                  transform: 'rotate(-45deg)',
                  boxShadow: `0 0 6px ${hitmarker?.isHeadshot ? '#f43f5e' : '#38bdf8'}`,
                }}
              />
              {/* Bottom-Left */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '2px',
                  width: '9px',
                  height: '2px',
                  background: hitmarker?.isHeadshot ? '#f43f5e' : '#ffffff',
                  transform: 'rotate(-45deg)',
                  boxShadow: `0 0 6px ${hitmarker?.isHeadshot ? '#f43f5e' : '#38bdf8'}`,
                }}
              />
              {/* Bottom-Right */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '9px',
                  height: '2px',
                  background: hitmarker?.isHeadshot ? '#f43f5e' : '#ffffff',
                  transform: 'rotate(45deg)',
                  boxShadow: `0 0 6px ${hitmarker?.isHeadshot ? '#f43f5e' : '#38bdf8'}`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Top Match Status Bar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        {/* Left Stats Pill */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '8px 16px',
            borderRadius: '12px',
          }}
        >
          {/* Room Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>ROOM</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
              {roomCode}
            </span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Kills & Deaths */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 800 }}>
            <span style={{ color: '#10b981' }}>{kills} KILLS</span>
            <span style={{ color: '#f43f5e' }}>{deaths} DEATHS</span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Wifi size={13} color="#10b981" />
            <span>{ping > 0 ? `${ping}ms` : 'Online'}</span>
          </div>
        </div>

        {/* Right Corner: Kill Feed & Exit Match Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          
          {/* Top Buttons (Scoreboard + Leave) */}
          <div style={{ display: 'flex', gap: '8px' }} className="ui-interactive">
            <button
              onClick={() => setShowScoreboard(!showScoreboard)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <Users size={14} /> Scoreboard
            </button>
            <button
              onClick={handleLeaveGame}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <LogOut size={14} /> Exit
            </button>
          </div>

          {/* Kill Feed Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '320px' }}>
            {killFeed.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: `1px solid ${item.isHeadshot ? 'rgba(244, 63, 94, 0.5)' : 'rgba(56, 189, 248, 0.2)'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ color: item.attackerId === localSessionId ? '#38bdf8' : '#ffffff' }}>
                  {item.attackerName}
                </span>
                <span style={{ color: item.isHeadshot ? '#f43f5e' : '#f59e0b', fontSize: '10px' }}>
                  {item.isHeadshot ? '⚡ CRIT' : '⚡'}
                </span>
                <span style={{ color: item.victimId === localSessionId ? '#f43f5e' : '#94a3b8' }}>
                  {item.victimName}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 4. Bottom Center Health & Shield HUD */}
      {!isDead && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {/* Shield Active Badge */}
          {isShielded && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                background: 'rgba(56, 189, 248, 0.25)',
                border: '1px solid #38bdf8',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#38bdf8',
                textShadow: '0 0 8px #38bdf8',
                animation: 'pulse-subtle 1s infinite',
              }}
            >
              <Shield size={13} /> SHIELD ACTIVE
            </div>
          )}

          {/* Health Bar Box */}
          <div
            className="glass-panel"
            style={{
              width: '260px',
              padding: '10px 14px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                HEALTH
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#f43f5e',
                }}
              >
                {health} <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>/ 100</span>
              </span>
            </div>

            {/* Health Bar Track */}
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(15, 23, 42, 0.9)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: `${healthPercent * 100}%`,
                  height: '100%',
                  background:
                    healthPercent > 0.5
                      ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                      : healthPercent > 0.25
                      ? 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)'
                      : 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
                  boxShadow: `0 0 10px ${healthPercent > 0.5 ? '#10b981' : '#f43f5e'}88`,
                  transition: 'width 0.15s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Click to Lock Pointer Reminder on Desktop */}
      {!isPointerLocked && !isDead && (
        <div
          className="ui-interactive desktop-only"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: '90px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 24px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.requestPointerLock();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>
            <MousePointer size={16} /> CLICK TO LOCK MOUSE & SHOOT
          </div>
        </div>
      )}

      {/* 6. Elimination / Death Screen Overlay */}
      {isDead && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(9, 13, 22, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.5)',
            }}
          >
            <Skull size={36} color="#f43f5e" />
          </div>

          <h2
            style={{
              fontSize: '36px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              color: '#f43f5e',
              textTransform: 'uppercase',
            }}
          >
            YOU WERE ELIMINATED
          </h2>

          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            Eliminated by <strong style={{ color: '#ffffff' }}>{eliminatedBy || 'Opponent'}</strong>
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '15px',
              fontWeight: 800,
              color: '#38bdf8',
            }}
          >
            RESPAWNING IN {respawnCountdown}s...
          </div>
        </div>
      )}

      {/* 7. Scoreboard Leaderboard Modal (Tab / Toggle) */}
      {showScoreboard && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '520px',
            zIndex: 60,
            pointerEvents: 'none',
          }}
        >
          <div className="glass-panel glass-panel-glow" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                MATCH LEADERBOARD
              </span>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>
                {playerList.length} Players
              </span>
            </div>

            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span>Player</span>
              <span style={{ textAlign: 'center' }}>Kills</span>
              <span style={{ textAlign: 'center' }}>Deaths</span>
              <span style={{ textAlign: 'center' }}>Ping</span>
            </div>

            {/* Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {playerList.map((player) => {
                const isYou = player.id === localSessionId;
                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isYou ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isYou ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.1)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{player.name}</span>
                      {isYou && (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '1px 4px', borderRadius: '3px' }}>
                          YOU
                        </span>
                      )}
                      {player.isHost && (
                        <Crown size={12} color="#f59e0b" />
                      )}
                    </div>
                    <span style={{ textAlign: 'center', fontWeight: 800, color: '#10b981' }}>{player.kills || 0}</span>
                    <span style={{ textAlign: 'center', fontWeight: 800, color: '#f43f5e' }}>{player.deaths || 0}</span>
                    <span style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{player.ping || 24}ms</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 8. Mobile Touch HUD (Rendered on Touch Devices) */}
      {!isDead && <MobileControlsHUD />}

    </div>
  );
};
