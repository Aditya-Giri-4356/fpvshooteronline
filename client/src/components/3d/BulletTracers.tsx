import { useImperativeHandle, forwardRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface TracerData {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  createdAt: number;
  lifeTime: number;
  color: string;
}

export interface SparkData {
  id: string;
  position: THREE.Vector3;
  createdAt: number;
  color: string;
}

export interface BulletTracersRef {
  addTracer: (start: THREE.Vector3, end: THREE.Vector3, isCrit?: boolean) => void;
  addSpark: (position: THREE.Vector3, isCrit?: boolean) => void;
}

export const BulletTracers = forwardRef<BulletTracersRef>((_, ref) => {
  const [tracers, setTracers] = useState<TracerData[]>([]);
  const [sparks, setSparks] = useState<SparkData[]>([]);

  useImperativeHandle(ref, () => ({
    addTracer: (start: THREE.Vector3, end: THREE.Vector3, isCrit: boolean = false) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newTracer: TracerData = {
        id,
        start: start.clone(),
        end: end.clone(),
        createdAt: performance.now(),
        lifeTime: 0.12,
        color: isCrit ? '#f43f5e' : '#38bdf8',
      };
      setTracers((prev) => [...prev.slice(-20), newTracer]);
    },
    addSpark: (position: THREE.Vector3, isCrit: boolean = false) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newSpark: SparkData = {
        id,
        position: position.clone(),
        createdAt: performance.now(),
        color: isCrit ? '#f43f5e' : '#38bdf8',
      };
      setSparks((prev) => [...prev.slice(-25), newSpark]);
    },
  }));

  useFrame(() => {
    const now = performance.now();
    setTracers((prev) => prev.filter((t) => (now - t.createdAt) / 1000 < t.lifeTime));
    setSparks((prev) => prev.filter((s) => (now - s.createdAt) / 1000 < 0.25));
  });

  return (
    <group>
      {/* Laser Tracer Beams */}
      {tracers.map((tracer) => {
        const dir = new THREE.Vector3().subVectors(tracer.end, tracer.start);
        const length = dir.length();
        const midPoint = new THREE.Vector3().addVectors(tracer.start, tracer.end).multiplyScalar(0.5);

        const orientation = new THREE.Matrix4();
        orientation.lookAt(tracer.start, tracer.end, new THREE.Vector3(0, 1, 0));
        const rot = new THREE.Euler().setFromRotationMatrix(orientation);

        return (
          <group key={tracer.id} position={midPoint} rotation={rot}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, length, 6]} />
              <meshBasicMaterial color={tracer.color} transparent opacity={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* Surface Impact Sparks */}
      {sparks.map((spark) => (
        <group key={spark.id} position={spark.position}>
          <mesh>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshBasicMaterial color={spark.color} />
          </mesh>
          <pointLight color={spark.color} intensity={2} distance={3} decay={2} />
        </group>
      ))}
    </group>
  );
});

BulletTracers.displayName = 'BulletTracers';
