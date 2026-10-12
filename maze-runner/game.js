/**
 * MAZE RUNNER 100 — PLATFORMER LABYRINTH ODYSSEY
 * ElyWolf Arcade — 100 Complex Platformer Mazes with High Graphics
 */

// ==========================================================================
// AUDIO SYNTHESIZER ENGINE (Web Audio API)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump(isDouble = false) {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isDouble ? 'triangle' : 'sine';
      const baseFreq = isDouble ? 420 : 280;
      const targetFreq = isDouble ? 780 : 540;

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playWallJump() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.09);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playKeyPickup() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch (e) {}
  }

  playDeath() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const chord = [440, 554.37, 659.25, 880];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// ==========================================================================
// THEMES & REALM CONFIGURATIONS
// ==========================================================================
const THEMES = [
  {
    id: 'forest',
    name: 'MYSTIC GROVE',
    subName: 'Ancient Moss & Canopy',
    range: 'Levels 1–20',
    dotColor: '#10b981',
    bgGradTop: '#03140e',
    bgGradBottom: '#08261c',
    fogColor: 'rgba(16, 185, 129, 0.08)',
    tileFill: '#0a2f1e',
    tileBorder: '#10b981',
    tileAccent: '#34d399',
    particleType: 'leaf',
    particleColor: ['#10b981', '#34d399', '#6ee7b7', '#fef08a']
  },
  {
    id: 'glacial',
    name: 'GLACIAL CAVERNS',
    subName: 'Frost Spikes & Icicles',
    range: 'Levels 21–40',
    dotColor: '#38bdf8',
    bgGradTop: '#031024',
    bgGradBottom: '#07243c',
    fogColor: 'rgba(56, 189, 248, 0.08)',
    tileFill: '#0c2e47',
    tileBorder: '#38bdf8',
    tileAccent: '#bae6fd',
    particleType: 'frost',
    particleColor: ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff']
  },
  {
    id: 'atlantis',
    name: 'SUNKEN TEMPLE',
    subName: 'Classical Fluted Pillars',
    range: 'Levels 41–60',
    dotColor: '#06b6d4',
    bgGradTop: '#021824',
    bgGradBottom: '#073244',
    fogColor: 'rgba(6, 182, 212, 0.08)',
    tileFill: '#0c384a',
    tileBorder: '#06b6d4',
    tileAccent: '#67e8f9',
    particleType: 'bubble',
    particleColor: ['#06b6d4', '#67e8f9', '#a5f3fc', '#ffffff']
  },
  {
    id: 'cybercity',
    name: 'NEO-CYBER METROPOLIS',
    subName: 'Skyscrapers & Tech Circuits',
    range: 'Levels 61–80',
    dotColor: '#ec4899',
    bgGradTop: '#0f0724',
    bgGradBottom: '#220b3b',
    fogColor: 'rgba(236, 72, 153, 0.08)',
    tileFill: '#17112c',
    tileBorder: '#ec4899',
    tileAccent: '#06b6d4',
    particleType: 'cyber',
    particleColor: ['#ec4899', '#06b6d4', '#f43f5e', '#a855f7']
  },
  {
    id: 'celestial',
    name: 'CELESTIAL SANCTUARY',
    subName: 'Cosmic Nebula & Divine Pillars',
    range: 'Levels 81–100',
    dotColor: '#fbbf24',
    bgGradTop: '#0a0522',
    bgGradBottom: '#190e47',
    fogColor: 'rgba(251, 191, 36, 0.08)',
    tileFill: '#221552',
    tileBorder: '#fbbf24',
    tileAccent: '#fde047',
    particleType: 'stardust',
    particleColor: ['#fbbf24', '#fde047', '#e0e7ff', '#c084fc']
  }
];

function getThemeForLevel(lvl) {
  if (lvl <= 20) return THEMES[0];
  if (lvl <= 40) return THEMES[1];
  if (lvl <= 60) return THEMES[2];
  if (lvl <= 80) return THEMES[3];
  return THEMES[4];
}

// ==========================================================================
// PROCEDURAL DETERMINISTIC MAZE GENERATOR (100 UNIQUE LABYRINTHS)
// ==========================================================================
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

class MazeGenerator {
  static generate(levelNum) {
    const rng = seededRandom(levelNum * 91939 + 7109);

    // Scaling dimensions with level
    let cols = 28 + Math.floor(levelNum * 0.4);
    let rows = 18 + Math.floor(levelNum * 0.25);
    // Ensure odd dimensions for maze carving
    if (cols % 2 === 0) cols++;
    if (rows % 2 === 0) rows++;

    const TILE_SIZE = 36;
    // 1 = solid block, 0 = empty corridor, 2 = hazard/spike, 3 = jump pad, 4 = crumble
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(1));

    // Platformer Maze Carving: Carve 2-3 block high passages for jumping
    const stack = [];
    const startX = 2;
    const startY = rows - 3;

    function carve(x, y) {
      grid[y][x] = 0;
      if (y - 1 > 0) grid[y - 1][x] = 0; // 2 tiles vertical clearance
    }

    carve(startX, startY);
    stack.push({ x: startX, y: startY });

    const dirs = [
      { dx: 0, dy: -2 }, // Up
      { dx: 0, dy: 2 },  // Down
      { dx: -2, dy: 0 }, // Left
      { dx: 2, dy: 0 }   // Right
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      // Shuffle directions with deterministic rng
      const shuffled = [...dirs].sort(() => rng() - 0.5);
      let found = false;

      for (const d of shuffled) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;

        if (nx > 1 && nx < cols - 2 && ny > 1 && ny < rows - 2) {
          if (grid[ny][nx] === 1) {
            // Carve wall between
            carve(current.x + d.dx / 2, current.y + d.dy / 2);
            carve(nx, ny);
            stack.push({ x: nx, y: ny });
            found = true;
            break;
          }
        }
      }

      if (!found) {
        stack.pop();
      }
    }

    // Add multiple horizontal loops and connecting shafts for rich platforming
    const loopCount = Math.floor(8 + levelNum * 0.35);
    for (let i = 0; i < loopCount; i++) {
      const rx = 2 + Math.floor(rng() * (cols - 4));
      const ry = 2 + Math.floor(rng() * (rows - 4));
      grid[ry][rx] = 0;
      if (ry - 1 > 0) grid[ry - 1][rx] = 0;
    }

    // Find all walkable floors (empty tile with solid tile beneath)
    const walkableSpots = [];
    for (let y = 1; y < rows - 2; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (grid[y][x] === 0 && grid[y + 1][x] === 1) {
          walkableSpots.push({ x, y });
        }
      }
    }

    // Spawn player at bottom-left area
    let playerSpawn = walkableSpots.find(p => p.x <= 5 && p.y >= rows - 5) || walkableSpots[0] || { x: 2, y: rows - 3 };

    // Portal placed far away from spawn
    let portalSpot = walkableSpots
      .map(p => ({ ...p, dist: Math.hypot(p.x - playerSpawn.x, p.y - playerSpawn.y) }))
      .sort((a, b) => b.dist - a.dist)[0] || { x: cols - 3, y: 3 };

    // Keys to collect (1 to 3 based on level)
    const keyCount = levelNum < 15 ? 1 : (levelNum < 50 ? 2 : 3);
    const keys = [];
    const usedSpots = new Set([`${playerSpawn.x},${playerSpawn.y}`, `${portalSpot.x},${portalSpot.y}`]);

    // Sort walkable spots by distance to spawn and pick scattered spots
    const candidates = walkableSpots.filter(p => !usedSpots.has(`${p.x},${p.y}`));
    for (let k = 0; k < keyCount && candidates.length > 0; k++) {
      const idx = Math.floor(rng() * candidates.length);
      const chosen = candidates.splice(idx, 1)[0];
      keys.push({
        x: chosen.x * TILE_SIZE + TILE_SIZE / 2,
        y: chosen.y * TILE_SIZE + TILE_SIZE / 2,
        collected: false
      });
      usedSpots.add(`${chosen.x},${chosen.y}`);
    }

    // Add hazards (Spikes) starting level 5
    const hazardCount = levelNum >= 5 ? Math.floor(4 + levelNum * 0.4) : 0;
    const hazards = [];
    for (let h = 0; h < hazardCount && candidates.length > 0; h++) {
      const idx = Math.floor(rng() * candidates.length);
      const spot = candidates.splice(idx, 1)[0];
      // Don't place spike right next to spawn
      if (Math.hypot(spot.x - playerSpawn.x, spot.y - playerSpawn.y) > 4) {
        hazards.push({
          x: spot.x * TILE_SIZE,
          y: spot.y * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE
        });
        grid[spot.y][spot.x] = 2; // Spike tile
      }
    }

    // Add Jump Pads starting level 15
    const jumpPadCount = levelNum >= 15 ? Math.floor(2 + levelNum * 0.15) : 0;
    const jumpPads = [];
    for (let jp = 0; jp < jumpPadCount && candidates.length > 0; jp++) {
      const idx = Math.floor(rng() * candidates.length);
      const spot = candidates.splice(idx, 1)[0];
      jumpPads.push({
        x: spot.x * TILE_SIZE + 4,
        y: spot.y * TILE_SIZE + TILE_SIZE - 8,
        w: TILE_SIZE - 8,
        h: 8
      });
      grid[spot.y][spot.x] = 3;
    }

    return {
      cols,
      rows,
      tileSize: TILE_SIZE,
      width: cols * TILE_SIZE,
      height: rows * TILE_SIZE,
      grid,
      playerSpawn: {
        x: playerSpawn.x * TILE_SIZE + Math.floor((TILE_SIZE - 18) / 2),
        y: (playerSpawn.y + 1) * TILE_SIZE - 24
      },
      portal: {
        x: portalSpot.x * TILE_SIZE + TILE_SIZE / 2,
        y: portalSpot.y * TILE_SIZE + TILE_SIZE / 2,
        radius: 20
      },
      keys,
      hazards,
      jumpPads
    };
  }
}

