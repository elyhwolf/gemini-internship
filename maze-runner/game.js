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
    name: 'MYSTIC FOREST',
    range: 'Levels 1–20',
    dotColor: '#10b981',
    bgGradTop: '#041810',
    bgGradBottom: '#07261a',
    fogColor: 'rgba(16, 185, 129, 0.08)',
    tileFill: '#0d3824',
    tileBorder: '#10b981',
    tileAccent: '#34d399',
    particleType: 'leaf',
    particleColor: ['#10b981', '#34d399', '#6ee7b7', '#fef08a']
  },
  {
    name: 'CRYSTAL CAVERNS',
    range: 'Levels 21–40',
    dotColor: '#a855f7',
    bgGradTop: '#0a0a1a',
    bgGradBottom: '#180d2e',
    fogColor: 'rgba(168, 85, 247, 0.08)',
    tileFill: '#20133b',
    tileBorder: '#a855f7',
    tileAccent: '#c084fc',
    particleType: 'gem',
    particleColor: ['#a855f7', '#c084fc', '#38bdf8', '#818cf8']
  },
  {
    name: 'SUNKEN ATLANTIS',
    range: 'Levels 41–60',
    dotColor: '#06b6d4',
    bgGradTop: '#031424',
    bgGradBottom: '#082f49',
    fogColor: 'rgba(6, 182, 212, 0.08)',
    tileFill: '#0e3b52',
    tileBorder: '#06b6d4',
    tileAccent: '#67e8f9',
    particleType: 'bubble',
    particleColor: ['#06b6d4', '#67e8f9', '#a5f3fc', '#ffffff']
  },
  {
    name: 'VOLCANIC CITADEL',
    range: 'Levels 61–80',
    dotColor: '#f97316',
    bgGradTop: '#1a0808',
    bgGradBottom: '#2d0f0d',
    fogColor: 'rgba(249, 115, 22, 0.08)',
    tileFill: '#421612',
    tileBorder: '#f97316',
    tileAccent: '#fdba74',
    particleType: 'ember',
    particleColor: ['#f97316', '#ef4444', '#fbbf24', '#f59e0b']
  },
  {
    name: 'CELESTIAL PEAKS',
    range: 'Levels 81–100',
    dotColor: '#fbbf24',
    bgGradTop: '#0f0c24',
    bgGradBottom: '#1e144a',
    fogColor: 'rgba(251, 191, 36, 0.08)',
    tileFill: '#2a1f5e',
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
        x: playerSpawn.x * TILE_SIZE + TILE_SIZE / 2,
        y: playerSpawn.y * TILE_SIZE + TILE_SIZE / 2
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

  draw(ctx, camera) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
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

    // Movement tuning
    this.speed = 4.4;
    this.accel = 0.85;
    this.friction = 0.82;
    this.gravity = 0.48;
    this.jumpForce = -9.2;
    this.doubleJumpForce = -8.4;
    this.wallSlideMax = 1.8;

    this.grounded = false;
    this.canDoubleJump = true;
    this.wallSliding = false;
    this.wallDir = 0; // -1 for left wall, 1 for right wall
    this.facing = 1; // 1 right, -1 left

    this.trail = [];
  }

  update(keys, maze, particles, theme) {
    // Left / Right movement
    let moveDir = 0;
    if (keys.left) moveDir -= 1;
    if (keys.right) moveDir += 1;

    if (moveDir !== 0) {
      this.facing = moveDir;
      this.vx += moveDir * this.accel;
      if (Math.abs(this.vx) > this.speed) {
        this.vx = moveDir * this.speed;
      }
      // Running dust particles
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

    // Wall Detection
    const checkWallLeft = this.checkSolid(this.x - 2, this.y + 4, maze) || this.checkSolid(this.x - 2, this.y + this.h - 4, maze);
    const checkWallRight = this.checkSolid(this.x + this.w + 2, this.y + 4, maze) || this.checkSolid(this.x + this.w + 2, this.y + this.h - 4, maze);

    this.wallSliding = false;
    this.wallDir = 0;
    if (!this.grounded && this.vy > 0) {
      if (checkWallLeft && moveDir === -1) {
        this.wallSliding = true;
        this.wallDir = -1;
      } else if (checkWallRight && moveDir === 1) {
        this.wallSliding = true;
        this.wallDir = 1;
      }
    }

    // Gravity & Wall Sliding Speed
    if (this.wallSliding) {
      this.vy = Math.min(this.vy + this.gravity * 0.3, this.wallSlideMax);
      // Wall slide sparks
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
      if (this.vy > 14) this.vy = 14; // terminal velocity
    }

    // Jump Input
    if (keys.jumpPressed) {
      keys.jumpPressed = false;

      if (this.grounded) {
        // Normal Jump
        this.vy = this.jumpForce;
        this.grounded = false;
        this.canDoubleJump = true;
        sfx.playJump(false);
        particles.emit(this.x + this.w / 2, this.y + this.h, 6, {
          angle: -Math.PI / 2, spread: 1.2,
          speedMin: 1.5, speedMax: 4,
          colors: theme.particleColor
        });
      } else if (this.wallSliding || (checkWallLeft && keys.left) || (checkWallRight && keys.right)) {
        // Wall Jump
        const jumpAwayDir = checkWallLeft ? 1 : -1;
        this.vx = jumpAwayDir * 5.2;
        this.vy = this.jumpForce * 0.95;
        this.facing = jumpAwayDir;
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
        this.vy = this.doubleJumpForce;
        this.canDoubleJump = false;
        sfx.playJump(true);
        particles.emit(this.x + this.w / 2, this.y + this.h / 2, 10, {
          speedMin: 2, speedMax: 5,
          colors: ['#38bdf8', '#818cf8', '#c084fc', '#ffffff']
        });
      }
    }

    // Horizontal Movement & Collisions
    this.x += this.vx;
    this.resolveHorizontalCollision(maze);

    // Vertical Movement & Collisions
    this.y += this.vy;
    this.resolveVerticalCollision(maze, particles, theme);

    // Update Motion Trail
    this.trail.push({ x: this.x + this.w / 2, y: this.y + this.h / 2, alpha: 0.6 });
    if (this.trail.length > 5) this.trail.shift();
    this.trail.forEach(t => t.alpha *= 0.85);
  }

  checkSolid(px, py, maze) {
    const tx = Math.floor(px / maze.tileSize);
    const ty = Math.floor(py / maze.tileSize);
    if (tx < 0 || tx >= maze.cols || ty < 0 || ty >= maze.rows) return true;
    return maze.grid[ty][tx] === 1;
  }

  resolveHorizontalCollision(maze) {
    const ts = maze.tileSize;
    const startX = Math.floor(this.x / ts);
    const endX = Math.floor((this.x + this.w) / ts);
    const startY = Math.floor(this.y / ts);
    const endY = Math.floor((this.y + this.h) / ts);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        if (tx >= 0 && tx < maze.cols && ty >= 0 && ty < maze.rows) {
          if (maze.grid[ty][tx] === 1) {
            if (this.vx > 0) {
              this.x = tx * ts - this.w;
              this.vx = 0;
            } else if (this.vx < 0) {
              this.x = (tx + 1) * ts;
              this.vx = 0;
            }
          }
        }
      }
    }
  }

  resolveVerticalCollision(maze, particles, theme) {
    const ts = maze.tileSize;
    const startX = Math.floor(this.x / ts);
    const endX = Math.floor((this.x + this.w) / ts);
    const startY = Math.floor(this.y / ts);
    const endY = Math.floor((this.y + this.h) / ts);

    let onGround = false;

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        if (tx >= 0 && tx < maze.cols && ty >= 0 && ty < maze.rows) {
          if (maze.grid[ty][tx] === 1) {
            if (this.vy > 0) {
              this.y = ty * ts - this.h;
              // Landing impact dust
              if (!this.grounded && this.vy > 4) {
                particles.emit(this.x + this.w / 2, this.y + this.h, 5, {
                  angle: -Math.PI / 2, spread: 1.5,
                  speedMin: 1, speedMax: 3,
                  colors: theme.particleColor
                });
              }
              this.vy = 0;
              onGround = true;
            } else if (this.vy < 0) {
              this.y = (ty + 1) * ts;
              this.vy = 0;
            }
          }
        }
      }
    }

    this.grounded = onGround;
    if (this.grounded) {
      this.canDoubleJump = true;
    }
  }

  draw(ctx, camera, theme) {
    // Draw motion trail
    this.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = theme.tileBorder;
      ctx.beginPath();
      ctx.arc(t.x - camera.x, t.y - camera.y, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    const drawX = this.x - camera.x;
    const drawY = this.y - camera.y;

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
  constructor(game) {
    this.game = game;
    this.songs = window.MAZE_SONGS || [];
    this.currentLevel = 1;
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

    this.init();
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
    if (this.titleEl) this.titleEl.textContent = `Song ${level}: ${song.title}`;
    if (this.authorEl) this.authorEl.textContent = song.author;
    if (this.ytLink) this.ytLink.href = `https://music.youtube.com/watch?v=${song.videoId}`;

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

    // YouTube Music Player
    this.music = new MazeMusicPlayer(this);

    // Progress State
    this.currentLevel = parseInt(localStorage.getItem('elywolf_maze_level') || '1', 10);
    this.maxUnlockedLevel = parseInt(localStorage.getItem('elywolf_maze_max_unlocked') || '1', 10);
    if (isNaN(this.currentLevel) || this.currentLevel < 1) this.currentLevel = 1;
    if (this.currentLevel > 100) this.currentLevel = 100;
    if (this.maxUnlockedLevel < this.currentLevel) this.maxUnlockedLevel = this.currentLevel;

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
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        this.keys.up = true;
        this.keys.jumpPressed = true;
      }

      // Reset
      if (e.key === 'r' || e.key === 'R') {
        this.deaths++;
        this.loadLevel(this.currentLevel);
      }

      // Minimap Toggle
      if (e.key === 'm' || e.key === 'M') {
        this.toggleMinimap();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
        this.keys.up = false;
      }
    });

    // On-screen HUD buttons
    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) btnRestart.addEventListener('click', () => {
      this.deaths++;
      this.loadLevel(this.currentLevel);
    });

    const btnMinimap = document.getElementById('btnMinimap');
    if (btnMinimap) btnMinimap.addEventListener('click', () => this.toggleMinimap());

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
      this.renderMinimap();
      this.minimapOverlay.classList.remove('hidden');
    } else {
      this.minimapOverlay.classList.add('hidden');
    }
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
      btn.innerHTML = `
        <span class="lvl-num">${l}</span>
        <span class="lvl-song-name">🎵 ${song.title}</span>
        <span class="lvl-stars">${isLocked ? '🔒' : '★★★'}</span>
      `;

      if (!isLocked) {
        btn.onclick = () => {
          this.loadLevel(l);
          if (this.levelSelectModal) this.levelSelectModal.classList.add('hidden');
        };
      }

      this.levelsGrid.appendChild(btn);
    }
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
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

    // Camera follow player smoothly
    const targetCamX = this.player.x + this.player.w / 2 - this.viewportW / 2;
    const targetCamY = this.player.y + this.player.h / 2 - this.viewportH / 2;

    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

    // Clamp camera within maze boundaries
    this.camera.x = Math.max(0, Math.min(this.maze.width - this.viewportW, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.maze.height - this.viewportH, this.camera.y));

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

    // Check Hazard Collisions (Spikes)
    const px = this.player.x + this.player.w / 2;
    const py = this.player.y + this.player.h / 2;
    const tx = Math.floor(px / this.maze.tileSize);
    const ty = Math.floor(py / this.maze.tileSize);

    if (tx >= 0 && tx < this.maze.cols && ty >= 0 && ty < this.maze.rows) {
      if (this.maze.grid[ty][tx] === 2) {
        // Hit Spike
        sfx.playDeath();
        this.deaths++;
        this.particles.emit(px, py, 20, {
          speedMin: 2, speedMax: 6,
          colors: ['#ef4444', '#f87171', '#fff']
        });
        this.player.x = this.maze.playerSpawn.x;
        this.player.y = this.maze.playerSpawn.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.updateHUD();
      } else if (this.maze.grid[ty][tx] === 3) {
        // Jump Pad boost
        this.player.vy = -14.5;
        this.player.canDoubleJump = true;
        sfx.playJump(true);
        this.particles.emit(px, py + 10, 10, {
          angle: -Math.PI / 2, spread: 0.8,
          speedMin: 3, speedMax: 8,
          colors: ['#38bdf8', '#818cf8', '#fff']
        });
      }
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

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportW, this.viewportH);

    // 1. Parallax Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.viewportH);
    bgGrad.addColorStop(0, this.theme.bgGradTop);
    bgGrad.addColorStop(1, this.theme.bgGradBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.viewportW, this.viewportH);

    // Parallax Ambient Canopy / Mountain Hills
    ctx.save();
    ctx.fillStyle = this.theme.tileFill;
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 6; i++) {
      const hillX = ((i * 300) - (this.camera.x * 0.2) % 300);
      ctx.beginPath();
      ctx.arc(hillX, this.viewportH + 60, 220, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 2. Weather Particles
    this.weatherParticles.forEach(wp => {
      ctx.save();
      ctx.globalAlpha = wp.alpha;
      ctx.fillStyle = wp.color;
      ctx.beginPath();
      ctx.arc(wp.x - this.camera.x, wp.y - this.camera.y, wp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Render Maze Grid & Tiles
    const ts = this.maze.tileSize;
    const startCol = Math.max(0, Math.floor(this.camera.x / ts));
    const endCol = Math.min(this.maze.cols - 1, Math.ceil((this.camera.x + this.viewportW) / ts));
    const startRow = Math.max(0, Math.floor(this.camera.y / ts));
    const endRow = Math.min(this.maze.rows - 1, Math.ceil((this.camera.y + this.viewportH) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.maze.grid[r][c];
        const screenX = c * ts - this.camera.x;
        const screenY = r * ts - this.camera.y;

        if (tile === 1) {
          // Solid Block
          ctx.save();
          ctx.fillStyle = this.theme.tileFill;
          ctx.fillRect(screenX, screenY, ts, ts);

          // Glowing edge borders
          ctx.strokeStyle = this.theme.tileBorder;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

          // Inner bevel highlight
          ctx.fillStyle = this.theme.tileAccent;
          ctx.globalAlpha = 0.15;
          ctx.fillRect(screenX + 2, screenY + 2, ts - 4, 3);
          ctx.restore();
        } else if (tile === 2) {
          // Hazard Spike
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(screenX + 4, screenY + ts);
          ctx.lineTo(screenX + ts / 2, screenY + 6);
          ctx.lineTo(screenX + ts - 4, screenY + ts);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (tile === 3) {
          // Jump Pad
          ctx.save();
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(screenX + 4, screenY + ts - 8, ts - 8, 8);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(screenX + 8, screenY + ts - 11, ts - 16, 3);
          ctx.restore();
        }
      }
    }

    // 4. Render Keys / Relic Orbs
    const now = performance.now();
    this.maze.keys.forEach(k => {
      if (!k.collected) {
        const kx = k.x - this.camera.x;
        const ky = k.y - this.camera.y + Math.sin(now * 0.004) * 4;

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
    const portalX = this.maze.portal.x - this.camera.x;
    const portalY = this.maze.portal.y - this.camera.y;
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
      // Locked Icon
      ctx.fillStyle = '#f87171';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('🔒', portalX, portalY + 4);
    }
    ctx.restore();

    // 6. Draw Player
    this.player.draw(ctx, this.camera, this.theme);

    // 7. Draw Particles
    this.particles.draw(ctx, this.camera);
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  new MazeGame();
});
