import React from 'react';
import { Sky } from '@react-three/drei';

export const GameEnvironment: React.FC = () => {
  return (
    <>
      {/* Stylized Atmospheric Fog matching Slow Roads horizon */}
      <fog attach="fog" args={['#0f172a', 30, 180]} />
      <color attach="background" args={['#0f172a']} />

      {/* Atmospheric Sky Dome */}
      <Sky
        distance={450000}
        sunPosition={[50, 40, 50]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Ambient Lighting for Soft Fill */}
      <ambientLight intensity={0.45} color="#93c5fd" />

      {/* Main Directional Sunlight with Soft Shadows */}
      <directionalLight
        position={[60, 80, 50]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={250}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0001}
        color="#fffbeb"
      />

      {/* Secondary Hemisphere Light for Natural Horizon Lighting */}
      <hemisphereLight
        args={['#bae6fd', '#1e293b', 0.5]}
      />
    </>
  );
};
