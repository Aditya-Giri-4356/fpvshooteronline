# HYPERSHOT 3D - Multiplayer FPS

A high-performance, browser-based 3D multiplayer first-person shooter inspired by the fast, arcade-style gameplay feel of *Roblox Hypershot* combined with the scenic, atmospheric procedural visual feeling of *Slow Roads*.

Built as a standalone web application using **React 19, TypeScript, Vite, Three.js, React Three Fiber, Rapier 3D Physics, Node.js, and Colyseus WebSockets**.

---

## 🎮 Mobile & Desktop Controls

The game is built with **Mobile-First Priority (Landscape View)** while preserving full **Desktop / Laptop** controls.

### 📱 Mobile Phone Controls (Landscape Mode)
- **Left Thumb Dynamic Joystick**: Touch and drag to move in any direction. Pushing near the outer ring automatically engages sprint.
- **Right Thumb Aim Zone**: Drag anywhere on the right half of the screen to aim/pan smoothly with inertial touch smoothing.
- **Ergonomic Action Buttons**:
  - **FIRE Button** (Large Glowing Target): Tap or hold for continuous auto-firing with unlimited ammunition.
  - **JUMP Button** (Up Chevron): Quick tap to jump over hills and obstacles.
  - **SPRINT Button** (Zap Icon): Toggle or hold sprint speed.
- **Landscape Orientation Prompt**: Automatically prompts the player to rotate their phone horizontally if held vertically.

### 💻 Laptop / Desktop Controls
- **Movement**: `W`, `A`, `S`, `D` or Arrow Keys
- **Look / Aim**: Mouse Look (Click canvas to lock pointer, `ESC` to unlock)
- **Shoot**: Left Mouse Button (Hold for rapid auto-fire)
- **Jump**: `SPACE`
- **Sprint**: `SHIFT`
- **Scoreboard**: `TAB` (Hold or toggle to view match leaderboard)

---

## ⚔️ Combat & Gameplay Mechanics

- **Unlimited Ammunition**: Fast, arcade-style rapid fire with zero reload delays.
- **Damage System**:
  - Body Hit: **25 Damage**
  - Headshot: **50 Damage** (Critical Hit)
- **Hit Feedback**: Satisfying metallic hitmarker audio ding, 4-point crosshair hitmarker ticks (white for body, red for headshot), and floating 3D damage numbers.
- **Health & Shield**: 100 Max HP with screen damage vignette flash. Players spawn with a **2-second glowing invulnerability shield**.
- **Elimination & Respawning**: 3-second respawn timer after elimination -> spawns at a random map location with invulnerability shield.
- **Real-Time Kill Feed**: Top-right HUD notification stream (`Viper ⚡ [CRIT] ➔ Shadow`).
- **Procedural Sound Synthesizer**: Zero-dependency Web Audio API sound effects for laser gunshots, hitmarker dings, damage pulses, elimination chimes, and footsteps.

---

## 🌲 Scenic Environment (Slow Roads Aesthetic)

- **Atmospheric Sky & Lighting**: Procedural sky dome with soft sunlight, directional shadows, and atmospheric horizon fog.
- **Rolling Hills & Road**: Procedural elevation landscape with a curved asphalt road crossing the terrain.
- **Vegetation**: Low-poly procedural pine trees and shrub clusters scattered across the hills.
- **Tactical Cover**: Shipping containers, concrete roadblocks, and rock boulders with Rapier rigid body physics.

---

## 🚀 Running Locally

### 1. Single-Command Startup
Install dependencies and run both multiplayer server and client concurrently:

```bash
npm run install:all
npm run dev
```

This starts:
- **Multiplayer Backend**: `http://localhost:2567` (WebSocket on `ws://localhost:2567`)
- **Frontend Client**: `http://localhost:5173`

---

## 👥 Multiplayer Testing with Two Browsers / Mobile Devices

1. Start dev server (`npm run dev`).
2. **Browser 1 (Host)**:
   - Go to `http://localhost:5173/`.
   - Enter display name (e.g. `Viper`) and click **CREATE ROOM**.
   - Copy the 6-character room code (e.g. `AB7K9X`).
3. **Browser 2 (Guest / Mobile)**:
   - Open `http://localhost:5173/` on another window, incognito tab, or mobile device on the same local network (`http://<your-lan-ip>:5173`).
   - Click **JOIN ROOM**, enter a display name (e.g. `Shadow`), paste the code (`AB7K9X`), and click **JOIN ROOM**.
4. **Lobby & Match Start**:
   - Both players appear in the lobby roster in real-time.
   - Host clicks **START GAME MATCH** -> Both players enter the 3D world simultaneously.
5. **Real-Time Combat**:
   - Shoot at each other, see laser tracer beams, muzzle flashes, floating damage numbers, hitmarker sounds, elimination feed, and respawns!

---

## ☁️ Deploying Backend to Render

1. On [Render](https://dashboard.render.com/), create a new **Web Service** connected to this repository.
2. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Health Check Path**: `/health`
3. Environment Variables:
   - `PORT`: `10000` (Render handles this automatically)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `*`
4. On your frontend host (Vercel / Netlify / Render Static Site), set `VITE_SERVER_URL=https://your-server.onrender.com`.
