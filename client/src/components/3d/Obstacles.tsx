import React from 'react';
import { RigidBody } from '@react-three/rapier';

interface CrateProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

const Crate: React.FC<CrateProps> = ({
  position,
  rotation = [0, 0, 0],
  size = [2.5, 2.5, 5],
  color = '#0284c7',
}) => {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
    </RigidBody>
  );
};

interface BarrierProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

const Barrier: React.FC<BarrierProps> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 1.3, 0.6]} />
        <meshStandardMaterial
          color="#64748b"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  );
};

interface RockProps {
  position: [number, number, number];
  scale?: [number, number, number];
}

const Rock: React.FC<RockProps> = ({ position, scale = [2, 2.5, 2] }) => {
  return (
    <RigidBody type="fixed" colliders="hull" position={position}>
      <mesh scale={scale} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.95}
          metalness={0.05}
          flatShading
        />
      </mesh>
    </RigidBody>
  );
};

export const Obstacles: React.FC = () => {
  return (
    <group>
      {/* --- North Outpost Cluster --- */}
      <Crate position={[12, 1.25, -15]} size={[3, 2.5, 6]} color="#0369a1" />
      <Crate position={[15, 1.25, -18]} size={[3, 2.5, 3]} color="#e11d48" />
      <Crate position={[12, 3.75, -15]} size={[3, 2.5, 3]} color="#d97706" />
      <Barrier position={[8, 0.65, -12]} rotation={[0, 0.3, 0]} />

      {/* --- South Defense Perimeter --- */}
      <Crate position={[-14, 1.25, 16]} size={[3, 2.5, 6]} color="#0284c7" />
      <Crate position={[-17, 1.25, 14]} size={[3, 2.5, 4]} color="#059669" />
      <Barrier position={[-10, 0.65, 12]} rotation={[0, -0.4, 0]} />
      <Rock position={[-20, 1.5, 22]} scale={[3, 3, 3]} />

      {/* --- East Hideout Spot --- */}
      <Crate position={[22, 1.25, 8]} size={[4, 2.5, 4]} color="#0f766e" />
      <Barrier position={[18, 0.65, 6]} rotation={[0, 1.2, 0]} />
      <Rock position={[25, 2.0, 15]} scale={[3.5, 4, 3]} />

      {/* --- West Natural Boulders & Cover --- */}
      <Rock position={[-18, 1.5, -12]} scale={[3, 3.5, 2.5]} />
      <Rock position={[-22, 2.0, -16]} scale={[4, 4.5, 4]} />
      <Crate position={[-12, 1.25, -6]} size={[2.5, 2.5, 2.5]} color="#475569" />
      <Barrier position={[-8, 0.65, -4]} rotation={[0, -0.6, 0]} />

      {/* --- Mid-Field Tactical Blocks --- */}
      <Barrier position={[0, 0.65, 18]} />
      <Barrier position={[0, 0.65, -18]} />
      <Crate position={[-6, 1.25, 0]} size={[2, 2.5, 2]} color="#0284c7" />
      <Crate position={[6, 1.25, 0]} size={[2, 2.5, 2]} color="#059669" />

      {/* --- Scenic Ruin Pillars --- */}
      <RigidBody type="fixed" colliders="cuboid" position={[30, 4, -25]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.4, 8, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} flatShading />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-30, 4, 25]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.4, 8, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} flatShading />
        </mesh>
      </RigidBody>
    </group>
  );
};
