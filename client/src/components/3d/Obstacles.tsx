import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { getTerrainHeight, getRiverCenterX } from './Terrain';

export const Obstacles: React.FC = () => {
  const bridgeZ = 0;
  const bridgeX = getRiverCenterX(bridgeZ);
  const bridgeY = -0.2;

  // Cabin outposts on left and right ridges
  const cabin1 = { x: -28, z: -25, y: getTerrainHeight(-28, -25) };
  const cabin2 = { x: 30, z: 28, y: getTerrainHeight(30, 28) };

  return (
    <group>
      {/* 1. Rustic Wooden River Bridge across the canyon */}
      <group position={[bridgeX, bridgeY, bridgeZ]}>
        {/* Bridge Floor */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[18, 0.5, 4.5]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
        </RigidBody>

        {/* Bridge Railings */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.2, 2.1]} castShadow>
            <boxGeometry args={[18, 0.9, 0.2]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.2, -2.1]} castShadow>
            <boxGeometry args={[18, 0.9, 0.2]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        </RigidBody>

        {/* Support Pillars in Riverbed */}
        <mesh position={[-6, -1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 3.2, 6]} />
          <meshStandardMaterial color="#29180c" roughness={0.95} />
        </mesh>
        <mesh position={[6, -1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 3.2, 6]} />
          <meshStandardMaterial color="#29180c" roughness={0.95} />
        </mesh>
      </group>

      {/* 2. Mountain Outpost Cabin 1 (West Ridge) */}
      <group position={[cabin1.x, cabin1.y, cabin1.z]} rotation={[0, 0.4, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          {/* Main Walls */}
          <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[7, 4, 6]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        </RigidBody>
        {/* Slanted Roof */}
        <mesh position={[0, 4.6, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[8.2, 0.4, 7.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Porch Post */}
        <mesh position={[4.2, 1.8, 2.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 3.8, 6]} />
          <meshStandardMaterial color="#29180c" />
        </mesh>
      </group>

      {/* 3. Mountain Outpost Cabin 2 (East Ridge) */}
      <group position={[cabin2.x, cabin2.y, cabin2.z]} rotation={[0, -0.6, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.5, 4, 6.5]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.6, 0]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[7.6, 0.4, 8.0]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
