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
  // Sector 1: Nature & Earth (Levels 1–20)
  {
    id: 'forest',
    name: 'MYSTIC GROVE',
    subName: 'Ancient Moss & Emerald Canopy',
    range: 'Levels 1–5',
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
    id: 'autumn',
    name: 'GOLDEN CANOPY',
    subName: 'Amber Woods & Maple Leaves',
    range: 'Levels 6–10',
    dotColor: '#f59e0b',
    bgGradTop: '#180b03',
    bgGradBottom: '#2d1506',
    fogColor: 'rgba(245, 158, 11, 0.08)',
    tileFill: '#2a1609',
    tileBorder: '#f59e0b',
    tileAccent: '#fbbf24',
    particleType: 'leaf',
    particleColor: ['#f59e0b', '#d97706', '#ef4444', '#fde047']
  },
  {
    id: 'cavern',
    name: 'CRYSTAL GROTTO',
    subName: 'Amethyst Geodes & Violet Caves',
    range: 'Levels 11–15',
    dotColor: '#c084fc',
    bgGradTop: '#0b0416',
    bgGradBottom: '#1a0933',
    fogColor: 'rgba(192, 132, 252, 0.08)',
    tileFill: '#1b0d30',
    tileBorder: '#c084fc',
    tileAccent: '#e879f9',
    particleType: 'gem',
    particleColor: ['#c084fc', '#e879f9', '#a855f7', '#ffffff']
  },
  {
    id: 'desert',
    name: 'SUNKEN DUNE',
    subName: 'Ancient Sandstone & Hieroglyphs',
    range: 'Levels 16–20',
    dotColor: '#eab308',
    bgGradTop: '#170e03',
    bgGradBottom: '#2e1b07',
    fogColor: 'rgba(234, 179, 8, 0.08)',
    tileFill: '#291b0c',
    tileBorder: '#eab308',
    tileAccent: '#fde047',
    particleType: 'sand',
    particleColor: ['#eab308', '#ca8a04', '#fef08a', '#d97706']
  },

  // Sector 2: Frost & Fire (Levels 21–40)
  {
    id: 'glacial',
    name: 'GLACIAL CAVERNS',
    subName: 'Aurora Borealis & Frost Spikes',
    range: 'Levels 21–25',
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
    id: 'deepfreeze',
    name: 'BLIZZARD CLIFFS',
    subName: 'Permafrost Crags & Razor Ice',
    range: 'Levels 26–30',
    dotColor: '#0284c7',
    bgGradTop: '#020b18',
    bgGradBottom: '#051a2d',
    fogColor: 'rgba(2, 132, 199, 0.08)',
    tileFill: '#081f33',
    tileBorder: '#0284c7',
    tileAccent: '#38bdf8',
    particleType: 'snow',
    particleColor: ['#0284c7', '#38bdf8', '#bae6fd', '#ffffff']
  },
  {
    id: 'magma',
    name: 'VOLCANIC FORGE',
    subName: 'Basalt Stone & Molten Lava Veins',
    range: 'Levels 31–35',
    dotColor: '#f97316',
    bgGradTop: '#1a0601',
    bgGradBottom: '#330d03',
    fogColor: 'rgba(249, 115, 22, 0.08)',
    tileFill: '#240f07',
    tileBorder: '#f97316',
    tileAccent: '#fdba74',
    particleType: 'ember',
    particleColor: ['#f97316', '#ea580c', '#fb923c', '#ffedd5']
  },
  {
    id: 'inferno',
    name: 'CRIMSON ABYSS',
    subName: 'Obsidian Slabs & Ruby Torrents',
    range: 'Levels 36–40',
    dotColor: '#ef4444',
    bgGradTop: '#1a0303',
    bgGradBottom: '#330606',
    fogColor: 'rgba(239, 68, 68, 0.09)',
    tileFill: '#1a0707',
    tileBorder: '#ef4444',
    tileAccent: '#fca5a5',
    particleType: 'cinder',
    particleColor: ['#ef4444', '#dc2626', '#f87171', '#fee2e2']
  },

  // Sector 3: Ocean & Steel (Levels 41–60)
  {
    id: 'atlantis',
    name: 'SUNKEN TEMPLE',
    subName: 'Classical Fluted Marble & Caustics',
    range: 'Levels 41–45',
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
    id: 'coral',
    name: 'BIOLUMINESCENT REEF',
    subName: 'Abyssal Glow & Turquoise Coral',
    range: 'Levels 46–50',
    dotColor: '#14b8a6',
    bgGradTop: '#02161a',
    bgGradBottom: '#052f36',
    fogColor: 'rgba(20, 184, 166, 0.08)',
    tileFill: '#07282b',
    tileBorder: '#14b8a6',
    tileAccent: '#5eead4',
    particleType: 'spore',
    particleColor: ['#14b8a6', '#2dd4bf', '#a7f3d0', '#f0fdfa']
  },
  {
    id: 'steampunk',
    name: 'BRASS CLOCKWORK',
    subName: 'Victorian Gears & Copper Boilers',
    range: 'Levels 51–55',
    dotColor: '#d97706',
    bgGradTop: '#140c04',
    bgGradBottom: '#2b1807',
    fogColor: 'rgba(217, 119, 6, 0.08)',
    tileFill: '#221509',
    tileBorder: '#d97706',
    tileAccent: '#fde68a',
    particleType: 'steam',
    particleColor: ['#d97706', '#b45309', '#fde68a', '#e2e8f0']
  },
  {
    id: 'dungeon',
    name: 'IRON CITADEL',
    subName: 'Gothic Fortress Masonry & Chains',
    range: 'Levels 56–60',
    dotColor: '#a1a1aa',
    bgGradTop: '#0a0a0f',
    bgGradBottom: '#161622',
    fogColor: 'rgba(161, 161, 170, 0.08)',
    tileFill: '#18181b',
    tileBorder: '#71717a',
    tileAccent: '#e4e4e7',
    particleType: 'dust',
    particleColor: ['#a1a1aa', '#71717a', '#d4d4d8', '#ffffff']
  },

  // Sector 4: Cyber & Matrix (Levels 61–80)
  {
    id: 'cybercity',
    name: 'NEO-CYBER METROPOLIS',
    subName: 'Skyscrapers & Tech Circuits',
    range: 'Levels 61–65',
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
    id: 'matrix',
    name: 'SYNTH DATA MATRIX',
    subName: 'Phosphor Grids & Digital Streams',
    range: 'Levels 66–70',
    dotColor: '#22c55e',
    bgGradTop: '#011204',
    bgGradBottom: '#04260a',
    fogColor: 'rgba(34, 197, 94, 0.08)',
    tileFill: '#041c08',
    tileBorder: '#22c55e',
    tileAccent: '#86efac',
    particleType: 'matrix',
    particleColor: ['#22c55e', '#4ade80', '#16a34a', '#bbf7d0']
  },
  {
    id: 'acid',
    name: 'TOXIC REACTOR',
    subName: 'Corrosive Vats & Hazard Stripes',
    range: 'Levels 71–75',
    dotColor: '#84cc16',
    bgGradTop: '#0a1403',
    bgGradBottom: '#182907',
    fogColor: 'rgba(132, 204, 22, 0.08)',
    tileFill: '#142407',
    tileBorder: '#84cc16',
    tileAccent: '#bef264',
    particleType: 'acid',
    particleColor: ['#84cc16', '#a3e635', '#65a30d', '#d9f99d']
  },
  {
    id: 'void',
    name: 'DARK NEBULA',
    subName: 'Event Horizon & Warped Space',
    range: 'Levels 76–80',
    dotColor: '#8b5cf6',
    bgGradTop: '#080317',
    bgGradBottom: '#150730',
    fogColor: 'rgba(139, 92, 246, 0.08)',
    tileFill: '#130829',
    tileBorder: '#8b5cf6',
    tileAccent: '#c4b5fd',
    particleType: 'void',
    particleColor: ['#8b5cf6', '#a78bfa', '#6d28d9', '#ddd6fe']
  },

  // Sector 5: Astral & Singularity (Levels 81–100)
  {
    id: 'celestial',
    name: 'CELESTIAL SANCTUARY',
    subName: 'Cosmic Nebula & Divine Pillars',
    range: 'Levels 81–85',
    dotColor: '#fbbf24',
    bgGradTop: '#0a0522',
    bgGradBottom: '#190e47',
    fogColor: 'rgba(251, 191, 36, 0.08)',
    tileFill: '#221552',
    tileBorder: '#fbbf24',
    tileAccent: '#fde047',
    particleType: 'stardust',
    particleColor: ['#fbbf24', '#fde047', '#e0e7ff', '#c084fc']
  },
  {
    id: 'solar',
    name: 'SOLARIS PEAKS',
    subName: 'Coronal Flares & Radiant Marble',
    range: 'Levels 86–90',
    dotColor: '#f59e0b',
    bgGradTop: '#1a0c02',
    bgGradBottom: '#331804',
    fogColor: 'rgba(245, 158, 11, 0.08)',
    tileFill: '#2a1606',
    tileBorder: '#f59e0b',
    tileAccent: '#fef08a',
    particleType: 'solar',
    particleColor: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff']
  },
  {
    id: 'quantum',
    name: 'CHRONO NEXUS',
    subName: 'Spectral Shards & Temporal Rifts',
    range: 'Levels 91–95',
    dotColor: '#06b6d4',
    bgGradTop: '#031422',
    bgGradBottom: '#082840',
    fogColor: 'rgba(6, 182, 212, 0.08)',
    tileFill: '#0b2336',
    tileBorder: '#06b6d4',
    tileAccent: '#f43f5e',
    particleType: 'quantum',
    particleColor: ['#06b6d4', '#f43f5e', '#a855f7', '#67e8f9']
  },
  {
    id: 'infinity',
    name: 'OMEGA SINGULARITY',
    subName: 'Hyper-Geometry & Infinite Rainbows',
    range: 'Levels 96–100',
    dotColor: '#a78bfa',
    bgGradTop: '#040413',
    bgGradBottom: '#0f0f29',
    fogColor: 'rgba(167, 139, 250, 0.08)',
    tileFill: '#131326',
    tileBorder: '#a78bfa',
    tileAccent: '#38bdf8',
    particleType: 'rainbow',
    particleColor: ['#a78bfa', '#38bdf8', '#f43f5e', '#34d399', '#fde047']
  }
];

