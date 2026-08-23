import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

// River path calculation function
export function getRiverCenterX(z: number): number {
  return Math.sin(z * 0.035) * 14 + Math.cos(z * 0.07) * 6;
}

// Terrain elevation function matching alpine valley
export function getTerrainHeight(x: number, z: number): number {
  const riverX = getRiverCenterX(z);
  const distToRiver = Math.abs(x - riverX);

  // Riverbed canyon
  if (distToRiver < 8.0) {
    const canyonFactor = distToRiver / 8.0;
    return -2.2 + (canyonFactor * canyonFactor) * 1.8;
  }

  // Riverbanks and rolling green hills
  const bankElevation = Math.min(2.0, (distToRiver - 8.0) * 0.35);
  const rollingHills = (
    Math.sin(x * 0.04 + z * 0.03) * 2.2 +
    Math.cos(x * 0.06 - z * 0.05) * 1.5 +
    Math.sin(z * 0.08) * 1.0
  );

  // Gentle upward rise towards distant edges
  const edgeClimb = Math.pow(Math.max(0, Math.abs(x) - 35) / 45, 2) * 8.0;

  return Math.max(-0.4, bankElevation + rollingHills + edgeClimb);
}

export const Terrain: React.FC = () => {
  const size = 200;
  const segments = 90;

  // Generate detailed procedural alpine heightmap with vertex colors
  const { geometry, waterGeometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const grassColor = new THREE.Color('#3b7a37'); // Vibrant alpine meadow
    const darkGrass = new THREE.Color('#275424'); // Shaded forest slope
    const rockColor = new THREE.Color('#78716c'); // Riverbank stone / granite
    const sandColor = new THREE.Color('#a8a29e'); // Riverbed pebble / gravel

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const h = getTerrainHeight(vx, vz);
      pos.setY(i, h);

      const riverDist = Math.abs(vx - getRiverCenterX(vz));
      const chosenColor = new THREE.Color();

      if (h < -0.8) {
        // Deep riverbed gravel
        chosenColor.copy(sandColor).lerp(rockColor, 0.4);
      } else if (riverDist < 12.0) {
        // Rocky sandy riverbank
        const t = (riverDist - 6.0) / 6.0;
        chosenColor.copy(rockColor).lerp(grassColor, Math.max(0, Math.min(1, t)));
      } else if (h > 4.5) {
        // Higher ridge slope
        chosenColor.copy(grassColor).lerp(darkGrass, 0.5);
      } else {
        // Lush meadow grass
        const noise = (Math.sin(vx * 0.2) + Math.cos(vz * 0.2)) * 0.1;
        chosenColor.copy(grassColor).lerp(darkGrass, Math.max(0, Math.min(1, 0.3 + noise)));
      }

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Winding River Water Plane
    const wGeo = new THREE.PlaneGeometry(32, size, 16, segments);
    wGeo.rotateX(-Math.PI / 2);
    const wPos = wGeo.attributes.position;

    for (let i = 0; i < wPos.count; i++) {
      const wz = wPos.getZ(i);
      const riverX = getRiverCenterX(wz);
      const curX = wPos.getX(i);
      wPos.setX(i, curX + riverX);
      wPos.setY(i, -0.6); // Water surface height
    }
    wGeo.computeVertexNormals();

    return { geometry: geo, waterGeometry: wGeo };
  }, []);

  const waterMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Soft river water ripple shimmer animation
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      const t = clock.getElapsedTime();
      waterMaterialRef.current.roughness = 0.15 + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Physics Ground Collider for Hills & Valley */}
      <RigidBody type="fixed" colliders="trimesh" friction={1.0} restitution={0.0}>
        <mesh geometry={geometry} receiveShadow>
          <meshStandardMaterial
            vertexColors
            roughness={0.88}
            metalness={0.05}
            flatShading={false}
          />
        </mesh>
      </RigidBody>

      {/* Sparkling Alpine River Surface */}
      <mesh geometry={waterGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          ref={waterMaterialRef}
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.2}
          roughness={0.12}
          metalness={0.4}
          transparent={true}
          opacity={0.88}
        />
      </mesh>

      {/* Riverbed Pebbles / Subtle Shore Glow */}
      <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 180]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
