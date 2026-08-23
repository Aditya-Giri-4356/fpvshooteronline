import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CharacterClass, CHARACTER_CLASSES } from '@fps/shared';
import { CharacterModel } from './CharacterModel';
import * as THREE from 'three';

interface RotatingCharacterProps {
  characterClass: CharacterClass;
}

const RotatingCharacter: React.FC<RotatingCharacterProps> = ({ characterClass }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meta = CHARACTER_CLASSES[characterClass] || CHARACTER_CLASSES.VANGUARD;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* 3D Character Model */}
      <CharacterModel characterClass={characterClass} />

      {/* Holographic Base Ring */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 32]} />
        <meshBasicMaterial color={meta.accentColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="#090d16" />
      </mesh>
      <pointLight position={[0, -0.6, 0]} color={meta.accentColor} intensity={3} distance={4} />
    </group>
  );
};

export const CharacterPreviewCanvas: React.FC<RotatingCharacterProps> = ({ characterClass }) => {
  const meta = CHARACTER_CLASSES[characterClass] || CHARACTER_CLASSES.VANGUARD;

  return (
    <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.7) 0%, rgba(9, 13, 22, 0.95) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Canvas
        camera={{ position: [0, 0.2, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 3]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-2, 1, -2]} intensity={1.2} color={meta.accentColor} />
        <RotatingCharacter characterClass={characterClass} />
      </Canvas>
    </div>
  );
};