function getThemeForLevel(lvl) {
  const clamped = Math.max(1, Math.min(100, Math.floor(lvl || 1)));
  const index = Math.floor((clamped - 1) / 5);
  return THEMES[index] || THEMES[0];
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

// Retrieve local user identity for live maze runner multiplayer
function getMazeLocalUsername() {
  try {
    const u = localStorage.getItem('elywolf_arcade_session_user') || sessionStorage.getItem('elywolf_arcade_session_user');
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed && (parsed.displayName || parsed.email)) {
        return parsed.displayName || parsed.email.split('@')[0];
      }
    }
  } catch (e) {}
  let g = sessionStorage.getItem('elywolf_arcade_guest_id') || localStorage.getItem('elywolf_arcade_guest_id');
  if (!g) {
    g = `Guest #${Math.floor(1000 + Math.random() * 9000)}`;
    sessionStorage.setItem('elywolf_arcade_guest_id', g);
  }
  return g;
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

    // 1v1 Ranked Match Mode
    const urlParamsObj = new URLSearchParams(window.location.search);
    this.is1v1Match = urlParamsObj.get('mode') === '1v1' || urlParamsObj.get('mode') === 'live';
    this.matchOpponentName = (urlParamsObj.get('opp') || 'Opponent').trim();

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
    this.hudRunnersPill = document.getElementById('hudRunnersPill');
    this.hudRunnersText = document.getElementById('hudRunnersText');

    if (this.is1v1Match) {
      if (this.hudRunnersPill && this.hudRunnersText) {
        this.hudRunnersPill.classList.remove('hidden');
        this.hudRunnersText.textContent = `1v1 VS ${this.matchOpponentName.toUpperCase()} (+30 XP)`;
      }
      const btnLevelSelect = document.getElementById('btnLevelSelect');
      if (btnLevelSelect) btnLevelSelect.style.display = 'none';
    }

    // Live Multiplayer Synchronization State
    this.localPlayerName = getMazeLocalUsername();
    this.syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_arcade_sync') : null;
    this.remotePlayers = new Map();
    this.lastPosBroadcast = 0;
    this.initNetworkSync();

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());

    this.initControls();
    this.loadLevel(this.currentLevel);

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initNetworkSync() {
    if (this.syncChannel) {
      this.syncChannel.onmessage = (e) => {
        const data = e.data;
        if (!data || data.type !== 'MAZE_RUNNER_POS' || !data.name || data.name === this.localPlayerName) return;

        const existing = this.remotePlayers.get(data.name);
        if (existing) {
          existing.targetX = data.x;
          existing.targetY = data.y;
          existing.level = data.level;
          existing.vx = data.vx;
          existing.vy = data.vy;
          existing.facing = data.facing;
          existing.lastSeen = performance.now();
        } else {
          this.remotePlayers.set(data.name, {
            name: data.name,
            level: data.level,
            x: data.x,
            y: data.y,
            targetX: data.x,
            targetY: data.y,
            vx: data.vx,
            vy: data.vy,
            facing: data.facing,
            lastSeen: performance.now()
          });
        }
      };
    }

    // Polling presence cloud API every 4s for cross-device & cloud players
    const pollPresence = async () => {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.localPlayerName,
            displayName: this.localPlayerName,
            status: 'in-game',
            game: 'Maze Runner 100',
            mazePos: {
              level: this.currentLevel,
              x: Math.round(this.player ? this.player.x : 0),
              y: Math.round(this.player ? this.player.y : 0),
              facing: this.player ? this.player.facing : 1
            }
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.players)) {
            json.players.forEach(p => {
              if (p && p.displayName && p.displayName !== this.localPlayerName && p.mazePos) {
                const pos = p.mazePos;
                const existing = this.remotePlayers.get(p.displayName);
                if (existing) {
                  existing.targetX = pos.x;
                  existing.targetY = pos.y;
                  existing.level = pos.level;
                  existing.facing = pos.facing || 1;
                  existing.lastSeen = performance.now();
                } else {
                  this.remotePlayers.set(p.displayName, {
                    name: p.displayName,
                    level: pos.level,
                    x: pos.x,
                    y: pos.y,
                    targetX: pos.x,
                    targetY: pos.y,
                    vx: 0,
                    vy: 0,
                    facing: pos.facing || 1,
                    lastSeen: performance.now()
                  });
                }
              }
            });
          }
        }
      } catch (err) {}
    };

    pollPresence();
    this.presencePollInterval = setInterval(pollPresence, 4000);
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
    const pType = this.theme.particleType || 'leaf';
    for (let i = 0; i < 35; i++) {
      let vx = (Math.random() - 0.5) * 0.8;
      let vy = 0.4 + Math.random() * 0.8;
      let size = 1.5 + Math.random() * 3;

      if (pType === 'leaf') {
        vy = 0.4 + Math.random() * 0.6;
        vx = (Math.random() - 0.5) * 1.2;
        size = 2 + Math.random() * 2.5;
      } else if (pType === 'snow') {
        vx = 1.6 + Math.random() * 2.2;
        vy = 0.6 + Math.random() * 0.8;
        size = 1.5 + Math.random() * 2;
      } else if (pType === 'ember' || pType === 'cinder') {
        vy = -(0.6 + Math.random() * 1.2);
        vx = (Math.random() - 0.5) * 0.9;
        size = 1.5 + Math.random() * 2;
      } else if (pType === 'bubble' || pType === 'spore') {
        vy = -(0.3 + Math.random() * 0.7);
        vx = (Math.random() - 0.5) * 0.5;
        size = 2 + Math.random() * 3;
      } else if (pType === 'steam') {
        vy = -(0.5 + Math.random() * 0.8);
        vx = (Math.random() - 0.5) * 0.7;
        size = 2.5 + Math.random() * 3.5;
      } else if (pType === 'matrix') {
        vy = 2.0 + Math.random() * 1.8;
        vx = 0;
        size = 1.8 + Math.random() * 1.5;
      } else if (pType === 'acid') {
        vy = -(0.3 + Math.random() * 0.6);
        size = 2 + Math.random() * 2.5;
      } else if (['stardust', 'solar', 'quantum', 'rainbow', 'gem', 'sand', 'dust', 'void', 'cyber', 'frost'].includes(pType)) {
        vx = (Math.random() - 0.5) * 0.8;
        vy = 0.2 + Math.random() * 0.6;
      }

      this.weatherParticles.push({
        x: Math.random() * this.maze.width,
        y: Math.random() * this.maze.height,
        vx,
        vy,
        size,
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
        } else if (this.levelSelectModal && !this.levelSelectModal.classList.contains('hidden')) {
          e.preventDefault();
          e.stopPropagation();
          this.levelSelectModal.classList.add('hidden');
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

    if (this.levelSelectModal) {
      this.levelSelectModal.addEventListener('click', (e) => {
        if (e.target === this.levelSelectModal) {
          this.levelSelectModal.classList.add('hidden');
        }
      });
    }

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
      // Insert theme bracket header every 5 levels
      if ((l - 1) % 5 === 0) {
        const theme = getThemeForLevel(l);
        const header = document.createElement('div');
        header.className = 'level-theme-header';
        header.innerHTML = `
          <div class="theme-header-pill" style="border-left: 3px solid ${theme.dotColor};">
            <span class="theme-header-dot" style="background: ${theme.dotColor}; box-shadow: 0 0 8px ${theme.dotColor};"></span>
            <span class="theme-header-title" style="color: ${theme.dotColor};">${theme.name}</span>
            <span class="theme-header-range">${theme.range} • ${theme.subName}</span>
          </div>
        `;
        this.levelsGrid.appendChild(header);
      }

      const isLocked = l > this.maxUnlockedLevel;
      const isCurrent = l === this.currentLevel;
      const song = this.music ? this.music.getSong(l) : { title: `Song ${l}`, author: '' };
      const theme = getThemeForLevel(l);

      const btn = document.createElement('button');
      btn.className = `lvl-btn ${isLocked ? 'locked' : ''} ${isCurrent ? 'active-current' : ''}`;
      btn.title = `Maze ${l}: ${song.title} by ${song.author} (${theme.name})`;
      btn.style.setProperty('--theme-color', theme.dotColor);
      if (isCurrent) {
        btn.style.borderColor = theme.dotColor;
        btn.style.boxShadow = `0 0 14px ${theme.dotColor}66`;
      }

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

    // Throttled Broadcast of local player position (every 60ms)
    if (this.syncChannel && performance.now() - this.lastPosBroadcast > 60) {
      this.lastPosBroadcast = performance.now();
      this.syncChannel.postMessage({
        type: 'MAZE_RUNNER_POS',
        name: this.localPlayerName,
        level: this.currentLevel,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        vx: this.player.vx,
        vy: this.player.vy,
        facing: this.player.facing
      });
    }

    // Update HUD indicator of other runners on this level
    if (this.hudRunnersPill && this.hudRunnersText) {
      if (this.is1v1Match) {
        this.hudRunnersPill.classList.remove('hidden');
        const oppData = this.remotePlayers.get(this.matchOpponentName);
        if (oppData && oppData.level === this.currentLevel) {
          const dx = Math.round(oppData.x - this.player.x);
          const dy = Math.round(oppData.y - this.player.y);
          const dist = Math.round(Math.hypot(dx, dy));
          this.hudRunnersText.textContent = `1v1 VS ${this.matchOpponentName.toUpperCase()} (${dist}px AWAY) • FIRST TO PORTAL WINS!`;
        } else {
          this.hudRunnersText.textContent = `1v1 VS ${this.matchOpponentName.toUpperCase()} • FIRST TO FINISH WINS! (+30 XP)`;
        }
      } else {
        const sameLevelRunners = [];
        const now = performance.now();
        this.remotePlayers.forEach(p => {
          if (p.name !== this.localPlayerName && p.level === this.currentLevel && (now - p.lastSeen < 12000)) {
            sameLevelRunners.push(p.name);
          }
        });
        if (sameLevelRunners.length > 0) {
          this.hudRunnersPill.classList.remove('hidden');
          this.hudRunnersText.textContent = `${sameLevelRunners.length} RUNNER${sameLevelRunners.length > 1 ? 'S' : ''}: ${sameLevelRunners.join(', ')}`;
        } else {
          this.hudRunnersPill.classList.add('hidden');
        }
      }
    }

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
      if (wp.y < 0) wp.y = this.maze.height;
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

    if (window.ElyMatchGuard) {
      window.ElyMatchGuard.markFinished('win', { announce: true });
    }

    // Show Victory Modal
    setTimeout(() => {
      const clearTitle = document.getElementById('clearTitle');
      const clearSub = document.getElementById('clearSub');
      const clearTimeVal = document.getElementById('clearTimeVal');
      const clearDeathsVal = document.getElementById('clearDeathsVal');
      const clearUnlockedVal = document.getElementById('clearUnlockedVal');

      if (this.is1v1Match) {
        if (clearTitle) clearTitle.textContent = "VICTORY! YOU FINISHED FIRST!";
        if (clearSub) clearSub.textContent = `You beat ${this.matchOpponentName} to the portal on Maze ${this.currentLevel}! (+30 XP)`;
      } else {
        if (clearTitle) clearTitle.textContent = `MAZE ${this.currentLevel} CONQUERED!`;
        if (clearSub) clearSub.textContent = `${this.theme.name} • ${this.theme.range}`;
      }
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

    // Dispatch to specialized theme background renderer
    switch (themeId) {
      case 'forest': this.drawForestBackground(ctx, w, h, camX, now); break;
      case 'autumn': this.drawAutumnBackground(ctx, w, h, camX, now); break;
      case 'cavern': this.drawCavernBackground(ctx, w, h, camX, now); break;
      case 'desert': this.drawDesertBackground(ctx, w, h, camX, now); break;
      case 'glacial': this.drawGlacialBackground(ctx, w, h, camX, now); break;
      case 'deepfreeze': this.drawDeepfreezeBackground(ctx, w, h, camX, now); break;
      case 'magma': this.drawMagmaBackground(ctx, w, h, camX, now); break;
      case 'inferno': this.drawInfernoBackground(ctx, w, h, camX, now); break;
      case 'atlantis': this.drawAtlantisBackground(ctx, w, h, camX, now); break;
      case 'coral': this.drawCoralBackground(ctx, w, h, camX, now); break;
      case 'steampunk': this.drawSteampunkBackground(ctx, w, h, camX, now); break;
      case 'dungeon': this.drawDungeonBackground(ctx, w, h, camX, now); break;
      case 'cybercity': this.drawCybercityBackground(ctx, w, h, camX, now); break;
      case 'matrix': this.drawMatrixBackground(ctx, w, h, camX, now); break;
      case 'acid': this.drawAcidBackground(ctx, w, h, camX, now); break;
      case 'void': this.drawVoidBackground(ctx, w, h, camX, now); break;
      case 'celestial': this.drawCelestialBackground(ctx, w, h, camX, now); break;
      case 'solar': this.drawSolarBackground(ctx, w, h, camX, now); break;
      case 'quantum': this.drawQuantumBackground(ctx, w, h, camX, now); break;
      case 'infinity': this.drawInfinityBackground(ctx, w, h, camX, now); break;
      default: this.drawForestBackground(ctx, w, h, camX, now); break;
    }
  }

  drawForestBackground(ctx, w, h, camX, now) {
    // 1. Twilight Celestial Moon
    ctx.save();
    const moonX = w * 0.75 - (camX * 0.02) % (w * 1.5);
    const moonGrad = ctx.createRadialGradient(moonX, 90, 10, moonX, 90, 65);
    moonGrad.addColorStop(0, 'rgba(209, 250, 229, 0.85)');
    moonGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.25)');
    moonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, 90, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Far Canopy Hills (0.06)
    const fShift = (camX * 0.06) % 240;
    ctx.save();
    ctx.fillStyle = '#051810';
    for (let i = -1; i < Math.ceil(w / 160) + 2; i++) {
      const tx = i * 160 - fShift;
      ctx.beginPath();
      ctx.arc(tx + 80, h + 30, 180, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 3. Ancient Redwood / Mossy Banyan Trunks (0.15)
    const mShift = (camX * 0.15) % 300;
    ctx.save();
    ctx.fillStyle = '#082618';
    for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
      const bx = i * 220 - mShift;
      ctx.fillRect(bx + 40, h - 280, 50, 280);
      ctx.beginPath();
      ctx.moveTo(bx + 40, h - 220);
      ctx.quadraticCurveTo(bx - 30, h - 290, bx - 80, h - 270);
      ctx.lineTo(bx - 80, h - 250);
      ctx.quadraticCurveTo(bx - 20, h - 270, bx + 40, h - 200);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#104d33';
      ctx.fillRect(bx - 40, h - 270, 2.5, 60);
      ctx.fillRect(bx - 20, h - 260, 2.5, 45);
      ctx.fillStyle = '#082618';
    }
    ctx.restore();
  }

  drawAutumnBackground(ctx, w, h, camX, now) {
    // 1. Warm Harvest Sunset Sun
    ctx.save();
    const sunX = w * 0.3 - (camX * 0.02) % (w * 1.5);
    const sunGrad = ctx.createRadialGradient(sunX, 110, 15, sunX, 110, 85);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, 110, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Distant Amber Hills (0.06)
    const aShift = (camX * 0.06) % 220;
    ctx.save();
    ctx.fillStyle = '#220f04';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const hx = i * 180 - aShift;
      ctx.beginPath();
      ctx.arc(hx + 90, h + 20, 190, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 3. Silhouette Maple Trees & Sweeping Branches (0.14)
    const tShift = (camX * 0.14) % 280;
    ctx.save();
    ctx.fillStyle = '#3a1a08';
    for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
      const tx = i * 200 - tShift;
      ctx.fillRect(tx + 60, h - 260, 40, 260);
      ctx.beginPath();
      ctx.arc(tx + 80, h - 260, 75, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(tx + 50, h - 290, 45, 0, Math.PI * 2);
      ctx.arc(tx + 110, h - 290, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a1a08';
    }
    ctx.restore();
  }

  drawCavernBackground(ctx, w, h, camX, now) {
    // 1. Ambient Violet Geode Glow
    ctx.save();
    for (let g = 0; g < 3; g++) {
      const gx = (w * (0.2 + g * 0.35) - camX * 0.04) % (w + 200);
      const gy = h - 140;
      const gGrad = ctx.createRadialGradient(gx, gy, 10, gx, gy, 140);
      gGrad.addColorStop(0, 'rgba(192, 132, 252, 0.25)');
      gGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
      gGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(gx, gy, 140, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Cavern Roof Stalactites (0.07)
    const stShift = (camX * 0.07) % 200;
    ctx.save();
    ctx.fillStyle = '#120724';
    for (let i = -1; i < Math.ceil(w / 140) + 2; i++) {
      const sx = i * 140 - stShift;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 70, 110 + ((i * 47) % 70));
      ctx.lineTo(sx + 140, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Glowing Amethyst Crystal Formations on Ground (0.13)
    const cShift = (camX * 0.13) % 260;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
      const cx = i * 200 - cShift;
      const cy = h - 20;
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy);
      ctx.lineTo(cx + 35, cy - 90);
      ctx.lineTo(cx + 50, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy);
      ctx.lineTo(cx + 65, cy - 120);
      ctx.lineTo(cx + 85, cy);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 65, cy - 120);
      ctx.lineTo(cx + 65, cy);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDesertBackground(ctx, w, h, camX, now) {
    // 1. Desert Night Sky Stars & Crescent Moon
    ctx.save();
    const moonX = w * 0.8 - (camX * 0.015) % (w * 1.5);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(moonX, 85, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#170e03';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(moonX + 10, 80, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Distant Pyramids & Obelisks (0.04)
    const pShift = (camX * 0.04) % 340;
    ctx.save();
    ctx.fillStyle = '#1e1104';
    for (let i = -1; i < Math.ceil(w / 300) + 2; i++) {
      const px = i * 300 - pShift;
      ctx.beginPath();
      ctx.moveTo(px, h - 80);
      ctx.lineTo(px + 100, h - 230);
      ctx.lineTo(px + 200, h - 80);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2d1a08';
      ctx.beginPath();
      ctx.moveTo(px + 100, h - 230);
      ctx.lineTo(px + 200, h - 80);
      ctx.lineTo(px + 130, h - 80);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e1104';
    }
    ctx.restore();

    // 3. Sweeping Sand Dunes (0.12)
    const dShift = (camX * 0.12) % 280;
    ctx.save();
    ctx.fillStyle = '#3a230a';
    for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
      const dx = i * 220 - dShift;
      ctx.beginPath();
      ctx.moveTo(dx - 50, h);
      ctx.quadraticCurveTo(dx + 60, h - 140, dx + 180, h - 50);
      ctx.quadraticCurveTo(dx + 260, h - 110, dx + 350, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawGlacialBackground(ctx, w, h, camX, now) {
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

    // 2. Distant Jagged Icy Mountain Peaks (0.06)
    const mtnShift = (camX * 0.06) % 220;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const mx = i * 180 - mtnShift;
      const mh = 220 + ((i * 89) % 100);
      const my = h - mh;

      ctx.fillStyle = '#061a2e';
      ctx.beginPath();
      ctx.moveTo(mx - 40, h);
      ctx.lineTo(mx + 80, my);
      ctx.lineTo(mx + 200, h);
      ctx.closePath();
      ctx.fill();

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

    // 3. Foreground Cavern Frost Silhouette (0.15)
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
  }

  drawDeepfreezeBackground(ctx, w, h, camX, now) {
    // 1. Howling Blizzard Wind Streaks
    ctx.save();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.12)';
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 7; s++) {
      const sy = 40 + s * 65;
      const sOffset = (now * 0.8 + s * 140) % (w + 300);
      ctx.beginPath();
      ctx.moveTo(sOffset - 120, sy);
      ctx.lineTo(sOffset + 120, sy + 15);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Frozen Permafrost Crags & Sharp Spires (0.06)
    const pShift = (camX * 0.06) % 240;
    ctx.save();
    ctx.fillStyle = '#051424';
    for (let i = -1; i < Math.ceil(w / 160) + 2; i++) {
      const px = i * 160 - pShift;
      const ph = 260 + ((i * 71) % 90);
      ctx.beginPath();
      ctx.moveTo(px, h);
      ctx.lineTo(px + 40, h - ph);
      ctx.lineTo(px + 70, h - ph + 40);
      ctx.lineTo(px + 110, h - ph - 20);
      ctx.lineTo(px + 170, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Razor Ice Icebergs in Foreground (0.14)
    const bShift = (camX * 0.14) % 280;
    ctx.save();
    ctx.fillStyle = '#0a2740';
    for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
      const bx = i * 200 - bShift;
      ctx.beginPath();
      ctx.moveTo(bx, h);
      ctx.lineTo(bx + 60, h - 160);
      ctx.lineTo(bx + 140, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(bx + 60, h - 160);
      ctx.lineTo(bx + 75, h - 130);
      ctx.lineTo(bx + 60, h - 120);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0a2740';
    }
    ctx.restore();
  }

  drawMagmaBackground(ctx, w, h, camX, now) {
    // 1. Fiery Volcanic Caldera Sky Glow
    ctx.save();
    const vGrad = ctx.createLinearGradient(0, h, 0, h - 220);
    vGrad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
    vGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
    vGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, h - 220, w, 220);
    ctx.restore();

    // 2. Silhouette Volcano Peaks with Glowing Lava Calderas (0.05)
    const vShift = (camX * 0.05) % 300;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 240) + 2; i++) {
      const vx = i * 240 - vShift;
      const vh = 220 + ((i * 53) % 80);
      const vy = h - vh;
      ctx.fillStyle = '#170602';
      ctx.beginPath();
      ctx.moveTo(vx - 40, h);
      ctx.lineTo(vx + 90, vy);
      ctx.lineTo(vx + 130, vy);
      ctx.lineTo(vx + 260, h);
      ctx.closePath();
      ctx.fill();

      // Glowing molten crater summit
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(vx + 110, vy, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(vx + 110, vy, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Basalt Lava Flow Ridges (0.13)
    const lShift = (camX * 0.13) % 240;
    ctx.save();
    ctx.fillStyle = '#260a04';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const lx = i * 180 - lShift;
      ctx.beginPath();
      ctx.moveTo(lx, h);
      ctx.lineTo(lx + 70, h - 110);
      ctx.lineTo(lx + 160, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawInfernoBackground(ctx, w, h, camX, now) {
    // 1. Searing Crimson Abyss Horizon Glow
    ctx.save();
    const infGrad = ctx.createLinearGradient(0, h, 0, 0);
    infGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    infGrad.addColorStop(0.4, 'rgba(185, 28, 28, 0.1)');
    infGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = infGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 2. Obsidian Slabs & Fortress Towers (0.06)
    const oShift = (camX * 0.06) % 260;
    ctx.save();
    ctx.fillStyle = '#140303';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const ox = i * 180 - oShift;
      const oh = 250 + ((i * 61) % 90);
      ctx.fillRect(ox + 40, h - oh, 55, oh);
      ctx.beginPath();
      ctx.moveTo(ox + 35, h - oh);
      ctx.lineTo(ox + 67, h - oh - 35);
      ctx.lineTo(ox + 100, h - oh);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Cascading Vertical Ruby Lava Falls (0.14)
    const fShift = (camX * 0.14) % 320;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 260) + 2; i++) {
      const fx = i * 260 - fShift + 70;
      const fGrad = ctx.createLinearGradient(fx, 60, fx, h);
      fGrad.addColorStop(0, '#f87171');
      fGrad.addColorStop(0.5, '#ef4444');
      fGrad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = fGrad;
      ctx.fillRect(fx, 60, 12, h - 60);

      ctx.fillStyle = 'rgba(254, 226, 226, 0.7)';
      ctx.fillRect(fx + 4, 60, 4, h - 60);
    }
    ctx.restore();
  }

  drawAtlantisBackground(ctx, w, h, camX, now) {
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

    // 2. Distant Sunken Temple Colonnade (0.08)
    const ruinShift = (camX * 0.08) % 320;
    ctx.save();
    ctx.fillStyle = '#062638';
    for (let i = -1; i < Math.ceil(w / 280) + 2; i++) {
      const rx = i * 280 - ruinShift;
      const ry = h - 220;

      ctx.beginPath();
      ctx.moveTo(rx - 20, ry);
      ctx.lineTo(rx + 90, ry - 55);
      ctx.lineTo(rx + 200, ry);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(rx - 15, ry, 210, 14);

      for (let col = 0; col < 5; col++) {
        ctx.fillRect(rx + col * 42, ry + 14, 18, 206);
      }
    }
    ctx.restore();

    // 3. Giant Swaying Kelp Fronds (0.18)
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
  }

  drawCoralBackground(ctx, w, h, camX, now) {
    // 1. Abyssal Deep-Sea Trench Glow
    ctx.save();
    const seaGrad = ctx.createRadialGradient(w * 0.5, h - 100, 20, w * 0.5, h - 100, w * 0.6);
    seaGrad.addColorStop(0, 'rgba(20, 184, 166, 0.22)');
    seaGrad.addColorStop(0.7, 'rgba(6, 78, 92, 0.08)');
    seaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 2. Bioluminescent Branched Coral Silhouettes (0.07)
    const cShift = (camX * 0.07) % 240;
    ctx.save();
    ctx.fillStyle = '#06292d';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const cx = i * 180 - cShift;
      ctx.beginPath();
      ctx.moveTo(cx + 40, h);
      ctx.lineTo(cx + 40, h - 140);
      ctx.lineTo(cx + 20, h - 190);
      ctx.lineTo(cx + 32, h - 190);
      ctx.lineTo(cx + 45, h - 150);
      ctx.lineTo(cx + 60, h - 195);
      ctx.lineTo(cx + 72, h - 195);
      ctx.lineTo(cx + 52, h - 140);
      ctx.lineTo(cx + 52, h);
      ctx.closePath();
      ctx.fill();

      // Glowing turquoise tips
      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(cx + 26, h - 190, 4, 0, Math.PI * 2);
      ctx.arc(cx + 66, h - 195, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06292d';
    }
    ctx.restore();

    // 3. Drifting Translucent Jellyfish Silhouettes (0.13)
    const jShift = (camX * 0.13) % 300;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
      const jx = i * 220 - jShift + 40;
      const jBob = Math.sin(now * 0.002 + i) * 15;
      const jy = 100 + ((i * 37) % 80) + jBob;

      ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.beginPath();
      ctx.arc(jx, jy, 22, Math.PI, 0);
      ctx.fill();

      ctx.strokeStyle = 'rgba(94, 234, 212, 0.3)';
      ctx.lineWidth = 1.2;
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.moveTo(jx + t * 7, jy);
        ctx.quadraticCurveTo(jx + t * 7 + Math.sin(now * 0.003 + t) * 6, jy + 25, jx + t * 7, jy + 50);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawSteampunkBackground(ctx, w, h, camX, now) {
    // 1. Industrial Victorian Smokestacks & Boilers (0.05)
    const sShift = (camX * 0.05) % 240;
    ctx.save();
    ctx.fillStyle = '#1c1106';
    for (let i = -1; i < Math.ceil(w / 160) + 2; i++) {
      const sx = i * 160 - sShift;
      ctx.fillRect(sx + 30, h - 220, 35, 220);
      ctx.fillRect(sx + 20, h - 230, 55, 10);
      const puffY = h - 240 - ((now * 0.04 + i * 20) % 50);
      ctx.fillStyle = 'rgba(253, 230, 138, 0.12)';
      ctx.beginPath();
      ctx.arc(sx + 47, puffY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1106';
    }
    ctx.restore();

    // 2. Giant Animated Clockwork Gears & Cogs (0.12)
    const gShift = (camX * 0.12) % 320;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 260) + 2; i++) {
      const gx = i * 260 - gShift + 80;
      const gy = h - 170;
      const radius = 65;
      const teeth = 12;
      const rot = now * 0.0006 * (i % 2 === 0 ? 1 : -1);

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(rot);
      ctx.fillStyle = '#261608';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;

      ctx.beginPath();
      for (let t = 0; t < teeth; t++) {
        const a1 = (t * Math.PI * 2) / teeth;
        const a2 = a1 + (Math.PI / teeth) * 0.5;
        const a3 = a1 + (Math.PI / teeth);
        ctx.lineTo(Math.cos(a1) * (radius + 10), Math.sin(a1) * (radius + 10));
        ctx.lineTo(Math.cos(a2) * (radius + 10), Math.sin(a2) * (radius + 10));
        ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
        ctx.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#140c04';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawDungeonBackground(ctx, w, h, camX, now) {
    // 1. Gothic Fortress Masonry Ramparts (0.05)
    const dShift = (camX * 0.05) % 260;
    ctx.save();
    ctx.fillStyle = '#121217';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const dx = i * 180 - dShift;
      ctx.fillRect(dx, h - 260, 170, 260);
      for (let b = 0; b < 4; b++) {
        ctx.fillRect(dx + b * 42, h - 280, 24, 20);
      }
    }
    ctx.restore();

    // 2. Hanging Heavy Iron Chains (0.1)
    const cShift = (camX * 0.1) % 220;
    ctx.save();
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 3;
    for (let i = -1; i < Math.ceil(w / 160) + 2; i++) {
      const cx = i * 160 - cShift + 30;
      const sway = Math.sin(now * 0.0015 + i) * 12;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.quadraticCurveTo(cx + sway * 0.5, 90, cx + sway, 190);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Flickering Wall Sconces with Torchlight (0.15)
    const tShift = (camX * 0.15) % 260;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
      const tx = i * 200 - tShift + 60;
      const ty = h - 160;
      const flicker = Math.sin(now * 0.008 + i * 3) * 4;

      const tGrad = ctx.createRadialGradient(tx, ty, 5, tx, ty, 60 + flicker);
      tGrad.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
      tGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
      tGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.arc(tx, ty, 60 + flicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(tx - 3, ty, 6, 22);
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(tx, ty - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCybercityBackground(ctx, w, h, camX, now) {
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

      // Illuminated Window Grids
      const cols = Math.floor(bw / 12);
      const rows = Math.floor(bh / 16);
      for (let wr = 2; wr < rows - 2; wr++) {
        for (let wc = 1; wc < cols - 1; wc++) {
          const winHash = ((bHash + wr * 31 + wc * 17) ^ 0xc2b2ae35) >>> 0;
          const wx = bx + wc * 12 + 2;
          const wy = by + wr * 16 + 2;
          if (winHash % 5 === 0) {
            ctx.fillStyle = winHash % 15 === 0 ? '#ec4899' : (winHash % 8 === 0 ? '#06b6d4' : '#fbbf24');
            ctx.fillRect(wx, wy, 7, 9);
          }
        }
      }
    }

    // 4. Floating High-Speed Monorail (Parallax Factor: 0.18)
    const railShift = (camX * 0.18) % 300;
    const railY = h - 210;
    ctx.save();
    ctx.fillStyle = '#1b1136';
    ctx.fillRect(0, railY, w, 8);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(0, railY + 2, w, 2);

    ctx.fillStyle = '#100a22';
    for (let px = -railShift; px < w; px += 260) {
      ctx.fillRect(px, railY + 8, 16, h - railY - 8);
    }

    const trainX = ((now * 0.35) % (w + 600)) - 300;
    if (trainX > -300 && trainX < w + 300) {
      const trainGrad = ctx.createLinearGradient(trainX, railY - 14, trainX + 220, railY);
      trainGrad.addColorStop(0, '#06b6d4');
      trainGrad.addColorStop(0.5, '#ffffff');
      trainGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = trainGrad;
      ctx.fillRect(trainX, railY - 14, 220, 14);

      ctx.beginPath();
      ctx.moveTo(trainX + 220, railY);
      ctx.lineTo(trainX + 250, railY);
      ctx.lineTo(trainX + 220, railY - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#67e8f9';
      for (let tw = 15; tw < 205; tw += 24) {
        ctx.fillRect(trainX + tw, railY - 10, 14, 6);
      }
      const trailGrad = ctx.createLinearGradient(trainX, 0, trainX - 100, 0);
      trailGrad.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
      trailGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = trailGrad;
      ctx.fillRect(trainX - 100, railY - 5, 100, 3);
      ctx.restore();
    }

    // 5. Holographic Neon Billboards & Cables (Parallax Factor: 0.25)
    const nearShift = (camX * 0.25) % 360;
    for (let i = -1; i < Math.ceil(w / 300) + 2; i++) {
      const boardX = i * 300 - nearShift;
      const boardY = h - 290 - ((i * 53) % 60);

      ctx.save();
      ctx.translate(boardX, boardY);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, 120, 34);
      ctx.fillStyle = 'rgba(15, 7, 36, 0.85)';
      ctx.fillRect(0, 0, 120, 34);

      ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
      for (let l = 0; l < 34; l += 4) {
        ctx.fillRect(0, l, 120, 2);
      }

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

      ctx.save();
      ctx.strokeStyle = 'rgba(40, 25, 75, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(boardX - 40, boardY + 50);
      ctx.quadraticCurveTo(boardX + 100, boardY + 90, boardX + 240, boardY + 40);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawMatrixBackground(ctx, w, h, camX, now) {
    // 1. Perspective 3D Phosphor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.18)';
    ctx.lineWidth = 1;
    const gridY = h - 140;
    for (let y = gridY; y <= h; y += (y - gridY) * 0.4 + 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    const vX = w * 0.5 - (camX * 0.05) % 200;
    for (let x = -200; x <= w + 200; x += 60) {
      ctx.beginPath();
      ctx.moveTo(vX, gridY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Cascading Vertical Matrix Digital Streams (0.08)
    ctx.save();
    for (let s = 0; s < 18; s++) {
      const sx = (s * 85 - (camX * 0.08)) % (w + 100);
      const speed = 0.15 + (s % 5) * 0.04;
      const streamY = (now * speed + s * 120) % (h + 160);

      const sGrad = ctx.createLinearGradient(sx, streamY - 140, sx, streamY);
      sGrad.addColorStop(0, 'transparent');
      sGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.35)');
      sGrad.addColorStop(1, '#86efac');
      ctx.fillStyle = sGrad;
      ctx.fillRect(sx, streamY - 140, 2.5, 140);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 1, streamY, 4.5, 6);
    }
    ctx.restore();
  }

  drawAcidBackground(ctx, w, h, camX, now) {
    // 1. Toxic Chemical Refinery Tanks (0.05)
    const aShift = (camX * 0.05) % 260;
    ctx.save();
    ctx.fillStyle = '#111b05';
    for (let i = -1; i < Math.ceil(w / 180) + 2; i++) {
      const ax = i * 180 - aShift;
      ctx.fillRect(ax + 20, h - 220, 65, 220);
      ctx.beginPath();
      ctx.ellipse(ax + 52, h - 220, 32, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Bubbling Acid Vats with Glowing Lime Vapor (0.12)
    const vShift = (camX * 0.12) % 300;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 240) + 2; i++) {
      const vx = i * 240 - vShift + 40;
      const vy = h - 110;
      ctx.fillStyle = '#182707';
      ctx.fillRect(vx, vy, 110, 110);
      ctx.fillStyle = '#84cc16';
      ctx.shadowColor = '#a3e635';
      ctx.shadowBlur = 12;
      ctx.fillRect(vx + 4, vy + 4, 102, 6);
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 3. Overhead Yellow & Black Hazard Pipes (0.18)
    ctx.save();
    ctx.fillStyle = '#1a220c';
    ctx.fillRect(0, 50, w, 18);
    ctx.fillStyle = '#84cc16';
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x + 14, 50);
      ctx.lineTo(x + 6, 68);
      ctx.lineTo(x - 8, 68);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawVoidBackground(ctx, w, h, camX, now) {
    // 1. Swirling Gravitational Accretion Disk Vortex
    ctx.save();
    const vx = w * 0.5 - (camX * 0.03) % (w * 0.8);
    const vy = h * 0.45;
    const vRot = now * 0.0005;

    ctx.save();
    ctx.translate(vx, vy);
    ctx.rotate(vRot);
    for (let arm = 0; arm < 4; arm++) {
      ctx.rotate(Math.PI / 2);
      const armGrad = ctx.createRadialGradient(0, 0, 15, 70, 70, 140);
      armGrad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
      armGrad.addColorStop(0.6, 'rgba(109, 40, 217, 0.12)');
      armGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.arc(60, 40, 70, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#05020c';
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(vx, vy, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Cosmic Void Rifts & Warped Filaments (0.1)
    const rShift = (camX * 0.1) % 280;
    ctx.save();
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
      const rx = i * 220 - rShift;
      ctx.beginPath();
      ctx.moveTo(rx, 90);
      ctx.quadraticCurveTo(rx + 60, 170, rx + 130, 110);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCelestialBackground(ctx, w, h, camX, now) {
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

    // 2. Sparkling Constellations (0.05)
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

    // 3. Distant Floating Sacred Obelisks (0.12)
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

  drawSolarBackground(ctx, w, h, camX, now) {
    // 1. Blinding Solar Disc Corona
    ctx.save();
    const solX = w * 0.6 - (camX * 0.02) % (w * 1.5);
    const solGrad = ctx.createRadialGradient(solX, 130, 25, solX, 130, 160);
    solGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    solGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');
    solGrad.addColorStop(0.8, 'rgba(217, 119, 6, 0.15)');
    solGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = solGrad;
    ctx.beginPath();
    ctx.arc(solX, 130, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Magnetic Coronal Loops Arcing Across Sky (0.05)
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.lineWidth = 2.5;
    for (let loop = 0; loop < 3; loop++) {
      const lx = (w * (0.3 + loop * 0.3) - camX * 0.05) % (w + 200);
      ctx.beginPath();
      ctx.arc(lx, 150, 60 + loop * 25, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Radiant Sun Temple Spires (0.13)
    const spShift = (camX * 0.13) % 280;
    ctx.save();
    ctx.fillStyle = '#261404';
    for (let i = -1; i < Math.ceil(w / 200) + 2; i++) {
      const sx = i * 200 - spShift;
      ctx.fillRect(sx + 50, h - 230, 40, 230);
      ctx.beginPath();
      ctx.moveTo(sx + 40, h - 230);
      ctx.lineTo(sx + 70, h - 290);
      ctx.lineTo(sx + 100, h - 230);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx + 70, h - 290, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#261404';
    }
    ctx.restore();
  }

  drawQuantumBackground(ctx, w, h, camX, now) {
    // 1. Spacetime Grid Ripple Waves
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 1;
    for (let row = 0; row < 6; row++) {
      const ry = 80 + row * 60;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      for (let x = 0; x <= w; x += 30) {
        const wave = Math.sin(x * 0.01 + now * 0.002 + row) * 12;
        ctx.lineTo(x, ry + wave);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 2. Floating Rotating Prismatic Crystals (0.09)
    const qShift = (camX * 0.09) % 300;
    ctx.save();
    for (let i = -1; i < Math.ceil(w / 220) + 2; i++) {
      const qx = i * 220 - qShift + 60;
      const qy = 120 + ((i * 43) % 100);
      const rot = now * 0.001 + i;

      ctx.save();
      ctx.translate(qx, qy);
      ctx.rotate(rot);

      ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 32);
      ctx.lineTo(-22, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  drawInfinityBackground(ctx, w, h, camX, now) {
    // 1. Hypnotic Pulsing Rainbow Singularity Core
    ctx.save();
    const cx = w * 0.5 - (camX * 0.02) % (w * 0.6);
    const cy = h * 0.42;
    const pulse = Math.sin(now * 0.003) * 12 + 65;

    const ringColors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#a855f7'];
    ringColors.forEach((color, idx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse + idx * 18, 0, Math.PI * 2);
      ctx.stroke();
    });

    const sGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
    sGrad.addColorStop(0, '#ffffff');
    sGrad.addColorStop(0.5, '#a78bfa');
    sGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Rotating 4D Hypercube Tesseract Wireframe (0.08)
    ctx.save();
    ctx.translate(cx, cy);
    const tRot = now * 0.0008;
    ctx.rotate(tRot);
    ctx.strokeStyle = 'rgba(224, 231, 255, 0.35)';
    ctx.lineWidth = 1.5;

    ctx.strokeRect(-60, -60, 120, 120);
    ctx.strokeRect(-30, -30, 60, 60);
    [ [-60, -60, -30, -30], [60, -60, 30, -30], [60, 60, 30, 30], [-60, 60, -30, 30] ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.restore();
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
    const isPillar = leftOpen && rightOpen;

    // Deterministic pseudo-random hash for this tile
    const hash = ((c * 374761393 + r * 668265263) ^ 0x5bf03635) >>> 0;

    ctx.save();

    // Base Tile Fill
    ctx.fillStyle = this.theme.tileFill;
    ctx.fillRect(screenX, screenY, ts, ts);

    // Theme-specific block face details
    if (themeId === 'forest') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#041c11';
      ctx.fillRect(screenX + 4, screenY + ts * 0.5, ts - 8, 1);
      ctx.fillRect(screenX + ts * 0.5, screenY + 3, 1, ts * 0.5 - 3);

      if (topOpen) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 3);
        for (let g = 0; g <= ts; g += 6) {
          ctx.lineTo(screenX + g + 3, screenY - 3);
          ctx.lineTo(screenX + g + 6, screenY + 3);
        }
        ctx.closePath();
        ctx.fill();
        if (hash % 3 === 0) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(screenX + ts * 0.5, screenY - 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + ts);
        ctx.quadraticCurveTo(screenX + 5, screenY + ts + 8, screenX + 10, screenY + ts + 13);
        ctx.stroke();
      }

    } else if (themeId === 'autumn') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.strokeRect(screenX + 3.5, screenY + 3.5, ts - 7, ts - 7);

      if (topOpen) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 3);
        for (let g = 0; g <= ts; g += 7) {
          ctx.lineTo(screenX + g + 3.5, screenY - 3.5);
          ctx.lineTo(screenX + g + 7, screenY + 3);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(screenX + ts * 0.5 - 2, screenY - 2, 4, 2);
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 7, screenY + ts);
        ctx.quadraticCurveTo(screenX + 4, screenY + ts + 7, screenX + 9, screenY + ts + 11);
        ctx.stroke();
      }

    } else if (themeId === 'cavern') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(232, 121, 249, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX + 5, screenY + 5);
      ctx.lineTo(screenX + ts * 0.5, screenY + ts * 0.5);
      ctx.lineTo(screenX + ts - 5, screenY + ts - 5);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY);
        ctx.lineTo(screenX + 10, screenY - 6);
        ctx.lineTo(screenX + 16, screenY);
        ctx.lineTo(screenX + 24, screenY - 8);
        ctx.lineTo(screenX + 32, screenY);
        ctx.closePath();
        ctx.fill();
      }
      if (bottomOpen) {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.7)';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 4, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 11);
        ctx.lineTo(screenX + ts * 0.5 + 4, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'desert') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.strokeRect(screenX + 4, screenY + 4, ts - 8, ts - 8);

      if (topOpen) {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.quadraticCurveTo(screenX + ts * 0.5, screenY - 4, screenX + ts, screenY);
        ctx.lineTo(screenX + ts, screenY + 2);
        ctx.lineTo(screenX, screenY + 2);
        ctx.closePath();
        ctx.fill();
      }
      if (bottomOpen) {
        ctx.fillStyle = '#713f12';
        ctx.fillRect(screenX + 4, screenY + ts, ts - 8, 3.5);
      }

    } else if (themeId === 'glacial') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX + 5, screenY + 4);
      ctx.lineTo(screenX + ts * 0.55, screenY + ts * 0.45);
      ctx.lineTo(screenX + ts - 6, screenY + ts * 0.75);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.moveTo(screenX - 1, screenY);
        ctx.quadraticCurveTo(screenX + ts * 0.25, screenY + 4, screenX + ts * 0.5, screenY + 2);
        ctx.quadraticCurveTo(screenX + ts * 0.75, screenY + 5, screenX + ts + 1, screenY);
        ctx.lineTo(screenX + ts + 1, screenY - 3);
        ctx.quadraticCurveTo(screenX + ts * 0.5, screenY - 5, screenX - 1, screenY - 3);
        ctx.closePath();
        ctx.fill();
      }
      if (bottomOpen) {
        const iLen = 10 + (hash % 8);
        const iGrad = ctx.createLinearGradient(screenX + 6, screenY + ts, screenX + 6, screenY + ts + iLen);
        iGrad.addColorStop(0, '#e0f2fe');
        iGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
        ctx.fillStyle = iGrad;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + ts);
        ctx.lineTo(screenX + 11, screenY + ts + iLen);
        ctx.lineTo(screenX + 16, screenY + ts);
        ctx.moveTo(screenX + 20, screenY + ts);
        ctx.lineTo(screenX + 25, screenY + ts + iLen - 3);
        ctx.lineTo(screenX + 30, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'deepfreeze') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeRect(screenX + 3.5, screenY + 3.5, ts - 7, ts - 7);

      if (topOpen) {
        ctx.fillStyle = '#bae6fd';
        for (let j = 0; j < ts; j += 8) {
          ctx.beginPath();
          ctx.moveTo(screenX + j, screenY);
          ctx.lineTo(screenX + j + 4, screenY - 4);
          ctx.lineTo(screenX + j + 8, screenY);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (bottomOpen) {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + ts);
        ctx.lineTo(screenX + 12, screenY + ts + 12);
        ctx.lineTo(screenX + 16, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'magma') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts * 0.4);
      ctx.lineTo(screenX + ts * 0.5, screenY + ts * 0.6);
      ctx.lineTo(screenX + ts - 4, screenY + ts * 0.35);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#431407';
        ctx.fillRect(screenX, screenY, ts, 3);
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(screenX + 4, screenY + 1, ts - 8, 1);
      }
      if (bottomOpen) {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY + ts + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (themeId === 'inferno') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(screenX + ts * 0.5 - 2, screenY + ts * 0.5 - 2, 4, 4);

      if (topOpen) {
        ctx.fillStyle = '#ef4444';
        for (let g = 0; g < ts; g += 9) {
          ctx.beginPath();
          ctx.moveTo(screenX + g, screenY);
          ctx.lineTo(screenX + g + 4.5, screenY - 5);
          ctx.lineTo(screenX + g + 9, screenY);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (bottomOpen) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 3, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 9);
        ctx.lineTo(screenX + ts * 0.5 + 3, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'atlantis') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      if (isPillar) {
        const flutes = 3;
        const fw = ts / flutes;
        for (let f = 0; f < flutes; f++) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.fillRect(screenX + f * fw + 2, screenY, fw - 4, ts);
        }
      }

      if (topOpen) {
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(screenX - 2, screenY - 3, ts + 4, 3);
      }
      if (bottomOpen) {
        ctx.fillStyle = '#083344';
        ctx.fillRect(screenX - 2, screenY + ts, ts + 4, 3);
      }

    } else if (themeId === 'coral') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.35, screenY + ts * 0.35, 2, 0, Math.PI * 2);
      ctx.arc(screenX + ts * 0.65, screenY + ts * 0.65, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (topOpen) {
        ctx.fillStyle = '#5eead4';
        ctx.beginPath();
        ctx.arc(screenX + 8, screenY - 2, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 18, screenY - 3, 4, 0, Math.PI * 2);
        ctx.arc(screenX + 28, screenY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#0f766e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + ts);
        ctx.quadraticCurveTo(screenX + 11, screenY + ts + 6, screenX + 8, screenY + ts + 10);
        ctx.moveTo(screenX + 24, screenY + ts);
        ctx.quadraticCurveTo(screenX + 27, screenY + ts + 6, screenX + 24, screenY + ts + 10);
        ctx.stroke();
      }

    } else if (themeId === 'steampunk') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);

      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();

      if (topOpen) {
        ctx.fillStyle = '#d97706';
        for (let g = 0; g < ts; g += 6) {
          ctx.fillRect(screenX + g, screenY - 3, 3, 3);
        }
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY + ts + 5, 4, 0, Math.PI);
        ctx.stroke();
      }

    } else if (themeId === 'dungeon') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#3f3f46';
      [ [3, 3], [ts - 5, 3], [3, ts - 5], [ts - 5, ts - 5] ].forEach(([rx, ry]) => {
        ctx.fillRect(screenX + rx, screenY + ry, 2, 2);
      });

      if (topOpen) {
        ctx.fillStyle = '#71717a';
        ctx.fillRect(screenX + 2, screenY - 4, 8, 4);
        ctx.fillRect(screenX + ts - 10, screenY - 4, 8, 4);
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY + ts + 5, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (themeId === 'cybercity') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts * 0.5);
      ctx.lineTo(screenX + ts * 0.5, screenY + ts * 0.5);
      ctx.lineTo(screenX + ts * 0.75, screenY + 5);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(screenX, screenY, ts, 3.5);
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
      if (bottomOpen) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + ts);
        ctx.quadraticCurveTo(screenX + ts * 0.5, screenY + ts + 8, screenX + ts - 6, screenY + ts);
        ctx.stroke();
      }

    } else if (themeId === 'matrix') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(screenX + 4, screenY + ts * 0.5, 3, 3);
      ctx.fillRect(screenX + ts - 7, screenY + ts * 0.5, 3, 3);

      if (topOpen) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(screenX, screenY - 2, ts, 2);
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + ts);
        ctx.lineTo(screenX + 8, screenY + ts + 8);
        ctx.moveTo(screenX + 24, screenY + ts);
        ctx.lineTo(screenX + 24, screenY + ts + 8);
        ctx.stroke();
      }

    } else if (themeId === 'acid') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();

      if (topOpen) {
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(screenX, screenY - 2.5, ts, 2.5);
      }
      if (bottomOpen) {
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY + ts + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (themeId === 'void') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 6, 0, Math.PI);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(screenX + 4, screenY - 2, ts - 8, 2);
      }
      if (bottomOpen) {
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 8);
        ctx.stroke();
      }

    } else if (themeId === 'celestial') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX + ts * 0.5, screenY + 6);
      ctx.lineTo(screenX + ts * 0.5, screenY + ts - 6);
      ctx.moveTo(screenX + 6, screenY + ts * 0.5);
      ctx.lineTo(screenX + ts - 6, screenY + ts * 0.5);
      ctx.stroke();

      if (topOpen) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(screenX + 3, screenY - 2, ts - 6, 2.5);
        ctx.beginPath();
        ctx.arc(screenX + ts * 0.5, screenY - 2, 3, Math.PI, 0);
        ctx.fill();
      }
      if (bottomOpen) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 3, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 9);
        ctx.lineTo(screenX + ts * 0.5 + 3, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'solar') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts * 0.5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      if (topOpen) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY);
        ctx.lineTo(screenX + ts * 0.5, screenY - 6);
        ctx.lineTo(screenX + ts - 4, screenY);
        ctx.closePath();
        ctx.fill();
      }
      if (bottomOpen) {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 2.5, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 8);
        ctx.lineTo(screenX + ts * 0.5 + 2.5, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'quantum') {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.strokeRect(screenX + 4, screenY + 4, ts - 8, ts - 8);

      if (topOpen) {
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(screenX + 2, screenY - 2.5, ts - 4, 2.5);
      }
      if (bottomOpen) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 3, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 8);
        ctx.lineTo(screenX + ts * 0.5 + 3, screenY + ts);
        ctx.closePath();
        ctx.fill();
      }

    } else if (themeId === 'infinity') {
      const rainbowHue = (now * 0.08 + c * 10 + r * 10) % 360;
      ctx.strokeStyle = `hsl(${rainbowHue}, 85%, 65%)`;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, ts - 1, ts - 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + ts * 0.5 - 2, screenY + ts * 0.5 - 2, 4, 4);

      if (topOpen) {
        ctx.fillStyle = `hsl(${rainbowHue}, 90%, 75%)`;
        ctx.fillRect(screenX, screenY - 2.5, ts, 2.5);
      }
      if (bottomOpen) {
        ctx.fillStyle = `hsl(${(rainbowHue + 180) % 360}, 90%, 65%)`;
        ctx.beginPath();
        ctx.moveTo(screenX + ts * 0.5 - 3, screenY + ts);
        ctx.lineTo(screenX + ts * 0.5, screenY + ts + 8);
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

    } else if (themeId === 'deepfreeze') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else if (themeId === 'magma') {
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 5);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (themeId === 'inferno') {
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else if (themeId === 'atlantis') {
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

    } else if (themeId === 'coral') {
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(screenX + 5, screenY + ts);
      ctx.lineTo(screenX + ts * 0.35, screenY + 6);
      ctx.lineTo(screenX + ts * 0.65, screenY + ts);
      ctx.moveTo(screenX + ts * 0.45, screenY + ts);
      ctx.lineTo(screenX + ts * 0.75, screenY + 5);
      ctx.lineTo(screenX + ts - 5, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5eead4';
      ctx.stroke();

    } else if (themeId === 'steampunk') {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts, ts * 0.45, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (themeId === 'dungeon') {
      ctx.fillStyle = '#52525b';
      ctx.beginPath();
      ctx.moveTo(screenX + 5, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 4);
      ctx.lineTo(screenX + ts - 5, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else if (themeId === 'cybercity') {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screenX + 2, screenY + 8, 6, ts - 8);
      ctx.fillRect(screenX + ts - 8, screenY + 8, 6, ts - 8);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(screenX + 2, screenY + 6, 6, 3);
      ctx.fillRect(screenX + ts - 8, screenY + 6, 6, 3);

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

    } else if (themeId === 'matrix') {
      ctx.strokeStyle = '#22c55e';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 4);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.stroke();

    } else if (themeId === 'acid') {
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(screenX + 3, screenY + ts - 8, ts - 6, 8);
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.35, screenY + ts - 8, 3.5, 0, Math.PI * 2);
      ctx.arc(screenX + ts * 0.65, screenY + ts - 10, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (themeId === 'void') {
      ctx.fillStyle = '#6d28d9';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();

    } else if (themeId === 'celestial') {
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();

    } else if (themeId === 'solar') {
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(screenX + 3, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 2);
      ctx.lineTo(screenX + ts - 3, screenY + ts);
      ctx.closePath();
      ctx.fill();

    } else if (themeId === 'quantum') {
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 3);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else if (themeId === 'infinity') {
      const hue = (now * 0.1) % 360;
      ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
      ctx.shadowColor = `hsl(${hue}, 90%, 65%)`;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 2);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();

    } else if (themeId === 'autumn') {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 5);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else if (themeId === 'cavern') {
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 4);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else if (themeId === 'desert') {
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(screenX + 4, screenY + ts);
      ctx.lineTo(screenX + ts * 0.5, screenY + 5);
      ctx.lineTo(screenX + ts - 4, screenY + ts);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

    } else {
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

    if (['cybercity', 'matrix'].includes(themeId)) {
      ctx.strokeStyle = this.theme.tileBorder;
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

    } else if (['glacial', 'deepfreeze'].includes(themeId)) {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screenX + 4, screenY + ts - 10, ts - 8, 10);
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 10, 6, Math.PI, 0);
      ctx.fill();

    } else if (['atlantis', 'coral'].includes(themeId)) {
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(screenX + 4, screenY + ts - 10, ts - 8, 10);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 8, 7, 0, Math.PI);
      ctx.stroke();

    } else if (['magma', 'inferno'].includes(themeId)) {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(screenX + 4, screenY + ts - 10, ts - 8, 10);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 9, 6, Math.PI, 0);
      ctx.fill();

    } else if (['steampunk', 'dungeon'].includes(themeId)) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX + 4, screenY + ts - 9, ts - 8, 9);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(screenX + 7, screenY + ts - 13, ts - 14, 4);

    } else if (['celestial', 'solar', 'quantum', 'infinity'].includes(themeId)) {
      ctx.strokeStyle = this.theme.tileBorder;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(screenX + 3, screenY + ts - 8, ts - 6, 8);
      ctx.fillStyle = this.theme.tileAccent;
      ctx.beginPath();
      ctx.arc(screenX + ts * 0.5, screenY + ts - 8, 5, 0, Math.PI * 2);
      ctx.fill();

    } else {
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

    // 5.5 Draw Other Live Players on this level
    this.drawRemotePlayers(ctx, offset);

    // 6. Draw Player
    this.player.draw(ctx, this.camera, this.theme, offset);

    // 7. Draw Particles
    this.particles.draw(ctx, this.camera, offset);
  }

  drawRemotePlayers(ctx, offset) {
    const ox = offset ? offset.x : 0;
    const oy = offset ? offset.y : 0;
    const now = performance.now();

    this.remotePlayers.forEach(p => {
      if (!p || p.name === this.localPlayerName) return;
      if (p.level !== this.currentLevel) return;
      if (now - p.lastSeen > 15000) return;

      // Smooth position interpolation
      if (typeof p.x !== 'number') p.x = p.targetX || 0;
      if (typeof p.y !== 'number') p.y = p.targetY || 0;
      p.x += (p.targetX - p.x) * 0.35;
      p.y += (p.targetY - p.y) * 0.35;

      const drawX = p.x - this.camera.x + ox;
      const drawY = p.y - this.camera.y + oy;

      // Offscreen culling
      if (drawX < -120 || drawX > this.viewportW + 120 || drawY < -120 || drawY > this.viewportH + 120) return;

      ctx.save();

      // Emissive Hologram Bloom Glow
      const glowGrad = ctx.createRadialGradient(
        drawX + 9, drawY + 12, 3,
        drawX + 9, drawY + 12, 36
      );
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(drawX + 9, drawY + 12, 36, 0, Math.PI * 2);
      ctx.fill();

      // Ghost Runner Body Capsule
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(drawX, drawY, 18, 24, 5);
      } else {
        ctx.rect(drawX, drawY, 18, 24);
      }
      ctx.fill();
      ctx.stroke();

      // Visor / Eyes
      ctx.fillStyle = '#38bdf8';
      const eyeOffset = p.facing === 1 ? 8 : 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(drawX + eyeOffset, drawY + 6, 8, 4, 2);
      } else {
        ctx.fillRect(drawX + eyeOffset, drawY + 6, 8, 4);
      }
      ctx.fill();

      // Glowing Eye Shimmer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(drawX + eyeOffset + (p.facing === 1 ? 6 : 2), drawY + 8, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // FLOATING USERNAME PILL BADGE ABOVE PLAYER'S HEAD
      ctx.save();
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      const displayName = p.name;
      const textMetrics = ctx.measureText(displayName);
      const pillW = Math.max(textMetrics.width + 20, 52);
      const pillH = 20;
      const pillX = drawX + 9 - pillW / 2;
      const pillY = drawY - 26;

      // Dark glass backdrop with cyan outline & drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillW, pillH, 10);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();
      ctx.stroke();

      // Live green online indicator dot
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(pillX + 8, pillY + pillH / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Username text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName, pillX + 15, pillY + pillH / 2);

      ctx.restore();
    });
  }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new MazeGame();
});
