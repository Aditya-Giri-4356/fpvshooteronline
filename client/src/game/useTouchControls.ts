import { create } from 'zustand';

interface TouchControlsState {
  isTouchDevice: boolean;
  isPortrait: boolean;
  moveVector: { x: number; y: number };
  lookDelta: { dx: number; dy: number };
  isFiring: boolean;
  isJumping: boolean;
  isSprinting: boolean;

  setIsTouchDevice: (isTouch: boolean) => void;
  setIsPortrait: (isPortrait: boolean) => void;
  setMoveVector: (x: number, y: number) => void;
  addLookDelta: (dx: number, dy: number) => void;
  consumeLookDelta: () => { dx: number; dy: number };
  setIsFiring: (isFiring: boolean) => void;
  setIsJumping: (isJumping: boolean) => void;
  setIsSprinting: (isSprinting: boolean) => void;
}

let pendingLookDx = 0;
let pendingLookDy = 0;

export const useTouchControls = create<TouchControlsState>((set) => ({
  isTouchDevice: false,
  isPortrait: false,
  moveVector: { x: 0, y: 0 },
  lookDelta: { dx: 0, dy: 0 },
  isFiring: false,
  isJumping: false,
  isSprinting: false,

  setIsTouchDevice: (isTouchDevice) => set({ isTouchDevice }),
  setIsPortrait: (isPortrait) => set({ isPortrait }),
  setMoveVector: (x, y) => set({ moveVector: { x, y } }),
  addLookDelta: (dx, dy) => {
    pendingLookDx += dx;
    pendingLookDy += dy;
  },
  consumeLookDelta: () => {
    const dx = pendingLookDx;
    const dy = pendingLookDy;
    pendingLookDx = 0;
    pendingLookDy = 0;
    return { dx, dy };
  },
  setIsFiring: (isFiring) => set({ isFiring }),
  setIsJumping: (isJumping) => set({ isJumping }),
  setIsSprinting: (isSprinting) => set({ isSprinting }),
}));
