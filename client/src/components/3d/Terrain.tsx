import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

// Terrain elevation function: creates gentle rolling hills with flat central spawn
function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);
  const spawnFlatten = Math.min(1.0, Math.max(0.0, (distFromCenter - 15) / 25));

  const hill1 = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3.5;
  const hill2 = Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.07 + 0.8) * 1.8;
  const hill3 = Math.sin(x * 0.02) * 2.0;

  return (hill1 + hill2 + hill3) * spawnFlatten;
}

// Stylized Low-Poly Pine Tree
const PineTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1.0,
}) => {
  return (
    <RigidBody type="fixed" colliders="hull" position={position}>
      <group scale={[scale, scale, scale]}>
        {/* Trunk */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.35, 2.4, 6]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Tier 1 Foliage Cone */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.8, 2.2, 7]} />
          <meshStandardMaterial color="#14532d" roughness={0.7} flatShading />
        </mesh>
        {/* Tier 2 Foliage Cone */}
        <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.4, 1.9, 7]} />
          <meshStandardMaterial color="#166534" roughness={0.7} flatShading />
        </mesh>
        {/* Tier 3 Foliage Cone */}
        <mesh position={[0, 5.3, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.9, 1.6, 7]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} flatShading />
        </mesh>
      </group>
    </RigidBody>
  );
};

export const Terrain: React.FC = () => {
  // Generate procedural terrain geometry with vertex colors
  const terrainGeometry = useMemo(() => {
    const size = 240;
    const segments = 120;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    const grassLow = new THREE.Color('#1e3a29');   // Deep meadow green
    const grassMid = new THREE.Color('#2d5a3c');   // Mid grass green
    const grassHigh = new THREE.Color('#417a50');  // Highlight green
    const pathDirt = new THREE.Color('#334155');   // Slate soil

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      const distFromCenter = Math.sqrt(x * x + z * z);
      let col = grassMid.clone();

      if (distFromCenter < 12) {
        col.lerp(pathDirt, 0.4);
      } else if (y > 2.5) {
        col.lerp(grassHigh, (y - 2.5) / 4);
      } else if (y < -1.0) {
        col.lerp(grassLow, (-y - 1.0) / 3);
      }

      colors.push(col.r, col.g, col.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Curved road path geometry winding across the landscape
  const roadGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numPoints = 80;
    const length = 200;

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * length - length / 2;
      const x = t;
      const z = Math.sin(t * 0.03) * 35;
      const y = getTerrainHeight(x, z) + 0.08;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const shape = new THREE.Shape();
    const roadWidth = 5.5;
    shape.moveTo(-roadWidth / 2, 0);
    shape.lineTo(roadWidth / 2, 0);
    shape.lineTo(roadWidth / 2, 0.05);
    shape.lineTo(-roadWidth / 2, 0.05);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      steps: 120,
      bevelEnabled: false,
      extrudePath: curve,
    });
  }, []);

  // Procedural tree locations placed around hills and road edges
  const treePositions = useMemo(() => {
    const trees: { pos: [number, number, number]; scale: number }[] = [];
    const seed = [
      [-35, -20], [-45, 10], [-25, -35], [-30, 40],
      [35, 25], [45, -15], [30, -38], [40, 45],
      [-55, -45], [55, 35], [-20, 50], [20, -50],
      [-40, -60], [45, 60], [-60, 20], [60, -25],
      [-15, -40], [15, 42], [-50, 45], [50, -45]
    ];

    seed.forEach(([x, z], idx) => {
      const y = getTerrainHeight(x, z);
      const scale = 0.8 + (idx % 5) * 0.15;
      trees.push({ pos: [x, y, z], scale });
    });

    return trees;
  }, []);

  return (
    <group>
      {/* 1. Main Rolling Terrain with Rapier Physics Collider */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={terrainGeometry} receiveShadow>
          <meshStandardMaterial
            vertexColors
            roughness={0.85}
            metalness={0.1}
            flatShading={false}
          />
        </mesh>
      </RigidBody>

      {/* 2. Scenic Winding Road */}
      <mesh geometry={roadGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* 3. Spawn Platform Pad */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[10, 10.5, 0.2, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        {/* Neon glowing center ring */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7.5, 7.8, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </RigidBody>

      {/* 4. Atmospheric Scenic Pine Trees */}
      {treePositions.map((tree, index) => (
        <PineTree key={index} position={tree.pos} scale={tree.scale} />
      ))}
    </group>
  );
};
