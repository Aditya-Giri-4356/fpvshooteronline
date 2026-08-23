import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight, getRiverCenterX } from './Terrain';
import { RigidBody } from '@react-three/rapier';

export const Foliage: React.FC = () => {
  // Generate instanced placements for Pine Trees, Birch Trees, Grass Tufts, Ferns, Boulders, Logs
  const {
    pineTransforms,
    birchTransforms,
    grassTransforms,
    boulderTransforms,
    logTransforms,
  } = useMemo(() => {
    const pines: THREE.Matrix4[] = [];
    const birches: THREE.Matrix4[] = [];
    const grass: THREE.Matrix4[] = [];
    const boulders: THREE.Matrix4[] = [];
    const logs: THREE.Matrix4[] = [];

    const dummy = new THREE.Object3D();

    // 1. Pine Trees (Dense Alpine Forest on Slopes and Ridges)
    for (let i = 0; i < 160; i++) {
      const angle = (i / 160) * Math.PI * 2;
      const radius = 18 + Math.sqrt(Math.random()) * 75;
      const x = Math.cos(angle) * radius + (Math.sin(i * 5) * 6);
      const z = Math.sin(angle) * radius + (Math.cos(i * 3) * 6);

      const riverDist = Math.abs(x - getRiverCenterX(z));
      if (riverDist < 9.5) continue; // Don't spawn in the river

      const y = getTerrainHeight(x, z);
      const scale = 0.8 + Math.random() * 0.9;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.08,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.08
      );
      dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.3), scale);
      dummy.updateMatrix();

      pines.push(dummy.matrix.clone());
    }

    // 2. Mountain Birch / Deciduous Trees (Scattered near clearings & trails)
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 130;
      const z = (Math.random() - 0.5) * 130;
      const riverDist = Math.abs(x - getRiverCenterX(z));

      if (riverDist < 10.0 || riverDist > 45.0) continue;

      const y = getTerrainHeight(x, z);
      const scale = 0.75 + Math.random() * 0.7;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      birches.push(dummy.matrix.clone());
    }

    // 3. Lush Blade Grass Tufts & Ferns (Thousands of blades across meadows)
    for (let i = 0; i < 450; i++) {
      const x = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 140;
      const riverDist = Math.abs(x - getRiverCenterX(z));

      if (riverDist < 7.5) continue; // Don't spawn submerged in water

      const y = getTerrainHeight(x, z);
      const scale = 0.6 + Math.random() * 0.8;

      dummy.position.set(x, y + 0.1, z);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      dummy.scale.set(scale, scale * 1.2, scale);
      dummy.updateMatrix();

      grass.push(dummy.matrix.clone());
    }

    // 4. River Boulders & Granite Rocks along banks and clearings
    for (let i = 0; i < 70; i++) {
      const z = (Math.random() - 0.5) * 160;
      const riverX = getRiverCenterX(z);
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = 6.5 + Math.random() * 12.0;
      const x = riverX + (side * offset);

      const y = getTerrainHeight(x, z);
      const scale = 0.7 + Math.random() * 1.6;

      dummy.position.set(x, y + (scale * 0.2), z);
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.scale.set(scale * 1.3, scale * 0.8, scale * 1.1);
      dummy.updateMatrix();

      boulders.push(dummy.matrix.clone());
    }

    // 5. Fallen Logs & Stumps for tactical combat cover
    for (let i = 0; i < 24; i++) {
      const x = (Math.random() - 0.5) * 110;
      const z = (Math.random() - 0.5) * 110;
      const riverDist = Math.abs(x - getRiverCenterX(z));

      if (riverDist < 10.0) continue;

      const y = getTerrainHeight(x, z);

      dummy.position.set(x, y + 0.35, z);
      dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.1);
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();

      logs.push(dummy.matrix.clone());
    }

    return {
      pineTransforms: pines,
      birchTransforms: birches,
      grassTransforms: grass,
      boulderTransforms: boulders,
      logTransforms: logs,
    };
  }, []);

  // Geometry definitions
  const pineCrownGeo = useMemo(() => {
    // 3-tiered spruce crown geometry
    const geo = new THREE.ConeGeometry(2.4, 4.8, 6);
    geo.translate(0, 3.8, 0);
    return geo;
  }, []);

  const pineTrunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.35, 0.55, 3.2, 6);
    geo.translate(0, 1.6, 0);
    return geo;
  }, []);

  const birchCrownGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(2.2, 1);
    geo.translate(0, 4.2, 0);
    return geo;
  }, []);

  const birchTrunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.25, 0.4, 3.6, 6);
    geo.translate(0, 1.8, 0);
    return geo;
  }, []);

  const grassTuftGeo = useMemo(() => {
    // Cross-billboard grass tuft
    const g1 = new THREE.PlaneGeometry(0.9, 0.9);
    g1.translate(0, 0.45, 0);
    const g2 = g1.clone();
    g2.rotateY(Math.PI / 2);
    const g3 = g1.clone();
    g3.rotateY(Math.PI / 4);

    const merged = new THREE.BufferGeometry();
    const pos: number[] = [
      ...Array.from(g1.attributes.position.array),
      ...Array.from(g2.attributes.position.array),
      ...Array.from(g3.attributes.position.array),
    ];
    merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    merged.computeVertexNormals();
    return merged;
  }, []);

  const boulderGeo = useMemo(() => {
    return new THREE.DodecahedronGeometry(1.2, 1);
  }, []);

  const logGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.4, 0.45, 4.5, 6);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, []);

  return (
    <group>
      {/* 1. Pine Trees (Spruce Foliage & Wood Trunks) */}
      <instancedMesh
        args={[pineCrownGeo, undefined, pineTransforms.length]}
        castShadow
        receiveShadow
        ref={(mesh) => {
          if (mesh) {
            pineTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#1e3a1e" roughness={0.9} flatShading={true} />
      </instancedMesh>

      <instancedMesh
        args={[pineTrunkGeo, undefined, pineTransforms.length]}
        castShadow
        ref={(mesh) => {
          if (mesh) {
            pineTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#3f2715" roughness={0.95} />
      </instancedMesh>

      {/* 2. Birch & Deciduous Trees */}
      <instancedMesh
        args={[birchCrownGeo, undefined, birchTransforms.length]}
        castShadow
        ref={(mesh) => {
          if (mesh) {
            birchTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#4d7c0f" roughness={0.85} flatShading={true} />
      </instancedMesh>

      <instancedMesh
        args={[birchTrunkGeo, undefined, birchTransforms.length]}
        castShadow
        ref={(mesh) => {
          if (mesh) {
            birchTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </instancedMesh>

      {/* 3. Grass Tufts & Wild Ferns */}
      <instancedMesh
        args={[grassTuftGeo, undefined, grassTransforms.length]}
        ref={(mesh) => {
          if (mesh) {
            grassTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial
          color="#65a30d"
          roughness={0.9}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.92}
        />
      </instancedMesh>

      {/* 4. River Boulders & Rocks (With Physical Colliders) */}
      <instancedMesh
        args={[boulderGeo, undefined, boulderTransforms.length]}
        castShadow
        receiveShadow
        ref={(mesh) => {
          if (mesh) {
            boulderTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#78716c" roughness={0.88} metalness={0.08} flatShading={true} />
      </instancedMesh>

      {/* 5. Fallen Logs for Combat Cover */}
      <instancedMesh
        args={[logGeo, undefined, logTransforms.length]}
        castShadow
        receiveShadow
        ref={(mesh) => {
          if (mesh) {
            logTransforms.forEach((mat, idx) => mesh.setMatrixAt(idx, mat));
            mesh.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </instancedMesh>

      {/* Selected Tactical Cover Colliders */}
      {logTransforms.map((mat: THREE.Matrix4, i: number) => {
        const pos = new THREE.Vector3();
        pos.setFromMatrixPosition(mat);
        return (
          <RigidBody key={`log-col-${i}`} type="fixed" position={[pos.x, pos.y, pos.z]}>
            <mesh visible={false}>
              <boxGeometry args={[4.5, 0.8, 0.8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
};
