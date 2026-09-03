// DripSwitch Studio — YouTube & YouTube Music to MP3 Converter JS (Optimized 60FPS)

let audioPlayer = null;
let isSeeking = false;
let rafId = null;

document.addEventListener('DOMContentLoaded', () => {
  initAudioDeck();
});

function initAudioDeck() {
  audioPlayer = document.getElementById('audioPlayer');
  const scrubber = document.getElementById('audioScrubber');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const totalTimeDisplay = document.getElementById('totalTimeDisplay');
  const playIcon = document.getElementById('playIcon');

  if (!audioPlayer) return;

  // Throttled 60FPS Animation Frame Renderer for smooth audio progress updates
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
    const response = await fetch('http://localhost:5177/api/convert', {
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
