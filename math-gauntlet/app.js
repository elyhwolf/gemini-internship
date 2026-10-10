// Minimal Math Gauntlet Engine with Shenanigan Mechanics & Speedrun Timer

const QUESTIONS = [
  // 1-20: Ultra Easy
  { q: "1 + 1 = ?", a: "2", level: "Ultra Easy", hint: "Just warm up!" },
  { q: "3 + 4 = ?", a: "7", level: "Ultra Easy", hint: "Simple addition" },
  { q: "10 - 6 = ?", a: "4", level: "Ultra Easy", hint: "Subtract 6 from 10" },
  { q: "5 + 5 = ?", a: "10", level: "Ultra Easy", hint: "Double five" },
  { q: "9 - 2 = ?", a: "7", level: "Ultra Easy", hint: "🔍 Read carefully! (Shenanigan)", type: "upside_down" },
  { q: "8 + 7 = ?", a: "15", level: "Ultra Easy", hint: "Basic addition" },
  { q: "12 - 5 = ?", a: "7", level: "Ultra Easy", hint: "Subtract 5" },
  { q: "6 + 9 = ?", a: "15", level: "Ultra Easy", hint: "Single digits" },
  { q: "14 - 8 = ?", a: "6", level: "Ultra Easy", hint: "Basic subtraction" },
  { q: "8 + 7 = 15", a: "15", level: "Ultra Easy", hint: "🧩 Click & swap tiles to fix the formula!", type: "rearrange", tiles: ["+", "7", "8", "=", "15"], solution: ["8", "+", "7", "=", "15"] },
  { q: "20 - 9 = ?", a: "11", level: "Ultra Easy", hint: "Subtract 9" },
  { q: "13 + 8 = ?", a: "21", level: "Ultra Easy", hint: "Basic arithmetic" },
  { q: "18 - 4 = ?", a: "14", level: "Ultra Easy", hint: "🏃 Good luck clicking submit button!", type: "runaway" },
  { q: "15 + 9 = ?", a: "24", level: "Ultra Easy", hint: "Add 9" },
  { q: "25 - 11 = ?", a: "14", level: "Ultra Easy", hint: "🌫️ Hover or tap to unblur equation", type: "blurry" },
  { q: "17 + 6 = ?", a: "23", level: "Ultra Easy", hint: "Basic addition" },
  { q: "30 - 14 = ?", a: "16", level: "Ultra Easy", hint: "Subtract 14" },
  { q: "19 + 12 = ?", a: "31", level: "Ultra Easy", hint: "Add 12" },
  { q: "40 - 18 = ?", a: "22", level: "Ultra Easy", hint: "Subtract 18" },
  { q: "24 + 16 = ?", a: "40", level: "Ultra Easy", hint: "Round total" },

  // 21-40: Easy Multiplication & Division
  { q: "3 × 4 = ?", a: "12", level: "Easy", hint: "Times 4" },
  { q: "5 × 6 = ?", a: "30", level: "Easy", hint: "🔄 Mirrored box! Type answer in reverse", type: "reverse_input" },
  { q: "24 ÷ 4 = ?", a: "6", level: "Easy", hint: "Divide by 4" },
  { q: "7 × 4 = ?", a: "28", level: "Easy", hint: "Times 4" },
  { q: "36 ÷ 6 = ?", a: "6", level: "Easy", hint: "〰️ Dizzy math! (Wobbly font)", type: "wobbly" },
  { q: "8 × 7 = ?", a: "56", level: "Easy", hint: "Times 7" },
  { q: "45 ÷ 9 = ?", a: "5", level: "Easy", hint: "Divide by 9" },
  { q: "9 × 6 = ?", a: "54", level: "Easy", hint: "Times 6" },
  { q: "64 ÷ 8 = ?", a: "8", level: "Easy", hint: "Divide by 8" },
  { q: "7 × 4 = 28", a: "28", level: "Easy", hint: "🧩 Click pairs of tiles to rearrange formula", type: "rearrange", tiles: ["=", "28", "7", "×", "4"], solution: ["7", "×", "4", "=", "28"] },
  { q: "81 ÷ 9 = ?", a: "9", level: "Easy", hint: "Square root of 81" },
  { q: "11 × 7 = ?", a: "77", level: "Easy", hint: "Times 7" },
  { q: "64 ÷ 8 = 8", a: "SECRET_DOT", level: "Easy", hint: "👀 Answer is already on screen! Click the period . at the end!", type: "secret_dot" },
  { q: "14 × 3 = ?", a: "42", level: "Easy", hint: "Times 3" },
  { q: "72 ÷ 6 = ?", a: "12", level: "Easy", hint: "Divide by 6" },
  { q: "15 × 4 = ?", a: "60", level: "Easy", hint: "Quarter century times 4" },
  { q: "108 ÷ 9 = ?", a: "12", level: "Easy", hint: "Divide by 9" },
  { q: "16 × 5 = ?", a: "80", level: "Easy", hint: "Times 5" },
  { q: "132 ÷ 11 = ?", a: "12", level: "Easy", hint: "Divide by 11" },
  { q: "18 × 3 = ?", a: "54", level: "Easy", hint: "Times 3" },

  // 41-60: Medium 2-Step & Squares
  { q: "12² = ?", a: "144", level: "Medium", hint: "12 squared" },
  { q: "7 × 8 + 6 = ?", a: "62", level: "Medium", hint: "👻 Invisible Ink! Highlight text with mouse to reveal", type: "invisible" },
  { q: "90 ÷ 5 - 7 = ?", a: "11", level: "Medium", hint: "Divide then subtract" },
  { q: "13² = ?", a: "169", level: "Medium", hint: "13 squared upside down", type: "upside_down" },
  { q: "15 × 6 - 20 = ?", a: "70", level: "Medium", hint: "Multiply then subtract" },
  { q: "(14 + 16) × 3 = ?", a: "90", level: "Medium", hint: "Parentheses first" },
  { q: "144 ÷ 12 + 23 = ?", a: "35", level: "Medium", hint: "Divide then add" },
  { q: "15² - 25 = ?", a: "200", level: "Medium", hint: "Square minus 25" },
  { q: "84 ÷ 4 + 19 = ?", a: "40", level: "Medium", hint: "Divide then add" },
  { q: "16² = ?", a: "256", level: "Medium", hint: "🏃 Slippery submit button strikes again!", type: "runaway" },
  { q: "(25 - 9) × 4 = ?", a: "64", level: "Medium", hint: "Parentheses first" },
  { q: "175 ÷ 5 = ?", a: "35", level: "Medium", hint: "Divide by 5" },
  { q: "18 × 4 - 22 = ?", a: "50", level: "Medium", hint: "Multiply then subtract" },
  { q: "200 ÷ 8 + 15 = ?", a: "40", level: "Medium", hint: "Divide then add" },
  { q: "14 × 6 + 16 = ?", a: "100", level: "Medium", hint: "Multiply then add" },
  { q: "175 ÷ 5 = 35", a: "35", level: "Medium", hint: "🧩 Rearrange formula tiles!", type: "rearrange", tiles: ["35", "=", "175", "÷", "5"], solution: ["175", "÷", "5", "=", "35"] },
  { q: "(45 + 55) ÷ 4 = ?", a: "25", level: "Medium", hint: "Sum then divide" },
  { q: "21 × 4 = ?", a: "84", level: "Medium", hint: "Times 4" },
  { q: "225 ÷ 15 + 35 = ?", a: "50", level: "Medium", hint: "Divide then add" },
  { q: "20² - 100 = ?", a: "300", level: "Medium", hint: "Square minus 100" },

  // 61-80: Hard Algebra, Roots & Powers
  { q: "2⁶ = ?", a: "64", level: "Hard", hint: "2 to the 6th power" },
  { q: "√144 + 28 = ?", a: "40", level: "Hard", hint: "Square root + 28" },
  { q: "Solve x: 3x - 9 = 21", a: "10", level: "Hard", hint: "Find x" },
  { q: "3⁴ = ?", a: "81", level: "Hard", hint: "3 to the 4th power upside down", type: "upside_down" },
  { q: "√256 × 2 = ?", a: "32", level: "Hard", hint: "Square root times 2" },
  { q: "Solve x: 5x + 15 = 65", a: "10", level: "Hard", hint: "Find x" },
  { q: "2⁷ = ?", a: "128", level: "Hard", hint: "2 to the 7th power" },
  { q: "17 × 13 = ?", a: "221", level: "Hard", hint: "Multiplication" },
  { q: "√400 + 45 = ?", a: "65", level: "Hard", hint: "Square root + 45" },
  { q: "Solve x: 4x - 18 = 42", a: "15", level: "Hard", hint: "〰️ Wobbly algebra!", type: "wobbly" },
  { q: "3⁵ - 43 = ?", a: "200", level: "Hard", hint: "Power minus 43" },
  { q: "2⁸ = ?", a: "256", level: "Hard", hint: "2 to the 8th power" },
  { q: "√625 ÷ 5 = ?", a: "5", level: "Hard", hint: "Square root divided by 5" },
  { q: "Solve x: 6x + 24 = 120", a: "16", level: "Hard", hint: "Find x" },
  { q: "14 × 16 = ?", a: "224", level: "Hard", hint: "Multiplication" },
  { q: "2⁹ = ?", a: "512", level: "Hard", hint: "2 to the 9th power" },
  { q: "√900 - 12 = ?", a: "18", level: "Hard", hint: "Square root minus 12" },
  { q: "Solve x: 7x - 21 = 70", a: "13", level: "Hard", hint: "Find x" },
  { q: "15 × 15 + 75 = ?", a: "300", level: "Hard", hint: "Square plus 75" },
  { q: "2¹⁰ ÷ 4 = ?", a: "256", level: "Hard", hint: "Power divided by 4" },

  // 81-100: Expert Calculus, Logarithms & Factorials
  { q: "5! = ?", a: "120", level: "Expert", hint: "Factorial 5 × 4 × 3 × 2 × 1" },
  { q: "log₂(64) = ?", a: "6", level: "Expert", hint: "Logarithm base 2" },
  { q: "d/dx (4x + 9) at x=5", a: "4", level: "Expert", hint: "Derivative value upside down", type: "upside_down" },
  { q: "Solve x: 2ˣ = 128", a: "7", level: "Expert", hint: "Exponent x" },
  { q: "6! ÷ 10 = ?", a: "72", level: "Expert", hint: "Factorial divided by 10" },
  { q: "d/dx (x² + 6x) at x=3", a: "12", level: "Expert", hint: "2x + 6 evaluated at 3" },
  { q: "log₃(81) = ?", a: "4", level: "Expert", hint: "3 to what power equals 81?" },
  { q: "∫₀⁴ 2x dx = ?", a: "16", level: "Expert", hint: "Definite integral [x²] from 0 to 4" },
  { q: "Solve x: 3ˣ = 243", a: "5", level: "Expert", hint: "Exponent x" },
  { q: "(5! + 30) ÷ 3 = ?", a: "50", level: "Expert", hint: "🔄 Mirrored input box!", type: "reverse_input" },
  { q: "d/dx (2x² - 5x) at x=4", a: "11", level: "Expert", hint: "4x - 5 evaluated at 4" },
  { q: "log₂(512) = ?", a: "9", level: "Expert", hint: "2 to what power equals 512?" },
  { q: "∫₀³ 3x² dx = ?", a: "27", level: "Expert", hint: "Definite integral [x³] from 0 to 3" },
  { q: "Solve x: 2⁽ˣ⁺¹⁾ = 64", a: "5", level: "Expert", hint: "Exponent equation" },
  { q: "6! ÷ 24 = ?", a: "30", level: "Expert", hint: "Factorial division" },
  { q: "d/dx (x³ - 4x) at x=2", a: "8", level: "Expert", hint: "3x² - 4 evaluated at 2" },
  { q: "log₁₀(100,000) = ?", a: "5", level: "Expert", hint: "Logarithm base 10" },
  { q: "∫₀² 4x³ dx = ?", a: "16", level: "Expert", hint: "Definite integral [x⁴] from 0 to 2" },
  { q: "7! ÷ 5! = ?", a: "42", level: "Expert", hint: "7 × 6" },
  { q: "d/dx (x⁴ - 2x² + 10) at x=2", a: "24", level: "Expert", hint: "FINAL BOSS! 4x³ - 4x evaluated at 2" }
];

