import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../game/useGameStore';
import { registerCombatCallbacks } from '../../network/colyseusClient';
import { PlayerController } from './PlayerController';
import { RemotePlayer } from './RemotePlayer';
import { BulletTracers, BulletTracersRef } from './BulletTracers';
import { FloatingDamageNumbers, FloatingDamageNumbersRef } from './FloatingDamageNumbers';
import { WebGPUWorld } from './WebGPUWorld';

// Ambient menu camera overlooking the alpine river valley
const MenuCamera: React.FC = () => {
  const angle = useRef(0.4);

  useFrame((state, delta) => {
    angle.current += delta * 0.08;
    const radius = 32;
    const x = Math.sin(angle.current) * radius;
    const z = Math.cos(angle.current) * radius;
    const y = 9 + Math.sin(angle.current * 0.4) * 2;

    state.camera.position.set(x, y, z);
    state.camera.lookAt(0, 1.5, 0);
  });

  return null;
};

export const GameScene: React.FC = () => {
  const { screen, players, localSessionId } = useGameStore();
  const isPlaying = screen === 'PLAYING';

  const tracersRef = useRef<BulletTracersRef>(null);
  const damageNumbersRef = useRef<FloatingDamageNumbersRef>(null);

  // Hook combat network events to 3D visual FX
  useEffect(() => {
    registerCombatCallbacks({
      onRemoteShoot: (data) => {
        if (tracersRef.current) {
          const start = new THREE.Vector3(data.originX, data.originY, data.originZ);
          const end = new THREE.Vector3(data.hitX || data.originX, data.hitY || data.originY, data.hitZ || data.originZ);
          tracersRef.current.addTracer(start, end, false);
          tracersRef.current.addSpark(end, false);
        }
      },
      onPlayerHit: (data) => {
        if (damageNumbersRef.current) {
          const hitPos = new THREE.Vector3(data.hitX, data.hitY, data.hitZ);
          damageNumbersRef.current.addDamageNumber(hitPos, data.damage, data.isHeadshot);
        }
      },
    });
  }, []);

  const remotePlayers = Object.values(players).filter(
    (p) => p.id && p.id !== localSessionId
  );

  return (
    <div className="canvas-container" onClick={() => {
      if (isPlaying && !document.pointerLockElement) {
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!hasTouch) {
          const canvas = document.querySelector('canvas');
          if (canvas) canvas.requestPointerLock();
        }
      }
    }}>
      <WebGPUWorld>
        {/* Rapier 3D Physics Simulation */}
        <Physics gravity={[0, -18, 0]}>
          
          {/* Local First-Person Character */}
          {isPlaying ? (
            <PlayerController
              onSpawnTracer={(start, end, isCrit) => tracersRef.current?.addTracer(start, end, isCrit)}
              onSpawnSpark={(pos, isCrit) => tracersRef.current?.addSpark(pos, isCrit)}
            />
          ) : (
            <MenuCamera />
          )}

          {/* Remote Players */}
          {remotePlayers.map((player) => (
            <RemotePlayer key={player.id} player={player} />
          ))}

          {/* Laser Tracers & Sparks */}
          <BulletTracers ref={tracersRef} />

          {/* Floating Damage Numbers */}
          <FloatingDamageNumbers ref={damageNumbersRef} />
        </Physics>
      </WebGPUWorld>
    </div>
  );
};
