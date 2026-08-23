import React, { useState } from 'react';
import { Copy, Check, Crown, Play, LogOut, Loader2 } from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';
import { networkManager } from '../../network/colyseusClient';
import { MAX_PLAYERS_PER_ROOM } from '@fps/shared';

const PLAYER_COLORS = [
  '#38bdf8', // Sky Blue
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
];

export const LobbyScreen: React.FC = () => {
  const { roomCode, isHost, players, localSessionId } = useGameStore();
  const [copied, setCopied] = useState(false);

  const playerList = Object.values(players);
  const playerCount = playerList.length;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (isHost) {
      networkManager.startGame();
    }
  };

  const handleLeaveLobby = () => {
    networkManager.leaveRoom();
  };

  return (
    <div className="ui-overlay ui-interactive" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      {/* Background Decorative Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(6, 182, 212, 0) 70%)',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '560px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2 }}>
        
        {/* Main Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '32px' }}>
          
          {/* Room Code Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Multiplayer Room Code
            </span>

            {/* Click to Copy Badge */}
            <div
              className="room-code-badge"
              onClick={copyRoomCode}
              title="Click to copy room code"
            >
              <span>{roomCode}</span>
              {copied ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <Check size={18} /> COPIED!
                </div>
              ) : (
                <Copy size={18} opacity={0.7} />
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              Share this code with your friends to let them join this match.
            </p>
          </div>

          {/* Connected Players Section */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                Players in Lobby
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 10px', borderRadius: '12px' }}>
                {playerCount} / {MAX_PLAYERS_PER_ROOM}
              </span>
            </div>

            {/* Players Roster */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {playerList.map((player, idx) => {
                const isYou = player.id === localSessionId;
                const playerColor = PLAYER_COLORS[player.colorIndex % PLAYER_COLORS.length];

                return (
                  <div
                    key={player.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isYou ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isYou ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.1)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Avatar Indicator */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: playerColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#090d16',
                          fontWeight: 800,
                          fontSize: '14px',
                          boxShadow: `0 0 10px ${playerColor}66`,
                        }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name & Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                          {player.name}
                        </span>
                        {isYou && (
                          <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
                            YOU
                          </span>
                        )}
                        {player.isHost && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, background: 'rgba(245, 158, 11, 0.25)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px' }}>
                            <Crown size={12} /> HOST
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
                      READY
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isHost ? (
              <button
                onClick={handleStartGame}
                className="btn btn-success"
                style={{ width: '100%', fontSize: '16px', padding: '16px' }}
              >
                <Play size={20} /> START GAME MATCH
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: 'var(--primary)',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <Loader2 size={20} className="animate-spin" />
                Waiting for room host to start the game...
              </div>
            )}

            <button
              onClick={handleLeaveLobby}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <LogOut size={16} /> LEAVE LOBBY
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
