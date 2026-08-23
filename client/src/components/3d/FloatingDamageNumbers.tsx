import { forwardRef, useImperativeHandle, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

export interface DamageNumberData {
  id: string;
  position: THREE.Vector3;
  damage: number;
  isHeadshot: boolean;
  createdAt: number;
}

export interface FloatingDamageNumbersRef {
  addDamageNumber: (position: THREE.Vector3, damage: number, isHeadshot: boolean) => void;
}

export const FloatingDamageNumbers = forwardRef<FloatingDamageNumbersRef>((_, ref) => {
  const [numbers, setNumbers] = useState<DamageNumberData[]>([]);

  useImperativeHandle(ref, () => ({
    addDamageNumber: (position: THREE.Vector3, damage: number, isHeadshot: boolean) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const pos = position.clone().add(
        new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.2, (Math.random() - 0.5) * 0.4)
      );

      const item: DamageNumberData = {
        id,
        position: pos,
        damage,
        isHeadshot,
        createdAt: performance.now(),
      };
      setNumbers((prev) => [...prev.slice(-15), item]);
    },
  }));

  useFrame((_, delta) => {
    const now = performance.now();
    setNumbers((prev) =>
      prev
        .filter((n) => (now - n.createdAt) / 1000 < 0.9)
        .map((n) => {
          n.position.y += delta * 1.6;
          return n;
        })
    );
  });

  return (
    <group>
      {numbers.map((item) => {
        const ageSec = (performance.now() - item.createdAt) / 1000;
        const opacity = Math.max(0, 1 - ageSec / 0.9);

        return (
          <Billboard key={item.id} position={[item.position.x, item.position.y, item.position.z]}>
            <Text
              fontSize={item.isHeadshot ? 0.45 : 0.35}
              color={item.isHeadshot ? '#f43f5e' : '#ffffff'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#090d16"
              fillOpacity={opacity}
              outlineOpacity={opacity}
            >
              {item.isHeadshot ? `CRIT -${item.damage}` : `-${item.damage}`}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
});

FloatingDamageNumbers.displayName = 'FloatingDamageNumbers';
