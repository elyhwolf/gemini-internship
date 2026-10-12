// DripSwitch Studio — YouTube & YouTube Music to MP3 Converter JS (Optimized 60FPS)
// Includes Secret Easter Eggs: Hacker Terminal, Flappy Bird, Cloud Boss Mode, Castle Cutscene & 1500 ELO Chess AI!

let audioPlayer = null;
let isSeeking = false;
let rafId = null;
let currentTrackDuration = 0;
let currentVideoId = "";
let isPlayingEmbed = false;

// Logo Triple Click Tracker
let logoClickTimestamps = [];

document.addEventListener('DOMContentLoaded', () => {
  initAudioDeck();
});

// Logo Click Handler (3 clicks within 2000ms triggers secret entry)
function handleLogoClick() {
  const now = Date.now();
  
  logoClickTimestamps = logoClickTimestamps.filter(ts => now - ts <= 2000);
  logoClickTimestamps.push(now);

  const logoImg = document.getElementById('dripswitchLogo');
  if (logoImg) {
    logoImg.style.transform = `scale(1.2) rotate(${logoClickTimestamps.length * 15}deg)`;
    setTimeout(() => { logoImg.style.transform = 'scale(1) rotate(0deg)'; }, 150);
  }

  if (logoClickTimestamps.length >= 3) {
    logoClickTimestamps = [];
    openSecretModal();
  }
}

function openSecretModal() {
  const modal = document.getElementById('secretCodeModal');
  const input = document.getElementById('secretPasscodeInput');
  const error = document.getElementById('secretErrorMsg');
  if (modal) {
    modal.style.display = 'flex';
    if (input) { input.value = ''; input.focus(); }
    if (error) error.textContent = '';
  }
}

function closeSecretModal() {
  const modal = document.getElementById('secretCodeModal');
  if (modal) modal.style.display = 'none';
}

function handlePasscodeKeyPress(e) {
  if (e.key === 'Enter') {
    verifySecretCode();
  }
}

function verifySecretCode() {
  const input = document.getElementById('secretPasscodeInput');
  const error = document.getElementById('secretErrorMsg');
  const pass = input ? input.value.trim() : '';

  if (pass.toLowerCase() === 'elyisgreat') {
    closeSecretModal();
    launchHackerTerminal();
  } else {
    if (error) error.textContent = '[ACCESS DENIED] INVALID ACCESS CODE. HINT: What is Ely? (Adjective)';
    if (input) input.style.borderColor = '#ff3366';
  }
}

/* ====================================================== */
/* HACKER TERMINAL MATRIX RAIN & FLAPPY BIRD GAME ENGINE */
/* ====================================================== */

let matrixInterval = null;
let flappyAnimationId = null;

// Cloud Boss Mode Variables
let isCloudBossMode = false;
let cloudModeGraceTurnRemaining = 0;
let cloudBgX = 0;

function launchHackerTerminal() {
  const screen = document.getElementById('hackerTerminalScreen');
  if (screen) {
    screen.style.display = 'block';
    startMatrixRain();
    initFlappyBirdGame();
  }
}

function exitHackerTerminal() {
  const screen = document.getElementById('hackerTerminalScreen');
  if (screen) screen.style.display = 'none';
  document.body.classList.remove('cloud-theme');
  isCloudBossMode = false;
  cloudModeGraceTurnRemaining = 0;
  if (matrixInterval) clearInterval(matrixInterval);
  if (flappyAnimationId) cancelAnimationFrame(flappyAnimationId);
}

