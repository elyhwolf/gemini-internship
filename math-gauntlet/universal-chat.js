/**
 * ElyWolf Arcade — Universal Real-Time Chat Engine
 * Enables global chat across all arcade games, tabs, and direct URLs.
 */
(function() {
  if (window.__ELYWOLF_UNIVERSAL_CHAT_INITIALIZED__) return;
  window.__ELYWOLF_UNIVERSAL_CHAT_INITIALIZED__ = true;

  const STORAGE_KEY = 'elywolf_universal_chat_history';
  const SESSION_USER_KEY = 'elywolf_arcade_session_user';
  const GUEST_ID_KEY = 'elywolf_arcade_guest_id';
  const PROD_API_ORIGIN = 'https://gemini-internship.vercel.app';
  const API_CHAT = '/api/chat';

  // BroadcastChannel for cross-tab communication
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_arcade_sync') : null;

  function getLocalUser() {
    try {
      const u = localStorage.getItem(SESSION_USER_KEY) || sessionStorage.getItem(SESSION_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) { return null; }
  }

  function getSenderInfo() {
    const user = getLocalUser();
    if (user) {
      return {
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Player'),
        photoURL: user.photoURL || null
      };
    }
    let guestId = sessionStorage.getItem(GUEST_ID_KEY) || localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = `Guest #${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem(GUEST_ID_KEY, guestId);
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return { name: guestId, photoURL: null };
  }

  function loadCachedMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'm1', sender: 'System 🤖', text: 'Welcome to ElyWolf Arcade Global Lobby Chat!', time: 'System', isSystem: true, timestamp: 0 }
    ];
  }

  function saveCachedMessages(msgs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-150)));
    } catch (e) {}
  }

  let chatMessages = loadCachedMessages();
  let unreadCount = 0;
  let audioCtx = null;

  function playChatChime() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  function formatTime(m) {
    if (m.isSystem) return m.time || 'System';
    if (m.timestamp) {
      const d = new Date(Number(m.timestamp));
      if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    if (m.id && typeof m.id === 'string' && m.id.startsWith('msg_')) {
      const parts = m.id.split('_');
      if (parts[1]) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > 1600000000000) {
          const d = new Date(num);
          return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
      }
    }
    return m.time || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function isDuplicate(m) {
    if (!m) return true;
    return chatMessages.some(existing => 
      existing.id === m.id || 
      (existing.sender === m.sender && existing.text === m.text && Math.abs((existing.timestamp || 0) - (m.timestamp || 0)) < 4000)
    );
  }

  // If inside arcade iframe, notify parent instead of creating redundant floating button
  const isEmbeddedInArcade = window.self !== window.top;

  // Inject Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .ely-universal-chat-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      user-select: none;
    }
    .ely-universal-chat-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(14, 16, 25, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #f1f5f9;
      padding: 12px 20px;
      border-radius: 30px;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transition: all 0.25s ease;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .ely-universal-chat-toggle:hover {
      background: rgba(30, 34, 48, 0.95);
      border-color: #38bdf8;
      transform: translateY(-2px);
      box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7);
    }
    .ely-universal-chat-toggle svg {
      width: 18px;
      height: 18px;
      color: #f59e0b;
    }
    .ely-universal-chat-badge {
      background: #ef4444;
      color: #fff;
      font-family: monospace;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 10px;
    }
    .ely-universal-chat-drawer {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 360px;
      height: 490px;
      background: #141722;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow: hidden;
      animation: elyChatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes elyChatSlideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ely-universal-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: rgba(0, 0, 0, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ely-universal-chat-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 800;
      color: #f1f5f9;
    }
    .ely-universal-chat-title svg {
      width: 16px;
      height: 16px;
      color: #f59e0b;
    }
    .ely-universal-chat-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .ely-universal-chat-close:hover {
      color: #f1f5f9;
    }
    .ely-universal-chat-feed {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ely-chat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 8px 12px;
    }
    .ely-chat-item.system-msg {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.2);
    }
    .ely-chat-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ely-chat-sender-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ely-chat-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .ely-chat-avatar-initial {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: #fff;
      font-size: 0.62rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ely-chat-sender {
      font-size: 0.75rem;
      font-weight: 700;
      color: #f59e0b;
    }
    .ely-chat-item.system-msg .ely-chat-sender {
      color: #38bdf8;
    }
    .ely-chat-time {
      font-family: monospace;
      font-size: 0.65rem;
      color: #94a3b8;
    }
    .ely-chat-text {
      font-size: 0.82rem;
      color: #f1f5f9;
      line-height: 1.35;
      word-break: break-word;
      user-select: text;
    }
    .ely-chat-emotes {
      display: flex;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .ely-emote-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .ely-emote-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: scale(1.15);
    }
    .ely-chat-form {
      display: flex;
      gap: 8px;
      padding: 10px 14px 14px;
      background: rgba(0, 0, 0, 0.4);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .ely-chat-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 9px 14px;
      color: #f1f5f9;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .ely-chat-input:focus {
      border-color: #38bdf8;
      background: rgba(255, 255, 255, 0.1);
    }
    .ely-chat-send {
      background: #38bdf8;
      border: none;
      color: #0b0c10;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .ely-chat-send:hover {
      background: #7dd3fc;
      transform: scale(1.05);
    }
    .ely-chat-send svg {
      width: 16px;
      height: 16px;
      stroke: #0b0c10;
    }
    .ely-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(styleEl);

  // If inside arcade iframe, don't create duplicate UI; provide global helper
  if (isEmbeddedInArcade) {
    window.openArcadeChat = function() {
      try { window.parent.postMessage({ type: 'TOGGLE_LOBBY_CHAT' }, '*'); } catch (e) {}
    };
    return;
  }

  // Create UI Container
  const wrap = document.createElement('div');
  wrap.className = 'ely-universal-chat-wrap';
  wrap.innerHTML = `
    <button class="ely-universal-chat-toggle" id="elyUniversalChatToggle" title="Toggle Universal Arcade Chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>ARCADE LOBBY CHAT</span>
      <span class="ely-universal-chat-badge ely-hidden" id="elyUniversalChatBadge">0</span>
    </button>

    <div class="ely-universal-chat-drawer ely-hidden" id="elyUniversalChatDrawer">
      <div class="ely-universal-chat-header">
        <div class="ely-universal-chat-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Lobby Live Chat</span>
        </div>
        <button class="ely-universal-chat-close" id="elyUniversalChatClose">✕</button>
      </div>

      <div class="ely-universal-chat-feed" id="elyUniversalChatFeed"></div>

      <div class="ely-chat-emotes">
        <button class="ely-emote-btn" data-emote="🎮">🎮</button>
        <button class="ely-emote-btn" data-emote="⚔️">⚔️</button>
        <button class="ely-emote-btn" data-emote="🔥">🔥</button>
        <button class="ely-emote-btn" data-emote="🏆">🏆</button>
        <button class="ely-emote-btn" data-emote="👏">👏</button>
      </div>

      <form class="ely-chat-form" id="elyUniversalChatForm">
        <input type="text" class="ely-chat-input" id="elyUniversalChatInput" placeholder="Say something in arcade..." maxlength="120" autocomplete="off" />
        <button type="submit" class="ely-chat-send" title="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(wrap);

  const toggleBtn = document.getElementById('elyUniversalChatToggle');
  const badgeEl = document.getElementById('elyUniversalChatBadge');
  const drawerEl = document.getElementById('elyUniversalChatDrawer');
  const closeBtn = document.getElementById('elyUniversalChatClose');
  const feedEl = document.getElementById('elyUniversalChatFeed');
  const formEl = document.getElementById('elyUniversalChatForm');
  const inputEl = document.getElementById('elyUniversalChatInput');

  function updateBadge() {
    if (unreadCount > 0) {
      badgeEl.textContent = String(unreadCount);
      badgeEl.classList.remove('ely-hidden');
    } else {
      badgeEl.classList.add('ely-hidden');
    }
  }

  function toggleDrawer(open) {
    if (open) {
      drawerEl.classList.remove('ely-hidden');
      unreadCount = 0;
      updateBadge();
      inputEl.focus();
      scrollFeed();
    } else {
      drawerEl.classList.add('ely-hidden');
    }
  }

  function scrollFeed() {
    if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
  }

  function renderFeed() {
    if (!feedEl) return;
    feedEl.innerHTML = '';
    chatMessages.forEach(m => {
      const item = document.createElement('div');
      item.className = `ely-chat-item ${m.isSystem ? 'system-msg' : ''}`;
      const timeStr = formatTime(m);
      const avatarHtml = m.photoURL
        ? `<img src="${m.photoURL}" alt="${m.sender}" class="ely-chat-avatar" />`
        : `<span class="ely-chat-avatar-initial">${(m.sender || 'P').charAt(0).toUpperCase()}</span>`;

      item.innerHTML = `
        <div class="ely-chat-meta">
          <div class="ely-chat-sender-wrap">
            ${!m.isSystem ? avatarHtml : ''}
            <span class="ely-chat-sender">${m.sender}</span>
          </div>
          <span class="ely-chat-time">${timeStr}</span>
        </div>
        <div class="ely-chat-text">${m.text}</div>
      `;
      feedEl.appendChild(item);
    });
    scrollFeed();
  }

  // Render initial cached history immediately
  renderFeed();

  // Toggle events
  toggleBtn.addEventListener('click', () => toggleDrawer(drawerEl.classList.contains('ely-hidden')));
  closeBtn.addEventListener('click', () => toggleDrawer(false));

  // Emotes
  wrap.querySelectorAll('.ely-emote-btn').forEach(b => {
    b.addEventListener('click', () => {
      const emote = b.getAttribute('data-emote');
      sendMessage(emote);
    });
  });

  // Submit form
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    sendMessage(text);
    inputEl.value = '';
  });

  // Sending Logic
  async function sendMessage(text) {
    const sender = getSenderInfo();
    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const msgId = 'msg_' + timestamp + '_' + Math.random().toString(36).substr(2, 4);

    const msg = {
      id: msgId,
      sender: sender.name,
      text: text.trim(),
      time: timeStr,
      timestamp: timestamp,
      photoURL: sender.photoURL,
      isSystem: false
    };

    chatMessages.push(msg);
    chatMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    saveCachedMessages(chatMessages);
    renderFeed();

    // Broadcast across tabs
    if (syncChannel) {
      try { syncChannel.postMessage({ type: 'CHAT_MESSAGE', payload: msg }); } catch (e) {}
    } else {
      try { localStorage.setItem('elywolf_chat_broadcast', JSON.stringify(msg)); } catch (e) {}
    }

    // Post to cloud API
    const targetApi = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `${PROD_API_ORIGIN}/api/chat`
      : API_CHAT;

    try {
      await fetch(targetApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      fetchCloudChat();
    } catch (err) {}
  }

  // Receive from BroadcastChannel
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'CHAT_MESSAGE' && payload && !isDuplicate(payload)) {
        chatMessages.push(payload);
        chatMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveCachedMessages(chatMessages);
        renderFeed();
        if (drawerEl.classList.contains('ely-hidden')) {
          unreadCount++;
          updateBadge();
          playChatChime();
        }
      }
    };
  }

  // Fallback storage sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'elywolf_chat_broadcast' && e.newValue) {
      try {
        const msg = JSON.parse(e.newValue);
        if (msg && !isDuplicate(msg)) {
          chatMessages.push(msg);
          chatMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          saveCachedMessages(chatMessages);
          renderFeed();
          if (drawerEl.classList.contains('ely-hidden')) {
            unreadCount++;
            updateBadge();
            playChatChime();
          }
        }
      } catch (err) {}
    }
  });

  // Cloud Fetch Loop
  async function fetchCloudChat() {
    let cloudMsgs = null;
    try {
      const res = await fetch(API_CHAT);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.messages) cloudMsgs = data.messages;
      }
    } catch (e) {}

    if (!cloudMsgs && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const res = await fetch(`${PROD_API_ORIGIN}/api/chat`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.messages) cloudMsgs = data.messages;
        }
      } catch (e) {}
    }

    if (cloudMsgs && Array.isArray(cloudMsgs)) {
      let hasNew = false;
      cloudMsgs.forEach(m => {
        if (!isDuplicate(m)) {
          chatMessages.push(m);
          hasNew = true;
        }
      });
      if (hasNew) {
        chatMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveCachedMessages(chatMessages);
        renderFeed();
        if (drawerEl.classList.contains('ely-hidden')) {
          unreadCount++;
          updateBadge();
          playChatChime();
        }
      }
    }
  }

  // Poll cloud chat every 2.5 seconds
  setInterval(fetchCloudChat, 2500);
  fetchCloudChat();
})();
