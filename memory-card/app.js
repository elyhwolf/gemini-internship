/* ==========================================================================
   ALBUM COVER MEMORY MATCH - JAVASCRIPT ENGINE
   ========================================================================== */

// 6 User Album Cover Assets
const ALBUM_ASSETS = [
  { id: 'album1', title: 'Oval II / Drake', src: './assets/album1.jpg' },
  { id: 'album2', title: 'Illmatic - Nas', src: './assets/album2.jpg' },
  { id: 'album3', title: 'Currents - Tame Impala', src: './assets/album3.jpg' },
  { id: 'album4', title: 'Ken Carson / Lone', src: './assets/album4.jpg' },
  { id: 'album5', title: 'Lauryn Hill', src: './assets/album5.png' },
  { id: 'album6', title: 'TEC - Lil Tecca', src: './assets/album6.jpg' }
];

// Game State Variables
let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchesFound = 0;
let timerInterval = null;
let secondsElapsed = 0;
let gameStarted = false;
let audioMuted = false;

// Audio Context (Web Audio API Synthesizer)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synth Sound Generators
function playFlipSound() {
  if (audioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function playMatchSound() {
  if (audioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Major Chord Chime (E5 -> G#5 -> B5)
  const freqs = [659.25, 830.61, 987.77];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

    gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.05);
    osc.stop(ctx.currentTime + idx * 0.05 + 0.35);
  });
}

function playMismatchSound() {
  if (audioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function playWinSound() {
  if (audioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.1);
    osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
  });
}

// DOM Elements
const memoryGrid = document.getElementById('memoryGrid');
const timerDisplay = document.getElementById('timerDisplay');
const movesDisplay = document.getElementById('movesDisplay');
const matchesDisplay = document.getElementById('matchesDisplay');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIconOn = document.getElementById('soundIconOn');
const soundIconOff = document.getElementById('soundIconOff');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const finalTime = document.getElementById('finalTime');
const finalMoves = document.getElementById('finalMoves');
const starRating = document.getElementById('starRating');
const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');

// Initialize Deck
function initDeck() {
  // Pair 6 albums => 12 cards total
  const paired = [];
  ALBUM_ASSETS.forEach(item => {
    paired.push({ ...item, uniqueId: item.id + '_a' });
    paired.push({ ...item, uniqueId: item.id + '_b' });
  });

  // Fisher-Yates Shuffle
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }

  deck = paired;
}

// Render Card Elements into DOM
function renderBoard() {
  memoryGrid.innerHTML = '';
  deck.forEach((cardData, index) => {
    const cardEl = document.createElement('div');
    cardEl.classList.add('memory-card');
    cardEl.dataset.albumId = cardData.id;
    cardEl.dataset.index = index;

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-back">
          <div class="vinyl-center-hole">
            <svg class="vinyl-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>
        <div class="card-front">
          <img src="${cardData.src}" alt="${cardData.title}" class="album-img" loading="eager" />
        </div>
      </div>
    `;

    cardEl.addEventListener('click', () => handleCardClick(cardEl));
    memoryGrid.appendChild(cardEl);
  });
}

// Timer Logic
function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  secondsElapsed = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  gameStarted = false;
}

function updateTimerUI() {
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  timerDisplay.textContent = formatted;
}

// Card Click Logic
function handleCardClick(cardEl) {
  if (lockBoard) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

  startTimer();
  playFlipSound();

  cardEl.classList.add('flipped');

  if (!firstCard) {
    firstCard = cardEl;
    return;
  }

  secondCard = cardEl;
  lockBoard = true;
  moves++;
  movesDisplay.textContent = moves;

  checkForMatch();
}

// Check if cards match
function checkForMatch() {
  const isMatch = firstCard.dataset.albumId === secondCard.dataset.albumId;

  if (isMatch) {
    disableMatchedCards();
  } else {
    unflipCards();
  }
}

function disableMatchedCards() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');

  matchesFound++;
  matchesDisplay.textContent = `${matchesFound} / ${ALBUM_ASSETS.length}`;
  playMatchSound();

  resetBoardPointers();

  if (matchesFound === ALBUM_ASSETS.length) {
    handleVictory();
  }
}

function unflipCards() {
  setTimeout(() => {
    playMismatchSound();
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoardPointers();
  }, 900);
}

function resetBoardPointers() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Victory Event
function handleVictory() {
  stopTimer();
  playWinSound();

  const timeText = timerDisplay.textContent;
  finalTime.textContent = timeText;
  finalMoves.textContent = moves;

  // Compute Star Rating
  // Perfect <= 8 moves (3 stars), <= 12 (2 stars), > 12 (1 star)
  const stars = starRating.querySelectorAll('.star-svg');
  stars.forEach((star, idx) => {
    if (moves <= 8) {
      star.classList.add('filled');
    } else if (moves <= 12) {
      if (idx < 2) star.classList.add('filled');
      else star.classList.remove('filled');
    } else {
      if (idx < 1) star.classList.add('filled');
      else star.classList.remove('filled');
    }
  });

  setTimeout(() => {
    winModal.classList.remove('hidden');
    winModal.setAttribute('aria-hidden', 'false');
    triggerConfetti();
  }, 500);
}

// Reset / Restart Game
function resetGame() {
  stopTimer();
  secondsElapsed = 0;
  moves = 0;
  matchesFound = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameStarted = false;

  timerDisplay.textContent = '00:00';
  movesDisplay.textContent = '0';
  matchesDisplay.textContent = `0 / ${ALBUM_ASSETS.length}`;

  winModal.classList.add('hidden');
  winModal.setAttribute('aria-hidden', 'true');

  initDeck();
  renderBoard();
}

// Audio Toggle Event
soundToggleBtn.addEventListener('click', () => {
  audioMuted = !audioMuted;
  if (audioMuted) {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
  } else {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
    getAudioContext();
  }
});

// Event Listeners for Restart & Modal Play Again
restartBtn.addEventListener('click', resetGame);
modalPlayAgainBtn.addEventListener('click', resetGame);

// Confetti Particle Animation inside Win Modal
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const particles = [];
  const colors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#ffffff', '#ec4899'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.7) * 12,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2
    });
  }

  let animationId = null;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.alpha <= 0) return;
      activeParticles++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= 0.012;
      p.rotation += p.vRot;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (activeParticles > 0) {
      animationId = requestAnimationFrame(updateConfetti);
    }
  }

  updateConfetti();
}

// Ambient Background Canvas Animation
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const nodes = [];
  for (let i = 0; i < 25; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.3 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0) node.x = width;
      if (node.x > width) node.x = 0;
      if (node.y < 0) node.y = height;
      if (node.y > height) node.y = 0;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${node.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }

  loop();
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  resetGame();
});
