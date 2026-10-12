// ElyWolf Arcade — Hub Script, Firebase Auth, Real-Time Chat & Presence Engine

import { 
  signUpWithEmail, 
  signInWithEmail, 
  signOutUser, 
  onAuthChange,
  sendChatMessage,
  sendChallenge,
  onChatUpdate,
  onOnlinePlayersUpdate,
  getLocalSessionUser,
  setActiveGameStatus,
  updateUserProfilePic
} from './firebase-config.js';

// Web Audio API Synthesizer for Hub FX
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playHubSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.02);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (type === 'message') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {}
}

// Live Search Engine
function filterGames() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const cards = document.querySelectorAll('.neal-card');

  cards.forEach(card => {
    const cardName = card.getAttribute('data-name') || '';
    if (!query || cardName.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

window.filterGames = filterGames;

// Ambient Background Particle Canvas
function initBgCanvas() {
  const canvas = document.getElementById('hubBgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.25})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================================================
// AUTH & MULTIPLAYER LOBBY CONTROLLER
// ==========================================================================
let isSignUpMode = true;

const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authModal = document.getElementById('authModal');
const userProfilePill = document.getElementById('userProfilePill');
const userAvatarWrap = document.getElementById('userAvatarWrap');
const userAvatar = document.getElementById('userAvatar');
const inputChangeAvatar = document.getElementById('inputChangeAvatar');
const userNameDisplay = document.getElementById('userNameDisplay');
const signOutBtn = document.getElementById('signOutBtn');

const tabSignUp = document.getElementById('tabSignUp');
const tabSignIn = document.getElementById('tabSignIn');
const groupProfilePic = document.getElementById('groupProfilePic');
const avatarPreviewBox = document.getElementById('avatarPreviewBox');
const avatarPreviewImg = document.getElementById('avatarPreviewImg');
const avatarPreviewPlaceholder = document.getElementById('avatarPreviewPlaceholder');
const inputProfilePic = document.getElementById('inputProfilePic');
const btnUploadProfilePic = document.getElementById('btnUploadProfilePic');
const btnRemoveProfilePic = document.getElementById('btnRemoveProfilePic');
const avatarPresetsGrid = document.getElementById('avatarPresetsGrid');

const groupDisplayName = document.getElementById('groupDisplayName');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const authForm = document.getElementById('authForm');
const authAlert = document.getElementById('authAlert');

const inputDisplayName = document.getElementById('inputDisplayName');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

// Preset Arcade Avatars
const PRESET_SVGS = {
  wolf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="32" height="32" rx="16" fill="#0f172a"/><polygon points="16,3 28,12 24,29 8,29 4,12"></polygon><circle cx="11" cy="16" r="2" fill="#38bdf8"></circle><circle cx="21" cy="16" r="2" fill="#38bdf8"></circle><polygon points="16,21 13,25 19,25" fill="#38bdf8"></polygon></svg>`,
  gamepad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#a855f7" stroke-width="2"><rect width="32" height="32" rx="16" fill="#180b2b"/><rect x="4" y="8" width="24" height="16" rx="6"></rect><line x1="10" y1="13" x2="10" y2="19"></line><line x1="7" y1="16" x2="13" y2="16"></line><circle cx="21" cy="14" r="1.5" fill="#a855f7"></circle><circle cx="23" cy="18" r="1.5" fill="#a855f7"></circle></svg>`,
  lightning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#fbbf24" stroke-width="2"><rect width="32" height="32" rx="16" fill="#241a04"/><polygon points="18,3 6,17 15,17 14,29 26,15 17,15" fill="#fbbf24"></polygon></svg>`,
  alien: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#10b981" stroke-width="2"><rect width="32" height="32" rx="16" fill="#062015"/><rect x="7" y="10" width="18" height="14" rx="4"></rect><circle cx="12" cy="16" r="2" fill="#10b981"></circle><circle cx="20" cy="16" r="2" fill="#10b981"></circle><line x1="11" y1="6" x2="13" y2="10"></line><line x1="21" y1="6" x2="19" y2="10"></line></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#f59e0b" stroke-width="2"><rect width="32" height="32" rx="16" fill="#231503"/><polygon points="4,24 28,24 26,11 19,17 16,7 13,17 6,11" fill="rgba(245,158,11,0.4)"></polygon></svg>`,
  sword: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="#ec4899" stroke-width="2"><rect width="32" height="32" rx="16" fill="#240718"/><line x1="6" y1="26" x2="26" y2="6"></line><polyline points="20,6 26,6 26,12"></polyline><line x1="9" y1="21" x2="11" y2="23"></line></svg>`
};

function getPresetDataUrl(key) {
  const svg = PRESET_SVGS[key] || PRESET_SVGS.wolf;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

let selectedAvatarDataUrl = getPresetDataUrl('wolf');
let isCustomUploaded = false;

function setPresetAvatar(presetKey) {
  selectedAvatarDataUrl = getPresetDataUrl(presetKey);
  isCustomUploaded = false;
  if (avatarPreviewImg) {
    avatarPreviewImg.src = selectedAvatarDataUrl;
    avatarPreviewImg.classList.remove('hidden');
  }
  if (avatarPreviewPlaceholder) {
    avatarPreviewPlaceholder.classList.add('hidden');
  }
  if (btnRemoveProfilePic) {
    btnRemoveProfilePic.classList.add('hidden');
  }
  if (avatarPresetsGrid) {
    avatarPresetsGrid.querySelectorAll('.preset-avatar-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-preset') === presetKey);
    });
  }
}

// Convert image file to resized base64 JPEG
function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error("Please upload a valid image file."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image."));
      img.onload = () => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Presence & Chat Elements
const onlineCountText = document.getElementById('onlineCountText');
const onlinePlayersList = document.getElementById('onlinePlayersList');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatDrawer = document.getElementById('chatDrawer');
const chatFeed = document.getElementById('chatFeed');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBadgeCount = document.getElementById('chatBadgeCount');

// Fullscreen In-Arcade Game Stage Elements
const gameStageOverlay = document.getElementById('gameStageOverlay');
const gameStageIframe = document.getElementById('gameStageIframe');
const exitGameBtn = document.getElementById('exitGameBtn');
const stageGameName = document.getElementById('stageGameName');
const stageGameTag = document.getElementById('stageGameTag');
const hudOnlineCount = document.getElementById('hudOnlineCount');
const hudPlayersList = document.getElementById('hudPlayersList');
const stageChatToggleBtn = document.getElementById('stageChatToggleBtn');
const hudChatBadge = document.getElementById('hudChatBadge');

let currentActiveGame = null;

export function launchGame(gameName, gameUrl, gameTag) {
  if (!gameStageOverlay || !gameStageIframe) return;
  currentActiveGame = gameName;
  if (stageGameName) stageGameName.textContent = gameName;
  if (stageGameTag) stageGameTag.textContent = gameTag || '1v1 MULTIPLAYER';

  // Load game directly inside arcade fullscreen viewport
  gameStageIframe.src = gameUrl;
  gameStageOverlay.classList.remove('hidden');
  gameStageOverlay.setAttribute('aria-hidden', 'false');

  // Hide the main arcade lobby chat button so only the top-bar button shows
  const chatWidgetWrapper = document.querySelector('.chat-widget-wrapper');
  if (chatWidgetWrapper) chatWidgetWrapper.classList.add('in-game');
  if (toggleChatBtn) toggleChatBtn.classList.add('hidden');

  // Broadcast presence status update: e.g. "Playing Shark Bait"
  setActiveGameStatus(`Playing ${gameName}`);
  playHubSound('hover');
}

export function exitGame() {
  if (!gameStageOverlay || !gameStageIframe) return;
  gameStageOverlay.classList.add('hidden');
  gameStageOverlay.setAttribute('aria-hidden', 'true');
  gameStageIframe.src = 'about:blank';
  currentActiveGame = null;

  // Restore the main arcade lobby chat button on the home screen
  const chatWidgetWrapper = document.querySelector('.chat-widget-wrapper');
  if (chatWidgetWrapper) chatWidgetWrapper.classList.remove('in-game');
  if (toggleChatBtn) toggleChatBtn.classList.remove('hidden');

  // Reset status back to arcade hub
  setActiveGameStatus(null);
  playHubSound('hover');
}

window.launchGame = launchGame;
window.exitGame = exitGame;

function showAlert(msg, type = 'error') {
  authAlert.textContent = msg;
  authAlert.className = `auth-alert ${type}`;
  authAlert.classList.remove('hidden');
}

function hideAlert() {
  authAlert.classList.add('hidden');
}

function toggleAuthModal(show) {
  if (show) {
    authModal.classList.remove('hidden');
    authModal.setAttribute('aria-hidden', 'false');
    hideAlert();
  } else {
    authModal.classList.add('hidden');
    authModal.setAttribute('aria-hidden', 'true');
  }
}

function setAuthMode(signUp) {
  isSignUpMode = signUp;
  hideAlert();
  if (signUp) {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    if (groupDisplayName) groupDisplayName.classList.remove('hidden');
    if (groupProfilePic) groupProfilePic.classList.remove('hidden');
    submitAuthBtn.textContent = 'CREATE ACCOUNT';
  } else {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    if (groupDisplayName) groupDisplayName.classList.add('hidden');
    if (groupProfilePic) groupProfilePic.classList.add('hidden');
    submitAuthBtn.textContent = 'SIGN IN';
  }
}

// Chat Drawer Toggle
let unreadMessageCount = 0;
let lastSeenMessageCount = 0;

function updateBadgeUI() {
  const countStr = unreadMessageCount > 0 ? String(unreadMessageCount) : '0';
  const showBadge = unreadMessageCount > 0;

  if (chatBadgeCount) {
    chatBadgeCount.textContent = countStr;
    chatBadgeCount.classList.toggle('hidden', !showBadge);
  }
  if (hudChatBadge) {
    hudChatBadge.textContent = countStr;
    hudChatBadge.classList.toggle('hidden', !showBadge);
  }
}

function toggleChatDrawer(show) {
  if (show) {
    chatDrawer.classList.remove('hidden');
    chatInput.focus();
    scrollChatToBottom();
    // Clear unread count when opening drawer
    unreadMessageCount = 0;
    updateBadgeUI();
  } else {
    chatDrawer.classList.add('hidden');
  }
}

function scrollChatToBottom() {
  if (chatFeed) {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
}

// Render Presence Bar (Hub & In-Game Fullscreen HUD)
function renderOnlinePlayers(players) {
  const user = getLocalSessionUser();
  const currentName = (user ? (user.displayName || user.email.split('@')[0]) : '').trim().toLowerCase();
  const currentUid = user ? user.uid : '';

  // Strict filter: you should NEVER be able to see or challenge yourself
  const otherPlayers = players.filter(p => {
    if (p.isSelf) return false;
    const pName = (p.displayName || '').trim().toLowerCase();
    if (currentName && pName && pName === currentName) return false;
    if (currentUid && p.uid && p.uid === currentUid) return false;
    return true;
  });

  // Update Hub text and HUD count
  if (onlineCountText) {
    onlineCountText.textContent = `OTHER PLAYERS ONLINE (${otherPlayers.length})`;
  }
  if (hudOnlineCount) {
    hudOnlineCount.textContent = `OTHER PLAYERS ONLINE (${otherPlayers.length})`;
  }

  // 1. Render Hub Presence List
  if (onlinePlayersList) {
    onlinePlayersList.innerHTML = '';
    if (otherPlayers.length === 0) {
      onlinePlayersList.innerHTML = `<span style="font-size:0.8rem; color:var(--text-subtle); font-style:italic;">No other players online right now. Open another tab or share the link to play together!</span>`;
    } else {
      otherPlayers.forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        const avatarHtml = p.photoURL 
          ? `<img src="${p.photoURL}" alt="${p.displayName}" class="chip-avatar-img" />`
          : `<span class="chip-avatar">${p.avatar || 'P'}</span>`;
        chip.innerHTML = `
          ${avatarHtml}
          <div style="display:flex; flex-direction:column; line-height:1.2;">
            <span class="chip-name">${p.displayName}</span>
            <span style="font-size:0.62rem; color:#a1a1aa; font-family:var(--font-mono);">${p.status || 'Online'}</span>
          </div>
          <button class="chip-challenge-btn" title="Challenge ${p.displayName} to a match">CHALLENGE ⚔️</button>
        `;

        const btn = chip.querySelector('.chip-challenge-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const gameToChallenge = currentActiveGame || 'Shark Bait';
            sendChallenge(p.displayName, `${gameToChallenge} 1v1`);
            toggleChatDrawer(true);
          });
        }
        onlinePlayersList.appendChild(chip);
      });
    }
  }

  // 2. Render In-Game Topbar HUD Strip
  if (hudPlayersList) {
    hudPlayersList.innerHTML = '';
    if (otherPlayers.length === 0) {
      hudPlayersList.innerHTML = `<span class="hud-empty">No other players online right now.</span>`;
    } else {
      otherPlayers.forEach(p => {
        const hudChip = document.createElement('div');
        hudChip.className = 'hud-player-chip';
        const hudAvatarHtml = p.photoURL
          ? `<img src="${p.photoURL}" alt="${p.displayName}" class="hud-avatar-img" />`
          : `<span class="hud-avatar">${p.avatar || 'P'}</span>`;
        hudChip.innerHTML = `
          ${hudAvatarHtml}
          <span class="hud-name">${p.displayName}</span>
          <span class="hud-status">${p.status || 'Online'}</span>
          <button class="hud-challenge-btn" title="Challenge ${p.displayName} to 1v1">CHALLENGE ⚔️</button>
        `;

        const hudBtn = hudChip.querySelector('.hud-challenge-btn');
        if (hudBtn) {
          hudBtn.addEventListener('click', () => {
            const gameToChallenge = currentActiveGame || 'Shark Bait';
            sendChallenge(p.displayName, `${gameToChallenge} 1v1`);
            toggleChatDrawer(true);
          });
        }
        hudPlayersList.appendChild(hudChip);
      });
    }
  }
}

// Format chat time to user's actual local time (e.g. 8:15 PM, not 00:15)
function formatChatTime(m) {
  if (m.isSystem) return m.time || 'System';

  // 1. If timestamp property exists
  if (m.timestamp) {
    const d = new Date(Number(m.timestamp));
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  // 2. If id contains epoch timestamp
  if (m.id && typeof m.id === 'string' && m.id.startsWith('msg_')) {
    const rawNum = m.id.split('_')[1];
    const num = parseInt(rawNum, 10);
    if (!isNaN(num) && num > 1600000000000) {
      const d = new Date(num);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  // 3. If time is UTC formatted like "00:15"
  if (m.time && m.time !== 'System') {
    if (/^\d{1,2}:\d{2}$/.test(m.time)) {
      const parts = m.time.split(':');
      const d = new Date();
      d.setUTCHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return m.time;
  }

  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Render Chat Feed
function renderChatFeed(messages) {
  if (!chatFeed) return;
  
  const isDrawerOpen = !chatDrawer.classList.contains('hidden');
  const newDiff = lastSeenMessageCount > 0 ? (messages.length - lastSeenMessageCount) : 0;
  lastSeenMessageCount = messages.length;

  if (newDiff > 0) {
    if (!isDrawerOpen) {
      unreadMessageCount += newDiff;
      updateBadgeUI();
      playHubSound('message');
    }
  }

  chatFeed.innerHTML = '';

  messages.forEach(m => {
    const item = document.createElement('div');
    item.className = `chat-item ${m.isSystem ? 'system-msg' : ''}`;
    const displayTime = formatChatTime(m);
    const chatAvatarHtml = m.photoURL
      ? `<img src="${m.photoURL}" alt="${m.sender}" class="chat-msg-avatar" />`
      : `<span class="chat-msg-avatar-initial">${(m.sender || 'P').charAt(0).toUpperCase()}</span>`;
    item.innerHTML = `
      <div class="chat-item-meta">
        <div class="chat-sender-wrap">
          ${!m.isSystem ? chatAvatarHtml : ''}
          <span class="chat-sender">${m.sender}</span>
        </div>
        <span class="chat-time">${displayTime}</span>
      </div>
      <div class="chat-text">${m.text}</div>
    `;
    chatFeed.appendChild(item);
  });

  scrollChatToBottom();
}

// Register DOM Events
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a, button, .neal-card').forEach(el => {
    el.addEventListener('mouseenter', () => playHubSound('hover'));
  });
  initBgCanvas();

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => toggleAuthModal(true));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => toggleAuthModal(false));

  if (tabSignUp) tabSignUp.addEventListener('click', () => setAuthMode(true));
  if (tabSignIn) tabSignIn.addEventListener('click', () => setAuthMode(false));

  if (toggleChatBtn) toggleChatBtn.addEventListener('click', () => toggleChatDrawer(chatDrawer.classList.contains('hidden')));
  if (closeChatBtn) closeChatBtn.addEventListener('click', () => toggleChatDrawer(false));

  // Quick Emotes
  document.querySelectorAll('.emote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emote = btn.getAttribute('data-emote');
      sendChatMessage(emote);
    });
  });

  // Chat Form Submit
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      sendChatMessage(text);
      chatInput.value = '';
    });
  }

  // Auth Form Submit Handler
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = inputEmail.value.trim();
      const password = inputPassword.value;
      const displayName = inputDisplayName.value.trim();

      if (!email || !password) {
        showAlert("Please fill out all required fields.");
        return;
      }

      submitAuthBtn.disabled = true;
      submitAuthBtn.textContent = "Processing...";

      try {
        if (isSignUpMode) {
          await signUpWithEmail(email, password, displayName || email.split('@')[0], selectedAvatarDataUrl);
          showAlert("Account created successfully! Welcome to ElyWolf Arcade.", "success");
        } else {
          await signInWithEmail(email, password);
          showAlert("Signed in successfully!", "success");
        }
        setTimeout(() => {
          toggleAuthModal(false);
          submitAuthBtn.disabled = false;
          setAuthMode(isSignUpMode);
        }, 800);
      } catch (err) {
        submitAuthBtn.disabled = false;
        setAuthMode(isSignUpMode);
        showAlert(err.message || "Authentication failed. Check your credentials.");
      }
    });
  }

  // Preset Avatar Buttons
  if (avatarPresetsGrid) {
    avatarPresetsGrid.querySelectorAll('.preset-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        setPresetAvatar(presetKey);
        playHubSound('hover');
      });
    });
  }

  // Upload Profile Picture Click Triggers
  if (btnUploadProfilePic && inputProfilePic) {
    btnUploadProfilePic.addEventListener('click', () => inputProfilePic.click());
  }
  if (avatarPreviewBox && inputProfilePic) {
    avatarPreviewBox.addEventListener('click', () => inputProfilePic.click());
  }

  // File Input Handler for Sign-Up Profile Picture
  if (inputProfilePic) {
    inputProfilePic.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        selectedAvatarDataUrl = dataUrl;
        isCustomUploaded = true;
        if (avatarPreviewImg) {
          avatarPreviewImg.src = dataUrl;
          avatarPreviewImg.classList.remove('hidden');
        }
        if (avatarPreviewPlaceholder) {
          avatarPreviewPlaceholder.classList.add('hidden');
        }
        if (btnRemoveProfilePic) {
          btnRemoveProfilePic.classList.remove('hidden');
        }
        if (avatarPresetsGrid) {
          avatarPresetsGrid.querySelectorAll('.preset-avatar-btn').forEach(b => b.classList.remove('active'));
        }
      } catch (err) {
        showAlert(err.message || "Failed to process photo.");
      }
    });
  }

  // Remove Custom Photo Button (Revert to Preset)
  if (btnRemoveProfilePic) {
    btnRemoveProfilePic.addEventListener('click', () => {
      setPresetAvatar('wolf');
      if (inputProfilePic) inputProfilePic.value = '';
    });
  }

  // Header Avatar Change for Logged-In Users
  if (userAvatarWrap && inputChangeAvatar) {
    userAvatarWrap.addEventListener('click', () => inputChangeAvatar.click());
  }
  if (inputChangeAvatar) {
    inputChangeAvatar.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        await updateUserProfilePic(dataUrl);
        if (userAvatar) {
          userAvatar.innerHTML = `<img src="${dataUrl}" alt="Profile" class="avatar-img" />`;
        }
        playHubSound('hover');
      } catch (err) {
        alert(err.message || "Failed to update profile picture.");
      }
    });
  }

  // Initialize Default Preset Avatar in Modal Preview
  setPresetAvatar('wolf');

  // Sign Out Button
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      await signOutUser();
    });
  }

  // Subscribe to Presence & Chat updates
  onOnlinePlayersUpdate(renderOnlinePlayers);
  onChatUpdate(renderChatFeed);

  // Intercept game card clicks to launch fullscreen inside arcade
  document.querySelectorAll('.neal-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const gameName = card.getAttribute('data-game') || 'Shark Bait';
      const gameUrl = card.getAttribute('data-url') || card.getAttribute('href');
      const gameTag = card.getAttribute('data-tag') || '1v1 MULTIPLAYER';
      launchGame(gameName, gameUrl, gameTag);
    });
  });

  // Exit Game Button
  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', exitGame);
  }

  // In-Game Topbar Chat Toggle Button
  if (stageChatToggleBtn) {
    stageChatToggleBtn.addEventListener('click', () => {
      toggleChatDrawer(chatDrawer.classList.contains('hidden'));
    });
  }

  // Keyboard shortcut: ESC to exit game or close modal/chat
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (gameStageOverlay && !gameStageOverlay.classList.contains('hidden')) {
        exitGame();
      } else if (authModal && !authModal.classList.contains('hidden')) {
        toggleAuthModal(false);
      } else if (chatDrawer && !chatDrawer.classList.contains('hidden')) {
        toggleChatDrawer(false);
      }
    }
  });

  // Listen for child game iframe requests to toggle lobby chat
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'TOGGLE_LOBBY_CHAT') {
      toggleChatDrawer(chatDrawer.classList.contains('hidden'));
    }
  });

  // Observe Auth State Changes
  onAuthChange((user) => {
    if (user) {
      const name = user.displayName || user.email.split('@')[0];
      userNameDisplay.textContent = name;
      if (user.photoURL) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="${name}" class="avatar-img" />`;
      } else {
        userAvatar.textContent = name.charAt(0).toUpperCase();
      }

      openAuthModalBtn.classList.add('hidden');
      userProfilePill.classList.remove('hidden');
    } else {
      openAuthModalBtn.classList.remove('hidden');
      userProfilePill.classList.add('hidden');
    }
  });
});