let currentIndex = 0;
let timerInterval = null;
let puzzleTimerInterval = null;
let startTime = 0;
let totalElapsedMs = 0;
let currentMaxPuzzleMs = 10000;
let puzzleTimeRemainingMs = 10000;
let userCoins = 0;
const EXTRA_TIME_COST = 15;
let selectedTileIndex = null;
let currentTiles = [];
let blurryTimeout = null;

/* Lil Tecca - DOPAMINE Background Music Engine */
const EXPLICIT_PLAYLIST_ID = 'OLAK5uy_nhsNzPJhU9ZD8SFMR7Kh8y6CMV-IeWubM';
const CLEAN_PLAYLIST_ID = 'OLAK5uy_l9ZwfYqZdMD4_Jny-ifG5A1WXpxI7M3e8';

let ytPlayer = null;
let isMusicPlaying = false;
let hasSwitchedToCleanPlaylist = false;

function initYTMusicPlayer() {
  if (ytPlayer) return; // avoid duplicate initialization
  if (!window.YT || !window.YT.Player) return;

  try {
    ytPlayer = new YT.Player('ytMusicPlayer', {
      height: '0',
      width: '0',
      playerVars: {
        listType: 'playlist',
        list: EXPLICIT_PLAYLIST_ID, // Default: Original Album Playlist
        autoplay: 1,
        loop: 1,
        controls: 0,
        enablejsapi: 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  } catch (e) {
    console.error("Failed to initialize YT Player:", e);
  }
}

function resetAndReinitYTPlayer() {
  if (ytPlayer) {
    try {
      if (typeof ytPlayer.destroy === 'function') {
        ytPlayer.destroy();
      }
    } catch (e) {}
  }
  ytPlayer = null;
  isMusicPlaying = false;
  hasSwitchedToCleanPlaylist = false;
  devClickAttemptedThisRefresh = false;

  const container = document.getElementById('ytAudioContainer');
  if (container) {
    container.innerHTML = '<div id="ytMusicPlayer"></div>';
  }

  if (window.YT && window.YT.Player) {
    initYTMusicPlayer();
  }
}

// BFCache & Browser Back/Forward Arrow Event Handlers
window.addEventListener('pageshow', (event) => {
  resetAndReinitYTPlayer();
});

window.addEventListener('popstate', () => {
  resetAndReinitYTPlayer();
});

window.onYouTubeIframeAPIReady = function() {
  initYTMusicPlayer();
};

// Check if YT API loaded before app.js parsed (e.g., page refresh / browser cache)
if (window.YT && window.YT.Player) {
  initYTMusicPlayer();
} else {
  // Inject YouTube Iframe API dynamically to ensure handler is registered
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }
}

function onPlayerReady(event) {
  try {
    event.target.playVideo();
  } catch (e) {}
}

// Global trigger to ensure playback on first user gesture after refresh
function tryAutoPlayMusicOnRefresh() {
  if (!isMusicPlaying && ytPlayer && typeof ytPlayer.playVideo === 'function') {
    try {
      ytPlayer.playVideo();
    } catch (e) {}
  }
}

document.addEventListener('pointerdown', tryAutoPlayMusicOnRefresh, { once: false });
document.addEventListener('keydown', tryAutoPlayMusicOnRefresh, { once: false });
document.addEventListener('click', tryAutoPlayMusicOnRefresh, { once: false });

function onPlayerError(event) {
  const errCode = event.data;
  console.warn("YouTube player error event code:", errCode);

  // STRICT FILTER CHECK: YouTube codes 150, 101, and 151 are sent when Restricted Mode or explicit content filters block the track.
  const isExplicitContentFilter = (errCode === 150 || errCode === 101 || errCode === 151);

  if (isExplicitContentFilter && !hasSwitchedToCleanPlaylist) {
    hasSwitchedToCleanPlaylist = true;
    showToast("🧼 Content Filter Detected — Switched to Clean Album! 🎵", 4000);

    try {
      if (ytPlayer && typeof ytPlayer.loadPlaylist === 'function') {
        ytPlayer.loadPlaylist({
          listType: 'playlist',
          list: CLEAN_PLAYLIST_ID
        });
        ytPlayer.playVideo();
      }
    } catch (e) {
      console.error("Failed to switch to clean playlist:", e);
    }
  }
}

function onPlayerStateChange(event) {
  const badge = document.getElementById('musicStatusBadge');
  const btn = document.getElementById('btnPlayPause');
  const disc = document.getElementById('discIcon');
  const title = document.getElementById('musicTrackTitle');
  const widget = document.getElementById('musicPlayerWidget');

  if (event.data === YT.PlayerState.PLAYING) {
    isMusicPlaying = true;
    if (widget) widget.classList.add('visible');
    if (badge) { badge.textContent = "PLAYING"; badge.className = "album-badge"; }
    if (btn) btn.textContent = "❚❚";
    if (disc) disc.classList.remove("paused");

    try {
      const videoData = ytPlayer.getVideoData();
      if (videoData && videoData.title) {
        title.textContent = `Lil Tecca — ${videoData.title.replace(/lil tecca/gi, '').replace(/official/gi, '').trim()}`;
      }
    } catch (e) {}
  } else if (event.data === YT.PlayerState.ENDED) {
    // Automatically advance to next track in DOPAMINE album
    if (ytPlayer && typeof ytPlayer.nextVideo === 'function') {
      ytPlayer.nextVideo();
    }
  } else if (event.data === YT.PlayerState.PAUSED) {
    isMusicPlaying = false;
    if (badge) { badge.textContent = "PAUSED"; badge.className = "album-badge paused"; }
    if (btn) btn.textContent = "▶";
    if (disc) disc.classList.add("paused");
  }
}

function toggleMusicPlay() {
  const widget = document.getElementById('musicPlayerWidget');
  if (widget) widget.classList.add('visible');

  if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') {
    resetAndReinitYTPlayer();
    showToast("🎵 Lil Tecca Audio Player initializing...");
    return;
  }
  try {
    if (isMusicPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  } catch (e) {
    resetAndReinitYTPlayer();
  }
}

function nextMusicTrack() {
  if (ytPlayer && typeof ytPlayer.nextVideo === 'function') {
    ytPlayer.nextVideo();
  }
}

// Audio Synthesizer via Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.15) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function getCoinReward(level) {
  switch(level) {
    case "Ultra Easy": return 1;
    case "Easy": return 5;
    case "Medium": return 15;
    case "Hard": return 30;
    case "Expert": return 50;
    default: return 5;
  }
}

function updateCoinDisplay() {
  const counter = document.getElementById('coinCounter');
  if (counter) counter.textContent = userCoins;
  const buyBtn = document.getElementById('buyTimeBtn');
  if (buyBtn) buyBtn.disabled = (userCoins < EXTRA_TIME_COST);
}

function showCoinPopup(text) {
  const popup = document.getElementById('coinPopup');
  if (!popup) return;
  popup.textContent = text;
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
  }, 800);
}

