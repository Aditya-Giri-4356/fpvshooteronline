import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { IPlayer } from '@fps/shared';

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

  // Update target coordinates
  targetPos.current.set(player.x, player.y, player.z);
  targetYaw.current = player.rotY || 0;

  const playerColor = PLAYER_COLORS[player.colorIndex % PLAYER_COLORS.length] || '#38bdf8';
  const healthPercent = Math.max(0, Math.min(1.0, (player.health || 100) / 100));

  // Smooth interpolation loop
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (player.isDead) {
      groupRef.current.visible = false;
      return;
    } else {
      groupRef.current.visible = true;
    }

    // Smooth position interpolation (LERP)
    const lerpFactor = Math.min(1.0, delta * 15);
    groupRef.current.position.lerp(targetPos.current, lerpFactor);

    // Smooth yaw rotation interpolation
    const currentRotY = groupRef.current.rotation.y;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotY, targetYaw.current, lerpFactor);
  });

  if (player.isDead) return null;

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      
      {/* 1. Character Torso/Body (Hitbox Target) */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        userData={{ targetSessionId: player.id, isHeadshot: false }}
      >
        <capsuleGeometry args={[0.38, 0.9, 8, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 2. Character Head Hitbox */}
      <mesh
        position={[0, 0.75, 0]}
        userData={{ targetSessionId: player.id, isHeadshot: true }}
      >
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* 3. Glowing Tactical Visor */}
      <mesh position={[0, 0.75, 0.22]}>
        <boxGeometry args={[0.32, 0.1, 0.12]} />
        <meshStandardMaterial
          color={playerColor}
          emissive={playerColor}
          emissiveIntensity={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 4. Tactical Armor / Backpack */}
      <mesh position={[0, 0.05, -0.26]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.2]} />
        <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 5. Remote Weapon Model */}
      <group position={[0.35, -0.05, 0.35]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.08, 0.35]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]}>
          <boxGeometry args={[0.02, 0.02, 0.2]} />
          <meshStandardMaterial color={playerColor} emissive={playerColor} emissiveIntensity={1} />
        </mesh>

        {/* Remote Muzzle Flash */}
        {showMuzzleFlash && (
          <group position={[0, 0, 0.25]}>
            <pointLight color="#38bdf8" intensity={4} distance={6} />
            <mesh>
              <dodecahedronGeometry args={[0.12, 0]} />
              <meshBasicMaterial color="#bae6fd" />
            </mesh>
          </group>
        )}
      </group>

      {/* 6. Invulnerability Spawn Shield Sphere */}
      {player.isShielded && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} wireframe />
        </mesh>
      )}

      {/* 7. Floating 3D Billboard Nameplate & Health Bar */}
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
