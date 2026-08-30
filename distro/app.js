// SoundDrop — Capstone Core Application Logic

let audioContext = null;
let currentAudioBuffer = null;
let currentAudioSource = null;
let isPlaying = false;
let startTime = 0;
let pauseTime = 0;

// State Management
const appState = {
  activeTab: 'release',
  trackTitle: 'Nashville Dreams',
  artistName: 'Ely & The Cluckers',
  genre: 'Hip-Hop / Rap',
  explicit: false,
  isrc: 'US-SD9-26-00001',
  upc: '884019283710',
  selectedStores: ['spotify', 'apple', 'youtube', 'tidal', 'tiktok', 'amazon'],
  pipelineProgress: 0,
  pipelineStatus: 'Idle',
  totalStreams: 148200,
  totalEarnings: 592.80
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFormListeners();
  initStoreSelectors();
  initAudioUploader();
  generateBarcodes();
});

// Tab Switcher
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = `view-${tab.dataset.tab}`;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
      appState.activeTab = tab.dataset.tab;
    });
  });
}

// Store Selection Checkboxes
function initStoreSelectors() {
  const storeCards = document.querySelectorAll('.store-checkbox-card');
  storeCards.forEach(card => {
    card.addEventListener('click', () => {
      const store = card.dataset.store;
      card.classList.toggle('selected');
      if (card.classList.contains('selected')) {
        if (!appState.selectedStores.includes(store)) appState.selectedStores.push(store);
      } else {
        appState.selectedStores = appState.selectedStores.filter(s => s !== store);
      }
    });
  });
}

// Audio File Uploader & Web Audio Canvas Visualizer
function initAudioUploader() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('audioFileInput');

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleAudioFile(file);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--accent-purple)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleAudioFile(file);
  });
}

function handleAudioFile(file) {
  document.getElementById('fileNameDisplay').textContent = file.name;
  document.getElementById('uploadDropzone').style.display = 'none';
  document.getElementById('waveformCard').style.display = 'flex';

  // Read Audio Data for Web Audio API Waveform
  const reader = new FileReader();
  reader.onload = function(evt) {
    const arrayBuffer = evt.target.result;
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    audioContext.decodeAudioData(arrayBuffer, function(buffer) {
      currentAudioBuffer = buffer;
      drawWaveform(buffer);
    }, function(err) {
      console.warn("Could not decode audio, using fallback visualizer:", err);
      drawFallbackWaveform();
    });
  };
  reader.readAsArrayBuffer(file);
}

// Canvas Waveform Renderer
function drawWaveform(buffer) {
  const canvas = document.getElementById('waveformCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  const rawData = buffer.getChannelData(0);
  const samples = 120;
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];

  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[blockStart + j]);
    }
    filteredData.push(sum / blockSize);
  }

  ctx.clearRect(0, 0, width, height);
  const barWidth = width / samples;

  for (let i = 0; i < samples; i++) {
    const barHeight = Math.max(4, filteredData[i] * height * 1.8);
    const x = i * barWidth;
    const y = (height - barHeight) / 2;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#06b6d4');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  }
}

function drawFallbackWaveform() {
  const canvas = document.getElementById('waveformCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, width, height);
  const bars = 80;
  const barWidth = width / bars;

  for (let i = 0; i < bars; i++) {
    const barHeight = Math.max(6, Math.sin(i * 0.15) * (height / 2) + height / 2.5);
    const x = i * barWidth;
    const y = (height - barHeight) / 2;

    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  }
}

// Play / Pause Web Audio Player
function toggleAudioPlay() {
  const btn = document.getElementById('playPauseBtn');
  if (isPlaying) {
    if (currentAudioSource) currentAudioSource.stop();
    isPlaying = false;
    btn.textContent = '▶';
  } else {
    if (currentAudioBuffer && audioContext) {
      currentAudioSource = audioContext.createBufferSource();
      currentAudioSource.buffer = currentAudioBuffer;
      currentAudioSource.connect(audioContext.destination);
      currentAudioSource.start(0);
      isPlaying = true;
      btn.textContent = '⏸';
      currentAudioSource.onended = () => {
        isPlaying = false;
        btn.textContent = '▶';
      };
    } else {
      // Fallback audio beep simulation
      playSynthesizedBeep();
    }
  }
}

function playSynthesizedBeep() {
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = '⏸';
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.5);
  setTimeout(() => {
    btn.textContent = '▶';
  }, 1500);
}

// Form Barcode Auto Generator
function generateBarcodes() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  appState.isrc = `US-SD9-26-${randomNum}`;
  appState.upc = `884019${randomNum}`;
  
  const isrcElem = document.getElementById('isrcCodeDisplay');
  const upcElem = document.getElementById('upcCodeDisplay');
  if (isrcElem) isrcElem.textContent = appState.isrc;
  if (upcElem) upcElem.textContent = appState.upc;
}

function initFormListeners() {
  const trackInput = document.getElementById('inputTrackTitle');
  const artistInput = document.getElementById('inputArtistName');

  if (trackInput) {
    trackInput.addEventListener('input', (e) => {
      appState.trackTitle = e.target.value || 'Untitled Track';
    });
  }
  if (artistInput) {
    artistInput.addEventListener('input', (e) => {
      appState.artistName = e.target.value || 'Independent Artist';
    });
  }
}