function buyExtraTime() {
  if (userCoins < EXTRA_TIME_COST) {
    showToast("Not enough coins! Need 15 🪙");
    return;
  }
  userCoins -= EXTRA_TIME_COST;
  updateCoinDisplay();
  puzzleTimeRemainingMs += 5000;
  updatePuzzleTimerUI();
  playTone(1400, 'sine', 0.2);
  showToast("⚡ Bought +5s Extra Time! (-15 🪙)");
}

function calculateMaxPuzzleMs(qNum) {
  // Q1: 10.0s (10000ms), Q100: ~3.5s (3500ms)
  return Math.max(3500, Math.round(10000 - (qNum - 1) * 65));
}

function startGauntlet() {
  document.getElementById('startStage').classList.remove('active');
  document.getElementById('gauntletStage').classList.add('active');
  currentIndex = 0;
  userCoins = 0;
  updateCoinDisplay();
  startSpeedrunTimer();
  renderQuestion();
  setupEventListeners();

  // Make music player widget visible & start playing Lil Tecca - DOPAMINE Album!
  const widget = document.getElementById('musicPlayerWidget');
  if (widget) {
    widget.classList.add('visible');
  }
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
  }
}

function startSpeedrunTimer() {
  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    totalElapsedMs = Date.now() - startTime;
    updateTimerDisplay();
  }, 100);
}

function stopSpeedrunTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
}

function updateTimerDisplay() {
  const totalSecs = Math.floor(totalElapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((totalElapsedMs % 1000) / 100);
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  const timerText = document.getElementById('timerText');
  if (timerText) {
    timerText.textContent = formatted;
  } else {
    document.getElementById('timerDisplay').textContent = formatted;
  }
}

/* Per-Puzzle Countdown Timer (Escalating Speed Limit) */
function startPuzzleCountdown() {
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
  const qNum = currentIndex + 1;
  currentMaxPuzzleMs = calculateMaxPuzzleMs(qNum);
  puzzleTimeRemainingMs = currentMaxPuzzleMs;
  updatePuzzleTimerUI();

  let lastSec = Math.ceil(puzzleTimeRemainingMs / 1000);

  puzzleTimerInterval = setInterval(() => {
    puzzleTimeRemainingMs -= 100;
    const currentSec = Math.ceil(puzzleTimeRemainingMs / 1000);

    // Play urgent tick sound on last 3 seconds
    if (currentSec <= 3 && currentSec !== lastSec && puzzleTimeRemainingMs > 0) {
      playTone(900, 'square', 0.05);
      lastSec = currentSec;
    }

    if (puzzleTimeRemainingMs <= 0) {
      clearInterval(puzzleTimerInterval);
      puzzleTimeRemainingMs = 0;
      updatePuzzleTimerUI();
      handlePuzzleTimeout();
    } else {
      updatePuzzleTimerUI();
    }
  }, 100);
}

function updatePuzzleTimerUI() {
  const pct = Math.max(0, (puzzleTimeRemainingMs / currentMaxPuzzleMs) * 100);
  const secs = (puzzleTimeRemainingMs / 1000).toFixed(1);
  const bar = document.getElementById('puzzleTimerFill');
  const badge = document.getElementById('puzzleTimerBadge');
  const puzzleTimerText = document.getElementById('puzzleTimerText');

  bar.style.width = `${pct}%`;
  if (puzzleTimerText) {
    puzzleTimerText.textContent = `${secs}s`;
  } else {
    badge.textContent = `${secs}s`;
  }

  if (puzzleTimeRemainingMs <= 3000) {
    badge.classList.add('warning');
    bar.style.background = '#ef4444';
  } else {
    badge.classList.remove('warning');
    bar.style.background = '#ef4444';
  }
}

function handlePuzzleTimeout() {
  playTone(150, 'sawtooth', 0.4);
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);

  showToast("⏱️ TIMEOUT! Make 2 FREE THROWS IN A ROW or RESTART! 🏀", 3000);

  document.getElementById('gauntletStage').classList.remove('active');
  document.getElementById('basketballStage').classList.add('active');

  startBasketballMinigame();
}

