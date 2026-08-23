import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, ArrowUp, Zap, RotateCcw } from 'lucide-react';
import { useTouchControls } from '../../game/useTouchControls';

export const MobileControlsHUD: React.FC = () => {
  const {
    isTouchDevice,
    isPortrait,
    setIsTouchDevice,
    setIsPortrait,
    setMoveVector,
    addLookDelta,
    setIsFiring,
    setIsJumping,
    setIsSprinting,
    isSprinting,
  } = useTouchControls();

  // Joystick state
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  // Aim look touch state
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detect touch device & screen orientation
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };

    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkTouch();
    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [setIsTouchDevice, setIsPortrait]);

  // Touch Handlers for Virtual Joystick
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId.current !== null) return;

    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenter.current = { x: centerX, y: centerY };
    setIsJoystickActive(true);

    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const maxRadius = 45;
        const dx = touch.clientX - joystickCenter.current.x;
        const dy = touch.clientY - joystickCenter.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: clampedX, y: clampedY });

        // Normalize between -1 and 1
        const normX = clampedX / maxRadius;
        const normY = clampedY / maxRadius;
        setMoveVector(normX, normY);

        // Auto-sprint when pushed near maximum outer ring
        if (dist / maxRadius > 0.75) {
          setIsSprinting(true);
        }
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setKnobPos({ x: 0, y: 0 });
        setMoveVector(0, 0);
        setIsJoystickActive(false);
        break;
      }
    }
  };

  // Touch Handlers for Right-Side Look/Aim Zone
  const handleLookStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        addLookDelta(dx, dy);
        break;
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  // If user is holding phone vertically, prompt them to rotate to landscape
  if (isTouchDevice && isPortrait) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: 'rgba(9, 13, 22, 0.96)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          color: '#ffffff',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulse-subtle 2s infinite',
          }}
        >
          <RotateCcw size={40} color="#38bdf8" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
          Rotate Device
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '300px' }}>
          HYPERSHOT 3D is designed for optimal landscape combat. Please rotate your phone horizontally.
        </p>
      </div>
    );
  }

  // Only render touch overlay if touch device is detected
  if (!isTouchDevice) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      {/* 1. Left-Side Movement Zone & Virtual Joystick */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: isJoystickActive ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.4)',
          border: `2px solid ${isJoystickActive ? 'rgba(56, 189, 248, 0.6)' : 'rgba(56, 189, 248, 0.25)'}`,
          boxShadow: isJoystickActive ? '0 0 25px rgba(56, 189, 248, 0.35)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        {/* Joystick Thumb Knob */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.6)',
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#090d16',
            fontWeight: 800,
            fontSize: '11px',
          }}
        >
          MOVE
        </div>
      </div>

      {/* 2. Right-Side Aim/Look Drag Zone (Covers whole right half) */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          right: 0,
          width: '55vw',
          height: 'calc(100% - 70px)',
          pointerEvents: 'auto',
          touchAction: 'none',
          zIndex: 1,
        }}
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      />

      {/* 3. Right-Side Action Buttons Cluster */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Sprint Toggle Button */}
        <button
          className="btn"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            background: isSprinting ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(15, 23, 42, 0.8)',
            border: `2px solid ${isSprinting ? '#10b981' : 'rgba(56, 189, 248, 0.4)'}`,
            boxShadow: isSprinting ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none',
            color: '#ffffff',
            pointerEvents: 'auto',
            touchAction: 'none',
          }}
          onTouchStart={() => setIsSprinting(!isSprinting)}
        >
          <Zap size={22} color={isSprinting ? '#ffffff' : '#38bdf8'} />
        </button>

        {/* Jump Button */}
        <button
          className="btn"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            padding: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(56, 189, 248, 0.5)',
            color: '#38bdf8',
            pointerEvents: 'auto',
            touchAction: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          }}
          onTouchStart={() => setIsJumping(true)}
          onTouchEnd={() => setIsJumping(false)}
        >
          <ArrowUp size={28} />
        </button>

        {/* Large Ergonomic Fire Button */}
        <button
          className="btn"
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            padding: 0,
            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
            border: '3px solid #fecdd3',
            boxShadow: '0 0 25px rgba(244, 63, 94, 0.65)',
            color: '#ffffff',
            pointerEvents: 'auto',
            touchAction: 'none',
          }}
          onTouchStart={() => setIsFiring(true)}
          onTouchEnd={() => setIsFiring(false)}
          onTouchCancel={() => setIsFiring(false)}
        >
          <Crosshair size={36} />
        </button>
      </div>
    </div>
  );
};
