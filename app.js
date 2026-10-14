// ElyWolf Arcade — Hub Script, Firebase Auth, Real-Time Chat & Presence Engine

import { 
  signUpWithEmail, 
  signInWithEmail, 
  signOutUser, 
  onAuthChange,
  sendChatMessage,
  sendChallenge,
  sendChallengeOffer,
  respondToChallengeOffer,
  onChallengeOffer,
  onChallengeResponse,
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
    } else if (type === 'ding') {
      // Crisp metallic bell chime for @ mentions (D6 + D7 overtone)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1174.66, now); // D6
      osc1.frequency.exponentialRampToValueAtTime(1170, now + 0.6);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2349.32, now); // D7 chime shimmer
      osc2.frequency.exponentialRampToValueAtTime(2340, now + 0.5);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } else if (type === 'challenge') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
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
const btnQuickMention = document.getElementById('btnQuickMention');
const mentionDropdown = document.getElementById('mentionDropdown');

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
const exitConfirmModal = document.getElementById('exitConfirmModal');
const exitConfirmGameName = document.getElementById('exitConfirmGameName');
const btnCancelExit = document.getElementById('btnCancelExit');
const btnConfirmExit = document.getElementById('btnConfirmExit');

let currentActiveGame = null;

function loadGameIframe(gameUrl) {
  const container = document.querySelector('.game-stage-viewport');
  const oldIframe = document.getElementById('gameStageIframe');
  const newIframe = document.createElement('iframe');
  newIframe.id = 'gameStageIframe';
  newIframe.title = 'Arcade Game Viewport';
  newIframe.allow = 'autoplay; fullscreen; encrypted-media';
  newIframe.setAttribute('frameborder', '0');
  newIframe.src = gameUrl;

  newIframe.addEventListener('load', () => {
    try {
      const loc = newIframe.contentWindow.location;
      if (loc.href === 'about:blank') {
        if (currentActiveGame) {
          exitGame(false);
        }
      } else if (loc.pathname === '/' || (loc.pathname.endsWith('/index.html') && !loc.pathname.includes('/maze-runner/') && !loc.pathname.includes('/go-fish/') && !loc.pathname.includes('/math-gauntlet/') && !loc.pathname.includes('/wardrobe/') && !loc.pathname.includes('/memory-card/'))) {
        exitGame(false);
      }
    } catch (err) {}
  });

  if (oldIframe) {
    oldIframe.replaceWith(newIframe);
  } else if (container) {
    container.prepend(newIframe);
  }
  return newIframe;
}

export function launchGame(gameName, gameUrl, gameTag) {
  if (!gameStageOverlay) return;
  currentActiveGame = gameName;
  if (stageGameName) stageGameName.textContent = gameName;
  if (stageGameTag) stageGameTag.textContent = gameTag || '1v1 MULTIPLAYER';
  if (exitConfirmGameName) exitConfirmGameName.textContent = gameName;

  // Re-create iframe with the game URL so Chrome doesn't push a subframe history entry
  loadGameIframe(gameUrl);

  gameStageOverlay.classList.remove('hidden');
  gameStageOverlay.setAttribute('aria-hidden', 'false');
  hideExitConfirmModal();

  // Push dedicated game hash so Chrome's browser back arrow works and navigates back to home
  const gameSlug = (gameName || 'game').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const targetHash = `#game=${gameSlug}`;
  if (window.location.hash !== targetHash) {
    history.pushState({ inGame: true, game: gameName, slug: gameSlug }, '', targetHash);
  }

  // Hide the main arcade lobby chat button so only the top-bar button shows
  const chatWidgetWrapper = document.querySelector('.chat-widget-wrapper');
  if (chatWidgetWrapper) chatWidgetWrapper.classList.add('in-game');
  if (toggleChatBtn) toggleChatBtn.classList.add('hidden');

  // Broadcast presence status update: e.g. "Playing Shark Bait"
  setActiveGameStatus(`Playing ${gameName}`);
  playHubSound('hover');
}

export function requestExitGame() {
  if (!currentActiveGame && (!gameStageOverlay || gameStageOverlay.classList.contains('hidden'))) return;
  if (exitConfirmModal) {
    if (exitConfirmGameName) {
      exitConfirmGameName.textContent = currentActiveGame || 'this game';
    }
    exitConfirmModal.classList.remove('hidden');
    exitConfirmModal.setAttribute('aria-hidden', 'false');
    playHubSound('hover');
  } else {
    exitGame(true);
  }
}