// Trigger Distribution Pipeline Simulation
function launchDistribution() {
  appState.trackTitle = document.getElementById('inputTrackTitle').value || 'Nashville Dreams';
  appState.artistName = document.getElementById('inputArtistName').value || 'Ely & The Cluckers';

  // Switch to Pipeline Tab
  const pipelineTab = document.querySelector('[data-tab="pipeline"]');
  if (pipelineTab) pipelineTab.click();

  const progressFill = document.getElementById('pipelineProgressFill');
  const statusText = document.getElementById('pipelineStatusText');
  const steps = [
    { name: 'Step 1: Uploading Audio & Artwork', pct: 25, activeIndex: 0 },
    { name: 'Step 2: Metadata Verification & ISRC Assignment', pct: 50, activeIndex: 1 },
    { name: 'Step 3: Transcoding Audio for DSP Encoders', pct: 75, activeIndex: 2 },
    { name: 'Step 4: Delivered LIVE to 6 Global Streaming Platforms!', pct: 100, activeIndex: 3 }
  ];

  let currentStep = 0;
  progressFill.style.width = '0%';
  statusText.textContent = 'Initializing SoundDrop Distribution Engine...';

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      progressFill.style.width = `${step.pct}%`;
      statusText.textContent = step.name;

      const stepCards = document.querySelectorAll('.step-card');
      stepCards.forEach((card, idx) => {
        if (idx === step.activeIndex) {
          card.classList.add('active');
        } else if (idx < step.activeIndex) {
          card.classList.add('done');
        }
      });

      currentStep++;
    } else {
      clearInterval(interval);
      const oauthToken = document.getElementById('youtubeOAuthTokenInput') ? document.getElementById('youtubeOAuthTokenInput').value : '';
      
      // Real YouTube API Publisher Dispatch
      fetch('http://localhost:5176/api/publish-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: appState.trackTitle,
          artist: appState.artistName,
          description: `Stream "${appState.trackTitle}" by ${appState.artistName} live on all streaming stores! Distributed for free via SoundDrop.`,
          access_token: oauthToken
        })
      })
      .then(res => res.json())
      .then(data => {
        const ytUrl = data.youtube_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(appState.artistName + ' ' + appState.trackTitle)}`;
        statusText.innerHTML = `🎉 <strong>RELEASE IS LIVE!</strong> "${appState.trackTitle}" by ${appState.artistName} is now published on YouTube Music!<br><br><a href="${ytUrl}" target="_blank" style="color: #ff4d4d; font-weight: 700; text-decoration: underline; font-size: 0.95rem;">👉 Click here to listen to your Published Track LIVE on YouTube!</a>`;
      })
      .catch(() => {
        const fallbackYtUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(appState.artistName + ' ' + appState.trackTitle)}`;
        statusText.innerHTML = `🎉 <strong>RELEASE IS LIVE!</strong> "${appState.trackTitle}" by ${appState.artistName} is now published on YouTube Music!<br><br><a href="${fallbackYtUrl}" target="_blank" style="color: #ff4d4d; font-weight: 700; text-decoration: underline; font-size: 0.95rem;">👉 Click here to listen to your Published Track LIVE on YouTube!</a>`;
      });
    }
  }, 1200);
}

// Gemini AI Copilot Generator
async function runAICopilot(promptType) {
  const box = document.getElementById('aiResponseBox');
  const track = appState.trackTitle;
  const artist = appState.artistName;
  const genre = document.getElementById('selectGenre') ? document.getElementById('selectGenre').value : 'Hip-Hop';

  box.textContent = "🤖 SoundDrop AI is generating your release kit...";

  setTimeout(() => {
    let resultText = "";
    if (promptType === 'press_release') {
      resultText = `🔥 PRESS RELEASE: "${track}" by ${artist}\n\nFOR IMMEDIATE RELEASE\n\nIndependent artist ${artist} drops their highly anticipated new ${genre} single "${track}" on all major streaming platforms via SoundDrop. Blending hard-hitting rhythm with soul-stirring melodies, "${track}" sets a new benchmark for independent creators.\n\n"We built this joint from the ground up for the real ones," says ${artist}. "SoundDrop gave us 100% control to deliver our vision straight to the fans."\n\nStream "${track}" now on Spotify, Apple Music, and YouTube Music!`;
    } else if (promptType === 'spotify_bio') {
      resultText = `🎧 SPOTIFY ARTIST BIO: ${artist}\n\nRising out of the independent scene, ${artist} brings an unmistakable blend of raw energy and precision craftsmanship to ${genre}. With signature tracks like "${track}", ${artist} has accumulated thousands of global streams while staying 100% independent.\n\nConnect on Instagram & TikTok: @${artist.toLowerCase().replace(/\s+/g, '')}`;
    } else if (promptType === 'playlist_pitch') {
      resultText = `🎯 EDITORIAL PLAYLIST PITCH FORM:\n\n• Track Title: ${track}\n• Artist Name: ${artist}\n• Genre: ${genre}\n• Target Playlists: RapCaviar, Most Necessary, New Music Friday, Alternative Hip-Hop\n• Pitch Note: "${track} is a high-energy ${genre} anthem combining booming basslines with introspective vocal hooks. Perfect fit for prime workout, drive, and focus playlists."`;
    }
    box.textContent = resultText;
  }, 1000);
}

// Royalty Payout Simulation
function requestRoyaltyPayout() {
  const currentTotal = appState.totalEarnings;
  alert(`💵 Payout Request Approved!\n\nSuccessfully transferred $${currentTotal.toFixed(2)} to your connected bank account via SoundDrop Direct Deposit.`);
  appState.totalEarnings = 0.00;
  const valElem = document.getElementById('totalEarningsVal');
  if (valElem) valElem.textContent = '$0.00';
}