// ==========================================================================
// PARTICLE SYSTEM
// ==========================================================================
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, config = {}) {
    for (let i = 0; i < count; i++) {
      const angle = config.angle !== undefined ? config.angle + (Math.random() - 0.5) * (config.spread || 1) : Math.random() * Math.PI * 2;
      const speed = (config.speedMin || 1) + Math.random() * ((config.speedMax || 4) - (config.speedMin || 1));
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (config.sizeMin || 2) + Math.random() * ((config.sizeMax || 5) - (config.sizeMin || 2)),
        color: config.colors ? config.colors[Math.floor(Math.random() * config.colors.length)] : (config.color || '#fff'),
        alpha: 1,
        decay: config.decay || (0.015 + Math.random() * 0.02),
        gravity: config.gravity !== undefined ? config.gravity : 0.08
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      p.size = Math.max(0.5, p.size * 0.98);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, camera, offset) {
    const ox = offset ? offset.x : 0;
    const oy = offset ? offset.y : 0;
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x + ox, p.y - camera.y + oy, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

// ==========================================================================
// PLAYER CONTROLLER & PHYSICS
// ==========================================================================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 18;
    this.h = 24;
    this.vx = 0;
    this.vy = 0;

    // Movement tuning (tight, responsive platformer feel)
    this.speed = 4.5;
    this.accel = 0.9;
    this.friction = 0.82;
    this.gravity = 0.46;
    this.jumpForce = -9.0;
    this.doubleJumpForce = -8.2;
    this.wallSlideMax = 1.9;

    this.grounded = true;
    this.canDoubleJump = true;
    this.wallSliding = false;
    this.wallDir = 0; // -1 for left wall, 1 for right wall
    this.facing = 1; // 1 right, -1 left
    this.wallJumpLock = 0;

    // Forgiving platformer feel: coyote time & jump buffering
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    this.trail = [];
  }

  update(keys, maze, particles, theme) {
    // Grounded evaluation for this frame
    this.grounded = this.checkGrounded(maze);

    // Left / Right movement
    let moveDir = 0;
    if (keys.left) moveDir -= 1;
    if (keys.right) moveDir += 1;

    if (this.wallJumpLock > 0) {
      this.wallJumpLock--;
    } else {
      if (moveDir !== 0) {
        this.facing = moveDir;
        this.vx += moveDir * this.accel;
        if (Math.abs(this.vx) > this.speed) {
          this.vx = moveDir * this.speed;
        }
        if (this.grounded && Math.random() < 0.25) {
          particles.emit(this.x + this.w / 2, this.y + this.h, 1, {
            angle: moveDir === 1 ? Math.PI : 0,
            speedMin: 0.5, speedMax: 2,
            color: theme.tileAccent,
            gravity: 0.02
          });
        }
      } else {
        this.vx *= this.friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
      }
    }

    // Wall Detection (test strictly adjacent to the wall)
    const checkWallLeft = this.checkSolid(this.x - 2, this.y + 4, maze) || this.checkSolid(this.x - 2, this.y + this.h - 4, maze);
    const checkWallRight = this.checkSolid(this.x + this.w + 2, this.y + 4, maze) || this.checkSolid(this.x + this.w + 2, this.y + this.h - 4, maze);

    this.wallSliding = false;
    this.wallDir = 0;
    if (!this.grounded && this.vy > 0) {
      if (checkWallLeft && (moveDir === -1 || keys.left)) {
        this.wallSliding = true;
        this.wallDir = -1;
      } else if (checkWallRight && (moveDir === 1 || keys.right)) {
        this.wallSliding = true;
        this.wallDir = 1;
      }
    }

    // Gravity & Wall Sliding Speed
    if (this.wallSliding) {
      this.vy = Math.min(this.vy + this.gravity * 0.35, this.wallSlideMax);
      if (Math.random() < 0.3) {
        const sparkX = this.wallDir === -1 ? this.x : this.x + this.w;
        particles.emit(sparkX, this.y + this.h / 2, 1, {
          angle: -Math.PI / 2,
          speedMin: 1, speedMax: 3,
          color: '#fbbf24',
          decay: 0.04
        });
      }
    } else {
      this.vy += this.gravity;
      if (this.vy > 12) this.vy = 12; // cap terminal velocity
    }

    // Timers
    if (this.grounded) {
      this.coyoteTimer = 6;
      this.canDoubleJump = true;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (keys.jumpPressed) {
      keys.jumpPressed = false;
      this.jumpBufferTimer = 6;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    // Execute Jump
    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0 || this.grounded) {
        // Normal Jump
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.grounded = false;
        this.vy = this.jumpForce;
        sfx.playJump(false);
        particles.emit(this.x + this.w / 2, this.y + this.h, 6, {
          angle: -Math.PI / 2, spread: 1.2,
          speedMin: 1.5, speedMax: 4,
          colors: theme.particleColor
        });
      } else if (this.wallSliding || checkWallLeft || checkWallRight) {
        // Wall Jump
        this.jumpBufferTimer = 0;
        const jumpAwayDir = checkWallLeft ? 1 : -1;
        this.vx = jumpAwayDir * 5.4;
        this.vy = this.jumpForce * 0.95;
        this.facing = jumpAwayDir;
        this.wallJumpLock = 10;
        this.canDoubleJump = true;
        sfx.playWallJump();
        const wallX = checkWallLeft ? this.x : this.x + this.w;
        particles.emit(wallX, this.y + this.h / 2, 8, {
          angle: checkWallLeft ? 0 : Math.PI,
          speedMin: 2, speedMax: 5,
          colors: theme.particleColor
        });
      } else if (this.canDoubleJump) {
        // Double Jump
        this.jumpBufferTimer = 0;
        this.vy = this.doubleJumpForce;
        this.canDoubleJump = false;
        sfx.playJump(true);
        particles.emit(this.x + this.w / 2, this.y + this.h / 2, 10, {
          speedMin: 2, speedMax: 5,
          colors: ['#38bdf8', '#818cf8', '#c084fc', '#ffffff']
        });
      }
    }

    // Variable jump height: release jump button while rising to cut upward boost
    if (!keys.up && this.vy < -2.5) {
      this.vy *= 0.65;
    }

    // 1. Move Horizontal with discrete collision sub-stepping
    if (this.vx !== 0) {
      const dirX = Math.sign(this.vx);
      let remX = Math.abs(this.vx);
      while (remX > 0) {
        const step = Math.min(remX, 3);
        this.x += dirX * step;
        remX -= step;
        if (this.resolveHorizontalCollision(maze, dirX)) {
          this.vx = 0;
          break;
        }
      }
    }

    // 2. Move Vertical with discrete collision sub-stepping
    if (this.vy !== 0) {
      const dirY = Math.sign(this.vy);
      let remY = Math.abs(this.vy);
      while (remY > 0) {
        const step = Math.min(remY, 3);
        this.y += dirY * step;
        remY -= step;
        if (this.resolveVerticalCollision(maze, dirY, particles, theme)) {
          this.vy = 0;
          break;
        }
      }
    }

    // 3. Grounded State Check
    this.grounded = this.checkGrounded(maze);
    if (this.grounded) {
      this.canDoubleJump = true;
    }

    // Absolute Safety Boundary Clamp within Outer Maze Perimeter
    const ts = maze.tileSize;
    this.x = Math.max(ts, Math.min(maze.width - ts - this.w, this.x));
    this.y = Math.max(ts, Math.min(maze.height - ts - this.h, this.y));

    // Anti-clip fail-safe: If center is inside a solid block, snap safely to spawn
    const centerTileX = Math.floor((this.x + this.w / 2) / ts);
    const centerTileY = Math.floor((this.y + this.h / 2) / ts);
    if (this.isTileSolid(centerTileX, centerTileY, maze)) {
      this.x = maze.playerSpawn.x;
      this.y = maze.playerSpawn.y;
      this.vx = 0;
      this.vy = 0;
    }

    // Update Motion Trail
    this.trail.push({ x: this.x + this.w / 2, y: this.y + this.h / 2, alpha: 0.6 });
    if (this.trail.length > 5) this.trail.shift();
    this.trail.forEach(t => t.alpha *= 0.85);
  }

  isTileSolid(tx, ty, maze) {
    if (tx < 0 || tx >= maze.cols || ty < 0 || ty >= maze.rows) return true;
    return maze.grid[ty][tx] === 1;
  }

  checkSolid(px, py, maze) {
    const tx = Math.floor(px / maze.tileSize);
    const ty = Math.floor(py / maze.tileSize);
    return this.isTileSolid(tx, ty, maze);
  }

  checkGrounded(maze) {
    const ts = maze.tileSize;
    const footY = this.y + this.h + 0.5;
    const tileY = Math.floor(footY / ts);
    const left = this.x + 2;
    const right = this.x + this.w - 2;
    const startTileX = Math.floor(left / ts);
    const endTileX = Math.floor(right / ts);

    for (let tx = startTileX; tx <= endTileX; tx++) {
      if (this.isTileSolid(tx, tileY, maze)) {
        return true;
      }
    }
    return false;
  }

  resolveHorizontalCollision(maze, dirX) {
    const ts = maze.tileSize;
    // Inset top and bottom by 2px so floor and ceiling are excluded
    const top = this.y + 2;
    const bottom = this.y + this.h - 2;
    const startTileY = Math.floor(top / ts);
    const endTileY = Math.floor(bottom / ts);

    if (dirX > 0) {
      const right = this.x + this.w;
      const tileX = Math.floor(right / ts);
      for (let ty = startTileY; ty <= endTileY; ty++) {
        if (this.isTileSolid(tileX, ty, maze)) {
          this.x = tileX * ts - this.w;
          return true;
        }
      }
    } else if (dirX < 0) {
      const left = this.x;
      const tileX = Math.floor(left / ts);
      for (let ty = startTileY; ty <= endTileY; ty++) {
        if (this.isTileSolid(tileX, ty, maze)) {
          this.x = (tileX + 1) * ts;
          return true;
        }
      }
    }
    return false;
  }

  resolveVerticalCollision(maze, dirY, particles, theme) {
    const ts = maze.tileSize;
    // Inset left and right by 2px so side walls are excluded
    const left = this.x + 2;
    const right = this.x + this.w - 2;
    const startTileX = Math.floor(left / ts);
    const endTileX = Math.floor(right / ts);

    if (dirY > 0) {
      const bottom = this.y + this.h;
      const tileY = Math.floor(bottom / ts);
      for (let tx = startTileX; tx <= endTileX; tx++) {
        if (this.isTileSolid(tx, tileY, maze)) {
          this.y = tileY * ts - this.h;
          if (!this.grounded && this.vy > 4) {
            particles.emit(this.x + this.w / 2, this.y + this.h, 5, {
              angle: -Math.PI / 2, spread: 1.5,
              speedMin: 1, speedMax: 3,
              colors: theme.particleColor
            });
          }
          return true;
        }
      }
    } else if (dirY < 0) {
      const top = this.y;
      const tileY = Math.floor(top / ts);
      for (let tx = startTileX; tx <= endTileX; tx++) {
        if (this.isTileSolid(tx, tileY, maze)) {
          this.y = (tileY + 1) * ts;
          return true;
        }
      }
    }
    return false;
  }

  draw(ctx, camera, theme, offset) {
    const ox = offset ? offset.x : 0;
    const oy = offset ? offset.y : 0;

    // Draw motion trail
    this.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = theme.tileBorder;
      ctx.beginPath();
      ctx.arc(t.x - camera.x + ox, t.y - camera.y + oy, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const drawX = this.x - camera.x + ox;
    const drawY = this.y - camera.y + oy;

    // Emissive Aura / Bloom Halo
    ctx.save();
    const glowGrad = ctx.createRadialGradient(
      drawX + this.w / 2, drawY + this.h / 2, 4,
      drawX + this.w / 2, drawY + this.h / 2, 45
    );
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    glowGrad.addColorStop(0.5, theme.fogColor);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(drawX + this.w / 2, drawY + this.h / 2, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body Capsule
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = theme.tileBorder;
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.tileBorder;
    ctx.shadowBlur = 10;

    // Rounded runner body
    ctx.beginPath();
    const r = 5;
    ctx.roundRect(drawX, drawY, this.w, this.h, r);
    ctx.fill();
    ctx.stroke();

    // Visor / Eyes
    ctx.fillStyle = '#0f172a';
    const eyeOffsetX = this.facing === 1 ? 8 : 2;
    ctx.beginPath();
    ctx.roundRect(drawX + eyeOffsetX, drawY + 6, 8, 4, 2);
    ctx.fill();

    // Glowing Visor Line
    ctx.fillStyle = theme.tileAccent;
    ctx.beginPath();
    ctx.arc(drawX + eyeOffsetX + (this.facing === 1 ? 6 : 2), drawY + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ==========================================================================
// YOUTUBE MUSIC CONTROLLER (100 UNIQUE SONGS FOR 100 PUZZLES)
// ==========================================================================
class MazeMusicPlayer {
  constructor(game, initialLevel = 1) {
    this.game = game;
    this.songs = window.MAZE_SONGS || [];
    this.currentLevel = Math.max(1, Math.min(100, initialLevel));
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 80;
    this.ytPlayer = null;
    this.ytReady = false;
    this.hasUserInteracted = false;
    this.toastTimeout = null;

    // DOM Elements
    this.hudCard = document.getElementById('hudMusicCard');
    this.titleEl = document.getElementById('musicTrackTitle');
    this.authorEl = document.getElementById('musicTrackAuthor');
    this.equalizer = document.getElementById('musicEqualizer');
    this.btnToggle = document.getElementById('btnMusicToggle');
    this.playIcon = document.getElementById('musicPlayIcon');
    this.pauseIcon = document.getElementById('musicPauseIcon');
    this.ytLink = document.getElementById('btnMusicYtLink');
    this.toast = document.getElementById('songToast');
    this.toastTitle = document.getElementById('toastTitle');
    this.toastSub = document.getElementById('toastSub');

    // Immediately update HUD and modals with the active level's track info
    this.updateTrackInfo(this.currentLevel);

    this.init();
  }

  updateTrackInfo(level) {
    const song = this.getSong(level);
    if (this.titleEl) this.titleEl.textContent = `Song ${level}: ${song.title}`;
    if (this.authorEl) this.authorEl.textContent = song.author;
    if (this.ytLink) this.ytLink.href = `https://music.youtube.com/watch?v=${song.videoId}`;
    const vTrackName = document.getElementById('vTrackName');
    if (vTrackName) {
      vTrackName.textContent = `Song ${level}: ${song.title} — ${song.author}`;
    }
  }

  init() {
    // User interaction unlocker for browser autoplay policy
    const userUnlock = () => {
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;
        this.playLevel(this.currentLevel, true);
      }
    };
    window.addEventListener('keydown', userUnlock, { passive: true });
    window.addEventListener('click', userUnlock, { passive: true });
    window.addEventListener('touchstart', userUnlock, { passive: true });

    // Play/Pause button
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hasUserInteracted = true;
        this.togglePlay();
      });
    }

    this.initYouTube();
  }

  initYouTube() {
    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (this.ytPlayer) return;
      try {
        const firstSong = this.getSong(this.currentLevel);
        this.ytPlayer = new YT.Player('ytPlayerContainer', {
          height: '10',
          width: '10',
          videoId: firstSong.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: firstSong.videoId,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event) => {
              this.ytReady = true;
              event.target.setVolume(this.volume);
              const song = this.getSong(this.currentLevel);
              if (typeof event.target.cueVideoById === 'function') {
                event.target.cueVideoById({
                  videoId: song.videoId,
                  suggestedQuality: 'small'
                });
              }
              if (this.hasUserInteracted) {
                this.playLevel(this.currentLevel);
              }
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.updateUI();
              } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                if (event.data === YT.PlayerState.ENDED) {
                  // Loop current puzzle song
                  event.target.playVideo();
                } else {
                  this.isPlaying = false;
                  this.updateUI();
                }
              }
            },
            onError: (err) => {
              console.warn('YouTube IFrame API warning:', err);
              const song = this.getSong(this.currentLevel);
              this.playFallbackEmbed(song.videoId);
            }
          }
        });
      } catch (err) {
        console.warn('Could not initialize YT.Player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      window.onYouTubeIframeAPIReady = setupPlayer;
    }
  }

  getSong(level) {
    if (!this.songs || this.songs.length === 0) {
      return {
        level: level,
        videoId: 'kK0Vd3daL_o',
        title: `Maze ${level} Song`,
        author: 'ElyWolf Music'
      };
    }
    const idx = Math.max(0, Math.min(this.songs.length - 1, level - 1));
    return this.songs[idx];
  }

  playLevel(level, force = false) {
    const isNewLevel = (this.currentLevel !== level) || force;
    this.currentLevel = level;
    const song = this.getSong(level);

    // Update HUD metadata
    this.updateTrackInfo(level);

    // Pop toast notification on level entry
    if (isNewLevel) {
      this.showToast(`MAZE ${level} SONG`, `${song.title} — ${song.author}`);
    }

    if (!this.hasUserInteracted) return;

    if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        this.ytPlayer.loadVideoById({
          videoId: song.videoId,
          suggestedQuality: 'small'
        });
        this.ytPlayer.playVideo();
        this.isPlaying = true;
      } catch (e) {
        this.playFallbackEmbed(song.videoId);
      }
    } else {
      this.playFallbackEmbed(song.videoId);
    }

    this.updateUI();
  }

  playFallbackEmbed(videoId) {
    let iframe = document.getElementById('ytAudioFallbackIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'ytAudioFallbackIframe';
      iframe.className = 'yt-hidden-player';
      iframe.setAttribute('allow', 'autoplay; encrypted-media');
      iframe.setAttribute('tabindex', '-1');
      document.body.appendChild(iframe);
    }
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${videoId}`;
    this.isPlaying = true;
    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      const fallback = document.getElementById('ytAudioFallbackIframe');
      if (fallback) fallback.src = 'about:blank';
      this.isPlaying = false;
    } else {
      this.playLevel(this.currentLevel, true);
    }
    this.updateUI();
  }

  updateUI() {
    if (this.hudCard) {
      this.hudCard.classList.toggle('music-playing', this.isPlaying);
    }
    if (this.playIcon && this.pauseIcon) {
      this.playIcon.classList.toggle('hidden', this.isPlaying);
      this.pauseIcon.classList.toggle('hidden', !this.isPlaying);
    }
  }

  showToast(title, sub) {
    if (!this.toast) return;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    if (this.toastTitle) this.toastTitle.textContent = title;
    if (this.toastSub) this.toastSub.textContent = sub;
    this.toast.classList.remove('hidden');

    this.toastTimeout = setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 4200);
  }
}

// ==========================================================================
// MAIN GAME CONTROLLER
// ==========================================================================
class MazeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Progress State (load saved level before player initialization)
    let startLvl = 1;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramLevel = parseInt(urlParams.get('level') || '', 10);
      if (!isNaN(paramLevel) && paramLevel >= 1 && paramLevel <= 100) {
        startLvl = paramLevel;
      } else {
        startLvl = parseInt(localStorage.getItem('elywolf_maze_level') || '1', 10);
      }
    } catch (e) {
      startLvl = 1;
    }

    this.currentLevel = !isNaN(startLvl) && startLvl >= 1 && startLvl <= 100 ? startLvl : 1;
    this.maxUnlockedLevel = Math.max(
      this.currentLevel,
      parseInt(localStorage.getItem('elywolf_maze_max_unlocked') || '100', 10)
    );
    if (this.maxUnlockedLevel > 100) this.maxUnlockedLevel = 100;

    // YouTube Music Player initialized with active level so song never resets to mist
    this.music = new MazeMusicPlayer(this, this.currentLevel);

    this.theme = getThemeForLevel(this.currentLevel);
    this.particles = new ParticleSystem();
    this.weatherParticles = [];

    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jumpPressed: false
    };

    this.camera = { x: 0, y: 0 };
    this.levelTime = 0;
    this.deaths = 0;
    this.isPaused = false;
    this.isCompleted = false;

    // DOM Elements
    this.hudLevelVal = document.getElementById('hudLevelVal');
    this.hudThemeDot = document.getElementById('hudThemeDot');
    this.hudThemeName = document.getElementById('hudThemeName');
    this.hudKeysVal = document.getElementById('hudKeysVal');
    this.hudTimerVal = document.getElementById('hudTimerVal');
    this.hudDeathsVal = document.getElementById('hudDeathsVal');
    this.minimapOverlay = document.getElementById('minimapOverlay');
    this.levelClearModal = document.getElementById('levelClearModal');
    this.levelSelectModal = document.getElementById('levelSelectModal');
    this.levelsGrid = document.getElementById('levelsGrid');

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());

    this.initControls();
    this.loadLevel(this.currentLevel);

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.viewportW = window.innerWidth;
    this.viewportH = window.innerHeight;
  }

  loadLevel(lvl) {
    const prevLevel = this.currentLevel;
    this.currentLevel = Math.max(1, Math.min(100, lvl));
    localStorage.setItem('elywolf_maze_level', this.currentLevel);
    this.theme = getThemeForLevel(this.currentLevel);

    this.maze = MazeGenerator.generate(this.currentLevel);
    this.player = new Player(this.maze.playerSpawn.x, this.maze.playerSpawn.y);

    this.levelTime = 0;
    this.isCompleted = false;
    this.particles.particles = [];
    this.initWeatherParticles();

    this.updateHUD();
    this.renderMinimap();

    // Play corresponding song for this maze puzzle
    if (this.music) {
      this.music.playLevel(this.currentLevel);
    }

    if (this.levelClearModal) this.levelClearModal.classList.add('hidden');
    if (this.levelSelectModal) this.levelSelectModal.classList.add('hidden');
  }

  initWeatherParticles() {
    this.weatherParticles = [];
    for (let i = 0; i < 35; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.maze.width,
        y: Math.random() * this.maze.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.2 + Math.random() * 0.8,
        size: 1.5 + Math.random() * 3,
        color: this.theme.particleColor[Math.floor(Math.random() * this.theme.particleColor.length)],
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  updateHUD() {
    if (this.hudLevelVal) this.hudLevelVal.textContent = this.currentLevel;
    if (this.hudThemeDot) this.hudThemeDot.style.background = this.theme.dotColor;
    if (this.hudThemeName) {
      this.hudThemeName.textContent = this.theme.name;
      this.hudThemeName.style.color = this.theme.dotColor;
    }
    if (this.hudDeathsVal) this.hudDeathsVal.textContent = this.deaths;
    this.updateKeysHUD();
  }

  updateKeysHUD() {
    if (!this.hudKeysVal || !this.maze) return;
    const collected = this.maze.keys.filter(k => k.collected).length;
    const total = this.maze.keys.length;
    this.hudKeysVal.textContent = `${collected}/${total}`;
  }

  initControls() {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        if (!this.keys.up) {
          this.keys.jumpPressed = true;
        }
        this.keys.up = true;
      }

      // Reset
      if (e.key === 'r' || e.key === 'R') {
        this.deaths++;
        this.player.x = this.maze.playerSpawn.x;
        this.player.y = this.maze.playerSpawn.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.updateHUD();
      }

      // Minimap Toggle
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggleMinimap();
      } else if (e.key === 'Escape') {
        if (this.minimapOverlay && !this.minimapOverlay.classList.contains('hidden')) {
          e.preventDefault();
          e.stopPropagation();
          this.closeMinimap();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        this.keys.up = false;
      }
    };

    // Attach keyboard events only to window to prevent duplicate bubbling triggers
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('blur', () => {
      this.keys.left = false;
      this.keys.right = false;
      this.keys.up = false;
      this.keys.down = false;
      this.keys.jumpPressed = false;
    });

    // On-screen HUD buttons
    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) btnRestart.addEventListener('click', () => {
      this.deaths++;
      this.player.x = this.maze.playerSpawn.x;
      this.player.y = this.maze.playerSpawn.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.updateHUD();
    });

    const btnMinimap = document.getElementById('btnMinimap');
    if (btnMinimap) btnMinimap.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimap();
    });

    const btnCloseMinimap = document.getElementById('btnCloseMinimap');
    if (btnCloseMinimap) btnCloseMinimap.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeMinimap();
    });

    if (this.minimapOverlay) {
      this.minimapOverlay.addEventListener('click', (e) => {
        // Clicking backdrop outside canvas or on close button closes the map
        if (e.target === this.minimapOverlay || e.target.closest('#btnCloseMinimap')) {
          this.closeMinimap();
        }
      });
    }

    const btnAudio = document.getElementById('btnAudio');
    const audioIconOn = document.getElementById('audioIconOn');
    const audioIconOff = document.getElementById('audioIconOff');
    if (btnAudio) btnAudio.addEventListener('click', () => {
      sfx.muted = !sfx.muted;
      if (audioIconOn && audioIconOff) {
        audioIconOn.classList.toggle('hidden', sfx.muted);
        audioIconOff.classList.toggle('hidden', !sfx.muted);
      }
    });

    const btnLevelSelect = document.getElementById('btnLevelSelect');
    if (btnLevelSelect) btnLevelSelect.addEventListener('click', () => this.openLevelSelect());

    const btnCloseLevelSelect = document.getElementById('btnCloseLevelSelect');
    if (btnCloseLevelSelect) btnCloseLevelSelect.addEventListener('click', () => {
      if (this.levelSelectModal) this.levelSelectModal.classList.add('hidden');
    });

    const btnNextLevel = document.getElementById('btnNextLevel');
    if (btnNextLevel) btnNextLevel.addEventListener('click', () => {
      this.loadLevel(this.currentLevel + 1);
    });

    const btnReplayLevel = document.getElementById('btnReplayLevel');
    if (btnReplayLevel) btnReplayLevel.addEventListener('click', () => {
      this.loadLevel(this.currentLevel);
    });

    // Mobile Touch buttons
    const tLeft = document.getElementById('tLeft');
    const tRight = document.getElementById('tRight');
    const tJump = document.getElementById('tJump');

    const bindTouch = (el, pressAction, releaseAction) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); pressAction(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); releaseAction(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); pressAction(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); releaseAction(); });
    };

    bindTouch(tLeft, () => { this.keys.left = true; }, () => { this.keys.left = false; });
    bindTouch(tRight, () => { this.keys.right = true; }, () => { this.keys.right = false; });
    bindTouch(tJump, () => { this.keys.up = true; this.keys.jumpPressed = true; }, () => { this.keys.up = false; });
  }

  toggleMinimap() {
    if (!this.minimapOverlay) return;
    const isHidden = this.minimapOverlay.classList.contains('hidden');
    if (isHidden) {
      this.openMinimap();
    } else {
      this.closeMinimap();
    }
  }

  openMinimap() {
    if (!this.minimapOverlay) return;
    this.renderMinimap();
    this.minimapOverlay.classList.remove('hidden');
  }

  closeMinimap() {
    if (!this.minimapOverlay) return;
    this.minimapOverlay.classList.add('hidden');
  }

  renderMinimap() {
    if (!this.minimapCanvas || !this.minimapCtx || !this.maze) return;
    const scale = Math.min(600 / this.maze.width, 420 / this.maze.height);
    this.minimapCanvas.width = this.maze.width * scale;
    this.minimapCanvas.height = this.maze.height * scale;

    const mCtx = this.minimapCtx;
    mCtx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

    // Draw solid walls
    mCtx.fillStyle = this.theme.tileFill;
    for (let y = 0; y < this.maze.rows; y++) {
      for (let x = 0; x < this.maze.cols; x++) {
        if (this.maze.grid[y][x] === 1) {
          mCtx.fillRect(x * this.maze.tileSize * scale, y * this.maze.tileSize * scale, this.maze.tileSize * scale, this.maze.tileSize * scale);
        }
      }
    }

    // Keys
    this.maze.keys.forEach(k => {
      if (!k.collected) {
        mCtx.fillStyle = '#fbbf24';
        mCtx.beginPath();
        mCtx.arc(k.x * scale, k.y * scale, 4, 0, Math.PI * 2);
        mCtx.fill();
      }
    });

    // Portal
    mCtx.fillStyle = '#10b981';
    mCtx.beginPath();
    mCtx.arc(this.maze.portal.x * scale, this.maze.portal.y * scale, 6, 0, Math.PI * 2);
    mCtx.fill();

    // Player position
    if (this.player) {
      mCtx.fillStyle = '#ffffff';
      mCtx.shadowColor = '#38bdf8';
      mCtx.shadowBlur = 6;
      mCtx.beginPath();
      mCtx.arc((this.player.x + this.player.w / 2) * scale, (this.player.y + this.player.h / 2) * scale, 5, 0, Math.PI * 2);
      mCtx.fill();
    }
  }

  openLevelSelect() {
    if (!this.levelSelectModal || !this.levelsGrid) return;
    this.levelsGrid.innerHTML = '';

    const tabs = document.querySelectorAll('.r-tab');
    let activeStart = 1;
    tabs.forEach(tab => {
      if (tab.classList.contains('active')) {
        activeStart = parseInt(tab.getAttribute('data-start') || '1', 10);
      }
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderLevelsGrid(parseInt(tab.getAttribute('data-start') || '1', 10));
      };
    });

    this.renderLevelsGrid(activeStart);
    this.levelSelectModal.classList.remove('hidden');
  }

  renderLevelsGrid(startLvl) {
    if (!this.levelsGrid) return;
    this.levelsGrid.innerHTML = '';
    const endLvl = Math.min(100, startLvl + 19);

    for (let l = startLvl; l <= endLvl; l++) {
      const isLocked = l > this.maxUnlockedLevel;
      const isCurrent = l === this.currentLevel;
      const song = this.music ? this.music.getSong(l) : { title: `Song ${l}`, author: '' };

      const btn = document.createElement('button');
      btn.className = `lvl-btn ${isLocked ? 'locked' : ''} ${isCurrent ? 'active-current' : ''}`;
      btn.title = `Maze ${l}: ${song.title} by ${song.author}`;
      const musicIconSvg = `<svg class="inline-music-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
      const lockIconSvg = `<svg class="lvl-lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      const starIconSvg = `<svg class="lvl-star-svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      const starsGroupHtml = `<span class="lvl-stars-group">${starIconSvg}${starIconSvg}${starIconSvg}</span>`;

      btn.innerHTML = `
        <span class="lvl-num">${l}</span>
        <span class="lvl-song-name">${musicIconSvg} <span>${song.title}</span></span>
        <span class="lvl-stars">${isLocked ? lockIconSvg : starsGroupHtml}</span>
      `;

      btn.onclick = () => {
        this.loadLevel(l);
        if (this.levelSelectModal) this.levelSelectModal.classList.add('hidden');
      };

      this.levelsGrid.appendChild(btn);
    }
  }

  getOffset() {
    const ox = this.viewportW > this.maze.width ? Math.floor((this.viewportW - this.maze.width) / 2) : 0;
    let oy = 0;
    if (this.viewportH > this.maze.height) {
      const hudMargin = 72;
      if (this.viewportH - this.maze.height >= hudMargin + 20) {
        // Center in the playable region below the top HUD
        oy = Math.floor(hudMargin + (this.viewportH - hudMargin - this.maze.height) / 2);
      } else {
        oy = Math.floor((this.viewportH - this.maze.height) / 2);
      }
    }
    return { x: ox, y: oy };
  }

  gameLoop(currentTime) {
    const dt = Math.max(0, Math.min((currentTime - this.lastFrameTime) / 1000, 0.1));
    this.lastFrameTime = currentTime;

    if (!this.isPaused && !this.isCompleted) {
      this.update(dt);
    }

    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    this.levelTime += dt;
    // Format Timer
    const mins = Math.floor(this.levelTime / 60);
    const secs = (this.levelTime % 60).toFixed(1);
    if (this.hudTimerVal) {
      this.hudTimerVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }

    // Update Player
    this.player.update(this.keys, this.maze, this.particles, this.theme);

    // Camera follow player smoothly or center maze if smaller than viewport
    if (this.viewportW <= this.maze.width) {
      const targetCamX = this.player.x + this.player.w / 2 - this.viewportW / 2;
      this.camera.x += (targetCamX - this.camera.x) * 0.12;
      this.camera.x = Math.max(0, Math.min(this.maze.width - this.viewportW, this.camera.x));
    } else {
      this.camera.x = 0;
    }

    if (this.viewportH <= this.maze.height) {
      const targetCamY = this.player.y + this.player.h / 2 - this.viewportH / 2;
      this.camera.y += (targetCamY - this.camera.y) * 0.12;
      this.camera.y = Math.max(0, Math.min(this.maze.height - this.viewportH, this.camera.y));
    } else {
      this.camera.y = 0;
    }

    // Check Key / Orb pickups
    this.maze.keys.forEach(k => {
      if (!k.collected) {
        const dist = Math.hypot((this.player.x + this.player.w / 2) - k.x, (this.player.y + this.player.h / 2) - k.y);
        if (dist < 22) {
          k.collected = true;
          sfx.playKeyPickup();
          this.particles.emit(k.x, k.y, 16, {
            speedMin: 2, speedMax: 6,
            colors: ['#fbbf24', '#fde047', '#fff', '#10b981']
          });
          this.updateKeysHUD();
        }
      }
    });

    // Check Hazard Collisions (Spikes) & Jump Pads
    const px = this.player.x + this.player.w / 2;
    const py = this.player.y + this.player.h / 2;
    const footY = this.player.y + this.player.h - 1;
    const centerY = py;
    const tx = Math.floor(px / this.maze.tileSize);
    const tyFoot = Math.floor(footY / this.maze.tileSize);
    const tyCenter = Math.floor(centerY / this.maze.tileSize);

    const hitSpike = (tx >= 0 && tx < this.maze.cols) && (
      (tyFoot >= 0 && tyFoot < this.maze.rows && this.maze.grid[tyFoot][tx] === 2) ||
      (tyCenter >= 0 && tyCenter < this.maze.rows && this.maze.grid[tyCenter][tx] === 2)
    );
    const hitPad = (tx >= 0 && tx < this.maze.cols) && (
      (tyFoot >= 0 && tyFoot < this.maze.rows && this.maze.grid[tyFoot][tx] === 3) ||
      (tyCenter >= 0 && tyCenter < this.maze.rows && this.maze.grid[tyCenter][tx] === 3)
    );

    if (hitSpike) {
      sfx.playDeath();
      this.deaths++;
      this.particles.emit(px, footY, 20, {
        speedMin: 2, speedMax: 6,
        colors: ['#ef4444', '#f87171', '#fff']
      });
      this.player.x = this.maze.playerSpawn.x;
      this.player.y = this.maze.playerSpawn.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.updateHUD();
    } else if (hitPad) {
      this.player.vy = -11.5;
      this.player.canDoubleJump = true;
      sfx.playJump(true);
      this.particles.emit(px, footY + 4, 10, {
        angle: -Math.PI / 2, spread: 0.8,
        speedMin: 3, speedMax: 8,
        colors: ['#38bdf8', '#818cf8', '#fff']
      });
    }

    // Check Portal Exit Trigger
    const allKeysCollected = this.maze.keys.every(k => k.collected);
    const portalDist = Math.hypot(px - this.maze.portal.x, py - this.maze.portal.y);
    if (allKeysCollected && portalDist < 26 && !this.isCompleted) {
      this.triggerLevelVictory();
    }

    // Weather Particles
    this.weatherParticles.forEach(wp => {
      wp.x += wp.vx;
      wp.y += wp.vy;
      if (wp.y > this.maze.height) wp.y = 0;
      if (wp.x < 0) wp.x = this.maze.width;
      if (wp.x > this.maze.width) wp.x = 0;
    });

    // Particle System
    this.particles.update();
  }

  triggerLevelVictory() {
    this.isCompleted = true;
    sfx.playVictory();

    this.particles.emit(this.maze.portal.x, this.maze.portal.y, 40, {
      speedMin: 3, speedMax: 8,
      colors: ['#10b981', '#34d399', '#fbbf24', '#fff']
    });

    // Save max unlocked level
    const nextLevel = this.currentLevel + 1;
    if (nextLevel > this.maxUnlockedLevel && nextLevel <= 100) {
      this.maxUnlockedLevel = nextLevel;
      localStorage.setItem('elywolf_maze_max_unlocked', this.maxUnlockedLevel);
    }

    // Show Victory Modal
    setTimeout(() => {
      const clearTitle = document.getElementById('clearTitle');
      const clearSub = document.getElementById('clearSub');
      const clearTimeVal = document.getElementById('clearTimeVal');
      const clearDeathsVal = document.getElementById('clearDeathsVal');
      const clearUnlockedVal = document.getElementById('clearUnlockedVal');

      if (clearTitle) clearTitle.textContent = `MAZE ${this.currentLevel} CONQUERED!`;
      if (clearSub) clearSub.textContent = `${this.theme.name} • ${this.theme.range}`;
      if (clearTimeVal) clearTimeVal.textContent = this.hudTimerVal ? this.hudTimerVal.textContent : '00:00.0';
      if (clearDeathsVal) clearDeathsVal.textContent = this.deaths;
      if (clearUnlockedVal) clearUnlockedVal.textContent = `${this.maxUnlockedLevel} / 100`;

      // Update cleared puzzle song in victory modal
      const currentSong = this.music.getSong(this.currentLevel);
      const nextSong = this.music.getSong(Math.min(100, this.currentLevel + 1));
      const vTrackName = document.getElementById('vTrackName');
      if (vTrackName) {
        vTrackName.textContent = `Song ${this.currentLevel}: ${currentSong.title} — ${currentSong.author} (Next: ${nextSong.title})`;
      }

      if (this.levelClearModal) this.levelClearModal.classList.remove('hidden');
    }, 400);
  }

  drawBackground(ctx, offset, now) {
    const w = this.viewportW;
    const h = this.viewportH;
    const themeId = this.theme.id;
    const camX = this.camera.x;

    // Base atmospheric sky gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, this.theme.bgGradTop);
    bgGrad.addColorStop(1, this.theme.bgGradBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    if (themeId === 'cybercity') {
      // ======================================================================
      // HIGH-QUALITY CYBERPUNK CITYSCAPE METROPOLIS
      // ======================================================================

      // 1. Sweeping Sky Searchlight Beams
      ctx.save();
      for (let s = 0; s < 3; s++) {
        const sweepAngle = Math.sin(now * 0.0008 + s * 2.1) * 0.35 - 0.2;
        const beamBaseX = (w * (0.25 + s * 0.3) - camX * 0.04) % (w + 200);
        ctx.save();
        ctx.translate(beamBaseX, h);
        ctx.rotate(sweepAngle);
        const beamGrad = ctx.createLinearGradient(0, 0, 0, -h * 1.2);
        beamGrad.addColorStop(0, s === 1 ? 'rgba(236, 72, 153, 0.15)' : 'rgba(6, 182, 212, 0.12)');
        beamGrad.addColorStop(0.7, s === 1 ? 'rgba(236, 72, 153, 0.04)' : 'rgba(6, 182, 212, 0.03)');
        beamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-70, -h * 1.2);
        ctx.lineTo(70, -h * 1.2);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // 2. Far Skyline Silhouettes (Parallax Factor: 0.04)
      const farShift = (camX * 0.04) % 180;
      ctx.fillStyle = '#0a0518';
      for (let i = -1; i < Math.ceil(w / 120) + 2; i++) {
        const bx = i * 120 - farShift;
        const bHash = ((i * 1234567) ^ 0x9e3779b9) >>> 0;
        const bh = 140 + (bHash % 160);
        const bw = 85 + ((bHash >> 4) % 30);
        const by = h - bh;
        ctx.fillRect(bx, by, bw, bh);

        // Tower spire with blinking red aircraft warning beacon
        const spireH = 25 + ((bHash >> 8) % 35);
        ctx.fillRect(bx + bw / 2 - 1.5, by - spireH, 3, spireH);
        const blink = Math.sin(now * 0.004 + i) > 0.3;
        if (blink) {
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by - spireH, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 3. Midground High-Tech Skyscrapers (Parallax Factor: 0.12)
      const midShift = (camX * 0.12) % 240;
      for (let i = -1; i < Math.ceil(w / 140) + 2; i++) {
        const bx = i * 140 - midShift;
        const bHash = ((i * 2654435761) ^ 0x85ebca6b) >>> 0;
        const bh = 180 + (bHash % 220);
        const bw = 95 + ((bHash >> 3) % 40);
        const by = h - bh;

        // Building Facade
        ctx.fillStyle = '#120b24';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#281a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // Angled architectural crown / roof cut
        if (bHash % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + bw, by + 18);
          ctx.lineTo(bx + bw, by);
          ctx.closePath();
          ctx.fillStyle = '#1c1038';
          ctx.fill();
        }

        // Illuminated Window Grids (amber, cyan, pink, dark)
        const cols = Math.floor(bw / 12);
        const rows = Math.floor(bh / 16);
        for (let wr = 2; wr < rows - 2; wr++) {
          for (let wc = 1; wc < cols - 1; wc++) {
            const winHash = ((bHash + wr * 31 + wc * 17) ^ 0xc2b2ae35) >>> 0;
            const wx = bx + wc * 12 + 2;
            const wy = by + wr * 16 + 2;
            const winState = winHash % 10;
            if (winState === 0) {
              ctx.fillStyle = 'rgba(236, 72, 153, 0.75)'; // Neon Pink
              ctx.fillRect(wx, wy, 6, 8);
            } else if (winState === 1 || winState === 2) {
              ctx.fillStyle = 'rgba(6, 182, 212, 0.7)'; // Neon Cyan
              ctx.fillRect(wx, wy, 6, 8);
            } else if (winState === 3 || winState === 4) {
              ctx.fillStyle = 'rgba(245, 158, 11, 0.65)'; // Warm Amber
              ctx.fillRect(wx, wy, 6, 8);
            } else {
              // Unlit / Dark Office
              ctx.fillStyle = 'rgba(30, 20, 60, 0.4)';
              ctx.fillRect(wx, wy, 6, 8);
            }
          }
        }

        // Glowing Vertical Elevator Shaft
        if (bHash % 3 === 0) {
          const shaftX = bx + bw - 10;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.fillRect(shaftX, by + 10, 6, bh - 20);
          const carY = by + 10 + (Math.sin(now * 0.0015 + i) * 0.5 + 0.5) * (bh - 35);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(shaftX, carY, 6, 8);
        }
      }

      // 4. Overhead Monorail Girder & Fast Maglev Train (Parallax Factor: 0.18)
      const railY = h - 220;
      ctx.save();
      // Concrete & Steel Transit Beam
      ctx.fillStyle = '#18122c';
      ctx.fillRect(0, railY, w, 8);
      ctx.fillStyle = '#06b6d4';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, railY + 2, w, 2);
      ctx.restore();

      // Maglev Bullet Train passing by horizontally
      const trainSpeed = 0.35;
      const trainCycle = w + 400;
      const trainX = ((now * trainSpeed) % trainCycle) - 300;
      if (trainX > -250 && trainX < w + 50) {
        ctx.save();
        // Train Body
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.fillRect(trainX, railY - 10, 160, 9);
        // Aerodynamic Nose
        ctx.beginPath();
        ctx.moveTo(trainX + 160, railY - 10);
        ctx.lineTo(trainX + 185, railY - 4);
        ctx.lineTo(trainX + 160, railY - 1);
        ctx.closePath();
        ctx.fill();
        // Glowing Cyan Passenger Windows
        ctx.fillStyle = '#06b6d4';
        for (let tw = 0; tw < 8; tw++) {
          ctx.fillRect(trainX + 15 + tw * 16, railY - 8, 9, 4);
        }
        // Maglev propulsion light trail
        const trailGrad = ctx.createLinearGradient(trainX, 0, trainX - 100, 0);
        trailGrad.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
        trailGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = trailGrad;
        ctx.fillRect(trainX - 100, railY - 5, 100, 3);
        ctx.restore();
      }

      // 5. Holographic Neon Billboards & Aerial Utility Cables (Parallax Factor: 0.25)
      const nearShift = (camX * 0.25) % 360;
      for (let i = -1; i < Math.ceil(w / 300) + 2; i++) {
        const boardX = i * 300 - nearShift;
        const boardY = h - 290 - ((i * 53) % 60);

        // Neon Billboard: "ELYWOLF CYBER"
        ctx.save();
        ctx.translate(boardX, boardY);
        // Holo Frame
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, 120, 34);
        ctx.fillStyle = 'rgba(15, 7, 36, 0.85)';
        ctx.fillRect(0, 0, 120, 34);

        // Holo Scanlines
        ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
        for (let l = 0; l < 34; l += 4) {
          ctx.fillRect(0, l, 120, 2);
        }

        // Glowing Text with subtle neon flicker
        const flicker = Math.sin(now * 0.007 + i) > -0.9 ? 1 : 0.4;
        ctx.globalAlpha = flicker;
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
        ctx.font = '800 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(i % 2 === 0 ? 'ELYWOLF CYBER' : 'NEO ARCADE', 60, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '600 7px "JetBrains Mono", monospace';
        ctx.fillText('SYSTEM v3.8 ONLINE', 60, 26);
        ctx.restore();

        // Diagonal aerial utility cables drooping between towers
        ctx.save();
        ctx.strokeStyle = 'rgba(40, 25, 75, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(boardX - 40, boardY + 50);
        ctx.quadraticCurveTo(boardX + 100, boardY + 90, boardX + 240, boardY + 40);
        ctx.stroke();
        ctx.restore();
      }

    } else if (themeId === 'glacial') {
      // ======================================================================
      // GLACIAL CAVERNS: AURORA BOREALIS & FROZEN MOUNTAIN PEAKS
      // ======================================================================

      // 1. Shimmering Aurora Borealis Ethereal Curtains
      ctx.save();
      for (let a = 0; a < 3; a++) {
        const aColor = a === 0 ? 'rgba(16, 185, 129, 0.18)' : (a === 1 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(129, 140, 248, 0.15)');
        ctx.fillStyle = aColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= w; x += 30) {
          const wave = Math.sin(x * 0.004 + now * 0.0009 + a * 1.5) * 45 + Math.cos(x * 0.008 + now * 0.0006) * 25;
          const y = 80 + a * 50 + wave;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 2. Distant Jagged Icy Mountain Peaks (Parallax Factor: 0.06)
      const mtnShift = (camX * 0.06) % 220;
      ctx.save();
      for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
        const mx = i * 180 - mtnShift;
        const mh = 220 + ((i * 89) % 100);
        const my = h - mh;

        // Mountain Silhouette
        ctx.fillStyle = '#061a2e';
        ctx.beginPath();
        ctx.moveTo(mx - 40, h);
        ctx.lineTo(mx + 80, my);
        ctx.lineTo(mx + 200, h);
        ctx.closePath();
        ctx.fill();

        // Crystalline Glacial Facet Light Edge
        ctx.fillStyle = '#0e385e';
        ctx.beginPath();
        ctx.moveTo(mx + 80, my);
        ctx.lineTo(mx + 200, h);
        ctx.lineTo(mx + 110, h);
        ctx.closePath();
        ctx.fill();

        // Snow Cap on Peak
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(mx + 80, my);
        ctx.lineTo(mx + 105, my + 45);
        ctx.lineTo(mx + 80, my + 38);
        ctx.lineTo(mx + 60, my + 45);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. Foreground Cavern Frost Silhouette (Parallax Factor: 0.15)
      ctx.save();
      ctx.fillStyle = 'rgba(12, 46, 71, 0.4)';
      const cavShift = (camX * 0.15) % 260;
      for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
        const cx = i * 200 - cavShift;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 60, 90 + ((i * 47) % 60));
        ctx.lineTo(cx + 120, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

    } else if (themeId === 'atlantis') {
      // ======================================================================
      // SUNKEN TEMPLE / ATLANTIS: UNDERWATER CAUSTICS & SUBMERGED RUINS
      // ======================================================================

      // 1. Shimmering Underwater Caustic God-Rays
      ctx.save();
      for (let r = 0; r < 5; r++) {
        const rayAngle = -0.15 + Math.sin(now * 0.001 + r * 1.3) * 0.05;
        const rayX = (r * 180 - (camX * 0.05) % (w + 200));
        ctx.save();
        ctx.translate(rayX, 0);
        ctx.rotate(rayAngle);
        const rayGrad = ctx.createLinearGradient(0, 0, 0, h * 1.2);
        rayGrad.addColorStop(0, 'rgba(34, 211, 238, 0.22)');
        rayGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-80, h * 1.2);
        ctx.lineTo(80, h * 1.2);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // 2. Distant Sunken Temple Colonnade & Pediments (Parallax Factor: 0.08)
      const ruinShift = (camX * 0.08) % 320;
      ctx.save();
      ctx.fillStyle = '#062638';
      for (let i = -1; i < Math.ceil(w / 280) + 2; i++) {
        const rx = i * 280 - ruinShift;
        const ry = h - 220;

        // Submerged Temple Pediment (Triangular Gable)
        ctx.beginPath();
        ctx.moveTo(rx - 20, ry);
        ctx.lineTo(rx + 90, ry - 55);
        ctx.lineTo(rx + 200, ry);
        ctx.closePath();
        ctx.fill();
        // Architrave beam
        ctx.fillRect(rx - 15, ry, 210, 14);

        // Colonnade Pillars
        for (let col = 0; col < 5; col++) {
          ctx.fillRect(rx + col * 42, ry + 14, 18, 206);
        }
      }
      ctx.restore();

      // 3. Giant Swaying Deep-Sea Kelp Fronds (Parallax Factor: 0.18)
      const kelpShift = (camX * 0.18) % 180;
      ctx.save();
      ctx.fillStyle = 'rgba(6, 78, 92, 0.55)';
      for (let k = -1; k < Math.ceil(w / 120) + 2; k++) {
        const kx = k * 120 - kelpShift;
        const sway = Math.sin(now * 0.002 + k * 1.1) * 25;
        ctx.beginPath();
        ctx.moveTo(kx, h);
        ctx.quadraticCurveTo(kx + sway * 0.6, h - 120, kx + sway, h - 260);
        ctx.quadraticCurveTo(kx + sway * 0.8 + 15, h - 130, kx + 18, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

    } else if (themeId === 'forest') {
      // ======================================================================
      // MYSTIC GROVE: ANCIENT CANOPY & TWILIGHT SILHOUETTES
      // ======================================================================

      // 1. Distant Twilight Moon / Celestial Orb
      ctx.save();
      const moonX = w * 0.75 - (camX * 0.02) % (w * 1.5);
      const moonGrad = ctx.createRadialGradient(moonX, 100, 10, moonX, 100, 70);
      moonGrad.addColorStop(0, 'rgba(209, 250, 229, 0.8)');
      moonGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.2)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, 100, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Far Canopy Trees (Parallax Factor: 0.06)
      const fShift = (camX * 0.06) % 240;
      ctx.save();
      ctx.fillStyle = '#061d14';
      for (let i = -1; i < Math.ceil(w / 160) + 2; i++) {
        const tx = i * 160 - fShift;
        ctx.beginPath();
        ctx.arc(tx + 80, h + 30, 180, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();

      // 3. Midground Massive Ancient Banyan / Redwood Trunks (Parallax Factor: 0.15)
      const mShift = (camX * 0.15) % 300;
      ctx.save();
      ctx.fillStyle = '#09291b';
      for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
        const bx = i * 220 - mShift;
        ctx.fillRect(bx + 40, h - 280, 55, 280);
        ctx.beginPath();
        ctx.moveTo(bx + 40, h - 220);
        ctx.quadraticCurveTo(bx - 30, h - 290, bx - 80, h - 270);
        ctx.lineTo(bx - 80, h - 250);
        ctx.quadraticCurveTo(bx - 20, h - 270, bx + 40, h - 200);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0f3f2b';
        ctx.fillRect(bx - 40, h - 270, 2.5, 60);
        ctx.fillRect(bx - 20, h - 260, 2.5, 45);
        ctx.fillStyle = '#09291b';
      }
      ctx.restore();

    } else if (themeId === 'celestial') {
      // ======================================================================
      // CELESTIAL SANCTUARY: COSMIC NEBULA & SACRED ASTRAL STARS
      // ======================================================================

      // 1. Cosmic Nebula Clusters
      ctx.save();
      for (let n = 0; n < 3; n++) {
        const nx = (w * (0.2 + n * 0.35) - camX * 0.03) % (w + 200);
        const ny = 120 + n * 60;
        const nebGrad = ctx.createRadialGradient(nx, ny, 20, nx, ny, 180);
        nebGrad.addColorStop(0, n === 1 ? 'rgba(236, 72, 153, 0.18)' : 'rgba(168, 85, 247, 0.22)');
        nebGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, 180, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Sparkling Constellations (Parallax Factor: 0.05)
      ctx.save();
      const starShift = (camX * 0.05) % 300;
      for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
        const sx = i * 180 - starShift;
        const sHash = ((i * 719393) ^ 0x45d9f3b) >>> 0;
        const s1x = sx + 30;
        const s1y = 60 + (sHash % 90);
        const s2x = sx + 80;
        const s2y = 40 + ((sHash >> 3) % 80);
        const s3x = sx + 130;
        const s3y = 75 + ((sHash >> 6) % 100);

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s1x, s1y);
        ctx.lineTo(s2x, s2y);
        ctx.lineTo(s3x, s3y);
        ctx.stroke();

        [ [s1x, s1y], [s2x, s2y], [s3x, s3y] ].forEach(([px, py]) => {
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();

      // 3. Distant Floating Sacred Obelisks (Parallax Factor: 0.12)
      const obShift = (camX * 0.12) % 320;
      ctx.save();
      ctx.fillStyle = '#1e1147';
      for (let i = -1; i < Math.ceil(w / 240) + 2; i++) {
        const ox = i * 240 - obShift;
        const oy = h - 230 - ((i * 37) % 60);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + 80, oy);
        ctx.lineTo(ox + 40, oy + 55);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(ox + 36, oy - 70, 8, 70);
      }
      ctx.restore();
    }
  }

  drawSolidTile(ctx, screenX, screenY, ts, c, r, now) {
    const grid = this.maze.grid;
    const rows = this.maze.rows;
    const cols = this.maze.cols;
    const themeId = this.theme.id;

    // Neighbor adjacency checks
    const topOpen = r === 0 || grid[r - 1][c] !== 1;
    const bottomOpen = r === rows - 1 || grid[r + 1][c] !== 1;
    const leftOpen = c === 0 || grid[r][c - 1] !== 1;
    const rightOpen = c === cols - 1 || grid[r][c + 1] !== 1;

    // Is this a vertical pillar / column structure? (both sides open or standalone column)
    const isPillar = leftOpen && rightOpen;

    // Deterministic pseudo-random hash for this tile
    const hash = ((c * 374761393 + r * 668265263) ^ 0x5bf03635) >>> 0;

    ctx.save();

    if (themeId === 'glacial') {
      // ======================================================================
      // GLACIAL REALM: FROST CRUST & SHARP TRANSLUCENT ICICLES
      // ======================================================================

      // Main Block Ice Core
      const iceGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + ts);
      iceGrad.addColorStop(0, '#0c2e47');
      iceGrad.addColorStop(1, '#071f33');
      ctx.fillStyle = iceGrad;
      ctx.fillRect(screenX, screenY, ts, ts);

      // Crystalline internal fracture cracks
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (hash % 3 === 0) {
        ctx.moveTo(screenX + 5, screenY + 4);
        ctx.lineTo(screenX + ts * 0.55, screenY + ts * 0.45);
        ctx.lineTo(screenX + ts - 6, screenY + ts * 0.75);
      } else if (hash % 3 === 1) {
        ctx.moveTo(screenX + ts - 6, screenY + 6);
        ctx.lineTo(screenX + ts * 0.45, screenY + ts * 0.55);
        ctx.lineTo(screenX + 6, screenY + ts - 6);
      }
      ctx.stroke();

      // Glowing ice border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      // Top Edge: Snow Crust / Powder Snow Cap
      if (topOpen) {
        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.moveTo(screenX - 1, screenY);
        // Soft undulating snow mounds
        ctx.quadraticCurveTo(screenX + ts * 0.25, screenY + 4, screenX + ts * 0.5, screenY + 2);
        ctx.quadraticCurveTo(screenX + ts * 0.75, screenY + 5, screenX + ts + 1, screenY);
        ctx.lineTo(screenX + ts + 1, screenY - 3);
        ctx.quadraticCurveTo(screenX + ts * 0.5, screenY - 5, screenX - 1, screenY - 3);
        ctx.closePath();
        ctx.fill();

        // Specular snow highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX + 4, screenY - 2, ts - 8, 1.5);
      }

      // Bottom Edge: SHARP TRANSLUCENT ICICLES
      if (bottomOpen) {
        const numIcicles = 3;
        const icicleSpacing = ts / numIcicles;

        for (let i = 0; i < numIcicles; i++) {
          const iHash = ((hash + i * 7919) ^ 0x45d9f3b) >>> 0;
          const iLen = 8 + (iHash % 12); // Length between 8px and 19px
          const iBaseX = screenX + i * icicleSpacing + 3;
          const iWidth = icicleSpacing - 4;
          const tipX = iBaseX + iWidth * 0.5 + ((iHash % 5) - 2);
          const tipY = screenY + ts + iLen;

          // Translucent sharp icicle body
          const icicleGrad = ctx.createLinearGradient(iBaseX, screenY + ts, tipX, tipY);
          icicleGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
          icicleGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.65)');
          icicleGrad.addColorStop(1, 'rgba(186, 230, 253, 0.35)');

          ctx.fillStyle = icicleGrad;
          ctx.beginPath();
          ctx.moveTo(iBaseX, screenY + ts);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(iBaseX + iWidth, screenY + ts);
          ctx.closePath();
          ctx.fill();

          // Central razor-sharp specular spine highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(iBaseX + iWidth * 0.5, screenY + ts);
          ctx.lineTo(tipX, tipY - 2);
          ctx.stroke();

          // Glistening tip water drip drop
          if (iHash % 4 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(tipX, tipY + 1, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

    } else if (themeId === 'atlantis') {
      // ======================================================================
      // SUNKEN TEMPLE: FLUTED MARBLE PILLARS, IONIC CAPITALS & ATTIC BASES
      // ======================================================================

      if (isPillar) {
        // --- COMPLEX GRECO-ROMAN PILLAR DESIGN ---
        // Pillar Shaft Base Marble
        const colGrad = ctx.createLinearGradient(screenX, screenY, screenX + ts, screenY);
        colGrad.addColorStop(0, '#062d3d');
        colGrad.addColorStop(0.5, '#0e465c');
        colGrad.addColorStop(1, '#062d3d');
        ctx.fillStyle = colGrad;
        ctx.fillRect(screenX, screenY, ts, ts);

        // Fluted Vertical Grooves (4 flutes giving deep cylindrical relief)
        const flutes = 4;
        const fluteW = ts / flutes;
        for (let f = 0; f < flutes; f++) {
          const fx = screenX + f * fluteW;
          // Shadow channel
          ctx.fillStyle = 'rgba(2, 24, 36, 0.6)';
          ctx.fillRect(fx + 1, screenY, fluteW * 0.45, ts);
          // Highlight ridge
          ctx.fillStyle = 'rgba(103, 232, 249, 0.35)';
          ctx.fillRect(fx + fluteW * 0.45, screenY, fluteW * 0.45, ts);
        }

        // Exposed Left/Right Pillar Edge Highlights
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 0.5, screenY);
        ctx.lineTo(screenX + 0.5, screenY + ts);
        ctx.moveTo(screenX + ts - 0.5, screenY);
        ctx.lineTo(screenX + ts - 0.5, screenY + ts);
        ctx.stroke();

        // TOP OF PILLAR: ORNATE IONIC CAPITAL
        if (topOpen) {
          // Abacus slab extending slightly outward
          ctx.fillStyle = '#0e4a60';
          ctx.fillRect(screenX - 3, screenY - 5, ts + 6, 5);
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(screenX - 3, screenY - 5, ts + 6, 5);

          // Ionic Volute Scroll Left
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(screenX, screenY - 1, 3.5, 0, Math.PI * 2);
          ctx.fill();
          // Ionic Volute Scroll Right
          ctx.beginPath();
          ctx.arc(screenX + ts, screenY - 1, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Central decorative carved rosette
          ctx.fillStyle = '#a5f3fc';
          ctx.fillRect(screenX + ts * 0.5 - 2, screenY - 3, 4, 3);
        }

        // BOTTOM OF PILLAR: STEPPED ATTIC PLINTH BASE
        if (bottomOpen) {
          // Torus molding ring
          ctx.fillStyle = '#0a3a4d';
          ctx.fillRect(screenX - 2, screenY + ts, ts + 4, 4);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX - 2, screenY + ts, ts + 4, 4);

          // Stepped square plinth base
          ctx.fillStyle = '#062635';
          ctx.fillRect(screenX - 4, screenY + ts + 4, ts + 8, 4);
          ctx.strokeStyle = '#06b6d4';
          ctx.strokeRect(screenX - 4, screenY + ts + 4, ts + 8, 4);
        }

      } else {
        // --- SUNKEN TEMPLE ASHLAR MASONRY WALL ---
        ctx.fillStyle = '#0c384a';
        ctx.fillRect(screenX, screenY, ts, ts);

        // Beveled Stone Border
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

        // Ancient Greek Key / Labyrinth Meander Carving
        if (hash % 2 === 0) {
          ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.strokeRect(screenX + 6, screenY + 6, ts - 12, ts - 12);
          ctx.moveTo(screenX + 10, screenY + 10);
          ctx.lineTo(screenX + ts - 10, screenY + 10);
          ctx.lineTo(screenX + ts - 10, screenY + ts - 10);
          ctx.stroke();
        } else {
          // Glowing Sunken Cyan Rune
          ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.beginPath();
          ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Top edge patina moss / water caustics
        if (topOpen) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(screenX + 2, screenY, ts - 4, 2.5);
        }
      }

    } else if (themeId === 'cybercity') {
      // ======================================================================
      // NEO-CYBER METROPOLIS: CARBON PLATES, CIRCUIT TRACES & CAUTION CHEVRONS
      // ======================================================================

      // Dark Carbon Composite Plate
      ctx.fillStyle = '#17112c';
      ctx.fillRect(screenX, screenY, ts, ts);

      // Neon Magenta Outer Cyber Border
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      // Printed Circuit Traces
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (hash % 2 === 0) {
        ctx.moveTo(screenX + 4, screenY + ts * 0.5);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts * 0.5);
        ctx.lineTo(screenX + ts * 0.75, screenY + 5);
      } else {
        ctx.moveTo(screenX + ts * 0.5, screenY + ts - 5);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts * 0.35);
        ctx.lineTo(screenX + ts - 5, screenY + ts * 0.35);
      }
      ctx.stroke();

      // Microchip Logic Node Pad
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(screenX + ts * 0.5 - 2, screenY + ts * 0.5 - 2, 4, 4);

      // Hexagonal Bolt Rivets in Corners
      ctx.fillStyle = '#64748b';
      [ [4, 4], [ts - 5, 4], [4, ts - 5], [ts - 5, ts - 5] ].forEach(([bx, by]) => {
        ctx.fillRect(screenX + bx, screenY + by, 2, 2);
      });

      // Top Edge: Industrial Caution Chevron Stripes
      if (topOpen) {
        ctx.fillStyle = '#f59e0b'; // Amber Hazard
        ctx.fillRect(screenX, screenY, ts, 3.5);
        // Diagonal black hash stripes
        ctx.fillStyle = '#0f172a';
        for (let s = 0; s < ts; s += 8) {
          ctx.beginPath();
          ctx.moveTo(screenX + s, screenY);
          ctx.lineTo(screenX + s + 4, screenY);
          ctx.lineTo(screenX + s + 2, screenY + 3.5);
          ctx.lineTo(screenX + s - 2, screenY + 3.5);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Bottom Edge: Dangling Fiber Optic / Cyber Cables
      if (bottomOpen) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + ts);
        ctx.quadraticCurveTo(screenX + ts * 0.5, screenY + ts + 8, screenX + ts - 6, screenY + ts);
        ctx.stroke();

        // Blinking LED status indicator on cable
        const ledBlink = Math.sin(now * 0.006 + hash) > 0;
        ctx.fillStyle = ledBlink ? '#ec4899' : '#06b6d4';
        ctx.fillRect(screenX + ts * 0.5 - 1.5, screenY + ts + 6, 3, 3);
      }

    } else if (themeId === 'forest') {
      // ======================================================================
      // MYSTIC GROVE: MOSSY STONEWORK, LUSH GRASS & ROOT TENDRILS
      // ======================================================================

      // Weathered Ancient Stone
      ctx.fillStyle = '#0a2f1e';
      ctx.fillRect(screenX, screenY, ts, ts);

      // Emerald Moss Border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      // Embedded Moss Texture / Mortar Lines
      ctx.fillStyle = '#041c11';
      ctx.fillRect(screenX + 4, screenY + ts * 0.5, ts - 8, 1);
      ctx.fillRect(screenX + ts * 0.5, screenY + 3, 1, ts * 0.5 - 3);

      // Top Edge: Lush Grass & Turf
      if (topOpen) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 3);
        // Grass tufts
        for (let g = 0; g <= ts; g += 6) {
          ctx.lineTo(screenX + g + 3, screenY - 3);
          ctx.lineTo(screenX + g + 6, screenY + 3);
        }
        ctx.closePath();
        ctx.fill();

        // Tiny Flower Sprouts
        if (hash % 3 === 0) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(screenX + ts * 0.5, screenY - 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bottom Edge: Hanging Banyan Vines & Roots
      if (bottomOpen) {
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + ts);
        ctx.quadraticCurveTo(screenX + 5, screenY + ts + 8, screenX + 10, screenY + ts + 13);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screenX + ts - 8, screenY + ts);
        ctx.quadraticCurveTo(screenX + ts - 6, screenY + ts + 6, screenX + ts - 11, screenY + ts + 10);
        ctx.stroke();
      }

    } else if (themeId === 'celestial') {
      // ======================================================================
      // CELESTIAL SANCTUARY: OBSIDIAN MARBLE & RADIANT GOLD INLAYS
      // ======================================================================

      // Polished Obsidian Marble
      ctx.fillStyle = '#221552';
      ctx.fillRect(screenX, screenY, ts, ts);

      // Radiant Gold Inlaid Border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      // Astral Star & Sacred Compass Inlay
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX + ts * 0.5, screenY + 6);
      ctx.lineTo(screenX + ts * 0.5, screenY + ts - 6);
      ctx.moveTo(screenX + 6, screenY + ts * 0.5);
      ctx.lineTo(screenX + ts - 6, screenY + ts * 0.5);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Top Edge: Divine Floating Golden Crest
      if (topOpen) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(screenX + 3, screenY - 2, ts - 6, 2.5);
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY - 2, 3, Math.PI, 0);
        ctx.fill();
      }

      // Bottom Edge: Crystalline Gold Prism Stalactites
      if (bottomOpen) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 3, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 9);
        ctx.lineTo(screenX + ts * 0.5 + 3, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawHazardTile(ctx, screenX, screenY, ts, c, r, now) {
    const themeId = this.theme.id;
    ctx.save();

    if (themeId === 'glacial') {
      // Razor-sharp Translucent Ice Stalagmites
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(screenX + 3, screenY + ts);
      ctx.lineTo(screenX + ts * 0.35, screenY + 4);
      ctx.lineTo(screenX + ts * 0.65, screenY + ts);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(screenX + ts * 0.45, screenY + ts);
      ctx.lineTo(screenX + ts * 0.75, screenY + 7);
      ctx.lineTo(screenX + ts - 3, screenY + ts);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else if (themeId === 'atlantis') {
      // Bronze Sunken Trident / Urchin Spines
      ctx.fillStyle = '#0e7490';
      ctx.fillRect(screenX + ts * 0.5 - 2, screenY + 8, 4, ts - 8);
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(screenX + ts * 0.5, screenY + 4);
      ctx.lineTo(screenX + ts * 0.5 - 6, screenY + 14);
      ctx.lineTo(screenX + ts * 0.5 + 6, screenY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#67e8f9';
      ctx.stroke();

    } else if (themeId === 'cybercity') {
      // High-Voltage Plasma Laser Arc Trap
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screenX + 2, screenY + 8, 6, ts - 8);
      ctx.fillRect(screenX + ts - 8, screenY + 8, 6, ts - 8);

      ctx.fillStyle = '#ec4899';
      ctx.fillRect(screenX + 2, screenY + 6, 6, 3);
      ctx.fillRect(screenX + ts - 8, screenY + 6, 6, 3);

      // Crackling violent plasma lightning arc
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX + 6, screenY + 7);
      const midJitter = (Math.random() - 0.5) * 8;
      ctx.lineTo(screenX + ts * 0.5, screenY + 7 + midJitter);
      ctx.lineTo(screenX + ts - 6, screenY + 7);
      ctx.stroke();

    } else if (themeId === 'celestial') {
      // Solar Sacred Lances
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();

    } else {
      // Forest: Thorny Briar Spikes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 6);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawJumpPadTile(ctx, screenX, screenY, ts, c, r, now) {
    const themeId = this.theme.id;
    ctx.save();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(screenX + 2, screenY + ts - 10, ts - 4, 10);

    if (themeId === 'cybercity') {
      // Maglev Repulsor Pad with animated glowing chevron arrows
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 2, screenY + ts - 10, ts - 4, 10);

      const pulse = Math.sin(now * 0.008) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(6, 182, 212, ${pulse})`;
      ctx.beginPath();
      ctx.moveTo(screenX + ts * 0.5, screenY + ts - 16);
      ctx.lineTo(screenX + ts * 0.25, screenY + ts - 10);
      ctx.lineTo(screenX + ts * 0.75, screenY + ts - 10);
      ctx.closePath();
      ctx.fill();

    } else if (themeId === 'glacial') {
      // Arctic Frost Geyser Vent
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX + 4, screenY + ts - 10, ts - 8, 10);
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 10, 6, Math.PI, 0);
      ctx.fill();

    } else if (themeId === 'atlantis') {
      // Hydro-kinetic Vortex Spring
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(screenX + 4, screenY + ts - 10, ts - 8, 10);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 8, 7, 0, Math.PI);
      ctx.stroke();

    } else {
      // Classic Kinetic Jump Spring
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX + 4, screenY + ts - 8, ts - 8, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screenX + 8, screenY + ts - 11, ts - 16, 3);
    }

    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportW, this.viewportH);
    const offset = this.getOffset();
    const now = performance.now();

    // 1. High-Fidelity Parallax Realm Background (Cityscape, Aurora, Underwater, Canopy, Nebula)
    this.drawBackground(ctx, offset, now);

    // Outer Maze Floating Frame & Glow (anchors the labyrinth in center screen)
    ctx.save();
    ctx.strokeStyle = this.theme.tileBorder;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.theme.tileBorder;
    ctx.shadowBlur = 18;
    ctx.strokeRect(offset.x - 1, offset.y - 1, this.maze.width + 2, this.maze.height + 2);
    ctx.restore();

    // 2. Weather Particles
    this.weatherParticles.forEach(wp => {
      ctx.save();
      ctx.globalAlpha = wp.alpha;
      ctx.fillStyle = wp.color;
      ctx.beginPath();
      ctx.arc(wp.x - this.camera.x + offset.x, wp.y - this.camera.y + offset.y, wp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Render Sophisticated Maze Grid & Realm Tiles
    const ts = this.maze.tileSize;
    const startCol = Math.max(0, Math.floor(this.camera.x / ts));
    const endCol = Math.min(this.maze.cols - 1, Math.ceil((this.camera.x + this.viewportW) / ts));
    const startRow = Math.max(0, Math.floor(this.camera.y / ts));
    const endRow = Math.min(this.maze.rows - 1, Math.ceil((this.camera.y + this.viewportH) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.maze.grid[r][c];
        const screenX = c * ts - this.camera.x + offset.x;
        const screenY = r * ts - this.camera.y + offset.y;

        if (tile === 1) {
          this.drawSolidTile(ctx, screenX, screenY, ts, c, r, now);
        } else if (tile === 2) {
          this.drawHazardTile(ctx, screenX, screenY, ts, c, r, now);
        } else if (tile === 3) {
          this.drawJumpPadTile(ctx, screenX, screenY, ts, c, r, now);
        }
      }
    }

    // 4. Render Keys / Relic Orbs
    this.maze.keys.forEach(k => {
      if (!k.collected) {
        const kx = k.x - this.camera.x + offset.x;
        const ky = k.y - this.camera.y + offset.y + Math.sin(now * 0.004) * 4;

        ctx.save();
        // Golden Key Glow
        const kGlow = ctx.createRadialGradient(kx, ky, 2, kx, ky, 25);
        kGlow.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        kGlow.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
        kGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = kGlow;
        ctx.beginPath();
        ctx.arc(kx, ky, 25, 0, Math.PI * 2);
        ctx.fill();

        // Key Shape
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(kx, ky - 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(kx - 1.5, ky, 3, 10);
        ctx.fillRect(kx + 1, ky + 4, 4, 2);
        ctx.fillRect(kx + 1, ky + 7, 3, 2);

        ctx.restore();
      }
    });

    // 5. Render Exit Portal
    const portalX = this.maze.portal.x - this.camera.x + offset.x;
    const portalY = this.maze.portal.y - this.camera.y + offset.y;
    const allKeys = this.maze.keys.every(k => k.collected);

    ctx.save();
    const portalGlow = ctx.createRadialGradient(portalX, portalY, 4, portalX, portalY, 40);
    portalGlow.addColorStop(0, allKeys ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.4)');
    portalGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = portalGlow;
    ctx.beginPath();
    ctx.arc(portalX, portalY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Swirling portal ring
    const ringAngle = now * 0.003;
    ctx.strokeStyle = allKeys ? '#10b981' : '#f87171';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(portalX, portalY, 18, ringAngle, ringAngle + Math.PI * 1.5);
    ctx.stroke();

    ctx.strokeStyle = allKeys ? '#a7f3d0' : '#fca5a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(portalX, portalY, 12, -ringAngle, -ringAngle + Math.PI * 1.5);
    ctx.stroke();

    if (!allKeys) {
      // Custom Canvas-Drawn Metallic Padlock (Zero emojis, 100% custom vector asset)
      ctx.save();
      // Shackle
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(portalX, portalY - 2.5, 4.5, Math.PI, 0);
      ctx.stroke();

      // Padlock Body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(portalX - 6.5, portalY - 2, 13, 10, 2);
      } else {
        ctx.rect(portalX - 6.5, portalY - 2, 13, 10);
      }
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Keyhole
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.arc(portalX, portalY + 1.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(portalX - 0.9, portalY + 1.5, 1.8, 3.2);
      ctx.restore();
    }
    ctx.restore();

    // 6. Draw Player
    this.player.draw(ctx, this.camera, this.theme, offset);

    // 7. Draw Particles
    this.particles.draw(ctx, this.camera, offset);
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new MazeGame();
});
