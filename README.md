# HYPERSHOT 3D - Multiplayer FPS

A high-performance, browser-based 3D multiplayer first-person shooter inspired by the fast, arcade-style gameplay feel of *Roblox Hypershot* combined with the scenic, atmospheric procedural visual feeling of *Slow Roads*.

Built as a standalone web application using **React 19, TypeScript, Vite, Three.js, React Three Fiber, Rapier 3D Physics, Node.js, and Colyseus WebSockets**.

---

## ⚡ Deployment Architecture (Netlify + Render)

For maximum performance, zero cost, and instant loading:
1. **Frontend (3D Game Client)** ➔ Hosted on **Netlify** (Global CDN, 100% Free, SSL, never sleeps).
2. **Backend (Multiplayer WebSocket Server)** ➔ Hosted on **Render** (Free WebSockets support with `/health` checks).

---

## 🚀 How to Deploy Frontend to Netlify (1-Click Setup)

1. Go to [app.netlify.com](https://app.netlify.com/) and log in.
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize your repository: `Aditya-Giri-4356/fpvshooteronline`.
4. Netlify will automatically detect [`netlify.toml`](./netlify.toml) with the correct build settings:
   - **Build Command**: `npm --prefix shared install && npm --prefix shared run build && npm --prefix client install && npm --prefix client run build`
   - **Publish Directory**: `client/dist`
5. **Environment Variable**:
   - Go to **Site Configuration** -> **Environment Variables** -> **Add a variable**:
     - Key: `VITE_SERVER_URL`
     - Value: `https://<your-render-backend-name>.onrender.com` *(or `http://localhost:2567` for local testing)*
6. Click **Deploy Site** — Netlify builds and hosts your game at `https://<your-site-name>.netlify.app`!

---

## ☁️ How to Deploy Backend to Render (Free WebSocket Server)

1. On [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Web Service**.
2. Connect `Aditya-Giri-4356/fpvshooteronline`.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm --prefix shared install && npm --prefix shared run build && npm --prefix server install && npm --prefix server run build`
   - **Start Command**: `npm --prefix server run start`
   - **Health Check Path**: `/health`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `*`
5. Copy your Render server URL (e.g. `https://fps-multiplayer-server.onrender.com`) and paste it as `VITE_SERVER_URL` in Netlify.

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

## 🚀 Running Locally

```bash
npm run install:all
npm run dev
```

Starts:
- **Multiplayer Backend**: `http://localhost:2567`
- **Frontend Client**: `http://localhost:5173`
