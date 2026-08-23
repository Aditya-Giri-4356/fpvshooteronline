# HYPERSHOT 3D - Multiplayer FPS

A high-performance, browser-based 3D multiplayer first-person shooter inspired by the fast, arcade-style gameplay feel of *Roblox Hypershot* combined with the scenic, atmospheric procedural visual feeling of *Slow Roads* and CC0 environmental building kits.

Built as a standalone web application using **React 19, TypeScript, Vite, Three.js, React Three Fiber, Rapier 3D Physics, Node.js, and Colyseus WebSockets**.

---

## 🗺️ 4 Playable Environment / Map Themes

Host can select the active map zone in the lobby, which dynamically updates lighting, skybox, heightmap terrain, obstacles, and the entire glassmorphic UI color scheme:

1. **Desert Outpost** *(Military Sandstone Stronghold)*:
   - Arid sandstone canyons, watchtowers with sniper perches, fortified sandbag bunkers, and warm golden dust haze.
   - UI Accent: Warm Amber & Gold (`#f59e0b`).
2. **Cyber Metropolis** *(Neo-Tokyo Urban Highway)*:
   - Overcast neon city skyline with multi-lane asphalt highway, illuminated skyscraper facades, holographic road barriers, and ambient purple-cyan lighting.
   - UI Accent: Neon Cyan & Magenta (`#06b6d4`).
3. **Scenic Valley** *(Alpine Mountain Highway — Slow Roads Style)*:
   - Rolling green alpine hills, lush pine forests, curved scenic road with guardrails, and mountain dawn skybox.
   - UI Accent: Emerald Green (`#10b981`).
4. **Industrial Docks** *(Cargo Port Container Yard)*:
   - Stormy shipping harbor with towering modular cargo containers (Blue, Red, Orange, Green), crane gantries, and fuel tanks.
   - UI Accent: Crimson Rose & Industrial Steel (`#f43f5e`).

---

## 👤 4 Operative Character Classes with 3D Preview

Players can customize their combat operative in the lobby with a live rotating 3D preview:

1. **Vanguard (Tactical Assault)**:
   - Balanced frontline combatant with cobalt-blue tactical helmet, reinforced shoulder armor, and high versatility.
2. **Phantom (Cyber Scout)**:
   - Lightweight stealth operative with aerodynamic carbon weave, ultra-agile strafing speed, and emerald-green optics.
3. **Juggernaut (Heavy Enforcer)**:
   - Imposing titanium exoskeleton with wide shoulder plating, heavy blast helmet, and glowing crimson forcefield shielding.
4. **Spectre (Cyber Infiltrator)**:
   - Futuristic cybernetic infiltrator with precision targeting sensors and amber holographic energy nodes.

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

## ⚡ Deployment & Hosting (Netlify + Render)

- **Frontend (3D Game Client)** ➔ Hosted on **Netlify** (Global CDN, 100% Free, SSL, never sleeps).
- **Backend (Multiplayer WebSocket Server)** ➔ Hosted on **Render** (Free WebSockets support with 24/7 self-ping keep-alive loop).
