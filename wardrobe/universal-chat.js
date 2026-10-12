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

  function playChatChime(isMention = false) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (isMention) {
        // Metallic crystal bell chime for @ mentions (D6 1174Hz + D7 2349Hz overtone)
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1174.66, now);
        osc1.frequency.exponentialRampToValueAtTime(1170, now + 0.6);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2349.32, now);
        osc2.frequency.exponentialRampToValueAtTime(2340, now + 0.5);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
      } else {
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
      }
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
    .ely-chat-mention {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      padding: 1px 6px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      display: inline-block;
      transition: all 0.15s ease;
    }
    .ely-chat-mention:hover {
      background: rgba(56, 189, 248, 0.35);
      color: #7dd3fc;
    }
    .ely-chat-mention.mention-me {
      color: #facc15;
      background: rgba(234, 179, 8, 0.22);
      border: 1px solid rgba(234, 179, 8, 0.5);
      font-weight: 800;
      box-shadow: 0 0 8px rgba(234, 179, 8, 0.3);
    }
    .ely-chat-item.mentioned-me {
      border-left: 3px solid #facc15;
      background: rgba(234, 179, 8, 0.1);
      box-shadow: 0 0 15px rgba(234, 179, 8, 0.15);
    }
    .ely-chat-sender {
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .ely-chat-sender:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
    .ely-quick-mention-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      border-radius: 8px;
      padding: 4px 10px;
      font-family: monospace;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .ely-quick-mention-btn:hover {
      background: #38bdf8;
      color: #0b0c10;
      transform: scale(1.08);
    }
    .ely-chat-form {
      position: relative;
      display: flex;
      gap: 8px;
      padding: 10px 14px 14px;
      background: rgba(0, 0, 0, 0.4);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .ely-mention-dropdown {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 12px;
      right: 12px;
      background: #141722;
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 14px;
      box-shadow: 0 -12px 35px rgba(0, 0, 0, 0.85);
      max-height: 180px;
      overflow-y: auto;
      z-index: 100;
      display: flex;
      flex-direction: column;
      padding: 6px;
    }
    .ely-mention-header {
      font-size: 0.65rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      padding: 4px 8px;
      font-family: monospace;
      letter-spacing: 0.05em;
    }
    .ely-mention-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      color: #f1f5f9;
      font-size: 0.8rem;
      transition: all 0.15s ease;
    }
    .ely-mention-item:hover, .ely-mention-item.active {
      background: rgba(56, 189, 248, 0.18);
      color: #ffffff;
    }
    .ely-mention-toast {
      position: fixed;
      top: 24px;
      right: 24px;
      background: linear-gradient(135deg, rgba(20, 23, 34, 0.95), rgba(30, 34, 48, 0.95));
      border: 1px solid #facc15;
      border-radius: 16px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(234, 179, 8, 0.3);
      z-index: 9999999;
      cursor: pointer;
      animation: elyMentionToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes elyMentionToastIn {
      from { opacity: 0; transform: translateY(-16px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ely-mention-toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(234, 179, 8, 0.2);
      color: #facc15;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ely-mention-toast-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ely-mention-toast-title {
      font-size: 0.78rem;
      font-weight: 800;
      color: #facc15;
    }
    .ely-mention-toast-text {
      font-size: 0.74rem;
      color: #cbd5e1;
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

  // If inside arcade iframe, don't create duplicate UI; provide global helpers
  if (isEmbeddedInArcade) {
    window.openArcadeChat = function() {
      try { window.parent.postMessage({ type: 'TOGGLE_LOBBY_CHAT' }, '*'); } catch (e) {}
    };
    window.exitArcadeGame = function() {
      try { window.parent.postMessage({ type: 'REQUEST_EXIT_GAME' }, '*'); } catch (e) {}
    };
    // Intercept in-game back arrows or links pointing to arcade hub so iframe never loads main menu
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = (link.getAttribute('href') || '').trim();
        if (href === '../' || href === '/' || href === '../index.html' || href === '/index.html' || link.classList.contains('back-link')) {
          e.preventDefault();
          e.stopPropagation();
          window.exitArcadeGame();
        }
      }
    }, true);
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
        <button type="button" class="ely-quick-mention-btn" id="elyQuickMention" title="Mention a player (@)">@</button>
        <button class="ely-emote-btn" data-emote="🎮">🎮</button>
        <button class="ely-emote-btn" data-emote="⚔️">⚔️</button>
        <button class="ely-emote-btn" data-emote="🔥">🔥</button>
        <button class="ely-emote-btn" data-emote="🏆">🏆</button>
        <button class="ely-emote-btn" data-emote="👏">👏</button>
      </div>

      <form class="ely-chat-form" id="elyUniversalChatForm">
        <div class="ely-mention-dropdown ely-hidden" id="elyMentionDropdown"></div>
        <input type="text" class="ely-chat-input" id="elyUniversalChatInput" placeholder="Say something in arcade... (@ to mention)" maxlength="120" autocomplete="off" />
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
  const quickMentionBtn = document.getElementById('elyQuickMention');
  const mentionDropdownEl = document.getElementById('elyMentionDropdown');
  let activeMentionIdx = 0;

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
    if (cleanText.includes('@' + cleanTarget)) return true;
    if (cleanTarget.startsWith('guest #') || cleanTarget.startsWith('guest#')) {
      const digits = cleanTarget.replace(/guest\s*#?/, '').trim();
      if (digits && (cleanText.includes('@guest#' + digits) || cleanText.includes('@guest ' + digits))) return true;
      if (/\b@guest\b/i.test(text)) return true;
    }
    const firstWord = cleanTarget.split(' ')[0];
    if (firstWord && firstWord.length >= 3 && cleanText.includes('@' + firstWord)) return true;
    return false;
  }

  function formatTextWithMentions(text, myName) {
    const escaped = escapeHtml(text);
    const myClean = (myName || '').trim().toLowerCase();

    return escaped.replace(/@([a-zA-Z0-9_\-]+(?: #[0-9]+)?)/g, (fullMatch, username) => {
      const userClean = username.trim().toLowerCase();
      const isMe = myClean && (
        userClean === myClean ||
        (myClean.startsWith('guest') && userClean.startsWith('guest')) ||
        (myClean.split(' ')[0] === userClean && userClean.length >= 3)
      );
      const cls = isMe ? 'ely-chat-mention mention-me' : 'ely-chat-mention';
      return `<span class="${cls}" data-mention="${escapeHtml(username)}">@${username}</span>`;
    });
  }

  function showMentionToast(sender, text) {
    const existing = document.querySelector('.ely-mention-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ely-mention-toast';
    toast.innerHTML = `
      <div class="ely-mention-toast-icon">@</div>
      <div class="ely-mention-toast-body">
        <div class="ely-mention-toast-title">${escapeHtml(sender)} mentioned you!</div>
        <div class="ely-mention-toast-text">${escapeHtml(text)}</div>
      </div>
    `;
    toast.addEventListener('click', () => {
      toggleDrawer(true);
      toast.remove();
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  function getMentionCandidates() {
    const currentName = getSenderInfo().name.toLowerCase();
    const set = new Set();
    const candidates = [];

    chatMessages.forEach(m => {
      if (!m.isSystem && m.sender) {
        const name = m.sender.trim();
        if (name && name.toLowerCase() !== currentName && !set.has(name.toLowerCase())) {
          set.add(name.toLowerCase());
          candidates.push({ name: name, avatar: name.charAt(0).toUpperCase() });
        }
      }
    });
    return candidates;
  }

  function getQueryInfo() {
    if (!inputEl) return null;
    const val = inputEl.value;
    const pos = inputEl.selectionStart;
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
    if (mentionDropdownEl) {
      mentionDropdownEl.classList.add('ely-hidden');
      mentionDropdownEl.innerHTML = '';
    }
    activeMentionIdx = 0;
  }

  function applyMention(name, info) {
    if (!inputEl) return;
    const val = inputEl.value;
    const queryInfo = info || getQueryInfo();
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

    inputEl.value = newVal;
    inputEl.focus();
    inputEl.setSelectionRange(nextPos, nextPos);
    hideMentionDropdown();
  }

  function updateMentionDropdown() {
    if (!mentionDropdownEl || !inputEl) return;
    const info = getQueryInfo();
    if (!info) {
      hideMentionDropdown();
      return;
    }
    const q = info.query.toLowerCase();
    const candidates = getMentionCandidates().filter(c => !q || c.name.toLowerCase().includes(q));
    if (candidates.length === 0) {
      hideMentionDropdown();
      return;
    }

    if (activeMentionIdx >= candidates.length) activeMentionIdx = 0;

    mentionDropdownEl.innerHTML = `<div class="ely-mention-header">Mention Player (@)</div>`;
    candidates.slice(0, 5).forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ely-mention-item ${idx === activeMentionIdx ? 'active' : ''}`;
      btn.innerHTML = `<span style="font-weight:700;">@${escapeHtml(c.name)}</span>`;
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        applyMention(c.name, info);
      });
      mentionDropdownEl.appendChild(btn);
    });
    mentionDropdownEl.classList.remove('ely-hidden');
  }

  function setupClickToMention() {
    if (!feedEl) return;
    feedEl.querySelectorAll('.ely-chat-sender').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const senderName = el.textContent.trim();
        if (senderName && !senderName.includes('System')) {
          applyMention(senderName);
        }
      });
    });
    feedEl.querySelectorAll('.ely-chat-mention').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const mName = el.getAttribute('data-mention') || el.textContent.replace(/^@/, '').trim();
        if (mName) applyMention(mName);
      });
    });
  }

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
      hideMentionDropdown();
    }
  }

  function scrollFeed() {
    if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
  }

  function renderFeed() {
    if (!feedEl) return;
    feedEl.innerHTML = '';
    const myName = getSenderInfo().name;

    chatMessages.forEach(m => {
      const isMeMentioned = isUserMentioned(m.text, myName);
      const item = document.createElement('div');
      item.className = `ely-chat-item ${m.isSystem ? 'system-msg' : ''} ${isMeMentioned ? 'mentioned-me' : ''}`;
      const timeStr = formatTime(m);
      const avatarHtml = m.photoURL
        ? `<img src="${m.photoURL}" alt="${m.sender}" class="ely-chat-avatar" />`
        : `<span class="ely-chat-avatar-initial">${(m.sender || 'P').charAt(0).toUpperCase()}</span>`;

      item.innerHTML = `
        <div class="ely-chat-meta">
          <div class="ely-chat-sender-wrap">
            ${!m.isSystem ? avatarHtml : ''}
            <span class="ely-chat-sender" title="Click to mention ${escapeHtml(m.sender)}">${escapeHtml(m.sender)}</span>
          </div>
          <span class="ely-chat-time">${timeStr}</span>
        </div>
        <div class="ely-chat-text">${formatTextWithMentions(m.text, myName)}</div>
      `;
      feedEl.appendChild(item);
    });
    setupClickToMention();
    scrollFeed();
  }

  // Render initial cached history immediately
  renderFeed();

  // Toggle events
  toggleBtn.addEventListener('click', () => toggleDrawer(drawerEl.classList.contains('ely-hidden')));
  closeBtn.addEventListener('click', () => toggleDrawer(false));

  // Quick Mention Button
  if (quickMentionBtn) {
    quickMentionBtn.addEventListener('click', () => {
      if (!inputEl) return;
      const val = inputEl.value;
      if (!val.endsWith('@') && !val.endsWith('@ ')) {
        inputEl.value = val ? `${val} @` : '@';
      }
      inputEl.focus();
      updateMentionDropdown();
    });
  }

  if (inputEl) {
    inputEl.addEventListener('input', () => {
      updateMentionDropdown();
    });

    inputEl.addEventListener('keydown', (e) => {
      if (mentionDropdownEl && !mentionDropdownEl.classList.contains('ely-hidden')) {
        const items = mentionDropdownEl.querySelectorAll('.ely-mention-item');
        if (items.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeMentionIdx = (activeMentionIdx + 1) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeMentionIdx));
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeMentionIdx = (activeMentionIdx - 1 + items.length) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeMentionIdx));
            return;
          }
          if (e.key === 'Enter' || e.key === 'Tab') {
            const activeItem = items[activeMentionIdx];
            if (activeItem) {
              e.preventDefault();
              const name = activeItem.textContent.replace(/^@/, '').trim();
              if (name) applyMention(name);
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
    if (mentionDropdownEl && !mentionDropdownEl.contains(e.target) && e.target !== inputEl && e.target !== quickMentionBtn) {
      hideMentionDropdown();
    }
  });

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
    hideMentionDropdown();
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

  function handleIncomingMessage(m) {
    const myName = getSenderInfo().name;
    const isMeMentioned = (m.sender !== myName) && isUserMentioned(m.text, myName);
    if (isMeMentioned) {
      showMentionToast(m.sender, m.text);
      playChatChime(true); // Metallic bell DING
    } else if (drawerEl.classList.contains('ely-hidden')) {
      playChatChime(false);
    }
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
        }
        handleIncomingMessage(payload);
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
          }
          handleIncomingMessage(msg);
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
      const newArrivals = [];
      cloudMsgs.forEach(m => {
        if (!isDuplicate(m)) {
          chatMessages.push(m);
          newArrivals.push(m);
          hasNew = true;
        }
      });
      if (hasNew) {
        chatMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveCachedMessages(chatMessages);
        renderFeed();
        if (drawerEl.classList.contains('ely-hidden')) {
          unreadCount += newArrivals.length;
          updateBadge();
        }
        newArrivals.forEach(handleIncomingMessage);
      }
    }
  }

  // Poll cloud chat every 2.5 seconds
  setInterval(fetchCloudChat, 2500);
  fetchCloudChat();
})();