/* NBA 2K Basketball Free Throw Minigame Engine */
let freeThrowsStreak = 0;
let meterPos = 0;
let meterDirection = 1;
let meterInterval = null;
let isShooting = false;

function startBasketballMinigame() {
  freeThrowsStreak = 0;
  updateStreakDots();
  isShooting = false;

  const ball = document.getElementById('basketballBall');
  ball.className = "basketball";

  const feedback = document.getElementById('shotFeedback');
  feedback.textContent = "PRESS SPACE TO TIME YOUR SHOT!";
  feedback.className = "shot-feedback";

  meterPos = 0;
  meterDirection = 1;
  if (meterInterval) clearInterval(meterInterval);
  meterInterval = setInterval(animateShotMeter, 16);
}

function animateShotMeter() {
  meterPos += meterDirection * 2.5;
  if (meterPos >= 100) {
    meterPos = 100;
    meterDirection = -1;
  } else if (meterPos <= 0) {
    meterPos = 0;
    meterDirection = 1;
  }
  document.getElementById('shotBar').style.left = `${meterPos}%`;
}

function updateStreakDots() {
  const dot1 = document.getElementById('dot1');
  const dot2 = document.getElementById('dot2');
  if (dot1) dot1.className = freeThrowsStreak >= 1 ? "streak-dot active" : "streak-dot";
  if (dot2) dot2.className = freeThrowsStreak >= 2 ? "streak-dot active" : "streak-dot";
}

