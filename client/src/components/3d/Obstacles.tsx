import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../game/useGameStore';

export const Obstacles: React.FC = () => {
  const selectedTheme = useGameStore((state) => state.selectedTheme);

  if (selectedTheme === 'DESERT_OUTPOST') {
    return (
      <group>
        {/* Sandstone Watchtower North */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 4.5, -28]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 9, 6]} />
            <meshStandardMaterial color="#c29b6e" roughness={0.85} />
          </mesh>
          {/* Sniper Rooftop Railing */}
          <mesh position={[0, 4.8, 0]} castShadow>
            <boxGeometry args={[6.2, 0.8, 6.2]} />
            <meshStandardMaterial color="#8c6d46" roughness={0.9} />
          </mesh>
        </RigidBody>

        {/* Sandstone Watchtower South */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 4.5, 28]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 9, 6]} />
            <meshStandardMaterial color="#c29b6e" roughness={0.85} />
          </mesh>
        </RigidBody>

        {/* Fortified Sandstone Compound Center-East */}
        <RigidBody type="fixed" colliders="cuboid" position={[16, 2.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, 5, 12]} />
            <meshStandardMaterial color="#d4a373" roughness={0.8} />
          </mesh>
        </RigidBody>

        {/* Fortified Sandstone Compound Center-West */}
        <RigidBody type="fixed" colliders="cuboid" position={[-16, 2.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, 5, 12]} />
            <meshStandardMaterial color="#d4a373" roughness={0.8} />
          </mesh>
        </RigidBody>

        {/* Sandbag Barricades */}
        <RigidBody type="fixed" colliders="cuboid" position={[6, 0.6, -8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.5, 1.2, 1.2]} />
            <meshStandardMaterial color="#996e45" roughness={0.95} />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid" position={[-6, 0.6, 8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.5, 1.2, 1.2]} />
            <meshStandardMaterial color="#996e45" roughness={0.95} />
          </mesh>
        </RigidBody>

        {/* Fuel Drum Clusters */}
        <RigidBody type="fixed" colliders="cuboid" position={[7, 0.8, 10]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.6, 8]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.6} />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid" position={[-8, 0.8, -10]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.6, 8]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.6} />
          </mesh>
        </RigidBody>
      </group>
    );
  }

  if (selectedTheme === 'CYBER_METROPOLIS') {
    return (
      <group>
        {/* Skyscraper Facade 1 (East) */}
        <RigidBody type="fixed" colliders="cuboid" position={[22, 14, -10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[10, 28, 18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Glowing Windows */}
          <mesh position={[-5.1, 0, 0]}>
            <planeGeometry args={[16, 24]} />
            <meshBasicMaterial color="#06b6d4" opacity={0.3} transparent />
          </mesh>
        </RigidBody>

        {/* Skyscraper Facade 2 (West) */}
        <RigidBody type="fixed" colliders="cuboid" position={[-22, 14, 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[10, 28, 18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[5.1, 0, 0]}>
            <planeGeometry args={[16, 24]} />
            <meshBasicMaterial color="#ec4899" opacity={0.3} transparent />
          </mesh>
        </RigidBody>

        {/* Neon Billboard Tower */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 6, -32]}>
          <mesh castShadow>
            <boxGeometry args={[16, 12, 2]} />
            <meshStandardMaterial color="#1e1b4b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 1.1]}>
            <planeGeometry args={[15, 10]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </RigidBody>

        {/* Concrete Road Dividers */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.6, -10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.6, 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        </RigidBody>
      </group>
    );
  }

  if (selectedTheme === 'INDUSTRIAL_DOCKS') {
    return (
      <group>
        {/* Shipping Container Stack 1 (Blue & Red) */}
        <RigidBody type="fixed" colliders="cuboid" position={[-12, 1.5, -8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 3, 7]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} metalness={0.6} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid" position={[-12, 4.5, -8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 3, 7]} />
            <meshStandardMaterial color="#e11d48" roughness={0.5} metalness={0.6} />
          </mesh>
        </RigidBody>

        {/* Shipping Container Stack 2 (Orange & Green) */}
        <RigidBody type="fixed" colliders="cuboid" position={[14, 1.5, 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[7, 3, 3]} />
            <meshStandardMaterial color="#ea580c" roughness={0.5} metalness={0.6} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid" position={[14, 4.5, 10]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[7, 3, 3]} />
            <meshStandardMaterial color="#059669" roughness={0.5} metalness={0.6} />
          </mesh>
        </RigidBody>

        {/* Industrial Fuel Storage Tank */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 3.5, -24]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[4, 4, 7, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
          </mesh>
        </RigidBody>

        {/* Crane Support Gantry */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 7, 26]}>
          <mesh castShadow>
            <boxGeometry args={[20, 14, 2]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
          </mesh>
        </RigidBody>
      </group>
    );
  }

  // Default: SCENIC_VALLEY
  return (
    <group>
      {/* Mountain Boulders & Natural Cover */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12, 1.5, -12]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[3.2, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[14, 1.8, 14]}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[3.6, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Alpine Shed / Bunker */}
      <RigidBody type="fixed" colliders="cuboid" position={[15, 2.5, -10]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 5, 8]} />
          <meshStandardMaterial color="#582f0e" roughness={0.85} />
        </mesh>
        {/* Gable Roof */}
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[4.8, 4.8, 8.4]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Roadside Concrete Blocks */}
      <RigidBody type="fixed" colliders="cuboid" position={[-5, 0.6, 4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 1.2, 1.2]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[5, 0.6, -4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 1.2, 1.2]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.8} />
        </mesh>
      </RigidBody>
    </group>
  );
};
