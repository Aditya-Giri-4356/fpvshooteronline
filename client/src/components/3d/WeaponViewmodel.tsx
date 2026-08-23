import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface WeaponViewmodelProps {
  isFiring: boolean;
  isMoving: boolean;
  isSprinting: boolean;
  recoilTrigger: number; // Incrementing counter on each shot
}

export const WeaponViewmodel: React.FC<WeaponViewmodelProps> = ({
  isMoving,
  isSprinting,
  recoilTrigger,
}) => {
  const weaponGroupRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);
  const flashMeshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Animation values
  const sway = useRef(new THREE.Vector2(0, 0));
  const bobTimer = useRef(0);
  const currentRecoil = useRef(0);
  const lastRecoilTrigger = useRef(recoilTrigger);
  const flashTimer = useRef(0);

  // Trigger recoil & flash
  if (recoilTrigger !== lastRecoilTrigger.current) {
    lastRecoilTrigger.current = recoilTrigger;
    currentRecoil.current = 0.14; // Kickback distance
    flashTimer.current = 0.06;   // Flash duration in seconds
  }

  useFrame((_, delta) => {
    if (!weaponGroupRef.current) return;

    // 1. Recoil decay
    currentRecoil.current = THREE.MathUtils.lerp(currentRecoil.current, 0, delta * 24);

    // 2. Muzzle flash fade
    if (flashTimer.current > 0) {
      flashTimer.current -= delta;
      if (muzzleFlashRef.current) muzzleFlashRef.current.intensity = 3.5;
      if (flashMeshRef.current) flashMeshRef.current.visible = true;
    } else {
      if (muzzleFlashRef.current) muzzleFlashRef.current.intensity = 0;
      if (flashMeshRef.current) flashMeshRef.current.visible = false;
    }

    // 3. Movement Bobbing
    const bobSpeed = isSprinting ? 14 : 9;
    const bobAmount = isSprinting ? 0.04 : 0.02;

    if (isMoving) {
      bobTimer.current += delta * bobSpeed;
    } else {
      bobTimer.current = THREE.MathUtils.lerp(bobTimer.current, 0, delta * 4);
    }

    const bobX = Math.cos(bobTimer.current) * bobAmount;
    const bobY = Math.sin(bobTimer.current * 2) * (bobAmount * 0.7);

    // 4. Default Base Position in View Space (Lower Right)
    const basePos = new THREE.Vector3(
      0.32 + bobX + sway.current.x,
      -0.28 + bobY + sway.current.y,
      -0.65 + currentRecoil.current
    );

    const baseRot = new THREE.Euler(
      currentRecoil.current * 1.8 + bobY * 2,
      -0.08 + bobX * 1.5,
      0,
      'YXZ'
    );

    // Position weapon relative to camera
    weaponGroupRef.current.position.copy(camera.position);
    weaponGroupRef.current.quaternion.copy(camera.quaternion);

    // Apply local offset in camera orientation
    const localOffset = basePos.clone().applyQuaternion(camera.quaternion);
    weaponGroupRef.current.position.add(localOffset);

    const q = camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(baseRot));
    weaponGroupRef.current.quaternion.copy(q);
  });

  return (
    <group ref={weaponGroupRef}>
      {/* --- Gun Model (Stylized Futuristic Pulse Carbine) --- */}
      
      {/* Main Gun Receiver / Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.09, 0.38]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top Tactical Rail */}
      <mesh position={[0, 0.055, -0.02]}>
        <boxGeometry args={[0.04, 0.02, 0.32]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Futuristic Glowing Neon Core Strip */}
      <mesh position={[0.036, 0.01, 0]}>
        <boxGeometry args={[0.005, 0.025, 0.22]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.036, 0.01, 0]}>
        <boxGeometry args={[0.005, 0.025, 0.22]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>

      {/* Extended Barrel */}
      <mesh position={[0, 0.015, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.025, 0.18, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Muzzle Compensator */}
      <mesh position={[0, 0.015, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.05, 8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Pistol Grip */}
      <mesh position={[0, -0.09, 0.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.045, 0.12, 0.05]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Energy Mag Well */}
      <mesh position={[0, -0.065, -0.04]}>
        <boxGeometry args={[0.04, 0.08, 0.06]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Holographic Reflex Sight */}
      <mesh position={[0, 0.085, 0.02]}>
        <boxGeometry args={[0.045, 0.04, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.085, 0.02]}>
        <ringGeometry args={[0.008, 0.012, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
      </mesh>

      {/* --- Muzzle Flash Light & Mesh --- */}
      <pointLight
        ref={muzzleFlashRef}
        position={[0, 0.015, -0.42]}
        color="#38bdf8"
        intensity={0}
        distance={8}
        decay={2}
      />
      <mesh ref={flashMeshRef} position={[0, 0.015, -0.42]} visible={false}>
        <dodecahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
    </group>
  );
};