// Matrix Rain Animation
function startMatrixRain() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = '01ELYISGREAT010101010101010101010101010101';
  const fontSize = 16;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  if (matrixInterval) clearInterval(matrixInterval);

  matrixInterval = setInterval(() => {
    ctx.fillStyle = isCloudBossMode ? 'rgba(224, 247, 250, 0.15)' : 'rgba(2, 10, 5, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = isCloudBossMode ? '#00b0ff' : '#00ff66';
    ctx.font = `${fontSize}px VT323, monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 40);
}

// Flappy Bird Game Implementation
let bird = { x: 50, y: 150, radius: 12, velocity: 0, gravity: 0.35, jump: -6.5 };
let pipes = [];
let frameCount = 0;
let score = 0;
let highScore = localStorage.getItem('dripswitch_flappy_highscore') || 0;
let isGameOver = false;
let isGameStarted = false;

function initFlappyBirdGame() {
  const canvas = document.getElementById('flappyCanvas');
  if (!canvas) return;

  document.getElementById('flappyHighScore').textContent = highScore;

  resetFlappyGame();

  window.removeEventListener('keydown', handleFlappyInput);
  window.addEventListener('keydown', handleFlappyInput);

  canvas.removeEventListener('click', flapBird);
  canvas.addEventListener('click', flapBird);

  canvas.removeEventListener('touchstart', flapBird);
  canvas.addEventListener('touchstart', flapBird);

  gameLoop();
}

function handleFlappyInput(e) {
  if (document.getElementById('hackerTerminalScreen').style.display === 'block') {
    if (e.code === 'KeyC') {
      enterCloudMode();
      return;
    }
    if (e.code === 'KeyM') {
      triggerMonsterCutscene();
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (isGameOver) {
        resetFlappyGame();
      } else {
        flapBird();
      }
    }
  }
}

function resetFlappyGame() {
  bird.y = 200;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  isGameOver = false;
  isGameStarted = true;

  document.getElementById('flappyScore').textContent = '0';
  document.getElementById('flappyGameOverBox').style.display = 'none';

  const cloudBtn = document.getElementById('cloudModeBtn');
  if (cloudBtn) {
    if (isCloudBossMode) {
      cloudBtn.style.display = 'none';
    } else if (cloudModeGraceTurnRemaining > 0) {
      cloudBtn.style.display = 'block';
      cloudModeGraceTurnRemaining--;
    } else {
      cloudBtn.style.display = 'none';
    }
  }

  if (flappyAnimationId) cancelAnimationFrame(flappyAnimationId);
  gameLoop();
}

function flapBird() {
  if (isGameOver) {
    resetFlappyGame();
    return;
  }
  bird.velocity = bird.jump;
}

/* ====================================================== */
/* CLOUD BOSS MODE TRANSITION & RENDER LOGIC */
/* ====================================================== */

function enterCloudMode() {
  const fadeOverlay = document.getElementById('whiteFadeOverlay');
  const cloudBtn = document.getElementById('cloudModeBtn');
  
  cloudModeGraceTurnRemaining = 0;
  if (cloudBtn) cloudBtn.style.display = 'none';
  if (fadeOverlay) fadeOverlay.classList.add('active');

  setTimeout(() => {
    isCloudBossMode = true;
    document.body.classList.add('cloud-theme');

    const termTitle = document.getElementById('terminalTitleText');
    const consoleBox = document.getElementById('terminalConsoleBox');
    const scoreboard = document.getElementById('gameScoreboard');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverSub = document.getElementById('gameOverSub');

    if (termTitle) termTitle.textContent = 'ELY_CLOUD_OS v5.0 // CLOUD BOSS MODE';
    if (scoreboard) scoreboard.style.display = 'none';
    if (gameOverTitle) gameOverTitle.textContent = 'CLOUD CRASH';
    if (gameOverSub) gameOverSub.textContent = 'ATMOSPHERIC OVERLOAD';

    if (consoleBox) {
      consoleBox.innerHTML = `
        <p class="log-line green">> CLOUD BOSS MODE ACTIVATED!</p>
        <p class="log-line cyan">> ATMOSPHERE LOADED: DREAMY SKY & LIGHTNING CLOUD PILLARS</p>
        <p class="log-line yellow">> REACH SCORE 30 IN CLOUD MODE TO SUMMON THE CASTLE MONSTER BOSS!</p>
      `;
    }

    resetFlappyGame();

    setTimeout(() => {
      if (fadeOverlay) fadeOverlay.classList.remove('active');
    }, 600);

  }, 800);
}

function gameLoop() {
  const canvas = document.getElementById('flappyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Background Rendering
  if (isCloudBossMode) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#b2ebf2');
    skyGrad.addColorStop(0.5, '#e0f7fa');
    skyGrad.addColorStop(1, '#e1f5fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cloudBgX -= 0.6;
    if (cloudBgX <= -400) cloudBgX = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    drawCloud(ctx, cloudBgX + 50, 60, 60);
    drawCloud(ctx, cloudBgX + 280, 100, 80);
    drawCloud(ctx, cloudBgX + 450, 60, 60);
    drawCloud(ctx, cloudBgX + 680, 100, 80);
  } else {
    ctx.fillStyle = '#001207';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Game Logic Loop
  if (isGameStarted && !isGameOver) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
      triggerGameOver();
    }

    frameCount++;
    const spawnRate = isCloudBossMode ? 80 : 90;
    if (frameCount % spawnRate === 0) {
      const gap = isCloudBossMode ? 130 : 120;
      const minHeight = 40;
      const maxHeight = canvas.height - gap - minHeight - 60;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

      pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - gap,
        passed: false
      });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= isCloudBossMode ? 2.6 : 2.2;

      if (isCloudBossMode) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00b0ff';
        ctx.lineWidth = 3;

        ctx.fillRect(p.x, 0, 48, p.top);
        ctx.strokeRect(p.x, 0, 48, p.top);

        const bY = canvas.height - p.bottom;
        ctx.fillRect(p.x, bY, 48, p.bottom);
        ctx.strokeRect(p.x, bY, 48, p.bottom);

        ctx.fillStyle = '#ffea00';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x + 20, p.top - 6, 8, 12);
        ctx.fillRect(p.x + 20, bY - 6, 8, 12);
        ctx.shadowBlur = 0;

      } else {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(p.x, 0, 45, p.top);
        ctx.strokeStyle = '#003311';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x, 0, 45, p.top);

        ctx.fillRect(p.x, canvas.height - p.bottom, 45, p.bottom);
        ctx.strokeRect(p.x, canvas.height - p.bottom, 45, p.bottom);
      }

      if (!p.passed && p.x + 45 < bird.x) {
        p.passed = true;
        score++;
        document.getElementById('flappyScore').textContent = score;

        if (score >= 25 && !isCloudBossMode) {
          cloudModeGraceTurnRemaining = 2;
          const cloudBtn = document.getElementById('cloudModeBtn');
          if (cloudBtn) cloudBtn.style.display = 'block';
        }

        // TRIGGER MONSTER CASTLE CUTSCENE WHEN REACHING SCORE 30 IN CLOUD MODE!
        if (isCloudBossMode && score >= 30) {
          triggerMonsterCutscene();
          return;
        }

        if (score > highScore) {
          highScore = score;
          localStorage.setItem('dripswitch_flappy_highscore', highScore);
          document.getElementById('flappyHighScore').textContent = highScore;
        }
      }

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + (isCloudBossMode ? 48 : 45) &&
        (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom)
      ) {
        triggerGameOver();
      }

      if (p.x + 48 < 0) {
        pipes.splice(i, 1);
      }
    }
  }

  // Bird / Character Rendering
  if (isCloudBossMode) {
    ctx.shadowColor = '#00b0ff';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#00b0ff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bird.x - 2, bird.y - 2, bird.radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    const wingY = bird.y + Math.sin(frameCount * 0.2) * 6;
    ctx.ellipse(bird.x - 6, wingY, 10, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#050515';
    ctx.fillRect(bird.x + 4, bird.y - 4, 4, 4);

  } else {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bird.x - 4, bird.y - 2, 6, 4);
  }

  if (isCloudBossMode) {
    ctx.font = "700 24px 'VT323', monospace";
    ctx.fillStyle = '#0091ea';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${score}`, canvas.width - 16, 36);
    ctx.fillText(`BEST: ${highScore}`, canvas.width - 16, 62);
  }

  if (!isGameOver) {
    flappyAnimationId = requestAnimationFrame(gameLoop);
  }
}

