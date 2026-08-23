import React, { useEffect, useRef, useState } from 'react';
import { createRoot, advance, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { bootEngine } from '../../engine/main';
import { Engine } from '../../engine/core/Engine';

extend(THREE as any);

export const WebGPUWorld: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [r3fRoot, setR3fRoot] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current || engine) return;

    let isMounted = true;
    let rRoot: any = null;

    bootEngine(containerRef.current)
      .then((eng) => {
        if (!isMounted) return;
        setEngine(eng);
        
        // Let the R3F components render inside the Engine's scene and camera
        // Disable R3F's internal frameloop because Engine.ts is calling renderer.setAnimationLoop
        rRoot = createRoot(containerRef.current as any);
        rRoot.configure({
          gl: eng.renderer,
          camera: eng.camera,
          scene: eng.scene,
          frameloop: 'never', // We will step it manually in engine's onUpdate
          size: { width: window.innerWidth, height: window.innerHeight }
        });
        
        setR3fRoot(rRoot);

        // Hook R3F advance into the engine's update loop
        eng.onUpdate(() => {
          advance(performance.now(), true);
        });

      })
      .catch((err) => {
        console.error("Failed to boot WebGPU engine:", err);
      });

    return () => {
      isMounted = false;
      if (rRoot) {
        rRoot.unmount();
      }
    };
  }, []);

  // Update R3F children when they change, only if root is ready
  useEffect(() => {
    if (r3fRoot) {
      r3fRoot.render(children);
    }
  }, [r3fRoot, children]);

  return <div ref={containerRef} id="webgpu-container" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};
