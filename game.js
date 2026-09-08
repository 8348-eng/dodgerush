/**
 * DODGE RUSH - Game Engine
 * Mobile-First 3D Perspective Arcade Runner
 */

(() => {
  'use strict';

  // ==========================================
  // Global Configurations & Constants
  // ==========================================
  const LANES = [-1, 0, 1]; // Left (-1), Center (0), Right (1)
  const MAX_Z = 1000;       // Horizon depth
  const BASE_SPEED = 240;   // Base movement units per second
  const SPEED_SCALE = 16;   // Speed increase per level
  const GRAVITY = 32;       // Jump gravity
  const JUMP_FORCE = 11.5;  // Jump initial velocity

  const POWERUP_TYPES = {
    SHIELD: { id: 'shield', name: 'SHIELD', icon: '🛡️', color: '#00f0ff', duration: 0 }, // 1 hit protection
    MAGNET: { id: 'magnet', name: 'MAGNET', icon: '🧲', color: '#ffdf00', duration: 10 },
    BOOST: { id: 'boost', name: 'BOOST', icon: '⚡', color: '#ff0077', duration: 6 },
    MULTIPLIER: { id: 'multiplier', name: '2X COINS', icon: '✖️2', color: '#00ff88', duration: 12 }
  };

  // ==========================================
  // Game State
  // ==========================================
  const State = {
    screen: 'HOME', // HOME, PLAYING, PAUSED, GAMEOVER
    score: 0,
    coins: 0,
    runCoins: 0,
    level: 1,
    hearts: 3,
    highScore: parseInt(localStorage.getItem('dodgerush_highscore') || '0', 10),
    vibrationEnabled: localStorage.getItem('dodgerush_vibe') !== 'false',
    distanceTraveled: 0,
    shakeTime: 0,
    shakeIntensity: 0,
    lastFrameTime: performance.now(),
  };

  // Player
  const player = {
    lane: 0,           // -1, 0, 1
    targetLane: 0,
    laneX: 0,          // Current visual X position in world units
    jumpY: 0,          // Height above ground
    jumpVelocity: 0,
    isJumping: false,
    invincibleTime: 0, // i-frames after taking damage
    tilt: 0,           // Visual banking angle
    width: 32,
    height: 38,
    activePowerups: {}, // { [type]: remainingTime }
  };

  // Game Entities
  let obstacles = [];
  let coins = [];
  let powerups = [];
  let particles = [];
  let floatingTexts = [];

  // Spawning Timers
  let obstacleSpawnTimer = 1.0;
  let coinSpawnTimer = 0.5;
  let powerupSpawnTimer = 7.0;

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const homeScreen = document.getElementById('home-screen');
  const hudLayer = document.getElementById('hud-layer');
  const gameOverScreen = document.getElementById('game-over-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const instructionsModal = document.getElementById('instructions-modal');

  const hudScore = document.getElementById('hud-score');
  const hudCoins = document.getElementById('hud-coins');
  const hudLevel = document.getElementById('hud-level');
  const homeHighScore = document.getElementById('home-highscore');
  const heartsContainer = document.getElementById('hearts-container');
  const powerupsBar = document.getElementById('powerups-bar');
  const announcementBanner = document.getElementById('announcement-banner');

  const overScore = document.getElementById('over-score');
  const overBest = document.getElementById('over-best');
  const overCoins = document.getElementById('over-coins');
  const overLevel = document.getElementById('over-level');
  const overRecordBadge = document.getElementById('game-over-record');

  // Audio & Vibration controls
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const btnHomeMute = document.getElementById('btn-home-mute');
  const homeMuteIcon = document.getElementById('home-mute-icon');
  const homeMuteText = document.getElementById('home-mute-text');
  const btnHomeVibe = document.getElementById('btn-home-vibe');
  const homeVibeText = document.getElementById('home-vibe-text');

  // Canvas Geometry Helpers
  let width = window.innerWidth;
  let height = window.innerHeight;
  let horizonY = height * 0.38;
  let horizonX = width * 0.5;
  let roadBottomWidth = Math.min(width * 0.94, 460);
  let roadTopWidth = roadBottomWidth * 0.12;
  let roadLaneWidth = roadBottomWidth / 3;

  // ==========================================
  // Vibration Helper
  // ==========================================
  function triggerVibrate(pattern) {
    if (State.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Safe fail
      }
    }
  }

  // ==========================================
  // Responsive Canvas Resizer
  // ==========================================
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dynamic horizon and road sizing
    const isLandscape = width > height;
    horizonY = isLandscape ? height * 0.34 : height * 0.38;
    horizonX = width * 0.5;

    roadBottomWidth = isLandscape ? Math.min(width * 0.65, 520) : Math.min(width * 0.94, 420);
    roadTopWidth = roadBottomWidth * 0.14;
    roadLaneWidth = roadBottomWidth / 3.1;
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 150);
  });
  resizeCanvas();

  // ==========================================
  // Perspective Projection Engine
  // ==========================================
  function project(worldX, worldY, worldZ) {
    // Linear perspective scale where Z=0 is closest, Z=MAX_Z is horizon
    const depthFactor = Math.max(0.001, (MAX_Z - worldZ) / MAX_Z);
    const perspectiveScale = Math.pow(depthFactor, 1.8);

    const groundY = height - 130; // Road foot Y
    const screenY = horizonY + (groundY - horizonY) * perspectiveScale - (worldY * perspectiveScale * 1.5);
    const screenX = horizonX + (worldX * perspectiveScale);

    return {
      x: screenX,
      y: screenY,
      scale: perspectiveScale,
      depth: worldZ
    };
  }

  // ==========================================
  // Power-Up Helpers
  // ==========================================
  function activatePowerup(typeKey) {
    const pInfo = POWERUP_TYPES[typeKey];
    if (!pInfo) return;

    if (typeKey === 'SHIELD') {
      player.activePowerups.SHIELD = true;
    } else {
      player.activePowerups[typeKey] = pInfo.duration;
    }

    window.soundEngine?.playPowerup();
    triggerVibrate([40, 40, 60]);
    showAnnouncement(pInfo.name + ' ACTIVATED!');
    updatePowerupUI();
  }

  function hasPowerup(typeKey) {
    if (typeKey === 'SHIELD') return !!player.activePowerups.SHIELD;
    return (player.activePowerups[typeKey] || 0) > 0;
  }

  function updatePowerupUI() {
    powerupsBar.innerHTML = '';
    Object.keys(player.activePowerups).forEach(key => {
      const pInfo = POWERUP_TYPES[key];
      if (!pInfo) return;

      const ind = document.createElement('div');
      ind.className = `powerup-indicator ${pInfo.id}`;

      if (key === 'SHIELD') {
        ind.innerHTML = `
          <span class="icon-wrap">${pInfo.icon}</span>
          <span>SHIELD ACTIVE</span>
        `;
      } else {
        const remaining = player.activePowerups[key];
        const pct = Math.max(0, Math.min(100, (remaining / pInfo.duration) * 100));
        ind.innerHTML = `
          <span class="icon-wrap">${pInfo.icon}</span>
          <div class="timer-track"><div class="timer-fill" style="width:${pct}%;background:${pInfo.color}"></div></div>
        `;
      }
      powerupsBar.appendChild(ind);
    });
  }

  // ==========================================
  // Mid-Screen Announcement Banner
  // ==========================================
  let bannerTimeout = null;
  function showAnnouncement(text, color = null) {
    if (bannerTimeout) clearTimeout(bannerTimeout);
    announcementBanner.textContent = text;
    announcementBanner.style.color = color || '#fff';
    announcementBanner.classList.add('show');
    bannerTimeout = setTimeout(() => {
      announcementBanner.classList.remove('show');
    }, 1500);
  }

  // ==========================================
  // Player Actions
  // ==========================================
  function moveLeft() {
    if (State.screen !== 'PLAYING') return;
    if (player.targetLane > -1) {
      player.targetLane--;
      player.tilt = -0.32;
      window.soundEngine?.playLaneSwitch();
      triggerVibrate(20);
    }
  }

  function moveRight() {
    if (State.screen !== 'PLAYING') return;
    if (player.targetLane < 1) {
      player.targetLane++;
      player.tilt = 0.32;
      window.soundEngine?.playLaneSwitch();
      triggerVibrate(20);
    }
  }

  function jump() {
    if (State.screen !== 'PLAYING') return;
    if (!player.isJumping) {
      player.isJumping = true;
      player.jumpVelocity = JUMP_FORCE;
      window.soundEngine?.playJump();
      triggerVibrate(30);

      // Jump dust/sparks particles
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: player.laneX + (Math.random() - 0.5) * 20,
          y: 2,
          z: 20 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 40,
          vy: Math.random() * 25,
          vz: -20,
          color: '#00f0ff',
          size: Math.random() * 3 + 2,
          life: 0.35,
          maxLife: 0.35
        });
      }
    }
  }

  // ==========================================
  // Damage & Health Handling
  // ==========================================
  function takeDamage() {
    if (player.invincibleTime > 0) return;

    if (hasPowerup('BOOST')) {
      // Boosting ignores damage and smashes obstacle
      return;
    }

    if (hasPowerup('SHIELD')) {
      // Shield absorbs hit
      delete player.activePowerups.SHIELD;
      player.invincibleTime = 1.0;
      State.shakeTime = 0.25;
      State.shakeIntensity = 9;
      window.soundEngine?.playShieldBreak();
      triggerVibrate([60, 40, 60]);
      updatePowerupUI();
      showAnnouncement('SHIELD BROKE!', '#00f0ff');
      return;
    }

    // Normal damage
    State.hearts--;
    player.invincibleTime = 1.6;
    State.shakeTime = 0.4;
    State.shakeIntensity = 15;
    window.soundEngine?.playHit();
    triggerVibrate([100, 60, 120]);

    updateHeartsUI(true);

    if (State.hearts <= 0) {
      gameOver();
    }
  }

  function updateHeartsUI(animate = false) {
    const hearts = [
      document.getElementById('heart-1'),
      document.getElementById('heart-2'),
      document.getElementById('heart-3')
    ];

    hearts.forEach((h, idx) => {
      if (idx >= State.hearts) {
        if (!h.classList.contains('lost') && animate) {
          h.classList.add('shake');
          setTimeout(() => h.classList.remove('shake'), 400);
        }
        h.classList.add('lost');
      } else {
        h.classList.remove('lost');
      }
    });
  }

  // ==========================================
  // Particle System
  // ==========================================
  function createExplosion(worldX, worldY, worldZ, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 90 + 30;
      particles.push({
        x: worldX,
        y: worldY,
        z: worldZ,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 30,
        vz: (Math.random() - 0.5) * 80,
        color: color,
        size: Math.random() * 4 + 2.5,
        life: 0.55,
        maxLife: 0.55
      });
    }
  }

  function addFloatingText(text, worldX, worldY, worldZ, color = '#ffdf00') {
    floatingTexts.push({
      text,
      x: worldX,
      y: worldY,
      z: worldZ,
      color,
      life: 0.8,
      maxLife: 0.8
    });
  }

  // ==========================================
  // Spawner Logic
  // ==========================================
  function spawnObstacle() {
    const isDrone = Math.random() < 0.35 + Math.min(0.25, State.level * 0.04);
    const lane = LANES[Math.floor(Math.random() * LANES.length)];

    obstacles.push({
      lane: lane,
      worldX: lane * roadLaneWidth,
      worldZ: MAX_Z,
      type: isDrone ? 'DRONE' : 'BARRIER',
      height: isDrone ? 75 : 32,
      width: roadLaneWidth * 0.72,
      jumpable: !isDrone, // Barriers can be jumped over, Drones cannot!
      color: isDrone ? '#ff2a55' : '#ff9900',
      passed: false
    });

    // Chance of double obstacle at higher levels (Level 3+)
    if (State.level >= 3 && Math.random() < 0.28) {
      const otherLanes = LANES.filter(l => l !== lane);
      const secondLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      obstacles.push({
        lane: secondLane,
        worldX: secondLane * roadLaneWidth,
        worldZ: MAX_Z,
        type: 'BARRIER',
        height: 32,
        width: roadLaneWidth * 0.72,
        jumpable: true,
        color: '#ff9900',
        passed: false
      });
    }
  }

  function spawnCoins() {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const pattern = Math.random();

    if (pattern < 0.4) {
      // 3 coins in a row
      for (let i = 0; i < 3; i++) {
        coins.push({
          lane: lane,
          worldX: lane * roadLaneWidth,
          worldY: 12,
          worldZ: MAX_Z + i * 50,
          rotation: Math.random() * Math.PI,
          collected: false
        });
      }
    } else if (pattern < 0.75) {
      // Arching jump coin cluster
      const heights = [10, 36, 10];
      for (let i = 0; i < 3; i++) {
        coins.push({
          lane: lane,
          worldX: lane * roadLaneWidth,
          worldY: heights[i],
          worldZ: MAX_Z + i * 45,
          rotation: Math.random() * Math.PI,
          collected: false
        });
      }
    } else {
      // Single coin
      coins.push({
        lane: lane,
        worldX: lane * roadLaneWidth,
        worldY: 12,
        worldZ: MAX_Z,
        rotation: 0,
        collected: false
      });
    }
  }

  function spawnPowerup() {
    const keys = ['SHIELD', 'MAGNET', 'BOOST', 'MULTIPLIER'];
    const selectedKey = keys[Math.floor(Math.random() * keys.length)];
    const lane = LANES[Math.floor(Math.random() * LANES.length)];

    powerups.push({
      type: selectedKey,
      lane: lane,
      worldX: lane * roadLaneWidth,
      worldY: 18,
      worldZ: MAX_Z,
      rotation: 0,
      info: POWERUP_TYPES[selectedKey],
      collected: false
    });
  }

  // ==========================================
  // Game Lifecycle: Start, Pause, Over
  // ==========================================
  function startGame() {
    window.soundEngine?.ensureContext();
    window.soundEngine?.startMusic();

    State.screen = 'PLAYING';
    State.score = 0;
    State.coins = 0;
    State.runCoins = 0;
    State.level = 1;
    State.hearts = 3;
    State.distanceTraveled = 0;
    State.shakeTime = 0;

    player.lane = 0;
    player.targetLane = 0;
    player.laneX = 0;
    player.jumpY = 0;
    player.jumpVelocity = 0;
    player.isJumping = false;
    player.invincibleTime = 0;
    player.tilt = 0;
    player.activePowerups = {};

    obstacles = [];
    coins = [];
    powerups = [];
    particles = [];
    floatingTexts = [];

    obstacleSpawnTimer = 1.2;
    coinSpawnTimer = 0.6;
    powerupSpawnTimer = 9.0;

    // UI transitions
    homeScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    instructionsModal.classList.remove('active');
    hudLayer.classList.add('active');

    hudScore.textContent = '0';
    hudCoins.textContent = '0';
    hudLevel.textContent = '1';
    updateHeartsUI();
    updatePowerupUI();

    triggerVibrate([40, 30, 40]);
  }

  function pauseGame() {
    if (State.screen !== 'PLAYING') return;
    State.screen = 'PAUSED';
    pauseScreen.classList.add('active');
    window.soundEngine?.stopMusic();
    triggerVibrate(20);
  }

  function resumeGame() {
    if (State.screen !== 'PAUSED') return;
    State.screen = 'PLAYING';
    pauseScreen.classList.remove('active');
    window.soundEngine?.startMusic();
    triggerVibrate(20);
  }

  function gameOver() {
    State.screen = 'GAMEOVER';
    window.soundEngine?.stopMusic();
    window.soundEngine?.playGameOver();
    triggerVibrate([150, 80, 200]);

    // Check high score
    const isNewHigh = State.score > State.highScore;
    if (isNewHigh) {
      State.highScore = State.score;
      localStorage.setItem('dodgerush_highscore', State.highScore.toString());
      overRecordBadge.classList.add('visible');
    } else {
      overRecordBadge.classList.remove('visible');
    }

    // Accumulate total lifetime coins
    const lifetimeCoins = parseInt(localStorage.getItem('dodgerush_coins') || '0', 10) + State.runCoins;
    localStorage.setItem('dodgerush_coins', lifetimeCoins.toString());

    // Update Game Over UI
    overScore.textContent = State.score.toString();
    overBest.textContent = State.highScore.toString();
    overCoins.textContent = State.runCoins.toString();
    overLevel.textContent = State.level.toString();

    hudLayer.classList.remove('active');
    gameOverScreen.classList.add('active');
  }

  function showHome() {
    State.screen = 'HOME';
    window.soundEngine?.stopMusic();

    pauseScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    hudLayer.classList.remove('active');
    instructionsModal.classList.remove('active');
    homeScreen.classList.add('active');

    homeHighScore.textContent = State.highScore.toString();
    triggerVibrate(20);
  }

  // ==========================================
  // Main Update Loop
  // ==========================================
  function update(dt) {
    // Camera Shake decay
    if (State.shakeTime > 0) {
      State.shakeTime -= dt;
    }

    if (State.screen !== 'PLAYING') return;

    // Current Track Speed (accelerates with level & boost)
    const isBoosting = hasPowerup('BOOST');
    const speedMultiplier = isBoosting ? 1.9 : 1.0;
    const currentSpeed = (BASE_SPEED + (State.level - 1) * SPEED_SCALE) * speedMultiplier;

    // Progress score based on distance
    State.distanceTraveled += currentSpeed * dt;
    const scoreAdd = Math.floor(currentSpeed * dt * 0.08);
    State.score += scoreAdd;
    hudScore.textContent = State.score.toString();

    // Check level progression (Level up every 450 points)
    const nextLevel = Math.floor(State.score / 450) + 1;
    if (nextLevel > State.level) {
      State.level = nextLevel;
      hudLevel.textContent = State.level.toString();
      window.soundEngine?.playLevelUp();
      showAnnouncement(`LEVEL ${State.level}!`, '#00f0ff');
      triggerVibrate([60, 40, 80]);
    }

    // Power-up timers decay
    let powerupChanged = false;
    Object.keys(player.activePowerups).forEach(key => {
      if (key !== 'SHIELD') {
        player.activePowerups[key] -= dt;
        if (player.activePowerups[key] <= 0) {
          delete player.activePowerups[key];
          powerupChanged = true;
        }
      }
    });
    if (powerupChanged) {
      updatePowerupUI();
    }

    // Player Invulnerability i-frame decay
    if (player.invincibleTime > 0) {
      player.invincibleTime -= dt;
    }

    // Player Lateral Smooth Interpolation (Lane switching)
    const targetX = player.targetLane * roadLaneWidth;
    player.laneX += (targetX - player.laneX) * Math.min(1, dt * 14);
    player.tilt *= Math.max(0, 1 - dt * 10);

    // Player Jump Physics
    if (player.isJumping) {
      player.jumpY += player.jumpVelocity * dt * 35;
      player.jumpVelocity -= GRAVITY * dt * 35;
      if (player.jumpY <= 0) {
        player.jumpY = 0;
        player.jumpVelocity = 0;
        player.isJumping = false;
      }
    }

    // Spawning Updates
    const spawnRateFactor = Math.min(1.7, 1 + (State.level - 1) * 0.08);
    obstacleSpawnTimer -= dt * spawnRateFactor;
    if (obstacleSpawnTimer <= 0) {
      spawnObstacle();
      obstacleSpawnTimer = Math.max(0.75, (Math.random() * 0.8 + 0.85) / spawnRateFactor);
    }

    coinSpawnTimer -= dt;
    if (coinSpawnTimer <= 0) {
      spawnCoins();
      coinSpawnTimer = Math.random() * 0.6 + 0.6;
    }

    powerupSpawnTimer -= dt;
    if (powerupSpawnTimer <= 0) {
      spawnPowerup();
      powerupSpawnTimer = Math.random() * 8.0 + 8.0;
    }

    // Thruster engine particles behind player
    particles.push({
      x: player.laneX + (Math.random() - 0.5) * 12,
      y: player.jumpY + 6,
      z: 5,
      vx: (Math.random() - 0.5) * 15,
      vy: Math.random() * -10,
      vz: -80,
      color: isBoosting ? '#ff0077' : (Math.random() > 0.5 ? '#00f0ff' : '#00a2ff'),
      size: Math.random() * 3 + 2,
      life: 0.22,
      maxLife: 0.22
    });

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.worldZ -= currentSpeed * dt;

      // Player Collision Check (When near player plane Z ~ 15 to 40)
      if (!obs.passed && obs.worldZ <= 45 && obs.worldZ >= 5) {
        const lateralDist = Math.abs(player.laneX - obs.worldX);
        const hitWidth = obs.width * 0.72;

        if (lateralDist < hitWidth) {
          if (isBoosting) {
            // Smash through obstacle!
            obs.passed = true;
            createExplosion(obs.worldX, obs.height * 0.5, obs.worldZ, obs.color, 24);
            addFloatingText('+50 SMASH', obs.worldX, obs.height + 15, obs.worldZ, '#ff0077');
            State.score += 50;
            window.soundEngine?.playHit();
            triggerVibrate(30);
          } else if (obs.jumpable && player.jumpY > obs.height * 0.75) {
            // Successfully jumped over low barrier!
            if (!obs.jumpBonusAwarded) {
              obs.jumpBonusAwarded = true;
              addFloatingText('+15 JUMP', obs.worldX, obs.height + 25, obs.worldZ, '#00ff88');
              State.score += 15;
            }
          } else {
            // Collision hit!
            obs.passed = true;
            createExplosion(obs.worldX, obs.height * 0.5, obs.worldZ, obs.color, 16);
            takeDamage();
          }
        }
      }

      // Mark passed
      if (obs.worldZ < -20) {
        obstacles.splice(i, 1);
      }
    }

    // Update Coins
    const isMagnetActive = hasPowerup('MAGNET');
    const isMultiplierActive = hasPowerup('MULTIPLIER');

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.worldZ -= currentSpeed * dt;
      c.rotation += dt * 5;

      // Magnet attraction
      if (isMagnetActive && c.worldZ < 450 && c.worldZ > 0) {
        const dx = player.laneX - c.worldX;
        const dy = player.jumpY - c.worldY;
        c.worldX += dx * dt * 9;
        c.worldY += dy * dt * 9;
      }

      // Pickup Check
      if (!c.collected && c.worldZ <= 45 && c.worldZ >= 0) {
        const dx = Math.abs(player.laneX - c.worldX);
        const dy = Math.abs(player.jumpY - c.worldY);

        if (dx < 32 && dy < 32) {
          c.collected = true;
          const coinValue = isMultiplierActive ? 2 : 1;
          State.coins += coinValue;
          State.runCoins += coinValue;
          State.score += 25 * coinValue;

          hudCoins.textContent = State.coins.toString();
          hudScore.textContent = State.score.toString();

          window.soundEngine?.playCoin();
          triggerVibrate(15);

          createExplosion(c.worldX, c.worldY, c.worldZ, '#ffdf00', 8);
          addFloatingText(isMultiplierActive ? '+2 🪙' : '+1 🪙', c.worldX, c.worldY + 15, c.worldZ, '#ffdf00');

          coins.splice(i, 1);
          continue;
        }
      }

      if (c.worldZ < -20) {
        coins.splice(i, 1);
      }
    }

    // Update Power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.worldZ -= currentSpeed * dt;
      p.rotation += dt * 3.5;

      // Pickup Check
      if (!p.collected && p.worldZ <= 45 && p.worldZ >= 0) {
        const dx = Math.abs(player.laneX - p.worldX);
        const dy = Math.abs(player.jumpY - p.worldY);

        if (dx < 34 && dy < 34) {
          p.collected = true;
          activatePowerup(p.type);
          createExplosion(p.worldX, p.worldY, p.worldZ, p.info.color, 20);
          addFloatingText(p.info.name, p.worldX, p.worldY + 20, p.worldZ, p.info.color);
          powerups.splice(i, 1);
          continue;
        }
      }

      if (p.worldZ < -20) {
        powerups.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.z += pt.vz * dt;
      pt.life -= dt;
      if (pt.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update Floating Text Floaters
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += dt * 30;
      ft.life -= dt;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  // ==========================================
  // Render Engine
  // ==========================================
  function render() {
    ctx.save();

    // Camera Shake offset
    if (State.shakeTime > 0) {
      const shakeMag = State.shakeIntensity * (State.shakeTime / 0.4);
      const shakeX = (Math.random() - 0.5) * shakeMag;
      const shakeY = (Math.random() - 0.5) * shakeMag;
      ctx.translate(shakeX, shakeY);
    }

    // Background Gradient (Deep cyber space)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#04060e');
    bgGrad.addColorStop(horizonY / height, '#0d1326');
    bgGrad.addColorStop(1, '#070913');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant Horizon Glow & Neon Sun/Grid
    drawHorizonDecorations();

    // The 3-Lane Perspective Highway
    drawTrack();

    // Combine and Sort all 3D world entities by Z depth (Furthest first -> Painter's algorithm)
    const renderList = [];

    // Obstacles
    obstacles.forEach(obs => {
      renderList.push({ type: 'OBSTACLE', z: obs.worldZ, obj: obs });
    });

    // Coins
    coins.forEach(c => {
      renderList.push({ type: 'COIN', z: c.worldZ, obj: c });
    });

    // Power-ups
    powerups.forEach(p => {
      renderList.push({ type: 'POWERUP', z: p.worldZ, obj: p });
    });

    // Particles
    particles.forEach(pt => {
      renderList.push({ type: 'PARTICLE', z: pt.z, obj: pt });
    });

    // Player (Always near front at Z=20)
    renderList.push({ type: 'PLAYER', z: 20, obj: player });

    // Sort descending by Z
    renderList.sort((a, b) => b.z - a.z);

    // Draw all sorted items
    renderList.forEach(item => {
      switch (item.type) {
        case 'OBSTACLE': drawObstacle(item.obj); break;
        case 'COIN': drawCoin(item.obj); break;
        case 'POWERUP': drawPowerupEntity(item.obj); break;
        case 'PARTICLE': drawParticle(item.obj); break;
        case 'PLAYER': drawPlayer(item.obj); break;
      }
    });

    // Draw floating score text labels
    drawFloatingTexts();

    // Speed Lines overlay when boosting
    if (hasPowerup('BOOST')) {
      drawWarpLines();
    }

    ctx.restore();
  }

  // Draw Horizon elements
  function drawHorizonDecorations() {
    // Horizon neon sun arc
    ctx.save();
    const sunGrad = ctx.createRadialGradient(horizonX, horizonY, 2, horizonX, horizonY, 110);
    sunGrad.addColorStop(0, 'rgba(255, 0, 119, 0.45)');
    sunGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(horizonX, horizonY, 110, Math.PI, 0);
    ctx.fill();

    // Horizon line glow
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();
    ctx.restore();
  }

  // Draw the 3D Perspective Track
  function drawTrack() {
    const pFarLeft = project(-roadLaneWidth * 1.5, 0, MAX_Z);
    const pFarRight = project(roadLaneWidth * 1.5, 0, MAX_Z);
    const pNearLeft = project(-roadLaneWidth * 1.5, 0, 0);
    const pNearRight = project(roadLaneWidth * 1.5, 0, 0);

    // Main Road Surface
    ctx.save();
    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, pNearLeft.y);
    roadGrad.addColorStop(0, '#0c1022');
    roadGrad.addColorStop(1, '#0e152e');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(pFarLeft.x, pFarLeft.y);
    ctx.lineTo(pFarRight.x, pFarRight.y);
    ctx.lineTo(pNearRight.x, pNearRight.y);
    ctx.lineTo(pNearLeft.x, pNearLeft.y);
    ctx.closePath();
    ctx.fill();

    // Glowing Neon Side Rails
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    // Left Rail
    ctx.beginPath();
    ctx.moveTo(pFarLeft.x, pFarLeft.y);
    ctx.lineTo(pNearLeft.x, pNearLeft.y);
    ctx.stroke();

    // Right Rail
    ctx.beginPath();
    ctx.moveTo(pFarRight.x, pFarRight.y);
    ctx.lineTo(pNearRight.x, pNearRight.y);
    ctx.stroke();
    ctx.restore();

    // Lane Dividers (Dashed lines between lanes -0.5 and +0.5)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;

    [-0.5, 0.5].forEach(laneBorder => {
      const farP = project(laneBorder * roadLaneWidth, 0, MAX_Z);
      const nearP = project(laneBorder * roadLaneWidth, 0, 0);

      // Dash offset animated with track progress
      const dashOffset = (State.distanceTraveled * 0.8) % 40;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -dashOffset;

      ctx.beginPath();
      ctx.moveTo(farP.x, farP.y);
      ctx.lineTo(nearP.x, nearP.y);
      ctx.stroke();
    });
    ctx.restore();

    // Moving horizontal grid lines (creates sense of high speed)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 119, 0.25)';
    ctx.lineWidth = 1.5;

    const segmentCount = 14;
    const offset = (State.distanceTraveled * 0.9) % (MAX_Z / segmentCount);

    for (let i = 0; i < segmentCount; i++) {
      const z = (i * (MAX_Z / segmentCount) + offset) % MAX_Z;
      if (z > 20 && z < MAX_Z - 30) {
        const leftP = project(-roadLaneWidth * 1.5, 0, z);
        const rightP = project(roadLaneWidth * 1.5, 0, z);
        ctx.beginPath();
        ctx.moveTo(leftP.x, leftP.y);
        ctx.lineTo(rightP.x, rightP.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Draw Player Character (Futuristic Cyber Craft / Hover Racer)
  function drawPlayer(p) {
    // Blinking effect during invulnerability i-frames
    if (p.invincibleTime > 0 && Math.floor(performance.now() / 80) % 2 === 0) {
      return;
    }

    const pos = project(p.laneX, p.jumpY, 20);
    const groundPos = project(p.laneX, 0, 20);
    const scale = pos.scale;

    ctx.save();

    // 1. Shadow on Ground (scales realistically with jump height)
    const shadowScale = Math.max(0.4, 1 - (p.jumpY / 70));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(groundPos.x, groundPos.y, 22 * scale * shadowScale, 9 * scale * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Player Body with Tilt Angle
    ctx.translate(pos.x, pos.y);
    ctx.rotate(p.tilt);

    const pw = p.width * scale * 1.35;
    const ph = p.height * scale * 1.35;

    // Boost Aura
    if (hasPowerup('BOOST')) {
      ctx.shadowColor = '#ff0077';
      ctx.shadowBlur = 20;
    }

    // Main Chassis Gradient
    const shipGrad = ctx.createLinearGradient(0, -ph, 0, 0);
    shipGrad.addColorStop(0, '#00f0ff');
    shipGrad.addColorStop(0.6, '#0f1f3d');
    shipGrad.addColorStop(1, '#050a16');

    // Aerodynamic Cyber Hovercraft Shape
    ctx.fillStyle = shipGrad;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2 * scale;

    ctx.beginPath();
    ctx.moveTo(0, -ph * 0.95);             // Nose cone
    ctx.lineTo(pw * 0.52, -ph * 0.2);       // Right wing front
    ctx.lineTo(pw * 0.58, ph * 0.4);        // Right wingtip
    ctx.lineTo(pw * 0.28, ph * 0.3);        // Right thruster inlet
    ctx.lineTo(pw * 0.15, ph * 0.45);       // Right exhaust
    ctx.lineTo(-pw * 0.15, ph * 0.45);      // Left exhaust
    ctx.lineTo(-pw * 0.28, ph * 0.3);       // Left thruster inlet
    ctx.lineTo(-pw * 0.58, ph * 0.4);       // Left wingtip
    ctx.lineTo(-pw * 0.52, -ph * 0.2);      // Left wing front
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cockpit Canopy
    ctx.fillStyle = '#ff0077';
    ctx.shadowColor = '#ff0077';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -ph * 0.35, pw * 0.18, ph * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twin Jet Thruster Flames
    const flameH = (Math.random() * 8 + 12) * scale;
    const flameGrad = ctx.createLinearGradient(0, ph * 0.45, 0, ph * 0.45 + flameH);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.4, '#00f0ff');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;

    [-pw * 0.16, pw * 0.16].forEach(exX => {
      ctx.beginPath();
      ctx.moveTo(exX - pw * 0.08, ph * 0.45);
      ctx.lineTo(exX + pw * 0.08, ph * 0.45);
      ctx.lineTo(exX, ph * 0.45 + flameH);
      ctx.closePath();
      ctx.fill();
    });

    // 3. Shield Bubble Aura (if Shield is active)
    if (hasPowerup('SHIELD')) {
      const shieldR = pw * 0.85;
      const pulse = Math.sin(performance.now() * 0.008) * 3;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, -ph * 0.25, shieldR + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Obstacles (3D Perspective Blocks / Drones)
  function drawObstacle(obs) {
    const pos = project(obs.worldX, 0, obs.worldZ);
    if (pos.scale <= 0) return;

    const scale = pos.scale;
    const ow = obs.width * scale;
    const oh = obs.height * scale * 1.5;

    ctx.save();

    if (obs.type === 'BARRIER') {
      // Low Hazard Road Barrier with Neon Stripes
      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, ow * 0.55, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Barrier Face
      ctx.fillStyle = '#1b1c2b';
      ctx.strokeStyle = obs.color;
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.roundRect(pos.x - ow * 0.5, pos.y - oh, ow, oh, 4 * scale);
      ctx.fill();
      ctx.stroke();

      // Caution stripes
      ctx.fillStyle = obs.color;
      const stripeW = ow * 0.2;
      ctx.beginPath();
      ctx.rect(pos.x - ow * 0.35, pos.y - oh + 4 * scale, stripeW, oh - 8 * scale);
      ctx.rect(pos.x + ow * 0.15, pos.y - oh + 4 * scale, stripeW, oh - 8 * scale);
      ctx.fill();

      // Top Hazard Light
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - oh, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // TALL DRONE / EMP Gate (Hovering tall hazard)
      const hoverY = pos.y - 18 * scale;

      // Ground laser scanner shadow
      ctx.fillStyle = 'rgba(255, 42, 85, 0.25)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, ow * 0.6, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Drone Body
      ctx.fillStyle = '#1c0f1d';
      ctx.strokeStyle = '#ff2a55';
      ctx.lineWidth = 2.5 * scale;
      ctx.shadowColor = '#ff2a55';
      ctx.shadowBlur = 12;

      // Drone core
      ctx.beginPath();
      ctx.roundRect(pos.x - ow * 0.45, hoverY - oh, ow * 0.9, oh, 8 * scale);
      ctx.fill();
      ctx.stroke();

      // Glowing EMP Red Eye
      const eyePulse = Math.sin(performance.now() * 0.01) * 2;
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(pos.x, hoverY - oh * 0.5, (8 + eyePulse) * scale, 0, Math.PI * 2);
      ctx.fill();

      // Laser warning beam down to road
      ctx.strokeStyle = 'rgba(255, 42, 85, 0.45)';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(pos.x, hoverY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Spinning 3D Coin
  function drawCoin(c) {
    const pos = project(c.worldX, c.worldY, c.worldZ);
    if (pos.scale <= 0) return;

    const scale = pos.scale;
    const r = 14 * scale;
    const spinWidth = Math.cos(c.rotation) * r;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Coin Glow
    ctx.shadowColor = '#ffdf00';
    ctx.shadowBlur = 10;

    // Coin Face
    ctx.fillStyle = '#ffdf00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * scale;

    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(1.5, Math.abs(spinWidth)), r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner rim
    ctx.strokeStyle = '#e6b800';
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(1, Math.abs(spinWidth) * 0.65), r * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Power-up Capsule
  function drawPowerupEntity(p) {
    const pos = project(p.worldX, p.worldY, p.worldZ);
    if (pos.scale <= 0) return;

    const scale = pos.scale;
    const r = 16 * scale;
    const bob = Math.sin(performance.now() * 0.006 + p.worldX) * 4 * scale;

    ctx.save();
    ctx.translate(pos.x, pos.y + bob);

    // Glowing Orb
    ctx.fillStyle = p.info.color;
    ctx.shadowColor = p.info.color;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Particle
  function drawParticle(pt) {
    const pos = project(pt.x, pt.y, pt.z);
    if (pos.scale <= 0) return;

    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pt.size * pos.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Floating Score Floaters
  function drawFloatingTexts() {
    floatingTexts.forEach(ft => {
      const pos = project(ft.x, ft.y, ft.z);
      if (pos.scale <= 0) return;

      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${Math.floor(14 * pos.scale + 12)}px 'Orbitron', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, pos.x, pos.y);
      ctx.restore();
    });
  }

  // Draw Hyper-Speed Warp Lines during Boost
  function drawWarpLines() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < 12; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = Math.random() * height;
      const len = Math.random() * 80 + 50;

      ctx.beginPath();
      ctx.moveTo(horizonX + x * 0.1, horizonY + (y - horizonY) * 0.1);
      ctx.lineTo(horizonX + x, horizonY + (y - horizonY));
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // Game Loop
  // ==========================================
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - State.lastFrameTime) / 1000, 0.1);
    State.lastFrameTime = timestamp;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // ==========================================
  // Ergonomic Touch & Swipe Event Setup
  // ==========================================
  function setupInputHandlers() {
    // Touch Buttons
    const ctrlLeft = document.getElementById('ctrl-left');
    const ctrlJump = document.getElementById('ctrl-jump');
    const ctrlRight = document.getElementById('ctrl-right');

    const bindButton = (btn, action) => {
      const trigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('active-touch');
        action();
      };

      const release = (e) => {
        btn.classList.remove('active-touch');
      };

      btn.addEventListener('pointerdown', trigger, { passive: false });
      btn.addEventListener('pointerup', release, { passive: true });
      btn.addEventListener('pointercancel', release, { passive: true });
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    };

    bindButton(ctrlLeft, moveLeft);
    bindButton(ctrlJump, jump);
    bindButton(ctrlRight, moveRight);

    // Full-Screen Swipe Detection (Alternative / Complementary controls)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e) => {
      // Don't intercept button clicks inside controls dock or HUD buttons
      if (e.target.closest('#controls-dock') || e.target.closest('.hud-btn') || e.target.closest('button')) {
        return;
      }
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
    };

    const onTouchEnd = (e) => {
      if (e.target.closest('#controls-dock') || e.target.closest('.hud-btn') || e.target.closest('button')) {
        return;
      }
      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const dt = performance.now() - touchStartTime;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const minSwipe = 35; // Minimum distance for swipe in pixels

      if (dt < 450) {
        if (absDx > minSwipe && absDx > absDy) {
          // Horizontal Swipe
          if (dx < 0) {
            moveLeft();
          } else {
            moveRight();
          }
        } else if (absDy > minSwipe && dy < 0) {
          // Swipe Up -> Jump!
          jump();
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Desktop Keyboard fallback for testing/dev (Left/Right/A/D, Up/W/Space)
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          jump();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          if (State.screen === 'PLAYING') pauseGame();
          else if (State.screen === 'PAUSED') resumeGame();
          break;
      }
    });

    // Prevent default scroll on touchmove
    window.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  // ==========================================
  // UI & Menu Button Listeners
  // ==========================================
  function setupUIListeners() {
    // Start Game
    document.getElementById('btn-start-game').addEventListener('click', startGame);
    document.getElementById('btn-play-again').addEventListener('click', startGame);

    // How to play modal
    document.getElementById('btn-instructions').addEventListener('click', () => {
      instructionsModal.classList.add('active');
      window.soundEngine?.playTap();
    });
    document.getElementById('btn-close-instructions').addEventListener('click', () => {
      instructionsModal.classList.remove('active');
      window.soundEngine?.playTap();
    });

    // Home / Menu
    document.getElementById('btn-over-home').addEventListener('click', showHome);
    document.getElementById('btn-pause-home').addEventListener('click', showHome);

    // Pause / Resume
    document.getElementById('btn-pause').addEventListener('click', pauseGame);
    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-pause-restart').addEventListener('click', startGame);

    // Sound toggle buttons
    const updateSoundIcons = (muted) => {
      soundIconOn.style.display = muted ? 'none' : 'block';
      soundIconOff.style.display = muted ? 'block' : 'none';
      homeMuteIcon.textContent = muted ? '🔇' : '🔊';
      homeMuteText.textContent = muted ? 'Sound OFF' : 'Sound ON';
    };

    btnSoundToggle.addEventListener('click', () => {
      const isMuted = window.soundEngine?.toggleMute();
      updateSoundIcons(isMuted);
    });

    btnHomeMute.addEventListener('click', () => {
      const isMuted = window.soundEngine?.toggleMute();
      updateSoundIcons(isMuted);
    });

    // Vibration toggle
    btnHomeVibe.addEventListener('click', () => {
      State.vibrationEnabled = !State.vibrationEnabled;
      localStorage.setItem('dodgerush_vibe', State.vibrationEnabled.toString());
      homeVibeText.textContent = State.vibrationEnabled ? 'Vibration ON' : 'Vibration OFF';
      if (State.vibrationEnabled) triggerVibrate(40);
    });

    // Initial state sync
    homeHighScore.textContent = State.highScore.toString();
    updateSoundIcons(window.soundEngine?.isMuted());
    homeVibeText.textContent = State.vibrationEnabled ? 'Vibration ON' : 'Vibration OFF';
  }

  // ==========================================
  // Initialization
  // ==========================================
  function init() {
    setupInputHandlers();
    setupUIListeners();
    requestAnimationFrame(gameLoop);
  }

  init();
})();
