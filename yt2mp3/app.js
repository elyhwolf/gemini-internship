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
    if (error) error.textContent = '❌ INVALID ACCESS CODE. HINT: What is Ely? (Adjective)';
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

const PIECE_UNICODE = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
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

  updateTurnUI("YOUR TURN (WHITE)");
  renderChessBoard();
}

function renderChessBoard() {
  const boardEl = document.getElementById('chessBoard');
  const blackCapEl = document.getElementById('blackCapturedDeck');
  const whiteCapEl = document.getElementById('whiteCapturedDeck');
  
  if (!boardEl) return;
  boardEl.innerHTML = '';

  if (blackCapEl) blackCapEl.innerHTML = capturedBlack.map(p => PIECE_UNICODE[p] || '').join(' ');
  if (whiteCapEl) whiteCapEl.innerHTML = capturedWhite.map(p => PIECE_UNICODE[p] || '').join(' ');

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      sq.className = `chess-square ${isDark ? 'dark' : 'light'}`;
      
      const piece = chessBoardState[r][c];
      if (piece !== '.') {
        sq.textContent = PIECE_UNICODE[piece] || piece;
      }

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      if (validMoveTargets.some(m => m.r === r && m.c === c)) {
        sq.classList.add('valid-target');
      }

      sq.onclick = () => handleSquareClick(r, c);
      boardEl.appendChild(sq);
    }
  }
}

function handleSquareClick(r, c) {
  if (currentTurn !== 'W') return; // Monster is thinking

  const piece = chessBoardState[r][c];

  // If clicking on valid target square
  if (selectedSquare && validMoveTargets.some(m => m.r === r && m.c === c)) {
    makeMove(selectedSquare.r, selectedSquare.c, r, c);
    selectedSquare = null;
    validMoveTargets = [];
    renderChessBoard();

    // Trigger Monster AI turn if White played
    if (currentTurn === 'B') {
      updateTurnUI("MONSTER CONTEMPLATING... (1500 ELO)");
      setTimeout(makeMonsterAIMove, 600);
    }
    return;
  }

  // Select player's White piece (Uppercase)
  if (piece !== '.' && isWhitePiece(piece)) {
    selectedSquare = { r, c };
    validMoveTargets = getLegalMovesForSquare(r, c, chessBoardState);
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

  chessBoardState[toR][toC] = p;
  chessBoardState[fromR][fromC] = '.';

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
  const bestMove = getBestMoveMinimax(chessBoardState, 3, -100000, 100000, true);
  
  if (bestMove && bestMove.move) {
    const { fromR, fromC, toR, toC } = bestMove.move;
    makeMove(fromR, fromC, toR, toC);
    updateTurnUI("YOUR TURN (WHITE)");
  } else {
    updateTurnUI("CHECKMATE! YOU DEFEATED THE MONSTER!");
  }
  
  renderChessBoard();
}

function getBestMoveMinimax(board, depth, alpha, beta, isMaximizing) {
  const allMoves = getAllLegalMoves(board, isMaximizing ? 'B' : 'W');
  if (depth === 0 || allMoves.length === 0) {
    return { score: evaluateBoard(board) };
  }

  let bestMove = null;
  let bestScore = isMaximizing ? -100000 : 100000;

  for (const move of allMoves) {
    const tempBoard = cloneBoard(board);
    tempBoard[move.toR][move.toC] = tempBoard[move.fromR][move.fromC];
    tempBoard[move.fromR][move.fromC] = '.';

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

function getAllLegalMoves(board, side) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p !== '.' && ((side === 'W' && isWhitePiece(p)) || (side === 'B' && isBlackPiece(p)))) {
        const sqMoves = getLegalMovesForSquare(r, c, board);
        sqMoves.forEach(m => moves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c }));
      }
    }
  }
  return moves;
}

function getLegalMovesForSquare(r, c, board) {
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
  }

  return moves;
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

  audioPlayer.addEventListener('play', () => {
    if (playIcon) playIcon.textContent = '❚❚';
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateProgress);
  });

  audioPlayer.addEventListener('pause', () => {
    if (playIcon) playIcon.textContent = '▶';
    cancelAnimationFrame(rafId);
  });

  audioPlayer.addEventListener('ended', () => {
    if (playIcon) playIcon.textContent = '▶';
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

  if (audioPlayer && audioPlayer.src && audioPlayer.src.length > 5 && !audioPlayer.src.includes('about:blank')) {
    if (audioPlayer.paused) {
      audioPlayer.play().then(() => {
        if (playIcon) playIcon.textContent = '❚❚';
      }).catch(err => {
        console.log("Audio play error:", err);
        playFallbackEmbed();
      });
    } else {
      audioPlayer.pause();
      if (playIcon) playIcon.textContent = '▶';
    }
  } else {
    playFallbackEmbed();
  }
}

function playFallbackEmbed() {
  const playIcon = document.getElementById('playIcon');
  let iframe = document.getElementById('ytAudioIframe');

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'ytAudioIframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  if (isPlayingEmbed) {
    iframe.src = 'about:blank';
    isPlayingEmbed = false;
    if (playIcon) playIcon.textContent = '▶';
  } else {
    iframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&enablejsapi=1`;
    isPlayingEmbed = true;
    if (playIcon) playIcon.textContent = '❚❚';
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
      if (playIcon) playIcon.textContent = '▶';
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
