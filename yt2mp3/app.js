// DripSwitch Studio — YouTube & YouTube Music to MP3 Converter JS (Optimized 60FPS)
// Includes Triple-Click Secret Easter Egg & Flappy Bird Hacker Engine!

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
