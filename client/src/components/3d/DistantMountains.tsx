import React, { useMemo } from 'react';
import * as THREE from 'three';

export const DistantMountains: React.FC = () => {
  // Generate jagged alpine mountain peaks encircling the distant horizon
  const { geometry, snowGeometry } = useMemo(() => {
    const radius = 180;
    const peakCount = 18;
    const baseGeo = new THREE.BufferGeometry();
    const snowGeo = new THREE.BufferGeometry();

    const basePositions: number[] = [];
    const snowPositions: number[] = [];

    for (let i = 0; i < peakCount; i++) {
      const angle = (i / peakCount) * Math.PI * 2 + (Math.sin(i * 3) * 0.15);
      const dist = radius + Math.sin(i * 4) * 20;
      const height = 45 + Math.sin(i * 2.5) * 25 + (i % 2 === 0 ? 15 : 0);
      const width = 35 + Math.cos(i * 3) * 12;

      const cx = Math.cos(angle) * dist;
      const cz = Math.sin(angle) * dist;

      // Base mountain pyramid vertices
      const top: [number, number, number] = [cx, height, cz];
      const leftAngle = angle - (width / dist);
      const rightAngle = angle + (width / dist);

      const p1: [number, number, number] = [Math.cos(leftAngle) * dist, 0, Math.sin(leftAngle) * dist];
      const p2: [number, number, number] = [Math.cos(rightAngle) * dist, 0, Math.sin(rightAngle) * dist];
      const pBack: [number, number, number] = [Math.cos(angle) * (dist + 35), 0, Math.sin(angle) * (dist + 35)];

      // Front face
      basePositions.push(...p1, ...p2, ...top);
      // Left side
      basePositions.push(...p1, ...top, ...pBack);
      // Right side
      basePositions.push(...top, ...p2, ...pBack);

      // Snowcap on top 40% of the peak
      const snowCut = 0.6;
      const s1: [number, number, number] = [
        p1[0] + (top[0] - p1[0]) * snowCut,
        top[1] * snowCut,
        p1[2] + (top[2] - p1[2]) * snowCut,
      ];
      const s2: [number, number, number] = [
        p2[0] + (top[0] - p2[0]) * snowCut,
        top[1] * snowCut,
        p2[2] + (top[2] - p2[2]) * snowCut,
      ];

      snowPositions.push(...s1, ...s2, ...top);
    }

    baseGeo.setAttribute('position', new THREE.Float32BufferAttribute(basePositions, 3));
    baseGeo.computeVertexNormals();

    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
    snowGeo.computeVertexNormals();

    return { geometry: baseGeo, snowGeometry: snowGeo };
  }, []);

  return (
    <group position={[0, -2, 0]}>
      {/* Rocky Mountain Body */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#526070"
          roughness={0.9}
          metalness={0.1}
          flatShading={true}
        />
      </mesh>

      {/* Snow-Capped Alpine Peaks */}
      <mesh geometry={snowGeometry} position={[0, 0.1, 0]}>
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.7}
          metalness={0.05}
          flatShading={true}
        />
      </mesh>
    </group>
  );
};