function shootFreeThrow() {
  const bbStage = document.getElementById('basketballStage');
  if (!bbStage.classList.contains('active') || isShooting) return;

  isShooting = true;
  clearInterval(meterInterval);

  const ball = document.getElementById('basketballBall');
  const feedback = document.getElementById('shotFeedback');

  ball.className = "basketball";
  void ball.offsetWidth; // Force CSS reflow

  // Green Zone: 72% to 88%
  if (meterPos >= 72 && meterPos <= 88) {
    // 🟢 GREEN RELEASE!
    freeThrowsStreak++;
    updateStreakDots();
    playTone(1200, 'sine', 0.2);
    setTimeout(() => playTone(1600, 'triangle', 0.25), 100);

    feedback.textContent = "EXCELLENT RELEASE! 🟢 GREEN SPLASH!";
    feedback.className = "shot-feedback green";
    ball.classList.add('swish');

    if (freeThrowsStreak >= 2) {
      setTimeout(() => {
        showToast("🏀 2 FREE THROWS CLEARED! Returning to Gauntlet!");
        bbStage.classList.remove('active');
        document.getElementById('gauntletStage').classList.add('active');
        renderQuestion();
      }, 1200);
    } else {
      setTimeout(() => {
        ball.className = "basketball";
        feedback.textContent = "1 / 2 MADE! Shoot Free Throw #2!";
        feedback.className = "shot-feedback";
        isShooting = false;
        meterInterval = setInterval(animateShotMeter, 16);
      }, 1200);
    }
  } else {
    // 💀 MISSED FREE THROW -> RESTART GAUNTLET BACK TO QUESTION 1!
    freeThrowsStreak = 0;
    updateStreakDots();
    playTone(100, 'sawtooth', 0.6); // Loud fail buzzer

    feedback.textContent = "MISSED FREE THROW! RESTARTING GAUNTLET BACK TO QUESTION 1! 💀";
    feedback.className = "shot-feedback miss";
    ball.classList.add('clang');

    setTimeout(() => {
      currentIndex = 0; // RESTART GAUNTLET TO QUESTION 1!
      showToast("💀 MISSED FREE THROW! RESETTING GAUNTLET BACK TO QUESTION 1!", 4000);
      bbStage.classList.remove('active');
      document.getElementById('gauntletStage').classList.add('active');
      renderQuestion();
    }, 1600);
  }
}

function renderQuestion() {
  const current = QUESTIONS[currentIndex];
  const qNum = currentIndex + 1;
  const total = QUESTIONS.length;

  document.getElementById('questionCounter').textContent = `${qNum} / ${total}`;
  document.getElementById('difficultyTag').textContent = current.level;

  const eqBox = document.getElementById('equationBox');
  const eqText = document.getElementById('equationText');
  const eqHint = document.getElementById('equationHint');
  const input = document.getElementById('answerInput');
  const form = document.getElementById('answerForm');
  const submitBtn = document.getElementById('submitBtn');
  const tileContainer = document.getElementById('tileContainer');

  // Reset stage classes & shenanigans
  eqBox.className = "equation-box";
  eqText.className = "equation-text";
  eqHint.className = "equation-hint";
  input.className = "answer-input";
  submitBtn.className = "submit-btn";
  submitBtn.style.transform = "none";
  tileContainer.style.display = "none";
  form.style.display = "flex";
  input.disabled = false;

  eqText.textContent = current.q;
  eqHint.textContent = current.hint || "Enter numerical answer";

  // Clear any active blurry memorization timer
  if (blurryTimeout) {
    clearTimeout(blurryTimeout);
    blurryTimeout = null;
  }

  // Start 10-second puzzle countdown timer
  startPuzzleCountdown();

  // Apply specific Shenanigan mechanics
  if (current.type === "upside_down") {
    eqBox.classList.add("upside-down");
  } else if (current.type === "blurry") {
    eqText.classList.add("blurry-text");
    eqHint.textContent = "⏱️ QUICK! You have 2 seconds to memorize the equation!";
    blurryTimeout = setTimeout(() => {
      eqText.classList.add("auto-blurred");
      eqHint.textContent = "🙈 PERMANENTLY BLURRED! Solve from memory!";
      playTone(280, 'sine', 0.2);
    }, 2000);
  } else if (current.type === "invisible") {
    eqText.classList.add("invisible-text");
  } else if (current.type === "wobbly") {
    eqText.classList.add("wobbly-text");
  } else if (current.type === "reverse_input") {
    input.classList.add("reversed");
  } else if (current.type === "runaway") {
    submitBtn.classList.add("runaway");
    setupRunawayBtn(submitBtn);
  } else if (current.type === "secret_dot") {
    eqText.innerHTML = `64 ÷ 8 = 8<span class="secret-dot" onclick="clickSecretDot()">.</span>`;
  } else if (current.type === "rearrange") {
    form.style.display = "none";
    tileContainer.style.display = "flex";
    currentTiles = [...current.tiles];
    renderTiles();
  }

  // Progress bar fill
  const progressPct = (qNum / total) * 100;
  document.getElementById('progressFill').style.width = `${progressPct}%`;

  input.value = '';
  if (current.type !== "rearrange") {
    input.focus();
  }

  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.remove('active');
}