export function hideExitConfirmModal() {
  if (exitConfirmModal) {
    exitConfirmModal.classList.add('hidden');
    exitConfirmModal.setAttribute('aria-hidden', 'true');
  }
}

export function exitGame(updateHistory = true) {
  if (!gameStageOverlay) return;
  hideExitConfirmModal();
  gameStageOverlay.classList.add('hidden');
  gameStageOverlay.setAttribute('aria-hidden', 'true');
  
  const iframe = document.getElementById('gameStageIframe');
  if (iframe) {
    iframe.src = 'about:blank';
  }
  currentActiveGame = null;

  // Restore the main arcade lobby chat button on the home screen
  const chatWidgetWrapper = document.querySelector('.chat-widget-wrapper');
  if (chatWidgetWrapper) chatWidgetWrapper.classList.remove('in-game');
  if (toggleChatBtn) toggleChatBtn.classList.remove('hidden');

  // Reset status back to arcade hub
  setActiveGameStatus(null);
  playHubSound('hover');

  // Clean up URL hash if user exited via UI button (not browser back button)
  if (updateHistory && window.location.hash.startsWith('#game=')) {
    if (window.history.length > 1) {
      history.back();
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}

window.launchGame = launchGame;
window.requestExitGame = requestExitGame;
window.hideExitConfirmModal = hideExitConfirmModal;
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

// Mention & Autocomplete State
let latestOtherPlayers = [];
let latestChatHistory = [];
let hasLoadedInitialChat = false;
const processedMessageIds = new Set();
let activeMentionIndex = 0;

function getMyDisplayName() {
  const user = getLocalSessionUser();
  if (user) {
    return (user.displayName || (user.email ? user.email.split('@')[0] : 'Player')).trim();
  }
  const guestId = sessionStorage.getItem('elywolf_arcade_guest_id') || localStorage.getItem('elywolf_arcade_guest_id');
  return (guestId || 'Player').trim();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isUserMentioned(text, targetName) {
  if (!text || !targetName) return false;
  const cleanTarget = targetName.trim().toLowerCase();
  const cleanText = text.toLowerCase();

  // 1. Direct @Name match
  if (cleanText.includes('@' + cleanTarget)) return true;

  // 2. Guest match: "Guest #1234" -> "@Guest #1234", "@Guest#1234", "@Guest"
  if (cleanTarget.startsWith('guest #') || cleanTarget.startsWith('guest#')) {
    const digits = cleanTarget.replace(/guest\s*#?/, '').trim();
    if (digits && (cleanText.includes('@guest#' + digits) || cleanText.includes('@guest ' + digits))) {
      return true;
    }
    if (/\b@guest\b/i.test(text)) return true;
  }

  // 3. First word match for multi-word usernames (e.g. "@Ely" for "Ely Wolf")
  const firstWord = cleanTarget.split(' ')[0];
  if (firstWord && firstWord.length >= 3 && cleanText.includes('@' + firstWord)) {
    return true;
  }

  return false;
}

function formatChatText(text, myName) {
  const escaped = escapeHtml(text);
  const myClean = (myName || '').trim().toLowerCase();

  return escaped.replace(/@([a-zA-Z0-9_\-]+(?: #[0-9]+)?)/g, (fullMatch, username) => {
    const userClean = username.trim().toLowerCase();
    const isMe = myClean && (
      userClean === myClean ||
      (myClean.startsWith('guest') && userClean.startsWith('guest')) ||
      (myClean.split(' ')[0] === userClean && userClean.length >= 3)
    );
    const badgeClass = isMe ? 'chat-mention mention-me' : 'chat-mention';
    return `<span class="${badgeClass}" data-mention="${escapeHtml(username)}">@${username}</span>`;
  });
}

function showMentionToast(sender, text) {
  const existing = document.querySelector('.mention-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'mention-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="mention-toast-icon">@</div>
    <div class="mention-toast-body">
      <div class="mention-toast-title">${escapeHtml(sender)} mentioned you!</div>
      <div class="mention-toast-text">${escapeHtml(text)}</div>
    </div>
  `;

  toast.addEventListener('click', () => {
    toggleChatDrawer(true);
    toast.remove();
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      setTimeout(() => toast.remove(), 320);
    }
  }, 4500);
}

function getMentionCandidates() {
  const myName = getMyDisplayName().toLowerCase();
  const map = new Map();

  // 1. Add other online players
  latestOtherPlayers.forEach(p => {
    const pName = (p.displayName || '').trim();
    if (pName && pName.toLowerCase() !== myName && !map.has(pName.toLowerCase())) {
      map.set(pName.toLowerCase(), {
        name: pName,
        avatar: p.avatar || 'P',
        photoURL: p.photoURL || null,
        status: p.status || 'Online'
      });
    }
  });

  // 2. Add recent chatters
  latestChatHistory.forEach(m => {
    if (!m.isSystem && m.sender) {
      const sName = m.sender.trim();
      if (sName && sName.toLowerCase() !== myName && !map.has(sName.toLowerCase())) {
        map.set(sName.toLowerCase(), {
          name: sName,
          avatar: sName.charAt(0).toUpperCase(),
          photoURL: m.photoURL || null,
          status: 'Recent Chatter'
        });
      }
    }
  });

  return Array.from(map.values());
}

function getMentionQueryInfo() {
  if (!chatInput) return null;
  const val = chatInput.value;
  const pos = chatInput.selectionStart;
  const before = val.slice(0, pos);
  const match = before.match(/@([a-zA-Z0-9_\-# ]*)$/);
  if (!match) return null;
  return {
    query: match[1].trim(),
    startPos: pos - match[0].length,
    endPos: pos
  };
}

function hideMentionDropdown() {
  if (mentionDropdown) {
    mentionDropdown.classList.add('hidden');
    mentionDropdown.innerHTML = '';
  }
  activeMentionIndex = 0;
}

function applyMention(name, info) {
  if (!chatInput) return;
  const val = chatInput.value;
  const queryInfo = info || getMentionQueryInfo();
  let newVal;
  let nextPos;

  if (queryInfo) {
    const before = val.slice(0, queryInfo.startPos);
    const after = val.slice(queryInfo.endPos);
    newVal = `${before}@${name} ${after}`;
    nextPos = (before + `@${name} `).length;
  } else {
    newVal = val ? `${val} @${name} ` : `@${name} `;
    nextPos = newVal.length;
  }

  chatInput.value = newVal;
  chatInput.focus();
  chatInput.setSelectionRange(nextPos, nextPos);
  hideMentionDropdown();
}

function updateMentionDropdown() {
  if (!mentionDropdown || !chatInput) return;
  const info = getMentionQueryInfo();
  if (!info) {
    hideMentionDropdown();
    return;
  }

  const q = info.query.toLowerCase();
  const allCandidates = getMentionCandidates();
  const filtered = allCandidates.filter(c => !q || c.name.toLowerCase().includes(q));

  if (filtered.length === 0) {
    hideMentionDropdown();
    return;
  }

  if (activeMentionIndex >= filtered.length) {
    activeMentionIndex = 0;
  }

  mentionDropdown.innerHTML = `<div class="mention-header">Mention Player (@)</div>`;

  filtered.slice(0, 6).forEach((c, idx) => {
    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.className = `mention-item ${idx === activeMentionIndex ? 'active' : ''}`;
    const avatarHtml = c.photoURL
      ? `<img src="${c.photoURL}" class="mention-item-avatar" alt="${c.name}" />`
      : `<span class="chip-avatar" style="width:20px;height:20px;font-size:0.6rem;">${c.avatar}</span>`;

    itemBtn.innerHTML = `
      ${avatarHtml}
      <span class="mention-item-name">${escapeHtml(c.name)}</span>
      <span class="mention-item-status">${c.status}</span>
    `;

    itemBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      applyMention(c.name, info);
    });

    mentionDropdown.appendChild(itemBtn);
  });

  mentionDropdown.classList.remove('hidden');
}

function setupMentionClickHandlers() {
  if (!chatFeed) return;
  chatFeed.querySelectorAll('.chat-sender').forEach(el => {
    el.addEventListener('click', (e) => {
      const senderName = el.textContent.trim();
      if (senderName && !senderName.includes('System')) {
        window.location.href = `profile.html?user=${encodeURIComponent(senderName)}`;
      }
    });
  });

  chatFeed.querySelectorAll('.chat-mention').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const mentionName = el.getAttribute('data-mention') || el.textContent.replace(/^@/, '').trim();
      if (mentionName) {
        window.location.href = `profile.html?user=${encodeURIComponent(mentionName)}`;
      }
    });
  });
}

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
    hideMentionDropdown();
  }
}

function scrollChatToBottom() {
  if (chatFeed) {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
}

// Render Presence Bar (Hub & In-Game Fullscreen HUD)
function renderOnlinePlayers(players) {
  // You must never see yourself as an active player: hide this tab AND any other
  // tab/session of the same account. Other users still see you in their lists.
  const otherPlayers = players.filter(p => !p.isSelf && !p.isSameAccountTab);

  latestOtherPlayers = otherPlayers;

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
        const displayNameText = p.isSameAccountTab ? `${p.displayName} (Other Tab)` : p.displayName;
          const isFriended = window.ElyProfiles && window.ElyProfiles.isFriend && window.ElyProfiles.isFriend(p.displayName);
        const friendBtnHtml = `<button class="chip-friend-btn ${isFriended ? 'is-friend' : ''}" title="${isFriended ? 'Friends (click to remove)' : 'Add Friend'}">${isFriended ? '★ Friend' : '+ Friend'}</button>`;

        chip.innerHTML = `
          <a href="profile.html?user=${encodeURIComponent(p.displayName)}" class="chip-avatar-link" title="View ${escapeHtml(p.displayName)}'s profile">${avatarHtml}</a>
          <div style="display:flex; flex-direction:column; line-height:1.2;">
            <a href="profile.html?user=${encodeURIComponent(p.displayName)}" class="chip-name-link" title="View ${escapeHtml(p.displayName)}'s profile"><span class="chip-name">${displayNameText}</span></a>
            <span style="font-size:0.62rem; color:#a1a1aa; font-family:var(--font-mono);">${p.status || 'In Main Arcade Menu'}</span>
          </div>
          ${friendBtnHtml}
          <a href="profile.html?user=${encodeURIComponent(p.displayName)}" class="chip-profile-btn" title="View ${escapeHtml(p.displayName)}'s stats">PROFILE</a>
          <button class="chip-challenge-btn" title="Challenge ${escapeHtml(p.displayName)} to a match"><svg class="btn-sword-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:3px;"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path></svg>CHALLENGE</button>
        `;

        const friendBtn = chip.querySelector('.chip-friend-btn');
        if (friendBtn) {
          friendBtn.addEventListener('click', () => {
            if (window.ElyProfiles) {
              if (window.ElyProfiles.isFriend(p.displayName)) {
                window.ElyProfiles.removeFriend(p.displayName);
              } else {
                window.ElyProfiles.addFriend({ name: p.displayName, photoURL: p.photoURL || null });
              }
              renderPresence(presenceMap);
            }
          });
        }

        const btn = chip.querySelector('.chip-challenge-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            openChallengePicker(p.displayName);
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
          const displayNameText = p.isSameAccountTab ? `${p.displayName} (Other Tab)` : p.displayName;
          hudChip.innerHTML = `
            <a href="profile.html?user=${encodeURIComponent(p.displayName)}" target="_blank" class="hud-avatar-link" title="View ${escapeHtml(p.displayName)}'s profile">${hudAvatarHtml}</a>
            <a href="profile.html?user=${encodeURIComponent(p.displayName)}" target="_blank" class="hud-name-link" title="View ${escapeHtml(p.displayName)}'s profile"><span class="hud-name">${displayNameText}</span></a>
            <span class="hud-status">${p.status || 'In Main Arcade Menu'}</span>
            <a href="profile.html?user=${encodeURIComponent(p.displayName)}" target="_blank" class="chip-profile-btn" title="View ${escapeHtml(p.displayName)}'s stats">PROFILE</a>
            <button class="hud-challenge-btn" title="Challenge ${escapeHtml(p.displayName)} to 1v1"><svg class="btn-sword-icon" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:3px;"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path></svg>CHALLENGE</button>
          `;

          const hudBtn = hudChip.querySelector('.hud-challenge-btn');
          if (hudBtn) {
            hudBtn.addEventListener('click', () => {
              openChallengePicker(p.displayName);
            });
          }
          hudPlayersList.appendChild(hudChip);
        });
    }
  }
}

// ==========================================================================
// 1v1 CHALLENGE SYSTEM: ACCEPT / DECLINE & GAME SPECIFIC LAUNCHERS
// ==========================================================================
let currentChallengeTarget = null;
let currentIncomingChallenge = null;

export function openChallengePicker(targetName) {
  currentChallengeTarget = targetName;
  const modal = document.getElementById('challengePickerModal');
  const targetNameEl = document.getElementById('challengeTargetPlayerName');
  if (targetNameEl) targetNameEl.textContent = targetName.toUpperCase();
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    playHubSound('hover');
  }
}

export function closeChallengePicker() {
  const modal = document.getElementById('challengePickerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  currentChallengeTarget = null;
}

window.openChallengePicker = openChallengePicker;
window.closeChallengePicker = closeChallengePicker;

function showToast(msg) {
  const existing = document.querySelector('.arcade-hub-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'arcade-hub-toast';
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

function launchChallengeMatch(gameName, matchId, role, oppName) {
  let targetUrl = '';
  let cleanGameName = gameName;

  if (gameName.includes('Shark') || gameName.includes('Fish')) {
    cleanGameName = 'Shark Bait';
    targetUrl = `./go-fish/?mode=1v1&match=${encodeURIComponent(matchId)}&role=${role}&opp=${encodeURIComponent(oppName)}`;
  } else if (gameName.includes('Memory') || gameName.includes('Album')) {
    cleanGameName = 'Album Memory';
    targetUrl = `./memory-card/?mode=1v1&match=${encodeURIComponent(matchId)}&role=${role}&opp=${encodeURIComponent(oppName)}`;
  } else if (gameName.includes('Maze')) {
    cleanGameName = 'Maze Runner 100';
    // Compute a shared random level between 1 and 100 deterministically from matchId
    let seed = 0;
    for (let i = 0; i < matchId.length; i++) {
      seed = ((seed << 5) - seed + matchId.charCodeAt(i)) | 0;
    }
    const sharedLevel = (Math.abs(seed) % 100) + 1;
    targetUrl = `./maze-runner/?mode=1v1&match=${encodeURIComponent(matchId)}&role=${role}&opp=${encodeURIComponent(oppName)}&level=${sharedLevel}`;
  } else if (gameName.includes('Math')) {
    cleanGameName = 'Math Gauntlet';
    targetUrl = `./math-gauntlet/?mode=1v1&match=${encodeURIComponent(matchId)}&opp=${encodeURIComponent(oppName)}`;
  } else {
    cleanGameName = 'Shark Bait';
    targetUrl = `./go-fish/?mode=1v1&match=${encodeURIComponent(matchId)}&role=${role}&opp=${encodeURIComponent(oppName)}`;
  }

  launchGame(cleanGameName, targetUrl, '1v1 CHALLENGE MATCH');
}

// Wire up challenge picker game buttons
const closePickerBtn = document.getElementById('closeChallengePickerBtn');
if (closePickerBtn) closePickerBtn.addEventListener('click', closeChallengePicker);

document.querySelectorAll('.btn-challenge-pick-game').forEach(btn => {
  btn.addEventListener('click', () => {
    const game = btn.getAttribute('data-game') || 'Shark Bait';
    if (currentChallengeTarget) {
      sendChallengeOffer(currentChallengeTarget, game);
      closeChallengePicker();
      showToast(`Challenge offer sent to ${currentChallengeTarget} for ${game}!`);
      playHubSound('message');
    }
  });
});

const offerModal = document.getElementById('challengeOfferModal');
const btnAccept = document.getElementById('btnAcceptChallenge');
const btnDecline = document.getElementById('btnDeclineChallenge');

if (btnAccept) {
  btnAccept.addEventListener('click', () => {
    if (!currentIncomingChallenge) return;
    if (offerModal) {
      offerModal.classList.add('hidden');
      offerModal.setAttribute('aria-hidden', 'true');
    }
    const chal = currentIncomingChallenge;
    currentIncomingChallenge = null;
    const resp = respondToChallengeOffer(chal.id, 'accepted', chal.game, chal.from, chal.to);
    showToast(`Challenge accepted! Launching 1v1 match against ${chal.from}...`);
    setTimeout(() => {
      launchChallengeMatch(chal.game, resp.matchId, 'guest', chal.from);
    }, 500);
  });
}

if (btnDecline) {
  btnDecline.addEventListener('click', () => {
    if (!currentIncomingChallenge) return;
    if (offerModal) {
      offerModal.classList.add('hidden');
      offerModal.setAttribute('aria-hidden', 'true');
    }
    const chal = currentIncomingChallenge;
    currentIncomingChallenge = null;
    respondToChallengeOffer(chal.id, 'declined', chal.game, chal.from, chal.to);
    showToast('Challenge declined.');
  });
}

// Subscribe to incoming challenge offers
onChallengeOffer((chal) => {
  currentIncomingChallenge = chal;
  playHubSound('challenge');

  const nameEl = document.getElementById('challengeSenderName');
  const avatarEl = document.getElementById('challengeSenderAvatar');
  const titleEl = document.getElementById('challengeGameTitle');
  const descEl = document.getElementById('challengeGameDesc');

  if (nameEl) {
    nameEl.innerHTML = `<a href="profile.html?user=${encodeURIComponent(chal.from)}" style="color:inherit;text-decoration:none;" class="challenge-sender-link" title="View ${escapeHtml(chal.from)}'s profile">${escapeHtml(chal.from)}</a>`;
  }
  if (avatarEl) {
    avatarEl.style.cursor = 'pointer';
    avatarEl.title = `View ${escapeHtml(chal.from)}'s profile`;
    avatarEl.onclick = () => { window.location.href = `profile.html?user=${encodeURIComponent(chal.from)}`; };
    if (chal.fromPhoto) {
      avatarEl.innerHTML = `<img src="${chal.fromPhoto}" alt="${escapeHtml(chal.from)}" />`;
    } else {
      avatarEl.textContent = (chal.from || 'P').charAt(0).toUpperCase();
    }
  }

  if (titleEl && descEl) {
    if (chal.game.includes('Shark') || chal.game.includes('Fish')) {
      titleEl.textContent = "Shark Bait (Go-Fish 1v1)";
      descEl.textContent = "1v1 Go Fish match (you see your own deck only)";
    } else if (chal.game.includes('Memory') || chal.game.includes('Album')) {
      titleEl.textContent = "Album Memory (1v1 Race)";
      descEl.textContent = "3, 2, 1 Countdown race — whoever finishes first wins!";
    } else if (chal.game.includes('Maze')) {
      titleEl.textContent = "Maze Runner 100";
      descEl.textContent = "See other people and where they are & usernames in the same level!";
    } else if (chal.game.includes('Math')) {
      titleEl.textContent = "Math Gauntlet";
      descEl.textContent = "100 equation speedrun challenge with Live Leaderboard";
    } else {
      titleEl.textContent = `${chal.game} 1v1`;
      descEl.textContent = `1v1 challenge offer from ${chal.from}!`;
    }
  }

  if (offerModal) {
    offerModal.classList.remove('hidden');
    offerModal.setAttribute('aria-hidden', 'false');
  }
});

// Subscribe to challenge responses (acceptance or decline)
onChallengeResponse((resp) => {
  const user = getLocalSessionUser();
  const myName = (user ? (user.displayName || user.email.split('@')[0]) : '').trim().toLowerCase();
  const isChallenger = resp.from && resp.from.trim().toLowerCase() === myName;

  if (resp.status === 'accepted' || resp.response === 'accepted') {
    if (isChallenger) {
      playHubSound('challenge');
      showToast(`${resp.to} ACCEPTED your challenge! Launching match...`);
      setTimeout(() => {
        launchChallengeMatch(resp.game, resp.matchId, 'host', resp.to);
      }, 700);
    }
  } else if (resp.status === 'declined' || resp.response === 'declined') {
    if (isChallenger) {
      showToast(`${resp.to} declined the challenge.`);
    }
  }
});

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
  latestChatHistory = messages;

  const isDrawerOpen = !chatDrawer.classList.contains('hidden');
  const myName = getMyDisplayName();
  let hasMentionForMe = false;
  let newMessagesCount = 0;

  if (hasLoadedInitialChat) {
    messages.forEach(m => {
      const msgKey = m.id || `${m.sender}_${m.timestamp || m.text}`;
      if (!processedMessageIds.has(msgKey)) {
        processedMessageIds.add(msgKey);
        newMessagesCount++;
        // Play ding sound & trigger alert when mentioned by another user
        if (m.sender !== myName && isUserMentioned(m.text, myName)) {
          hasMentionForMe = true;
          showMentionToast(m.sender, m.text);
        }
      }
    });
  } else {
    // Initial load: populate cache without playing sounds
    messages.forEach(m => {
      const msgKey = m.id || `${m.sender}_${m.timestamp || m.text}`;
      processedMessageIds.add(msgKey);
    });
    hasLoadedInitialChat = true;
  }

  // Crisp metallic DING sound on mention!
  if (hasMentionForMe) {
    playHubSound('ding');
    if (!isDrawerOpen) {
      unreadMessageCount += newMessagesCount;
      updateBadgeUI();
    }
  } else if (newMessagesCount > 0 && !isDrawerOpen) {
    unreadMessageCount += newMessagesCount;
    updateBadgeUI();
    playHubSound('message');
  }

  chatFeed.innerHTML = '';

  messages.forEach(m => {
    const isMeMentioned = isUserMentioned(m.text, myName);
    const item = document.createElement('div');
    item.className = `chat-item ${m.isSystem ? 'system-msg' : ''} ${isMeMentioned ? 'mentioned-me' : ''}`;
    const displayTime = formatChatTime(m);
    const chatAvatarHtml = m.photoURL
      ? `<img src="${m.photoURL}" alt="${m.sender}" class="chat-msg-avatar" />`
      : `<span class="chat-msg-avatar-initial">${(m.sender || 'P').charAt(0).toUpperCase()}</span>`;
    const profileLinkHtml = !m.isSystem && m.sender
      ? `<a href="profile.html?user=${encodeURIComponent(m.sender)}" target="_blank" class="chat-sender-profile" title="View ${escapeHtml(m.sender)}'s profile">STATS</a>`
      : '';
    item.innerHTML = `
      <div class="chat-item-meta">
        <div class="chat-sender-wrap">
          ${!m.isSystem && m.sender ? `<a href="profile.html?user=${encodeURIComponent(m.sender)}" class="chat-avatar-link" title="View ${escapeHtml(m.sender)}'s profile">${chatAvatarHtml}</a>` : (!m.isSystem ? chatAvatarHtml : '')}
          ${!m.isSystem && m.sender ? `<a href="profile.html?user=${encodeURIComponent(m.sender)}" class="chat-sender-link" title="View ${escapeHtml(m.sender)}'s profile"><span class="chat-sender">${escapeHtml(m.sender)}</span></a>` : `<span class="chat-sender">${escapeHtml(m.sender)}</span>`}
          ${profileLinkHtml}
        </div>
        <span class="chat-time">${displayTime}</span>
      </div>
      <div class="chat-text">${formatChatText(m.text, myName)}</div>
    `;
    chatFeed.appendChild(item);
  });

  setupMentionClickHandlers();
  scrollChatToBottom();
}

// Register DOM Events
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a, button, .neal-card').forEach(el => {
    el.addEventListener('mouseenter', () => playHubSound('hover'));
  });
  initBgCanvas();

  // Surface the result of a match that just ended by resignation / leaving
  try {
    const rawResult = localStorage.getItem('elywolf_last_match_result');
    if (rawResult) {
      localStorage.removeItem('elywolf_last_match_result');
      const r = JSON.parse(rawResult);
      if (r && Date.now() - (r.timestamp || 0) < 60000) {
        const opp = r.opponent || 'your opponent';
        if (r.result === 'loss') {
          showToast(r.reason === 'resigned'
            ? `You resigned your match vs ${opp}.`
            : `You left the match vs ${opp}. It counts as a loss.`);
        } else if (r.result === 'win') {
          showToast(`${opp} resigned. You win the match!`);
        }
      }
    }
  } catch (e) {}

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

  // Quick Mention Button (@)
  if (btnQuickMention) {
    btnQuickMention.addEventListener('click', () => {
      if (!chatInput) return;
      const val = chatInput.value;
      if (!val.endsWith('@') && !val.endsWith('@ ')) {
        chatInput.value = val ? `${val} @` : '@';
      }
      chatInput.focus();
      updateMentionDropdown();
      playHubSound('hover');
    });
  }

  // Chat Input Mention & Key Navigation
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      updateMentionDropdown();
    });

    chatInput.addEventListener('keydown', (e) => {
      if (mentionDropdown && !mentionDropdown.classList.contains('hidden')) {
        const items = mentionDropdown.querySelectorAll('.mention-item');
        if (items.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeMentionIndex = (activeMentionIndex + 1) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeMentionIndex));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeMentionIndex = (activeMentionIndex - 1 + items.length) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeMentionIndex));
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            const activeItem = items[activeMentionIndex];
            if (activeItem) {
              e.preventDefault();
              const nameEl = activeItem.querySelector('.mention-item-name');
              if (nameEl) {
                applyMention(nameEl.textContent.trim());
              }
              return;
            }
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            hideMentionDropdown();
            return;
          }
        }
      }
    });
  }

  // Close mention dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (mentionDropdown && !mentionDropdown.contains(e.target) && e.target !== chatInput && e.target !== btnQuickMention) {
      hideMentionDropdown();
    }
  });

  // Chat Form Submit
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      sendChatMessage(text);
      chatInput.value = '';
      hideMentionDropdown();
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
          await signUpWithEmail(email, password, displayName || (email.includes('@') ? email.split('@')[0] : email), selectedAvatarDataUrl);
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

  // Exit Game Button (Back Arrow) Click
  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      requestExitGame();
    });
  }

  // Confirmation Modal Actions
  if (btnCancelExit) {
    btnCancelExit.addEventListener('click', (e) => {
      e.preventDefault();
      hideExitConfirmModal();
      playHubSound('hover');
    });
  }

  if (btnConfirmExit) {
    btnConfirmExit.addEventListener('click', (e) => {
      e.preventDefault();
      exitGame();
    });
  }

  // In-Game Topbar Chat Toggle Button
  if (stageChatToggleBtn) {
    stageChatToggleBtn.addEventListener('click', () => {
      toggleChatDrawer(chatDrawer.classList.contains('hidden'));
    });
  }

  // Keyboard shortcut: ESC to exit game (with confirmation) or close modal/chat
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (exitConfirmModal && !exitConfirmModal.classList.contains('hidden')) {
        hideExitConfirmModal();
      } else if (gameStageOverlay && !gameStageOverlay.classList.contains('hidden')) {
        requestExitGame();
      } else if (authModal && !authModal.classList.contains('hidden')) {
        toggleAuthModal(false);
      } else if (chatDrawer && !chatDrawer.classList.contains('hidden')) {
        toggleChatDrawer(false);
      }
    }
  });

  // Handle Chrome browser back arrow / swipe back gesture / history changes
  function handleBrowserNavigation(e) {
    const hash = window.location.hash || '';
    const hasGameHash = hash.startsWith('#game=');
    const hasGameState = e && e.state && e.state.inGame;

    if (!hasGameHash && !hasGameState) {
      // User clicked Chrome back arrow to return to home screen: exit immediately!
      if (currentActiveGame || (gameStageOverlay && !gameStageOverlay.classList.contains('hidden'))) {
        exitGame(false);
      }
    }
  }

  window.addEventListener('popstate', handleBrowserNavigation);
  window.addEventListener('hashchange', handleBrowserNavigation);

  // If user refreshes or initial loads with #game= hash, clean it up so home screen is displayed
  if (window.location.hash.startsWith('#game=')) {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (err) {}
  }

  // Listen for child game iframe requests to toggle lobby chat, exit game, or browser back
  window.addEventListener('message', (e) => {
    if (e.data) {
      if (e.data.type === 'TOGGLE_LOBBY_CHAT') {
        toggleChatDrawer(chatDrawer.classList.contains('hidden'));
      } else if (e.data.type === 'REQUEST_EXIT_GAME') {
        requestExitGame();
      } else if (e.data.type === 'BROWSER_BACK_REQUEST' || e.data.type === 'IFRAME_POPSTATE') {
        if (currentActiveGame || (gameStageOverlay && !gameStageOverlay.classList.contains('hidden'))) {
          exitGame(true);
        }
      }
    }
  });

  function updateHubProfileBadge() {
    if (!window.ElyProfiles) return;
    const me = window.ElyProfiles.getIdentity();
    const p = window.ElyProfiles.getLocalProfile(me.name) || { xp: 0, level: 1 };
    const lvlEl = document.getElementById('hubProfileLevel');
    const xpEl = document.getElementById('hubProfileXp');
    if (lvlEl) lvlEl.textContent = `LV ${p.level || 1}`;
    if (xpEl) xpEl.textContent = `${(p.xp || 0).toLocaleString()} XP`;
  }
  updateHubProfileBadge();

  // Observe Auth State Changes
  onAuthChange((user) => {
    if (user) {
      const name = user.displayName || user.email.split('@')[0];
      userNameDisplay.textContent = name;
      userNameDisplay.href = `profile.html?user=${encodeURIComponent(name)}`;
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
    updateHubProfileBadge();
  });
});
