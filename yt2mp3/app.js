// DripSwitch Studio — YouTube & YouTube Music to MP3 Converter JS (Optimized 60FPS)
// Includes Triple-Click Secret Easter Egg, Flappy Bird Hacker Engine & Custom BGM Audio Looper!

let audioPlayer = null;
let isSeeking = false;
let rafId = null;

// Logo Triple Click Tracker
let logoClickTimestamps = [];

// BGM Custom Audio Engine
let bgmAudio = new Audio();
bgmAudio.loop = true;
let isBgmMuted = false;
let currentBgmName = "Cyber Retro Chiptune BGM";

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
    if (error) error.textContent = '❌ INVALID ACCESS CODE. HINT: ElyIsGreat';
    if (input) input.style.borderColor = '#ff3366';
  }
}

/* ====================================================== */
/* CUSTOM BGM AUDIO FILE UPLOADER & LOOPER */
/* ====================================================== */

function handleBgmUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const objectUrl = URL.createObjectURL(file);
  bgmAudio.src = objectUrl;
  bgmAudio.loop = true;
  bgmAudio.volume = document.getElementById('bgmVolumeSlider') ? parseFloat(document.getElementById('bgmVolumeSlider').value) : 0.5;

  currentBgmName = file.name;
  const statusElem = document.getElementById('bgmTrackTitle');
  if (statusElem) {
    statusElem.textContent = `Looping: ${file.name}`;
    statusElem.style.color = '#00ff66';
  }

  if (!isBgmMuted && document.getElementById('hackerTerminalScreen').style.display === 'block') {
    bgmAudio.play().catch(err => console.log("BGM autoplay blocked:", err));
  }
}

function toggleBgmMute() {
  isBgmMuted = !isBgmMuted;
  const btn = document.getElementById('bgmToggleBtn');

  if (isBgmMuted) {
    bgmAudio.pause();
    if (btn) {
      btn.textContent = '🔇 BGM OFF';
      btn.style.borderColor = '#ff3366';
      btn.style.color = '#ff3366';
    }
  } else {
    if (bgmAudio.src) {
      bgmAudio.play().catch(err => console.log("BGM play error:", err));
    }
    if (btn) {
      btn.textContent = '🔊 BGM ON';
      btn.style.borderColor = '#00e5ff';
      btn.style.color = '#00e5ff';
    }
  }
}

function setBgmVolume(val) {
  bgmAudio.volume = parseFloat(val);
}

/* ====================================================== */
/* HACKER TERMINAL MATRIX RAIN & FLAPPY BIRD GAME ENGINE */
/* ====================================================== */

let matrixInterval = null;
let flappyAnimationId = null;

function launchHackerTerminal() {
  const screen = document.getElementById('hackerTerminalScreen');
  if (screen) {
    screen.style.display = 'block';
    startMatrixRain();
    initFlappyBirdGame();

    // Start background music loop
    if (bgmAudio.src && !isBgmMuted) {
      bgmAudio.play().catch(err => console.log("BGM playback blocked:", err));
    }
  }
}

function exitHackerTerminal() {
  const screen = document.getElementById('hackerTerminalScreen');
  if (screen) screen.style.display = 'none';
  if (matrixInterval) clearInterval(matrixInterval);
  if (flappyAnimationId) cancelAnimationFrame(flappyAnimationId);
  bgmAudio.pause();
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
    ctx.fillStyle = 'rgba(2, 10, 5, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff66';
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

function gameLoop() {
  const canvas = document.getElementById('flappyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#001207';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isGameStarted && !isGameOver) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
      triggerGameOver();
    }

    frameCount++;
    if (frameCount % 90 === 0) {
      const gap = 120;
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
      p.x -= 2.2;

      ctx.fillStyle = '#00ff66';
      ctx.fillRect(p.x, 0, 45, p.top);
      ctx.strokeStyle = '#003311';
      ctx.strokeRect(p.x, 0, 45, p.top);

      ctx.fillRect(p.x, canvas.height - p.bottom, 45, p.bottom);
      ctx.strokeRect(p.x, canvas.height - p.bottom, 45, p.bottom);

      if (!p.passed && p.x + 45 < bird.x) {
        p.passed = true;
        score++;
        document.getElementById('flappyScore').textContent = score;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('dripswitch_flappy_highscore', highScore);
          document.getElementById('flappyHighScore').textContent = highScore;
        }
      }

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + 45 &&
        (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom)
      ) {
        triggerGameOver();
      }

      if (p.x + 45 < 0) {
        pipes.splice(i, 1);
      }
    }
  }

  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#00e5ff';
  ctx.shadowColor = '#00ff66';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bird.x - 4, bird.y - 2, 6, 4);

  if (!isGameOver) {
    flappyAnimationId = requestAnimationFrame(gameLoop);
  }
}

function triggerGameOver() {
  isGameOver = true;
  document.getElementById('flappyGameOverBox').style.display = 'flex';
}

/* ====================================================== */
/* EXISTING AUDIO PLAYER & CONVERSION LOGIC */
/* ====================================================== */

function initAudioDeck() {
  audioPlayer = document.getElementById('audioPlayer');
  const scrubber = document.getElementById('audioScrubber');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const totalTimeDisplay = document.getElementById('totalTimeDisplay');
  const playIcon = document.getElementById('playIcon');

  if (!audioPlayer) return;

  function updateProgress() {
    if (audioPlayer && audioPlayer.duration && !isSeeking && !audioPlayer.paused) {
      const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      if (scrubber) scrubber.value = pct;
      if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
      if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    }
    if (!audioPlayer.paused) {
      rafId = requestAnimationFrame(updateProgress);
    }
  }

  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.paused) {
      if (audioPlayer.duration) {
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        if (scrubber) scrubber.value = pct;
        if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
      }
    }
  });

  audioPlayer.addEventListener('loadedmetadata', () => {
    if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
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
  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
}

function seekAudio(percent) {
  if (!audioPlayer) audioPlayer = document.getElementById('audioPlayer');
  if (audioPlayer && audioPlayer.duration) {
    const targetTime = (percent / 100) * audioPlayer.duration;
    audioPlayer.currentTime = targetTime;
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(targetTime);
  }
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
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
    const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5177'
      : window.location.origin;

    const response = await fetch(`${apiBase}/api/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    const data = await response.json();
    loader.style.display = 'none';

    if (data.success) {
      document.getElementById('trackTitle').textContent = data.title || 'Audio Track';
      document.getElementById('trackUploader').textContent = `Creator: ${data.uploader || 'YouTube Music'}`;
      document.getElementById('trackThumb').src = data.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
      
      audioPlayer = document.getElementById('audioPlayer');
      const downloadBtn = document.getElementById('downloadBtn');

      if (data.download_url) {
        audioPlayer.src = data.download_url;
        audioPlayer.load();
        downloadBtn.href = data.download_url;
        if (data.filename) downloadBtn.setAttribute('download', data.filename);
      }

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