/* Shenanigan Mechanics Handlers */
function setupRunawayBtn(btn) {
  btn.onmouseover = (e) => {
    const offsetX = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 80);
    const offsetY = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 40);
    btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };
}

function clickSecretDot() {
  playTone(880, 'sine', 0.2);
  showToast("Found the hidden dot! 🎯");
  advanceQuestion();
}

/* Tile Rearrange Interactive Mechanic */
function renderTiles() {
  const container = document.getElementById('tileContainer');
  container.innerHTML = '';

  currentTiles.forEach((tile, index) => {
    const tileDiv = document.createElement('div');
    tileDiv.className = `tile-block ${selectedTileIndex === index ? 'selected' : ''}`;
    tileDiv.textContent = tile;
    tileDiv.onclick = () => selectTile(index);
    container.appendChild(tileDiv);
  });
}

function selectTile(index) {
  playTone(520, 'square', 0.08);
  if (selectedTileIndex === null) {
    selectedTileIndex = index;
  } else {
    // Swap tiles
    const temp = currentTiles[selectedTileIndex];
    currentTiles[selectedTileIndex] = currentTiles[index];
    currentTiles[index] = temp;
    selectedTileIndex = null;

    // Check solution
    const current = QUESTIONS[currentIndex];
    if (JSON.stringify(currentTiles) === JSON.stringify(current.solution)) {
      playTone(660, 'sine', 0.15);
      advanceQuestion();
      return;
    }
  }
  renderTiles();
}

function submitAnswer(e) {
  e.preventDefault();
  const input = document.getElementById('answerInput');
  let userAns = input.value.trim();
  const current = QUESTIONS[currentIndex];

  // Handle reversed input shenanigan
  if (current.type === "reverse_input") {
    userAns = userAns.split('').reverse().join('');
  }

  // Check Easter Eggs first
  if (checkEasterEgg(userAns)) return;

  if (userAns === current.a) {
    playTone(750, 'sine', 0.12);
    advanceQuestion();
  } else {
    playTone(200, 'sawtooth', 0.2);
    showError();
  }
}

function advanceQuestion() {
  const current = QUESTIONS[currentIndex];
  if (current) {
    const earned = getCoinReward(current.level);
    userCoins += earned;
    updateCoinDisplay();
    showCoinPopup(`+${earned} 🪙`);

    const badge = document.getElementById('coinBadge');
    if (badge) {
      badge.classList.add('gain');
      setTimeout(() => badge.classList.remove('gain'), 400);
    }
  }

  currentIndex++;
  if (currentIndex >= QUESTIONS.length) {
    stopSpeedrunTimer();
    triggerLevel2Prank();
  } else {
    renderQuestion();
  }
}

function showError() {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.add('active');
  const input = document.getElementById('answerInput');
  input.select();
}

