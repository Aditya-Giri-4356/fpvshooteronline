import React from 'react';
import { CharacterClass, CHARACTER_CLASSES } from '@fps/shared';

interface CharacterModelProps {
  characterClass: CharacterClass;
  isShielded?: boolean;
  showMuzzleFlash?: boolean;
  targetSessionId?: string;
  isHitboxEnabled?: boolean;
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  characterClass,
  isShielded = false,
  showMuzzleFlash = false,
  targetSessionId,
  isHitboxEnabled = false,
}) => {
  const meta = CHARACTER_CLASSES[characterClass] || CHARACTER_CLASSES.VANGUARD;
  const isJuggernaut = characterClass === 'JUGGERNAUT';
  const isPhantom = characterClass === 'PHANTOM';
  const isSpectre = characterClass === 'SPECTRE';

  return (
    <group>
      {/* 1. Torso & Body Armor (Hitbox Target if enabled) */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        userData={isHitboxEnabled && targetSessionId ? { targetSessionId, isHeadshot: false } : undefined}
      >
        <capsuleGeometry args={[isJuggernaut ? 0.44 : 0.38, 0.9, 8, 16]} />
        <meshStandardMaterial
          color={meta.armorColor}
          roughness={isPhantom ? 0.2 : 0.5}
          metalness={isJuggernaut ? 0.8 : 0.5}
        />
      </mesh>

      {/* 2. Head & Helmet (Headshot Hitbox Target) */}
      <mesh
        position={[0, 0.75, 0]}
        userData={isHitboxEnabled && targetSessionId ? { targetSessionId, isHeadshot: true } : undefined}
        castShadow
      >
        <sphereGeometry args={[isJuggernaut ? 0.36 : 0.32, 12, 12]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* 3. Class-Specific Visor Optics */}
      <mesh position={[0, 0.75, isJuggernaut ? 0.25 : 0.22]}>
        <boxGeometry args={[isSpectre ? 0.36 : 0.3, isPhantom ? 0.08 : 0.12, 0.12]} />
        <meshStandardMaterial
          color={meta.visorColor}
          emissive={meta.visorColor}
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>

      {/* 4. Shoulder Armor Pauldrons */}
      <mesh position={[-0.45, 0.35, 0]} castShadow>
        <boxGeometry args={[isJuggernaut ? 0.28 : 0.18, isJuggernaut ? 0.32 : 0.2, 0.28]} />
        <meshStandardMaterial color={meta.accentColor} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.45, 0.35, 0]} castShadow>
        <boxGeometry args={[isJuggernaut ? 0.28 : 0.18, isJuggernaut ? 0.32 : 0.2, 0.28]} />
        <meshStandardMaterial color={meta.accentColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 5. Tactical Chestplate & Energy Node */}
      <mesh position={[0, 0.2, 0.22]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0.29]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <meshStandardMaterial
          color={meta.glowColor}
          emissive={meta.glowColor}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* 6. Tactical Weapon Model */}
      <group position={[0.36, -0.05, 0.36]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.08, 0.36]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]}>
          <boxGeometry args={[0.02, 0.02, 0.2]} />
          <meshStandardMaterial color={meta.accentColor} emissive={meta.accentColor} emissiveIntensity={1} />
        </mesh>

        {/* Remote Muzzle Flash */}
        {showMuzzleFlash && (
          <group position={[0, 0, 0.25]}>
            <pointLight color={meta.accentColor} intensity={4} distance={6} />
            <mesh>
              <dodecahedronGeometry args={[0.12, 0]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </group>

      {/* 7. Invulnerability Forcefield Shield */}
      {isShielded && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.92, 16, 16]} />
          <meshBasicMaterial color={meta.accentColor} transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
};
