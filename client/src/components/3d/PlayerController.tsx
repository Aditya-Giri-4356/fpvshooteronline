import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../game/useGameStore';
import { useTouchControls } from '../../game/useTouchControls';
import { networkManager, registerCombatCallbacks } from '../../network/colyseusClient';
import { soundFX } from '../../audio/SoundFX';
import { WeaponViewmodel } from './WeaponViewmodel';
import { 
  PLAYER_WALK_SPEED, 
  PLAYER_SPRINT_SPEED, 
  PLAYER_JUMP_FORCE,
  WEAPON_FIRE_RATE_MS,
  WEAPON_MAX_RANGE 
} from '@fps/shared';

const EYE_HEIGHT = 1.4;
const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_LOOK_SENSITIVITY = 0.0035;

interface PlayerControllerProps {
  onSpawnTracer?: (start: THREE.Vector3, end: THREE.Vector3, isCrit?: boolean) => void;
  onSpawnSpark?: (pos: THREE.Vector3, isCrit?: boolean) => void;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({
  onSpawnTracer,
  onSpawnSpark,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera, scene } = useThree();
  const { rapier, world } = useRapier();
  const { setPointerLocked, localSessionId, players, isDead } = useGameStore();

  const touch = useTouchControls();

  const localPlayer = localSessionId ? players[localSessionId] : null;
  const initialX = localPlayer?.x || 0;
  const initialZ = localPlayer?.z || 0;

  // Keyboard state
  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    sprint: boolean;
    isMouseDown: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    isMouseDown: false,
  });

  // Rotation Euler tracking
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isGrounded = useRef(true);

  // Weapon & Recoil state
  const [recoilCount, setRecoilCount] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const lastShotTime = useRef(0);
  const footstepTimer = useRef(0);

  // Handle shooting mechanics
  const performShoot = useCallback(() => {
    if (isDead) return;

    const now = performance.now();
    if (now - lastShotTime.current < WEAPON_FIRE_RATE_MS) return;
    lastShotTime.current = now;

    // 1. Play synthesized gunshot audio & recoil animation
    soundFX.playShootSound();
    setRecoilCount((prev) => prev + 1);

    // 2. Perform camera forward Raycast
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = WEAPON_MAX_RANGE;

    // Calculate muzzle origin in world space
    const muzzleOffset = new THREE.Vector3(0.25, -0.2, -0.5).applyQuaternion(camera.quaternion);
    const muzzlePos = camera.position.clone().add(muzzleOffset);

    // Intersect objects in scene (excluding viewmodel meshes)
    const intersects = raycaster.intersectObjects(scene.children, true);

    let hitPoint = camera.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(WEAPON_MAX_RANGE));
    let targetSessionId: string | undefined = undefined;
    let isHeadshot = false;

    for (let i = 0; i < intersects.length; i++) {
      const hit = intersects[i];
      // Skip local character meshes
      if (hit.object.userData?.targetSessionId === localSessionId) continue;
      // Skip sky dome / background
      if (hit.object.type === 'Sky') continue;

      hitPoint = hit.point;

      // Check if hit a remote player hitbox
      if (hit.object.userData?.targetSessionId) {
        targetSessionId = hit.object.userData.targetSessionId;
        isHeadshot = !!hit.object.userData.isHeadshot;
        break;
      }

      // Hit terrain / obstacle
      if (hit.point) {
        break;
      }
    }

    // 3. Spawn visual laser tracer & impact spark
    if (onSpawnTracer) {
      onSpawnTracer(muzzlePos, hitPoint, isHeadshot);
    }
    if (onSpawnSpark && hitPoint) {
      onSpawnSpark(hitPoint, isHeadshot);
    }

    // 4. Send shot to multiplayer server
    networkManager.sendPlayerShoot({
      originX: muzzlePos.x,
      originY: muzzlePos.y,
      originZ: muzzlePos.z,
      dirX: raycaster.ray.direction.x,
      dirY: raycaster.ray.direction.y,
      dirZ: raycaster.ray.direction.z,
      hitX: hitPoint.x,
      hitY: hitPoint.y,
      hitZ: hitPoint.z,
      targetSessionId,
      isHeadshot,
    });
  }, [camera, scene, isDead, localSessionId, onSpawnTracer, onSpawnSpark]);

  // Hook into network respawn
  useEffect(() => {
    registerCombatCallbacks({
      onLocalRespawn: (pos) => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation({ x: pos.x, y: pos.y + 1.0, z: pos.z }, true);
          rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
      },
    });
  }, []);

  // Setup input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          keys.current.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement) {
        keys.current.isMouseDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        keys.current.isMouseDown = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        yaw.current -= e.movementX * MOUSE_SENSITIVITY;
        pitch.current -= e.movementY * MOUSE_SENSITIVITY;

        const maxPitch = Math.PI / 2.1;
        pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
      }
    };

    const handlePointerLockChange = () => {
      const isLocked = !!document.pointerLockElement;
      setPointerLocked(isLocked);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [setPointerLocked]);

  // Main physics and combat update loop
  useFrame((_, delta) => {
    if (!rigidBodyRef.current || isDead) return;

    // 1. Consume mobile touch swipe look delta
    const touchDelta = touch.consumeLookDelta();
    if (touchDelta.dx !== 0 || touchDelta.dy !== 0) {
      yaw.current -= touchDelta.dx * TOUCH_LOOK_SENSITIVITY;
      pitch.current -= touchDelta.dy * TOUCH_LOOK_SENSITIVITY;

      const maxPitch = Math.PI / 2.1;
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    }

    // 2. Handle continuous auto-firing when mouse held or mobile fire button held
    const isTriggeringFire = keys.current.isMouseDown || touch.isFiring;
    if (isTriggeringFire) {
      performShoot();
    }

    const translation = rigidBodyRef.current.translation();
    const linvel = rigidBodyRef.current.linvel();

    // 3. Ground check via Rapier raycast
    const rayOrigin = { x: translation.x, y: translation.y, z: translation.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const maxToi = 1.1;
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, maxToi, true);
    isGrounded.current = hit !== null && hit.timeOfImpact < maxToi;

    // 4. Combine keyboard movement and mobile virtual joystick
    const sprintActive = keys.current.sprint || touch.isSprinting;
    setIsSprinting(sprintActive);

    const speed = sprintActive ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;
    const moveVector = new THREE.Vector3();

    // Keyboard inputs
    if (keys.current.forward) moveVector.z -= 1;
    if (keys.current.backward) moveVector.z += 1;
    if (keys.current.left) moveVector.x -= 1;
    if (keys.current.right) moveVector.x += 1;

    // Mobile Virtual Joystick inputs
    if (touch.moveVector.x !== 0 || touch.moveVector.y !== 0) {
      moveVector.x += touch.moveVector.x;
      moveVector.z += touch.moveVector.y;
    }

    const moving = moveVector.lengthSq() > 0.01;
    setIsMoving(moving);

    if (moving) {
      moveVector.normalize();
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      moveVector.multiplyScalar(speed);

      // Footstep sounds
      if (isGrounded.current) {
        footstepTimer.current += delta * (sprintActive ? 14 : 9);
        if (footstepTimer.current > Math.PI) {
          footstepTimer.current = 0;
          soundFX.playFootstepSound(sprintActive);
        }
      }
    }

    // 5. Jump handling (Keyboard Space or Mobile Jump Button)
    let vy = linvel.y;
    const jumpRequested = keys.current.jump || touch.isJumping;
    if (jumpRequested && isGrounded.current && vy > -1.0 && vy < 1.0) {
      vy = PLAYER_JUMP_FORCE;
      soundFX.playJumpSound();
    }

    // 6. Apply velocity
    rigidBodyRef.current.setLinvel({ x: moveVector.x, y: vy, z: moveVector.z }, true);

    // 7. Update Camera View
    camera.position.set(translation.x, translation.y + EYE_HEIGHT, translation.z);
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    // 8. Broadcast position update
    networkManager.sendPlayerMove(
      translation.x,
      translation.y,
      translation.z,
      pitch.current,
      yaw.current
    );
  });

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        type="dynamic"
        position={[initialX, 2.0, initialZ]}
        enabledRotations={[false, false, false]}
        friction={0.2}
        restitution={0.0}
        linearDamping={0.5}
        userData={{ targetSessionId: localSessionId, isLocal: true }}
      >
        <CapsuleCollider args={[0.5, 0.4]} />
      </RigidBody>

      {/* Local 3D Weapon Viewmodel */}
      {!isDead && (
        <WeaponViewmodel
          isFiring={keys.current.isMouseDown || touch.isFiring}
          isMoving={isMoving}
          isSprinting={isSprinting}
          recoilTrigger={recoilCount}
        />
      )}
    </>
  );
};