/* Toast Message & Easter Eggs System */
function showToast(text, duration = 2500) {
  const toast = document.getElementById('toastMsg');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function checkEasterEgg(inputVal) {
  const val = inputVal.toLowerCase();

  if (val === '42') {
    showToast("🌌 42: The answer to the universe! (+1 Question Skip)");
    playTone(1000, 'sine', 0.3);
    advanceQuestion();
    return true;
  } else if (val === '69' || val === '420') {
    showToast("Nice 😎");
    playTone(800, 'triangle', 0.2);
    return false;
  } else if (val === 'rick' || val === 'never') {
    showToast("🎵 Never gonna give you up!");
    playTone(440, 'square', 0.1);
    setTimeout(() => playTone(554, 'square', 0.1), 120);
    setTimeout(() => playTone(659, 'square', 0.15), 240);
    return false;
  } else if (val === 'ely' || val === 'wolf') {
    showToast("⚡ Developer Mode Activated!");
    triggerConfetti();
    return false;
  } else if (val === 'skip') {
    showToast("Nice try! No skipping without solving 😜");
    return false;
  }
  return false;
}

/* Konami Code Detector */
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    // Spacebar listener for Basketball 2K shooting
    if (e.code === 'Space' || e.key === ' ') {
      const bbStage = document.getElementById('basketballStage');
      if (bbStage && bbStage.classList.contains('active')) {
        e.preventDefault();
        shootFreeThrow();
        return;
      }
    }

    // Konami Code detector
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        showToast("🎮 KONAMI CODE UNLOCKED! Party Time 🎉");
        triggerConfetti();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

/* Confetti Particle Engine */
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ff0055', '#00e5ff', '#ffea00'];

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 50,
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() - 0.7) * 24,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.vRot;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}

/* Completion & Level 2 Prank Sequence */
function triggerLevel2Prank() {
  document.getElementById('gauntletStage').classList.remove('active');
  const prankStage = document.getElementById('prankStage');
  const prankText = document.getElementById('prankText');

  const totalSecs = (totalElapsedMs / 1000).toFixed(1);

  prankStage.classList.add('active');
  prankText.textContent = "NOW LEVEL 2";
  prankText.classList.remove('fade-out');

  const subtext = document.createElement('div');
  subtext.className = 'prank-subtext';
  subtext.textContent = `FINAL SPEEDRUN TIME: ${totalSecs}s`;
  prankStage.appendChild(subtext);

  // 1. Burst Confetti
  triggerConfetti();

  // 2. After 2.5 seconds, fade out NOW LEVEL 2 & show "just kidding"
  setTimeout(() => {
    prankText.classList.add('fade-out');

    setTimeout(() => {
      prankText.textContent = "just kidding";
      prankText.classList.remove('fade-out');

      // 3. After 2 seconds, open new tab & attempt tab close
      setTimeout(() => {
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        try {
          window.close();
        } catch (e) {}
      }, 2000);

    }, 500);

  }, 2500);
}

/* Dev Passcode Modal Mechanics */
let devClickAttemptedThisRefresh = false;

function openDevModal() {
  // Only 1 attempt allowed per page refresh to prevent spamming!
  if (devClickAttemptedThisRefresh) {
    return;
  }
  devClickAttemptedThisRefresh = true;

  // 20% chance of opening the modal on that single attempt
  if (Math.random() > 0.20) {
    return;
  }

  const modal = document.getElementById('devModal');
  const input = document.getElementById('devCodeInput');
  const err = document.getElementById('devModalError');

  if (modal) {
    modal.classList.add('active');
  }
  if (err) {
    err.classList.remove('active');
  }
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
}

function closeDevModal(e) {
  if (!e || e.target.id === 'devModal' || e.target.classList.contains('modal-close-btn')) {
    const modal = document.getElementById('devModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

function handleDevCodeInput(e) {
  const input = document.getElementById('devCodeInput');
  const err = document.getElementById('devModalError');
  if (err) err.classList.remove('active');

  if (input && input.value.length === 4) {
    submitDevCode();
  }
}

function submitDevCode() {
  const input = document.getElementById('devCodeInput');
  const err = document.getElementById('devModalError');
  const code = input ? input.value.trim() : '';

  if (code === '0000') {
    // 🔓 CORRECT PASSCODE! Fast-forward to Question 90
    playTone(1200, 'sine', 0.15);
    setTimeout(() => playTone(1600, 'sine', 0.25), 100);
    triggerConfetti();

    closeDevModal();
    showToast("⚡ DEV OVERRIDE UNLOCKED! Jumped to Question 90 / 100 🚀", 3500);

    // If currently on start stage, activate gauntlet stage
    const startStage = document.getElementById('startStage');
    const gauntletStage = document.getElementById('gauntletStage');
    if (startStage && startStage.classList.contains('active')) {
      startGauntlet();
    } else if (gauntletStage && !gauntletStage.classList.contains('active')) {
      const bbStage = document.getElementById('basketballStage');
      const prankStage = document.getElementById('prankStage');
      if (bbStage) bbStage.classList.remove('active');
      if (prankStage) prankStage.classList.remove('active');
      gauntletStage.classList.add('active');
    }

    // Set to Question 90 (0-indexed: index 89)
    currentIndex = 89;
    renderQuestion();

  } else {
    // ❌ INCORRECT PASSCODE
    playTone(180, 'sawtooth', 0.3);
    if (err) err.classList.add('active');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}
