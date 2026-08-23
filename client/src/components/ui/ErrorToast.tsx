import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useGameStore } from '../../game/useGameStore';

export const ErrorToast: React.FC = () => {
  const { errorMessage, setErrorMessage } = useGameStore();

  if (!errorMessage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: 'rgba(239, 68, 68, 0.92)',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.4)',
        backdropFilter: 'blur(8px)',
        fontSize: '15px',
        fontWeight: 600,
        maxWidth: '90vw',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <AlertTriangle size={20} color="#ffffff" style={{ flexShrink: 0 }} />
      <span>{errorMessage}</span>
      <button
        onClick={() => setErrorMessage(null)}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};
