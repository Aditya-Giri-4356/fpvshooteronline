import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { IPlayer } from '@fps/shared';
import { CharacterModel } from './CharacterModel';

interface RemotePlayerProps {
  player: IPlayer;
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const targetYaw = useRef(player.rotY || 0);

  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const lastShotTimestamp = useRef(player.lastShotTime || 0);

  // Detect new shot from remote player
  useEffect(() => {
    if (player.lastShotTime && player.lastShotTime !== lastShotTimestamp.current) {
      lastShotTimestamp.current = player.lastShotTime;
      setShowMuzzleFlash(true);
      const timer = setTimeout(() => setShowMuzzleFlash(false), 80);
      return () => clearTimeout(timer);
    }
  }, [player.lastShotTime]);

  targetPos.current.set(player.x, player.y, player.z);
  targetYaw.current = player.rotY || 0;

  const healthPercent = Math.max(0, Math.min(1.0, (player.health || 100) / 100));

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (player.isDead) {
      groupRef.current.visible = false;
      return;
    } else {
      groupRef.current.visible = true;
    }

    const lerpFactor = Math.min(1.0, delta * 15);
    groupRef.current.position.lerp(targetPos.current, lerpFactor);

    const currentRotY = groupRef.current.rotation.y;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotY, targetYaw.current, lerpFactor);
  });

  if (player.isDead) return null;

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      {/* 3D Themed Character Operative Model */}
      <CharacterModel
        characterClass={player.characterClass || 'VANGUARD'}
        isShielded={player.isShielded}
        showMuzzleFlash={showMuzzleFlash}
        targetSessionId={player.id}
        isHitboxEnabled={true}
      />

      {/* Floating 3D Billboard Nameplate & Health Bar */}
      <Billboard position={[0, 1.45, 0]}>
        {/* Host Crown Icon */}
        {player.isHost && (
          <Text
            position={[0, 0.42, 0]}
            fontSize={0.2}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#090d16"
          >
            ★ HOST
          </Text>
        )}

        {/* Display Name */}
        <Text
          position={[0, 0.18, 0]}
          fontSize={0.26}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#090d16"
        >
          {player.name}
        </Text>

        {/* Health Bar Background */}
        <mesh position={[0, -0.06, 0]}>
          <planeGeometry args={[0.8, 0.08]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>

        {/* Health Bar Fill */}
        <mesh
          position={[-(0.8 * (1 - healthPercent)) / 2, -0.06, 0.001]}
          scale={[healthPercent, 1, 1]}
        >
          <planeGeometry args={[0.76, 0.06]} />
          <meshBasicMaterial
            color={healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#f43f5e'}
          />
        </mesh>
      </Billboard>
    </group>
  );
};
