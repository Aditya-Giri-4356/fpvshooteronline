import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../game/useGameStore';
import { MAP_THEMES } from '@fps/shared';

export const Terrain: React.FC = () => {
  const selectedTheme = useGameStore((state) => state.selectedTheme);
  const theme = MAP_THEMES[selectedTheme] || MAP_THEMES.SCENIC_VALLEY;

  const size = 180;
  const segments = 60;

  // Generate theme-tailored procedural heightmap
  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const verts: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let y = 0;

      if (selectedTheme === 'DESERT_OUTPOST') {
        // Sand dunes with gentle rolling ridges
        const dune1 = Math.sin(x * 0.04 + z * 0.02) * 2.2;
        const dune2 = Math.cos(z * 0.05) * Math.sin(x * 0.03) * 1.5;
        // Flatten center compound
        const distFromCenter = Math.sqrt(x * x + z * z);
        const centerFlatten = Math.min(1.0, distFromCenter / 25);
        y = (dune1 + dune2) * centerFlatten;
      } else if (selectedTheme === 'CYBER_METROPOLIS') {
        // Flat urban plaza with highway ramp
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (Math.abs(x) < 8 && z > 20) {
          // Highway ramp
          y = Math.min(4.5, (z - 20) * 0.15);
        } else if (distFromCenter > 50) {
          y = Math.sin(x * 0.05) * 1.0;
        } else {
          y = 0;
        }
      } else if (selectedTheme === 'INDUSTRIAL_DOCKS') {
        // Concrete harbor apron with container dock elevation
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 45) {
          y = Math.sin(z * 0.04) * 1.2;
        } else {
          y = 0;
        }
      } else {
        // SCENIC_VALLEY: Slow Roads rolling hills
        const distFromRoad = Math.abs(x - Math.sin(z * 0.04) * 8);
        const roadFlatten = Math.min(1.0, distFromRoad / 7);
        const hill1 = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 4.5;
        const hill2 = Math.sin(x * 0.08 + z * 0.06) * 1.8;
        y = (hill1 + hill2) * roadFlatten;
      }

      pos.setY(i, y);
      verts.push(x, y, z);
    }

    geo.computeVertexNormals();
    return { geometry: geo, vertices: verts };
  }, [selectedTheme]);

  // Procedural Foliage / Decor tailored to theme
  const foliageItems = useMemo(() => {
    const items: Array<{ x: number; y: number; z: number; scale: number; type: string; color: string }> = [];
    const count = selectedTheme === 'CYBER_METROPOLIS' ? 12 : selectedTheme === 'INDUSTRIAL_DOCKS' ? 8 : 45;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.3);
      const radius = 18 + Math.random() * 55;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Keep center clearing open
      if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;

      let y = 0;
      if (selectedTheme === 'DESERT_OUTPOST') {
        y = (Math.sin(x * 0.04 + z * 0.02) * 2.2) * Math.min(1.0, radius / 25);
        items.push({
          x,
          y,
          z,
          scale: 0.8 + Math.random() * 0.6,
          type: i % 2 === 0 ? 'palm' : 'cactus',
          color: i % 2 === 0 ? '#4d7c0f' : '#3f6212',
        });
      } else if (selectedTheme === 'CYBER_METROPOLIS') {
        items.push({
          x,
          y: 0,
          z,
          scale: 1.0 + Math.random() * 0.5,
          type: 'neonPillar',
          color: i % 2 === 0 ? '#06b6d4' : '#ec4899',
        });
      } else if (selectedTheme === 'INDUSTRIAL_DOCKS') {
        items.push({
          x,
          y: 0,
          z,
          scale: 1.0,
          type: 'lightPost',
          color: '#f59e0b',
        });
      } else {
        // Scenic Valley pine trees
        const distFromRoad = Math.abs(x - Math.sin(z * 0.04) * 8);
        const roadFlatten = Math.min(1.0, distFromRoad / 7);
        y = (Math.sin(x * 0.035) * Math.cos(z * 0.035) * 4.5) * roadFlatten;

        items.push({
          x,
          y,
          z,
          scale: 0.8 + Math.random() * 0.7,
          type: 'pine',
          color: i % 3 === 0 ? '#1b4332' : i % 3 === 1 ? '#2d6a4f' : '#40916c',
        });
      }
    }
    return items;
  }, [selectedTheme]);

  return (
    <group>
      {/* Ground Physical Terrain */}
      <RigidBody type="fixed" colliders="trimesh" friction={0.7} restitution={0.0}>
        <mesh geometry={geometry} receiveShadow>
          <meshStandardMaterial
            color={theme.groundColor}
            roughness={selectedTheme === 'CYBER_METROPOLIS' ? 0.4 : 0.85}
            metalness={selectedTheme === 'CYBER_METROPOLIS' ? 0.25 : 0.05}
            flatShading={selectedTheme !== 'CYBER_METROPOLIS'}
          />
        </mesh>
      </RigidBody>

      {/* Center Road / Plaza Surface */}
      {selectedTheme === 'SCENIC_VALLEY' && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[7, 160, 2, 40]} />
          <meshStandardMaterial color={theme.roadColor} roughness={0.7} />
        </mesh>
      )}

      {selectedTheme === 'DESERT_OUTPOST' && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 140, 2, 30]} />
          <meshStandardMaterial color={theme.roadColor} roughness={0.9} />
        </mesh>
      )}

      {selectedTheme === 'CYBER_METROPOLIS' && (
        <group>
          {/* Main Neon Highway */}
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[14, 160, 2, 40]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Neon Highway Center Dividers */}
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.35, 150]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          {/* Neon Highway Border Lines */}
          <mesh position={[-6.8, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.25, 150]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>
          <mesh position={[6.8, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.25, 150]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>
        </group>
      )}

      {/* Themed Foliage & Environmental Elements */}
      {foliageItems.map((item, idx) => {
        if (item.type === 'pine') {
          return (
            <group key={idx} position={[item.x, item.y, item.z]} scale={[item.scale, item.scale, item.scale]}>
              {/* Trunk */}
              <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.35, 2, 6]} />
                <meshStandardMaterial color="#582f0e" roughness={0.9} />
              </mesh>
              {/* Foliage Cones */}
              <mesh position={[0, 2.5, 0]} castShadow>
                <coneGeometry args={[1.8, 2.2, 7]} />
                <meshStandardMaterial color={item.color} roughness={0.8} />
              </mesh>
              <mesh position={[0, 3.8, 0]} castShadow>
                <coneGeometry args={[1.4, 1.8, 7]} />
                <meshStandardMaterial color={item.color} roughness={0.8} />
              </mesh>
              <mesh position={[0, 4.8, 0]} castShadow>
                <coneGeometry args={[0.9, 1.4, 7]} />
                <meshStandardMaterial color={item.color} roughness={0.8} />
              </mesh>
            </group>
          );
        }

        if (item.type === 'palm') {
          return (
            <group key={idx} position={[item.x, item.y, item.z]} scale={[item.scale, item.scale, item.scale]}>
              <mesh position={[0, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.35, 5, 6]} />
                <meshStandardMaterial color="#854d0e" roughness={0.9} />
              </mesh>
              <mesh position={[0, 5.0, 0]} castShadow>
                <sphereGeometry args={[1.6, 6, 4]} />
                <meshStandardMaterial color={item.color} roughness={0.8} />
              </mesh>
            </group>
          );
        }

        if (item.type === 'neonPillar') {
          return (
            <group key={idx} position={[item.x, item.y, item.z]} scale={[item.scale, item.scale, item.scale]}>
              <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[0.6, 8, 0.6]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 4, 0]}>
                <boxGeometry args={[0.2, 7.6, 0.65]} />
                <meshBasicMaterial color={item.color} />
              </mesh>
            </group>
          );
        }

        if (item.type === 'lightPost') {
          return (
            <group key={idx} position={[item.x, item.y, item.z]}>
              <mesh position={[0, 3, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.2, 6, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, 6, 0]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshBasicMaterial color="#f59e0b" />
              </mesh>
              <pointLight position={[0, 5.8, 0]} color="#f59e0b" intensity={2.0} distance={15} decay={2} />
            </group>
          );
        }

        return null;
      })}
    </group>
  );
};
