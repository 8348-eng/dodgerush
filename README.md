# 🚀 Dodge Rush - Mobile-First 3D Web Runner

A high-octane, neon-arcade 3D endless runner game crafted specifically for mobile and Android browsers with zero dependencies, 60+ FPS hardware-accelerated rendering, procedural Web Audio soundtrack, and responsive dual touch & swipe controls.

![Dodge Rush Preview](https://img.shields.io/badge/Platform-Mobile%20Web%20%7C%20Android%20%7C%20Desktop-ff007f?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%7C%20Vanilla%20JS%20%7C%20CSS3-00f0ff?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API%20Synthesizer-a855f7?style=for-the-badge)

---

## 🎮 Features

- **Mobile-First Touch & Swipe Controls**:
  - Oversized thumb-friendly HUD buttons with instant touch-down reaction (`touchstart` & `pointerdown`).
  - Fluid swipe gestures for quick lane dodging and jump triggers.
  - Multi-touch support (jump while steering).
  - Desktop keyboard fallbacks (`A`/`D`, `Arrow Left`/`Right`, `Space`/`W`/`Up`).
- **3D Perspective Road & Dynamic Lighting**:
  - Pseudo-3D curved horizon with perspective projection and neon grid.
  - Speed lines, banking turns, shadow projection, and reactive camera shake.
- **Dynamic Obstacles & Power-Ups**:
  - Obstacles: Cyber barriers, spikes, overhead laser arches, rolling plasma spheres.
  - Power-Ups:
    - ⚡ **Turbo Boost**: High-speed burst with obstacle invulnerability.
    - 🛡️ **Plasma Shield**: Absorbs collision damage.
    - 🧲 **Coin Magnet**: Attracts nearby coins automatically.
    - 2️⃣ **2x Multiplier**: Doubles score and coin values.
- **Synthesizer & SFX Engine**:
  - 100% procedural Web Audio API audio — no external MP3/WAV assets to load!
  - 80s synthwave arpeggiator background music with custom drum beats.
  - Arcade-style sound effects for jumps, coins, power-ups, hits, and game over.
  - Haptic vibration feedback on Android devices.
- **Persistence & Polish**:
  - High score tracking and coin banking via `localStorage`.
  - Fullscreen toggle, mute toggle, pause modal, and game over stat breakdown.
  - Anti-scroll & anti-pinch gesture lock for a native app feel on mobile browsers.

---

## 🕹️ Controls

| Action | Mobile Touch Button | Mobile Swipe | Keyboard |
| :--- | :--- | :--- | :--- |
| **Move Left** | ◀ Left Button | Swipe Left | `A` or `←` |
| **Move Right** | Right Button ▶ | Swipe Right | `D` or `→` |
| **Jump** | ▲ Jump Button | Swipe Up | `Space` or `W` or `↑` |
| **Pause** | ⏸ Pause Icon | — | `Escape` or `P` |

---

## 🛠️ Tech Stack

- **HTML5 Canvas**: Pure 2D context rendering with custom 3D projection math.
- **Vanilla JavaScript (ES6+)**: Zero frameworks or bulky dependencies for instant mobile load times.
- **Modern CSS3**: Glassmorphism, animated glow effects, responsive landscape/portrait safe-area padding.
- **Web Audio API**: Real-time synthesizer nodes with low-latency polyphony.

---

## 🚀 Local Development

To run Dodge Rush locally:

```bash
# Clone the repository
git clone https://github.com/<username>/dodgerush.git

# Navigate to the folder
cd dodgerush

# Start any local HTTP server (e.g. Python or Node)
python -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in your desktop or mobile browser.
