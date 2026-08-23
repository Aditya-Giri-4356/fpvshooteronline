import React from 'react';
import { Sky } from '@react-three/drei';
import { useGameStore } from '../../game/useGameStore';

export const GameEnvironment: React.FC = () => {
  const selectedTheme = useGameStore((state) => state.selectedTheme);

  if (selectedTheme === 'DESERT_OUTPOST') {
    return (
      <>
        <color attach="background" args={['#dfb78c']} />
        <fog attach="fog" args={['#dfb78c', 20, 200]} />
        <ambientLight color="#fef3c7" intensity={0.8} />
        <directionalLight
          position={[60, 80, 40]}
          intensity={2.2}
          color="#fffbeb"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={250}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-bias={-0.0002}
        />
        <Sky
          distance={450000}
          sunPosition={[60, 40, 40]}
          turbidity={8.0}
          rayleigh={2.2}
          mieCoefficient={0.015}
          mieDirectionalG={0.88}
        />
      </>
    );
  }

  if (selectedTheme === 'CYBER_METROPOLIS') {
    return (
      <>
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#1e1b4b', 20, 180]} />
        <ambientLight color="#312e81" intensity={0.7} />
        <directionalLight
          position={[-40, 60, -30]}
          intensity={1.5}
          color="#818cf8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={250}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-bias={-0.0002}
        />
        <pointLight position={[0, 15, 0]} color="#06b6d4" intensity={2.5} distance={60} decay={2} />
        <pointLight position={[20, 12, -20]} color="#ec4899" intensity={2.5} distance={50} decay={2} />
        <pointLight position={[-20, 12, 20]} color="#3b82f6" intensity={2.5} distance={50} decay={2} />
        <Sky
          distance={450000}
          sunPosition={[-10, 2, -50]}
          turbidity={12.0}
          rayleigh={0.6}
          mieCoefficient={0.04}
          mieDirectionalG={0.8}
        />
      </>
    );
  }

  if (selectedTheme === 'INDUSTRIAL_DOCKS') {
    return (
      <>
        <color attach="background" args={['#334155']} />
        <fog attach="fog" args={['#475569', 15, 180]} />
        <ambientLight color="#334155" intensity={0.7} />
        <directionalLight
          position={[-50, 75, 40]}
          intensity={1.6}
          color="#cbd5e1"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={250}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-bias={-0.0002}
        />
        <pointLight position={[15, 10, 15]} color="#f59e0b" intensity={2.0} distance={40} decay={2} />
        <pointLight position={[-15, 10, -15]} color="#f43f5e" intensity={2.0} distance={40} decay={2} />
        <Sky
          distance={450000}
          sunPosition={[-50, 18, 40]}
          turbidity={14.0}
          rayleigh={3.0}
          mieCoefficient={0.07}
          mieDirectionalG={0.75}
        />
      </>
    );
  }

  // Default: SCENIC_VALLEY (Slow Roads green mountain hills)
  return (
    <>
      <color attach="background" args={['#c7e6f8']} />
      <fog attach="fog" args={['#c7e6f8', 30, 250]} />
      <ambientLight color="#e0f2fe" intensity={0.85} />
      <directionalLight
        position={[45, 65, 30]}
        intensity={2.0}
        color="#fef9c3"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={250}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0002}
      />
      <Sky
        distance={450000}
        sunPosition={[45, 25, 30]}
        turbidity={4.0}
        rayleigh={1.2}
        mieCoefficient={0.005}
        mieDirectionalG={0.9}
      />
    </>
  );
};
