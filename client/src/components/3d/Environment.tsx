import React from 'react';
import { Sky } from '@react-three/drei';

export const GameEnvironment: React.FC = () => {
  return (
    <>
      {/* Dynamic Alpine Sunlight */}
      <directionalLight
        position={[45, 60, 35]}
        intensity={2.4}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={250}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
        shadow-bias={-0.0002}
      />

      {/* Ambient Sky & Forest Canopy Fill */}
      <ambientLight intensity={1.1} color="#e0f2fe" />
      <hemisphereLight
        color="#bae6fd"
        groundColor="#3f6212"
        intensity={0.8}
      />

      {/* Atmospheric Alpine Horizon Mist & Depth Fog */}
      <fogExp2 attach="fog" args={['#b0cddb', 0.009]} />

      {/* Procedural Sky with Natural Sun Elevation */}
      <Sky
        sunPosition={[45, 60, 35]}
        turbidity={6.0}
        rayleigh={1.2}
        mieCoefficient={0.005}
        mieDirectionalG={0.85}
      />
    </>
  );
};