function drawCloud(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.45, 0, Math.PI * 2);
  ctx.arc(x + size * 0.7, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y + size * 0.15, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function triggerGameOver() {
  isGameOver = true;
  document.getElementById('flappyGameOverBox').style.display = 'flex';

  const cloudBtn = document.getElementById('cloudModeBtn');
  if (cloudBtn && cloudModeGraceTurnRemaining > 0 && !isCloudBossMode) {
    cloudBtn.style.display = 'block';
  }
}

/* ====================================================== */
/* ANIMATED CASTLE MONSTER CUTSCENE ENGINE */
/* ====================================================== */

let castleAnimationId = null;

function triggerMonsterCutscene() {
  if (flappyAnimationId) cancelAnimationFrame(flappyAnimationId);
  
  const darkRedOverlay = document.getElementById('darkRedFadeOverlay');
  const cutsceneScreen = document.getElementById('monsterCutsceneScreen');
  
  if (darkRedOverlay) darkRedOverlay.classList.add('active');

  setTimeout(() => {
    if (cutsceneScreen) cutsceneScreen.style.display = 'block';
    startCastleAnimation();
    playMonsterDialogue();

    setTimeout(() => {
      if (darkRedOverlay) darkRedOverlay.classList.remove('active');
    }, 600);
  }, 1000);
}

function startCastleAnimation() {
  const canvas = document.getElementById('castleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let torchFrame = 0;

  function renderCastle() {
    torchFrame += 0.08;

    // Dark Crimson Castle Hall Background
    const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width);
    bgGrad.addColorStop(0, '#2d0309');
    bgGrad.addColorStop(0.6, '#120104');
    bgGrad.addColorStop(1, '#050001');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gothic Stone Pillars
    ctx.fillStyle = '#1c0307';
    ctx.fillRect(canvas.width * 0.1, 0, 80, canvas.height);
    ctx.fillRect(canvas.width * 0.82, 0, 80, canvas.height);

    // Flickering Torches
    drawTorch(ctx, canvas.width * 0.1 + 40, canvas.height * 0.3, torchFrame);
    drawTorch(ctx, canvas.width * 0.82 + 40, canvas.height * 0.3, torchFrame + 2);

    // Dark Throne Structure
    const tW = 240, tH = 320;
    const tX = canvas.width / 2 - tW / 2;
    const tY = canvas.height / 2 - 80;

    ctx.fillStyle = '#080002';
    ctx.fillRect(tX, tY, tW, tH);
    ctx.strokeStyle = '#ff3344';
    ctx.lineWidth = 3;
    ctx.strokeRect(tX, tY, tW, tH);

    // Throne Crown Spikes
    ctx.beginPath();
    ctx.moveTo(tX, tY);
    ctx.lineTo(tX + 40, tY - 40);
    ctx.lineTo(tX + 80, tY);
    ctx.lineTo(tX + 120, tY - 60);
    ctx.lineTo(tX + 160, tY);
    ctx.lineTo(tX + 200, tY - 40);
    ctx.lineTo(tX + tW, tY);
    ctx.fillStyle = '#080002';
    ctx.fill();
    ctx.stroke();

    // Monster Boss sitting on Throne
    const mX = canvas.width / 2;
    const mY = tY + 130;

    // Monster Body Shadow
    ctx.fillStyle = '#0d0104';
    ctx.beginPath();
    ctx.arc(mX, mY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Red Eyes
    const eyeFlicker = Math.sin(torchFrame * 2) * 4;
    ctx.fillStyle = '#ff0033';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(mX - 22, mY - 10, 10 + eyeFlicker, 0, Math.PI * 2);
    ctx.arc(mX + 22, mY - 10, 10 + eyeFlicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mX - 22, mY - 10, 4, 0, Math.PI * 2);
    ctx.arc(mX + 22, mY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Monster Horns / Crown
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(mX - 35, mY - 45);
    ctx.lineTo(mX - 55, mY - 95);
    ctx.lineTo(mX - 20, mY - 55);
    ctx.lineTo(mX, mY - 105);
    ctx.lineTo(mX + 20, mY - 55);
    ctx.lineTo(mX + 55, mY - 95);
    ctx.lineTo(mX + 35, mY - 45);
    ctx.fill();

    castleAnimationId = requestAnimationFrame(renderCastle);
  }

  renderCastle();
}

function drawTorch(ctx, x, y, frame) {
  ctx.fillStyle = '#3a0c12';
  ctx.fillRect(x - 8, y, 16, 40);

  const flameH = 30 + Math.sin(frame * 3) * 8;
  ctx.fillStyle = '#ffea00';
  ctx.shadowColor = '#ff1744';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.ellipse(x, y - flameH / 2, 14, flameH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function playMonsterDialogue() {
  const textEl = document.getElementById('monsterDialogueText');
  const btn = document.getElementById('challengeBtn');
  if (!textEl) return;

  btn.style.display = 'none';

  const lines = [
    "MORTAL... YOU DARED SOAR THROUGH MY CLOUDS.",
    "I AM THE CASTLE MONSTER LORD.",
    "SHALL WE PLAY A GAME OF CHESS?"
  ];

  let lineIdx = 0;
  let charIdx = 0;

  textEl.textContent = "";

  function typeNextChar() {
    if (lineIdx < lines.length) {
      const currentLine = lines[lineIdx];
      if (charIdx < currentLine.length) {
        textEl.textContent += currentLine.charAt(charIdx);
        charIdx++;
        setTimeout(typeNextChar, 40);
      } else {
        setTimeout(() => {
          lineIdx++;
          charIdx = 0;
          if (lineIdx < lines.length) {
            textEl.textContent = "";
            setTimeout(typeNextChar, 300);
          } else {
            if (btn) btn.style.display = 'inline-block';
          }
        }, 1200);
      }
    }
  }

  typeNextChar();
}

/* ====================================================== */
/* 1500 ELO MINIMAX ALPHA-BETA GOTHIC CHESS AI ENGINE */
/* ====================================================== */

let chessBoardState = [];
let selectedSquare = null;
let validMoveTargets = [];
let currentTurn = 'W'; // 'W' = Human White, 'B' = Monster Black
let capturedWhite = [];
let capturedBlack = [];
let lastMove = null;
let enPassantTarget = null; // { r, c } target square for en-passant capture
let isChessAnimating = false;

// Castling State Tracking Flags
let hasMovedWKing = false;
let hasMovedWRookA = false;
let hasMovedWRookH = false;
let hasMovedBKing = false;
let hasMovedBRookA = false;
let hasMovedBRookH = false;

const CHESS_SVG_PIECES = {
  // White Pieces (#FFFFFF fill, Gold accent glow, #000 stroke)
  'K': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,11.63 C 22.5,11.63 21,14.63 21,14.63 L 15,14.63 L 15,17.63 L 17.5,17.63 L 17.5,21.63 C 15.5,21.63 12.5,23.13 12.5,26.63 C 12.5,28.63 14,30.13 16,30.13 L 29,30.13 C 31,30.13 32.5,28.63 32.5,26.63 C 32.5,23.13 29.5,21.63 27.5,21.63 L 27.5,17.63 L 30,17.63 L 30,14.63 L 24,14.63 L 24,11.63 Z"/><path d="M 22.5,6 L 22.5,11.63 M 20,8 L 25,8"/><path d="M 11.5,37 L 33.5,37 M 13,34 L 32,34 M 14.5,31 L 30.5,31"/></g></svg>`,
  'Q': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 Z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 14,36 C 16,36 21,36 22.5,36 C 24,36 29,36 31,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30"/><circle cx="6" cy="12" r="2" fill="#ffea00"/><circle cx="14" cy="9" r="2" fill="#ffea00"/><circle cx="22.5" cy="6" r="2" fill="#ffea00"/><circle cx="31" cy="9" r="2" fill="#ffea00"/><circle cx="39" cy="12" r="2" fill="#ffea00"/></g></svg>`,
  'R': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 Z M 12,36 L 12,32 L 33,32 L 33,36 Z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 Z M 12,14 L 33,14 L 30,32 L 15,32 Z"/></g></svg>`,
  'B': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,36 C 12.39,35 15,36 22.5,36 C 30,36 32.61,35 36,36 L 36,39 L 9,39 Z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,22 27.35,16.5 22.5,10 C 17.65,16.5 15,22 15,30 C 15,30 14.5,30.5 15,32 Z"/><circle cx="22.5" cy="8" r="2.5" fill="#ffea00"/><path d="M 17.5,26 L 27.5,26 M 22.5,21 L 22.5,31"/></g></svg>`,
  'N': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9.5,39 L 35.5,39 L 35.5,36 L 9.5,36 Z M 11.5,36 C 15,33 27,33 33.5,36 C 33.5,32 32.5,31 31.5,30 C 29.5,28 27.5,26 28.5,22 C 29.5,18 31.5,16.5 31.5,13.5 C 31.5,10.5 28.5,8 24.5,8 C 21,8 19,10 17.5,12 C 16,11 13,11 11.5,12.5 C 10,14 10.5,16 11,17.5 C 10,18.5 9,20.5 10,23 C 11,25.5 13,26 13,26 C 13,26 11.5,29.5 11.5,36 Z"/><circle cx="16" cy="14" r="1.5" fill="#ffea00"/></g></svg>`,
  'P': `<svg viewBox="0 0 45 45" class="piece-svg white"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,9 A 4,4 0 1,1 22.5,17 A 4,4 0 1,1 22.5,9 Z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,25 26.5,22 22.5,20 C 18.5,22 15,25 15,30 C 15,30 14.5,30.5 15,32 Z"/><path d="M 11.5,37 L 33.5,37 L 33.5,34 L 11.5,34 Z"/></g></svg>`,

  // Black Pieces (#151515 Obsidian Black fill, #FFFFFF crisp stroke)
  'k': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,11.63 C 22.5,11.63 21,14.63 21,14.63 L 15,14.63 L 15,17.63 L 17.5,17.63 L 17.5,21.63 C 15.5,21.63 12.5,23.13 12.5,26.63 C 12.5,28.63 14,30.13 16,30.13 L 29,30.13 C 31,30.13 32.5,28.63 32.5,26.63 C 32.5,23.13 29.5,21.63 27.5,21.63 L 27.5,17.63 L 30,17.63 L 30,14.63 L 24,14.63 L 24,11.63 Z"/><path d="M 22.5,6 L 22.5,11.63 M 20,8 L 25,8"/><path d="M 11.5,37 L 33.5,37 M 13,34 L 32,34 M 14.5,31 L 30.5,31"/></g></svg>`,
  'q': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 Z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 14,36 C 16,36 21,36 22.5,36 C 24,36 29,36 31,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z"/><path d="M 11.5,30 C 15,29 30,29 33.5,30"/><circle cx="6" cy="12" r="2" fill="#ffffff"/><circle cx="14" cy="9" r="2" fill="#ffffff"/><circle cx="22.5" cy="6" r="2" fill="#ffffff"/><circle cx="31" cy="9" r="2" fill="#ffffff"/><circle cx="39" cy="12" r="2" fill="#ffffff"/></g></svg>`,
  'r': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 Z M 12,36 L 12,32 L 33,32 L 33,36 Z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 Z M 12,14 L 33,14 L 30,32 L 15,32 Z"/></g></svg>`,
  'b': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,36 C 12.39,35 15,36 22.5,36 C 30,36 32.61,35 36,36 L 36,39 L 9,39 Z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,22 27.35,16.5 22.5,10 C 17.65,16.5 15,22 15,30 C 15,30 14.5,30.5 15,32 Z"/><circle cx="22.5" cy="8" r="2.5" fill="#ffffff"/><path d="M 17.5,26 L 27.5,26 M 22.5,21 L 22.5,31"/></g></svg>`,
  'n': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9.5,39 L 35.5,39 L 35.5,36 L 9.5,36 Z M 11.5,36 C 15,33 27,33 33.5,36 C 33.5,32 32.5,31 31.5,30 C 29.5,28 27.5,26 28.5,22 C 29.5,18 31.5,16.5 31.5,13.5 C 31.5,10.5 28.5,8 24.5,8 C 21,8 19,10 17.5,12 C 16,11 13,11 11.5,12.5 C 10,14 10.5,16 11,17.5 C 10,18.5 9,20.5 10,23 C 11,25.5 13,26 13,26 C 13,26 11.5,29.5 11.5,36 Z"/><circle cx="16" cy="14" r="1.5" fill="#ffffff"/></g></svg>`,
  'p': `<svg viewBox="0 0 45 45" class="piece-svg black"><g fill="#151515" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,9 A 4,4 0 1,1 22.5,17 A 4,4 0 1,1 22.5,9 Z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,25 26.5,22 22.5,20 C 18.5,22 15,25 15,30 C 15,30 14.5,30.5 15,32 Z"/><path d="M 11.5,37 L 33.5,37 L 33.5,34 L 11.5,34 Z"/></g></svg>`
};

const PIECE_VALUES = {
  'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
  'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

// 1500 ELO Positional Piece Tables
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

function startChessGame() {
  const cutsceneScreen = document.getElementById('monsterCutsceneScreen');
  const chessScreen = document.getElementById('chessGameScreen');
  
  if (cutsceneScreen) cutsceneScreen.style.display = 'none';
  if (castleAnimationId) cancelAnimationFrame(castleAnimationId);
  if (chessScreen) chessScreen.style.display = 'flex';

  resetChessBoard();
}

function exitChessGame() {
  const chessScreen = document.getElementById('chessGameScreen');
  if (chessScreen) chessScreen.style.display = 'none';
  exitHackerTerminal();
}

function resetChessBoard() {
  // Initial 8x8 Chess Position (Standard)
  chessBoardState = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['.','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','.','.','.'],
    ['.','.','.','.','.','.','.','.'],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];

  selectedSquare = null;
  validMoveTargets = [];
  currentTurn = 'W';
  capturedWhite = [];
  capturedBlack = [];
  lastMove = null;
  enPassantTarget = null;
  isChessAnimating = false;

  hasMovedWKing = false;
  hasMovedWRookA = false;
  hasMovedWRookH = false;
  hasMovedBKing = false;
  hasMovedBRookA = false;
  hasMovedBRookH = false;

  updateTurnUI("YOUR TURN (WHITE)");
  renderChessBoard();
}

function renderChessBoard() {
  const boardEl = document.getElementById('chessBoard');
  const blackCapEl = document.getElementById('blackCapturedDeck');
  const whiteCapEl = document.getElementById('whiteCapturedDeck');
  
  if (!boardEl) return;
  boardEl.innerHTML = '';

  if (blackCapEl) blackCapEl.innerHTML = capturedBlack.map(p => CHESS_SVG_PIECES[p] || '').join('');
  if (whiteCapEl) whiteCapEl.innerHTML = capturedWhite.map(p => CHESS_SVG_PIECES[p] || '').join('');

  const wKing = findKing(chessBoardState, 'W');
  const isWKingCheck = wKing && isKingInCheck(chessBoardState, 'W');

  const bKing = findKing(chessBoardState, 'B');
  const isBKingCheck = bKing && isKingInCheck(chessBoardState, 'B');

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      sq.className = `chess-square ${isDark ? 'dark' : 'light'}`;
      
      const piece = chessBoardState[r][c];
      if (piece !== '.') {
        sq.innerHTML = CHESS_SVG_PIECES[piece] || piece;
      }

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      if (validMoveTargets.some(m => m.r === r && m.c === c)) {
        sq.classList.add('valid-target');
      }

      if (lastMove && ((lastMove.fromR === r && lastMove.fromC === c) || (lastMove.toR === r && lastMove.toC === c))) {
        sq.classList.add('last-move');
      }

      if (isWKingCheck && wKing.r === r && wKing.c === c) {
        sq.classList.add('in-check');
      }

      if (isBKingCheck && bKing.r === r && bKing.c === c) {
        sq.classList.add('in-check');
      }

      sq.onclick = () => handleSquareClick(r, c);
      boardEl.appendChild(sq);
    }
  }
}

function animatePieceMove(fromR, fromC, toR, toC, callback) {
  const boardEl = document.getElementById('chessBoard');
  if (!boardEl) { callback(); return; }

  const squares = boardEl.children;
  const fromIdx = fromR * 8 + fromC;
  const toIdx = toR * 8 + toC;

  const fromSq = squares[fromIdx];
  const toSq = squares[toIdx];

  if (!fromSq || !toSq) { callback(); return; }

  const pieceSvg = fromSq.querySelector('.piece-svg');
  if (!pieceSvg) { callback(); return; }

  isChessAnimating = true;

  const pieceRect = pieceSvg.getBoundingClientRect();
  const toRect = toSq.getBoundingClientRect();

  // Calculate centered target position inside destination square
  const targetLeft = toRect.left + (toRect.width - pieceRect.width) / 2;
  const targetTop = toRect.top + (toRect.height - pieceRect.height) / 2;

  const dx = targetLeft - pieceRect.left;
  const dy = targetTop - pieceRect.top;

  // Clone SVG piece for exact 0.25s ease-in-out glide
  const clone = pieceSvg.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${pieceRect.left}px`;
  clone.style.top = `${pieceRect.top}px`;
  clone.style.width = `${pieceRect.width}px`;
  clone.style.height = `${pieceRect.height}px`;
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.zIndex = '99999';
  clone.style.pointerEvents = 'none';
  clone.style.willChange = 'transform';
  clone.style.transform = 'translate3d(0px, 0px, 0px)';

  // Append clone to body FIRST
  document.body.appendChild(clone);

  // Force reflow to guarantee starting position (0,0) is registered by browser
  void clone.offsetHeight;

  // Now hide original piece without any blank gap frame
  pieceSvg.style.opacity = '0';

  // Apply smooth ease-in-out transition and slide to destination
  clone.style.transition = 'transform 0.25s cubic-bezier(0.42, 0, 0.58, 1)';
  clone.style.transform = `translate3d(${dx}px, ${dy}px, 0px)`;

  setTimeout(() => {
    // 1. Render updated board state under the clone FIRST
    callback();

    // 2. Remove clone on the next frame after new board is painted (zero flicker/pop)
    requestAnimationFrame(() => {
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      isChessAnimating = false;
    });
  }, 250);
}

function handleSquareClick(r, c) {
  if (currentTurn !== 'W' || isChessAnimating) return; // Monster thinking, animating, or game over

  const piece = chessBoardState[r][c];

  // If clicking on valid target square
  if (selectedSquare && validMoveTargets.some(m => m.r === r && m.c === c)) {
    const fromR = selectedSquare.r;
    const fromC = selectedSquare.c;

    // Clear selection highlights immediately for a clean board during glide
    selectedSquare = null;
    validMoveTargets = [];
    renderChessBoard();

    animatePieceMove(fromR, fromC, r, c, () => {
      makeMove(fromR, fromC, r, c);
      renderChessBoard();

      // Check if Monster is checkmated or in stalemate
      if (isCheckmate(chessBoardState, 'B')) {
        currentTurn = 'OVER';
        updateTurnUI("[VICTORY] CHECKMATE! YOU DEFEATED THE MONSTER!");
        return;
      } else if (isStalemate(chessBoardState, 'B')) {
        currentTurn = 'OVER';
        updateTurnUI("[DRAW] STALEMATE! THE GAME IS A DRAW!");
        return;
      } else if (isKingInCheck(chessBoardState, 'B')) {
        updateTurnUI("[CHECK] MONSTER UNDER ATTACK...");
      } else {
        updateTurnUI("MONSTER CONTEMPLATING... (1500 ELO)");
      }

      // Trigger Monster AI turn if White played
      setTimeout(makeMonsterAIMove, 300);
    });
    return;
  }

  // Select player's White piece (Uppercase)
  if (piece !== '.' && isWhitePiece(piece)) {
    selectedSquare = { r, c };
    validMoveTargets = getStrictlyLegalMovesForSquare(r, c, chessBoardState);
  } else {
    selectedSquare = null;
    validMoveTargets = [];
  }

  renderChessBoard();
}

function makeMove(fromR, fromC, toR, toC) {
  const p = chessBoardState[fromR][fromC];
  const targetP = chessBoardState[toR][toC];

  if (targetP !== '.') {
    if (isWhitePiece(targetP)) capturedWhite.push(targetP);
    else capturedBlack.push(targetP);
  }

  // Handle En Passant Capture
  if ((p === 'P' || p === 'p') && fromC !== toC && targetP === '.') {
    const capPawn = chessBoardState[fromR][toC];
    if (capPawn !== '.') {
      if (isWhitePiece(capPawn)) capturedWhite.push(capPawn);
      else capturedBlack.push(capPawn);
      chessBoardState[fromR][toC] = '.';
    }
  }

  // Handle Castling Rook Movement
  if (p === 'K' && fromR === 7 && fromC === 4) {
    if (toR === 7 && toC === 6) { // White Kingside
      chessBoardState[7][5] = 'R';
      chessBoardState[7][7] = '.';
    } else if (toR === 7 && toC === 2) { // White Queenside
      chessBoardState[7][3] = 'R';
      chessBoardState[7][0] = '.';
    }
  } else if (p === 'k' && fromR === 0 && fromC === 4) {
    if (toR === 0 && toC === 6) { // Black Kingside
      chessBoardState[0][5] = 'r';
      chessBoardState[0][7] = '.';
    } else if (toR === 0 && toC === 2) { // Black Queenside
      chessBoardState[0][3] = 'r';
      chessBoardState[0][0] = '.';
    }
  }

  chessBoardState[toR][toC] = p;
  chessBoardState[fromR][fromC] = '.';

  // Set En Passant Target for next immediate turn
  if (p === 'P' && fromR === 6 && toR === 4) {
    enPassantTarget = { r: 5, c: fromC };
  } else if (p === 'p' && fromR === 1 && toR === 3) {
    enPassantTarget = { r: 2, c: fromC };
  } else {
    enPassantTarget = null;
  }

  // Update Castling History Flags
  if (fromR === 7 && fromC === 4) hasMovedWKing = true;
  if ((fromR === 7 && fromC === 7) || (toR === 7 && toC === 7)) hasMovedWRookH = true;
  if ((fromR === 7 && fromC === 0) || (toR === 7 && toC === 0)) hasMovedWRookA = true;

  if (fromR === 0 && fromC === 4) hasMovedBKing = true;
  if ((fromR === 0 && fromC === 7) || (toR === 0 && toC === 7)) hasMovedBRookH = true;
  if ((fromR === 0 && fromC === 0) || (toR === 0 && toC === 0)) hasMovedBRookA = true;

  lastMove = { fromR, fromC, toR, toC };

  // Pawn Promotion to Queen
  if (p === 'P' && toR === 0) chessBoardState[toR][toC] = 'Q';
  if (p === 'p' && toR === 7) chessBoardState[toR][toC] = 'q';

  currentTurn = currentTurn === 'W' ? 'B' : 'W';
}

function updateTurnUI(text) {
  const el = document.getElementById('chessTurnStatus');
  if (el) el.textContent = text;
}

function isWhitePiece(p) { return p >= 'A' && p <= 'Z'; }
function isBlackPiece(p) { return p >= 'a' && p <= 'z'; }

/* 1500 ELO MINIMAX ALPHA-BETA SEARCH ENGINE */

function makeMonsterAIMove() {
  if (currentTurn !== 'B' || isChessAnimating) return;

  const bestMove = getBestMoveMinimax(chessBoardState, 3, -100000, 100000, true);
  
  if (bestMove && bestMove.move) {
    const { fromR, fromC, toR, toC } = bestMove.move;

    // Clear selection state before AI animation
    selectedSquare = null;
    validMoveTargets = [];

    animatePieceMove(fromR, fromC, toR, toC, () => {
      makeMove(fromR, fromC, toR, toC);
      
      if (isCheckmate(chessBoardState, 'W')) {
        currentTurn = 'OVER';
        updateTurnUI("[DEFEAT] CHECKMATE! THE MONSTER REIGNS SUPREME!");
      } else if (isStalemate(chessBoardState, 'W')) {
        currentTurn = 'OVER';
        updateTurnUI("[DRAW] STALEMATE! GAME DRAWN!");
      } else if (isKingInCheck(chessBoardState, 'W')) {
        updateTurnUI("[CHECK] YOUR KING IS UNDER ATTACK!");
      } else {
        updateTurnUI("YOUR TURN (WHITE)");
      }

      renderChessBoard();
    });
  } else {
    if (isKingInCheck(chessBoardState, 'B')) {
      currentTurn = 'OVER';
      updateTurnUI("[VICTORY] CHECKMATE! YOU DEFEATED THE MONSTER!");
    } else {
      currentTurn = 'OVER';
      updateTurnUI("[DRAW] STALEMATE! GAME DRAWN!");
    }
    renderChessBoard();
  }
}

function getBestMoveMinimax(board, depth, alpha, beta, isMaximizing) {
  const allMoves = getStrictlyLegalMoves(board, isMaximizing ? 'B' : 'W');
  if (depth === 0 || allMoves.length === 0) {
    return { score: evaluateBoard(board) };
  }

  let bestMove = null;
  let bestScore = isMaximizing ? -100000 : 100000;

  for (const move of allMoves) {
    const tempBoard = cloneBoard(board);
    const pMoved = tempBoard[move.fromR][move.fromC];

    // Handle Castling Rook Simulation on tempBoard for Minimax
    if (pMoved === 'K' && move.fromR === 7 && move.fromC === 4) {
      if (move.toR === 7 && move.toC === 6) { tempBoard[7][5] = 'R'; tempBoard[7][7] = '.'; }
      if (move.toR === 7 && move.toC === 2) { tempBoard[7][3] = 'R'; tempBoard[7][0] = '.'; }
    } else if (pMoved === 'k' && move.fromR === 0 && move.fromC === 4) {
      if (move.toR === 0 && move.toC === 6) { tempBoard[0][5] = 'r'; tempBoard[0][7] = '.'; }
      if (move.toR === 0 && move.toC === 2) { tempBoard[0][3] = 'r'; tempBoard[0][0] = '.'; }
    }

    // Handle En Passant Simulation for Minimax
    if ((pMoved === 'P' || pMoved === 'p') && move.fromC !== move.toC && tempBoard[move.toR][move.toC] === '.') {
      tempBoard[move.fromR][move.toC] = '.';
    }

    tempBoard[move.toR][move.toC] = pMoved;
    tempBoard[move.fromR][move.fromC] = '.';

    if (tempBoard[move.toR][move.toC] === 'P' && move.toR === 0) tempBoard[move.toR][move.toC] = 'Q';
    if (tempBoard[move.toR][move.toC] === 'p' && move.toR === 7) tempBoard[move.toR][move.toC] = 'q';

    const result = getBestMoveMinimax(tempBoard, depth - 1, alpha, beta, !isMaximizing);
    
    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) break; // Alpha-Beta Cutoff
  }

  return { score: bestScore, move: bestMove };
}

function evaluateBoard(board) {
  const blackKing = findKing(board, 'B');
  if (!blackKing) return -99999;
  const whiteKing = findKing(board, 'W');
  if (!whiteKing) return 99999;

  let totalScore = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p !== '.') {
        let val = PIECE_VALUES[p] || 0;
        let posVal = 0;

        const idx = r * 8 + c;
        if (p === 'p') posVal = PAWN_TABLE[idx];
        if (p === 'n') posVal = KNIGHT_TABLE[idx];
        if (p === 'P') posVal = PAWN_TABLE[63 - idx];
        if (p === 'N') posVal = KNIGHT_TABLE[63 - idx];

        val += posVal;

        if (isBlackPiece(p)) totalScore += val; // Monster Black +
        else totalScore -= val; // Human White -
      }
    }
  }
  return totalScore;
}

function findKing(board, side) {
  const targetPiece = side === 'W' ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === targetPiece) return { r, c };
    }
  }
  return null;
}

function isSquareAttacked(board, r, c, attackerSide) {
  const isAttackerWhite = attackerSide === 'W';
  const pawnPiece = isAttackerWhite ? 'P' : 'p';
  const knightPiece = isAttackerWhite ? 'N' : 'n';
  const bishopPiece = isAttackerWhite ? 'B' : 'b';
  const rookPiece = isAttackerWhite ? 'R' : 'r';
  const queenPiece = isAttackerWhite ? 'Q' : 'q';
  const kingPiece = isAttackerWhite ? 'K' : 'k';

  // 1. Pawns (attacker pawns attack diagonally towards target)
  const pawnDir = isAttackerWhite ? 1 : -1;
  const pr = r + pawnDir;
  if (pr >= 0 && pr < 8) {
    if (c - 1 >= 0 && board[pr][c - 1] === pawnPiece) return true;
    if (c + 1 < 8 && board[pr][c + 1] === pawnPiece) return true;
  }

  // 2. Knights
  const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [dr, dc] of knightOffsets) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[nr][nc] === knightPiece) return true;
    }
  }

  // 3. Kings
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (board[nr][nc] === kingPiece) return true;
      }
    }
  }

  // 4. Linear (Rook / Queen)
  const linearDirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of linearDirs) {
    let step = 1;
    while (true) {
      const nr = r + dr * step, nc = c + dc * step;
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
      const target = board[nr][nc];
      if (target !== '.') {
        if (target === rookPiece || target === queenPiece) return true;
        break;
      }
      step++;
    }
  }

  // 5. Diagonal (Bishop / Queen)
  const diagDirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  for (const [dr, dc] of diagDirs) {
    let step = 1;
    while (true) {
      const nr = r + dr * step, nc = c + dc * step;
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
      const target = board[nr][nc];
      if (target !== '.') {
        if (target === bishopPiece || target === queenPiece) return true;
        break;
      }
      step++;
    }
  }

  return false;
}

function isKingInCheck(board, side) {
  const king = findKing(board, side);
  if (!king) return true;
  const opponentSide = side === 'W' ? 'B' : 'W';
  return isSquareAttacked(board, king.r, king.c, opponentSide);
}

function getPseudoLegalMovesForSquare(r, c, board) {
  const p = board[r][c];
  const moves = [];
  const isWhite = isWhitePiece(p);

  // Pawns
  if (p === 'P' || p === 'p') {
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Move forward 1
    if (board[r + dir] && board[r + dir][c] === '.') {
      moves.push({ r: r + dir, c });
      // Move forward 2
      if (r === startRow && board[r + 2 * dir] && board[r + 2 * dir][c] === '.') {
        moves.push({ r: r + 2 * dir, c });
      }
    }
    // Captures
    [-1, 1].forEach(dc => {
      if (board[r + dir] && board[r + dir][c + dc]) {
        const target = board[r + dir][c + dc];
        if (target !== '.' && (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
          moves.push({ r: r + dir, c: c + dc });
        }
      }
    });
    // En Passant Captures
    if (enPassantTarget && enPassantTarget.r === r + dir && Math.abs(enPassantTarget.c - c) === 1) {
      moves.push({ r: r + dir, c: enPassantTarget.c, isEnPassant: true });
    }
  }

  // Knights
  if (p === 'N' || p === 'n') {
    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    offsets.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (target === '.' || (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
          moves.push({ r: nr, c: nc });
        }
      }
    });
  }

  // Rooks / Queen (Linear)
  if (p === 'R' || p === 'r' || p === 'Q' || p === 'q') {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    dirs.forEach(([dr, dc]) => {
      let step = 1;
      while (true) {
        const nr = r + dr * step, nc = c + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
        const target = board[nr][nc];
        if (target === '.') {
          moves.push({ r: nr, c: nc });
        } else {
          if (isWhite ? isBlackPiece(target) : isWhitePiece(target)) moves.push({ r: nr, c: nc });
          break;
        }
        step++;
      }
    });
  }

  // Bishops / Queen (Diagonal)
  if (p === 'B' || p === 'b' || p === 'Q' || p === 'q') {
    const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
    dirs.forEach(([dr, dc]) => {
      let step = 1;
      while (true) {
        const nr = r + dr * step, nc = c + dc * step;
        if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
        const target = board[nr][nc];
        if (target === '.') {
          moves.push({ r: nr, c: nc });
        } else {
          if (isWhite ? isBlackPiece(target) : isWhitePiece(target)) moves.push({ r: nr, c: nc });
          break;
        }
        step++;
      }
    });
  }

  // Kings
  if (p === 'K' || p === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = board[nr][nc];
          if (target === '.' || (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
            moves.push({ r: nr, c: nc });
          }
        }
      }
    }

    // Castling Logic
    if (isWhite && r === 7 && c === 4) {
      const opp = 'B';
      // Kingside (O-O): e1 -> g1 (7,4 -> 7,6)
      if (!hasMovedWKing && !hasMovedWRookH && board[7][7] === 'R' && board[7][5] === '.' && board[7][6] === '.') {
        if (!isSquareAttacked(board, 7, 4, opp) && !isSquareAttacked(board, 7, 5, opp) && !isSquareAttacked(board, 7, 6, opp)) {
          moves.push({ r: 7, c: 6, isCastling: true });
        }
      }
      // Queenside (O-O-O): e1 -> c1 (7,4 -> 7,2)
      if (!hasMovedWKing && !hasMovedWRookA && board[7][0] === 'R' && board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.') {
        if (!isSquareAttacked(board, 7, 4, opp) && !isSquareAttacked(board, 7, 3, opp) && !isSquareAttacked(board, 7, 2, opp)) {
          moves.push({ r: 7, c: 2, isCastling: true });
        }
      }
    }

    if (!isWhite && r === 0 && c === 4) {
      const opp = 'W';
      // Kingside (O-O): e8 -> g8 (0,4 -> 0,6)
      if (!hasMovedBKing && !hasMovedBRookH && board[0][7] === 'r' && board[0][5] === '.' && board[0][6] === '.') {
        if (!isSquareAttacked(board, 0, 4, opp) && !isSquareAttacked(board, 0, 5, opp) && !isSquareAttacked(board, 0, 6, opp)) {
          moves.push({ r: 0, c: 6, isCastling: true });
        }
      }
      // Queenside (O-O-O): e8 -> c8 (0,4 -> 0,2)
      if (!hasMovedBKing && !hasMovedBRookA && board[0][0] === 'r' && board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.') {
        if (!isSquareAttacked(board, 0, 4, opp) && !isSquareAttacked(board, 0, 3, opp) && !isSquareAttacked(board, 0, 2, opp)) {
          moves.push({ r: 0, c: 2, isCastling: true });
        }
      }
    }
  }

  return moves;
}

function getStrictlyLegalMovesForSquare(r, c, board) {
  const p = board[r][c];
  if (p === '.') return [];
  const side = isWhitePiece(p) ? 'W' : 'B';
  const pseudoMoves = getPseudoLegalMovesForSquare(r, c, board);

  return pseudoMoves.filter(move => {
    const tempBoard = cloneBoard(board);
    const pieceMoved = tempBoard[r][c];

    // Handle Castling Rook Simulation on tempBoard
    if (pieceMoved === 'K' && r === 7 && c === 4) {
      if (move.r === 7 && move.c === 6) { tempBoard[7][5] = 'R'; tempBoard[7][7] = '.'; }
      if (move.r === 7 && move.c === 2) { tempBoard[7][3] = 'R'; tempBoard[7][0] = '.'; }
    } else if (pieceMoved === 'k' && r === 0 && c === 4) {
      if (move.r === 0 && move.c === 6) { tempBoard[0][5] = 'r'; tempBoard[0][7] = '.'; }
      if (move.r === 0 && move.c === 2) { tempBoard[0][3] = 'r'; tempBoard[0][0] = '.'; }
    }

    // Handle En Passant Simulation on tempBoard
    if ((pieceMoved === 'P' || pieceMoved === 'p') && c !== move.c && tempBoard[move.r][move.c] === '.') {
      tempBoard[r][move.c] = '.';
    }

    tempBoard[move.r][move.c] = pieceMoved;
    tempBoard[r][c] = '.';

    if (tempBoard[move.r][move.c] === 'P' && move.r === 0) tempBoard[move.r][move.c] = 'Q';
    if (tempBoard[move.r][move.c] === 'p' && move.r === 7) tempBoard[move.r][move.c] = 'q';

    return !isKingInCheck(tempBoard, side);
  });
}

function getStrictlyLegalMoves(board, side) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p !== '.' && ((side === 'W' && isWhitePiece(p)) || (side === 'B' && isBlackPiece(p)))) {
        const sqMoves = getStrictlyLegalMovesForSquare(r, c, board);
        sqMoves.forEach(m => moves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c }));
      }
    }
  }
  return moves;
}

function isCheckmate(board, side) {
  return isKingInCheck(board, side) && getStrictlyLegalMoves(board, side).length === 0;
}

function isStalemate(board, side) {
  return !isKingInCheck(board, side) && getStrictlyLegalMoves(board, side).length === 0;
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function resignChessGame() {
  updateTurnUI("YOU RESIGNED! THE MONSTER REIGNS SUPREME!");
}

/* ====================================================== */
/* AUDIO PLAYER & CONVERSION LOGIC */
/* ====================================================== */

function initAudioDeck() {
  audioPlayer = document.getElementById('audioPlayer');
  const scrubber = document.getElementById('audioScrubber');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const totalTimeDisplay = document.getElementById('totalTimeDisplay');
  const playIcon = document.getElementById('playIcon');

  if (!audioPlayer) return;

  function getActiveDuration() {
    if (audioPlayer && audioPlayer.duration && !isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
      return audioPlayer.duration;
    }
    return currentTrackDuration || 169;
  }

  function updateProgress() {
    const dur = getActiveDuration();
    if (!isSeeking && audioPlayer && !audioPlayer.paused) {
      const pct = (audioPlayer.currentTime / dur) * 100;
      if (scrubber) scrubber.value = pct;
      if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(dur);
    }
    if (audioPlayer && !audioPlayer.paused) {
      rafId = requestAnimationFrame(updateProgress);
    }
  }

  audioPlayer.addEventListener('timeupdate', () => {
    const dur = getActiveDuration();
    if (audioPlayer.paused) {
      const pct = (audioPlayer.currentTime / dur) * 100;
      if (scrubber) scrubber.value = pct;
      if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(dur);
    }
  });

  audioPlayer.addEventListener('loadedmetadata', () => {
    const dur = getActiveDuration();
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(dur);
  });

  const SVG_PLAY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const SVG_PAUSE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  audioPlayer.addEventListener('play', () => {
    if (playIcon) playIcon.innerHTML = SVG_PAUSE;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateProgress);
  });

  audioPlayer.addEventListener('pause', () => {
    if (playIcon) playIcon.innerHTML = SVG_PLAY;
    cancelAnimationFrame(rafId);
  });

  audioPlayer.addEventListener('ended', () => {
    if (playIcon) playIcon.innerHTML = SVG_PLAY;
    if (scrubber) scrubber.value = 0;
    cancelAnimationFrame(rafId);
  });

  if (scrubber) {
    scrubber.addEventListener('mousedown', () => { isSeeking = true; });
    scrubber.addEventListener('mouseup', () => { isSeeking = false; });
    scrubber.addEventListener('touchstart', () => { isSeeking = true; });
    scrubber.addEventListener('touchend', () => { isSeeking = false; });
  }
}

function togglePlayPause() {
  if (!audioPlayer) audioPlayer = document.getElementById('audioPlayer');
  const playIcon = document.getElementById('playIcon');

  const SVG_PLAY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const SVG_PAUSE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  if (audioPlayer && audioPlayer.src && audioPlayer.src.length > 5 && !audioPlayer.src.includes('about:blank')) {
    if (audioPlayer.paused) {
      audioPlayer.play().then(() => {
        if (playIcon) playIcon.innerHTML = SVG_PAUSE;
      }).catch(err => {
        console.log("Audio play error:", err);
        playFallbackEmbed();
      });
    } else {
      audioPlayer.pause();
      if (playIcon) playIcon.innerHTML = SVG_PLAY;
    }
  } else {
    playFallbackEmbed();
  }
}

function playFallbackEmbed() {
  const playIcon = document.getElementById('playIcon');
  let iframe = document.getElementById('ytAudioIframe');

  const SVG_PLAY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const SVG_PAUSE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'ytAudioIframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  if (isPlayingEmbed) {
    iframe.src = 'about:blank';
    isPlayingEmbed = false;
    if (playIcon) playIcon.innerHTML = SVG_PLAY;
  } else {
    iframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&enablejsapi=1`;
    isPlayingEmbed = true;
    if (playIcon) playIcon.innerHTML = SVG_PAUSE;
    simulatePlaybackProgress();
  }
}

function simulatePlaybackProgress() {
  const scrubber = document.getElementById('audioScrubber');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const totalTimeDisplay = document.getElementById('totalTimeDisplay');
  
  let currentSec = 0;
  const dur = currentTrackDuration || 169;

  if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(dur);

  const interval = setInterval(() => {
    if (!isPlayingEmbed) {
      clearInterval(interval);
      return;
    }
    currentSec += 1;
    if (currentSec > dur) {
      isPlayingEmbed = false;
      const playIcon = document.getElementById('playIcon');
      if (playIcon) playIcon.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      clearInterval(interval);
      return;
    }

    const pct = (currentSec / dur) * 100;
    if (scrubber) scrubber.value = pct;
    if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(currentSec);
  }, 1000);
}

function seekAudio(percent) {
  if (!audioPlayer) audioPlayer = document.getElementById('audioPlayer');
  const dur = (audioPlayer && audioPlayer.duration && !isNaN(audioPlayer.duration) && audioPlayer.duration > 0)
    ? audioPlayer.duration
    : (currentTrackDuration || 169);

  const targetTime = (percent / 100) * dur;
  if (audioPlayer) audioPlayer.currentTime = targetTime;

  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(targetTime);
}

function formatTime(secs) {
  if (isNaN(secs) || secs <= 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function convertYouTubeToMp3() {
  const urlInput = document.getElementById('ytUrlInput');
  const loader = document.getElementById('loaderBox');
  const resultBox = document.getElementById('resultBox');
  
  let url = urlInput.value.trim();
  if (!url) {
    alert("Please paste a valid YouTube or YouTube Music URL!");
    return;
  }

  url = url.replace('music.youtube.com', 'www.youtube.com');

  loader.style.display = 'flex';
  resultBox.style.display = 'none';

  try {
    let apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5177'
      : window.location.origin;

    let response;
    try {
      response = await fetch(`${apiBase}/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
    } catch (e) {
      if (apiBase !== 'http://localhost:5177') {
        response = await fetch('http://localhost:5177/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url })
        });
      } else {
        throw e;
      }
    }

    const data = await response.json();
    loader.style.display = 'none';

    if (data.success) {
      document.getElementById('trackTitle').textContent = data.title || 'Audio Track';
      document.getElementById('trackUploader').textContent = `Creator: ${data.uploader || 'YouTube Music'}`;
      document.getElementById('trackThumb').src = data.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
      
      currentTrackDuration = data.duration || 169;
      currentVideoId = data.video_id || "11vcNPy3KVQ";
      isPlayingEmbed = false;

      const totalTimeDisplay = document.getElementById('totalTimeDisplay');
      if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(currentTrackDuration);

      audioPlayer = document.getElementById('audioPlayer');
      const downloadBtn = document.getElementById('downloadBtn');

      let downloadUrl = data.download_url;
      if (!downloadUrl || !downloadUrl.startsWith('http://localhost')) {
        downloadUrl = `/api/download?id=${currentVideoId}&title=${encodeURIComponent(data.title || 'track')}`;
      }

      let streamUrl = data.download_url;
      if (!streamUrl || !streamUrl.startsWith('http://localhost')) {
        streamUrl = `/api/stream?id=${currentVideoId}`;
      }

      audioPlayer.src = streamUrl;
      audioPlayer.load();

      downloadBtn.href = downloadUrl;
      downloadBtn.setAttribute('download', data.filename || `${data.title}.mp3`);

      resultBox.style.display = 'flex';
    } else {
      alert(`Conversion Error: ${data.message || 'Could not extract audio from this URL.'}`);
    }
  } catch (err) {
    loader.style.display = 'none';
    console.error("Conversion failed:", err);
    alert("Could not connect to converter server. Please ensure the Python server is running!");
  }
}
