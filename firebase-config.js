/* ==========================================================================
   ELYWOLF ARCADE - GLOBAL REAL-TIME CROSS-DEVICE PRESENCE & CHAT SERVICE
   ========================================================================== */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Web Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyElyWolfArcadeKey_2026_MockAuth",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "elywolf-arcade.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "elywolf-arcade",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "elywolf-arcade.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "998877665544",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:998877665544:web:abcdef123456"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn("Firebase App initialization notice:", err);
}


// Local & Session Storage Keys
const LOCAL_USERS_KEY = 'elywolf_arcade_users_db';
const SESSION_USER_KEY = 'elywolf_arcade_session_user';
const GUEST_ID_KEY = 'elywolf_arcade_guest_id';

function getOrCreateGuestId() {
  let guestId = sessionStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    const num = Math.floor(1000 + Math.random() * 9000);
    guestId = `Guest #${num}`;
    sessionStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}'); } catch (e) { return {}; }
}
function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Session User per Tab
export function getLocalSessionUser() {
  try { 
    const session = sessionStorage.getItem(SESSION_USER_KEY);
    if (session) return JSON.parse(session);
    const fallback = localStorage.getItem(SESSION_USER_KEY);
    return fallback ? JSON.parse(fallback) : null;
  } catch (e) { return null; }
}

function setLocalSessionUser(user) {
  if (user) {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  }
  notifyAuthListeners(user);
}

// Global Auth Listeners
const authListeners = new Set();
function notifyAuthListeners(user) {
  authListeners.forEach(cb => { try { cb(user); } catch (e) {} });
}

if (auth) {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const u = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
      };
      setLocalSessionUser(u);
    } else {
      notifyAuthListeners(getLocalSessionUser());
    }
  });
}

// ==========================================================================
// GLOBAL REAL-TIME CROSS-DEVICE & CROSS-TAB PRESENCE & CHAT DETECTOR
// ==========================================================================
const TAB_SESSION_ID = 'tab_' + Math.random().toString(36).substr(2, 9);
const presenceListeners = new Set();
const chatListeners = new Set();

const UNIVERSAL_CHAT_STORAGE_KEY = 'elywolf_universal_chat_history';
const PROD_API_ORIGIN = 'https://gemini-internship.vercel.app';

function loadUniversalChatHistory() {
  try {
    const raw = localStorage.getItem(UNIVERSAL_CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [
    { id: 'm1', sender: 'System 🤖', text: 'Welcome to ElyWolf Arcade Global Lobby Chat!', time: 'System', isSystem: true, timestamp: 0 }
  ];
}

function saveUniversalChatHistory(messages) {
  try {
    localStorage.setItem(UNIVERSAL_CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-150)));
  } catch (e) {}
}

let globalChatCache = loadUniversalChatHistory();

// BroadcastChannel for instant zero-latency cross-tab communication
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_arcade_sync') : null;
const localPresenceMap = new Map();

// Challenge & Maze State Listeners
const challengeOfferListeners = new Set();
const challengeResponseListeners = new Set();
const friendOfferListeners = new Set();
const friendResponseListeners = new Set();
const mazePlayersListeners = new Set();

let pendingChallengeAction = null;
let pendingFriendAction = null;
let localMazePos = null;
const processedChallengeIds = new Set();
const processedFriendIds = new Set();

let activeGameStatus = null;

export function setActiveGameStatus(status) {
  activeGameStatus = status;
  sendPresenceHeartbeat();
}

function getPageLabel() {
  if (activeGameStatus) return activeGameStatus;
  const path = window.location.pathname;
  if (path.includes('/go-fish/')) return 'Playing Shark Bait';
  if (path.includes('/math-gauntlet/')) return 'Playing Math Gauntlet';
  if (path.includes('/memory-card/')) return 'Playing Album Memory';
  if (path.includes('/maze-runner/')) return 'Playing Maze Runner 100';
  return 'In Main Arcade Menu';
}

// API Endpoints
const API_PRESENCE = '/api/presence';
const API_CHAT = '/api/chat';

function isDuplicateChatMessage(msg) {
  if (!msg) return true;
  return globalChatCache.some(m => 
    m.id === msg.id || 
    (m.sender === msg.sender && m.text === msg.text && Math.abs((m.timestamp || 0) - (msg.timestamp || 0)) < 4000)
  );
}

function handleIncomingChallengeInvite(chal) {
  if (!chal || !chal.id || !chal.to) return;
  const user = getLocalSessionUser();
  const myName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  if (chal.to.trim().toLowerCase() === myName && chal.status === 'pending') {
    if (!processedChallengeIds.has(chal.id)) {
      processedChallengeIds.add(chal.id);
      challengeOfferListeners.forEach(cb => { try { cb(chal); } catch (e) {} });
    }
  }
}

function handleIncomingChallengeResponse(resp) {
  if (!resp || !resp.id) return;
  const user = getLocalSessionUser();
  const myName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  const isHost = resp.from && resp.from.trim().toLowerCase() === myName;
  const isGuest = resp.to && resp.to.trim().toLowerCase() === myName;
  if (isHost || isGuest) {
    const key = `${resp.id}_${resp.response || resp.status}`;
    if (!processedChallengeIds.has(key)) {
      processedChallengeIds.add(key);
      challengeResponseListeners.forEach(cb => { try { cb(resp); } catch (e) {} });
    }
  }
}

function handleIncomingFriendInvite(req) {
  if (!req || !req.id || !req.to) return;
  const user = getLocalSessionUser();
  const myName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  if (req.to.trim().toLowerCase() === myName && req.status === 'pending') {
    if (!processedFriendIds.has(req.id)) {
      processedFriendIds.add(req.id);
      friendOfferListeners.forEach(cb => { try { cb(req); } catch (e) {} });
    }
  }
}

function handleIncomingFriendResponse(resp) {
  if (!resp || !resp.id) return;
  const user = getLocalSessionUser();
  const myName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  const isSender = resp.from && resp.from.trim().toLowerCase() === myName;
  const isTarget = resp.to && resp.to.trim().toLowerCase() === myName;
  if (isSender || isTarget) {
    const key = `${resp.id}_${resp.status || resp.response}`;
    if (!processedFriendIds.has(key)) {
      processedFriendIds.add(key);
      friendResponseListeners.forEach(cb => { try { cb(resp); } catch (e) {} });
    }
  }
}

// Listen to local BroadcastChannel updates from other tabs on same machine
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === 'PRESENCE_HEARTBEAT' && payload && payload.tabId) {
      payload.lastSeen = Date.now();
      localPresenceMap.set(payload.tabId, payload);
      triggerPresenceBroadcast();
    } else if (type === 'CHAT_MESSAGE' && payload) {
      if (!isDuplicateChatMessage(payload)) {
        globalChatCache.push(payload);
        notifyChatListeners(globalChatCache);
      }
    } else if (type === 'CHALLENGE_INVITE' && payload) {
      handleIncomingChallengeInvite(payload);
    } else if (type === 'CHALLENGE_RESPONSE' && payload) {
      handleIncomingChallengeResponse(payload);
    } else if (type === 'FRIEND_REQUEST' && payload) {
      handleIncomingFriendInvite(payload);
    } else if (type === 'FRIEND_RESPONSE' && payload) {
      handleIncomingFriendResponse(payload);
    } else if (type === 'MAZE_POS' && payload) {
      mazePlayersListeners.forEach(cb => { try { cb([payload]); } catch (e) {} });
    }
  };
}

// Listen for window storage events for fallback tab sync (only when BroadcastChannel unavailable)
if (!syncChannel) {
  window.addEventListener('storage', (e) => {
    if (e.key === 'elywolf_chat_broadcast' && e.newValue) {
      try {
        const msg = JSON.parse(e.newValue);
        if (msg && !isDuplicateChatMessage(msg)) {
          globalChatCache.push(msg);
          notifyChatListeners(globalChatCache);
        }
      } catch (err) {}
    }
  });
}

function getMergedPlayers(apiPlayers = []) {
  const now = Date.now();
  const playerMap = new Map();

  // 1. Add API players
  apiPlayers.forEach(p => {
    if (p && p.tabId) playerMap.set(p.tabId, p);
  });

  // 2. Add local tab presence (valid within 35s)
  for (const [tabId, player] of localPresenceMap.entries()) {
    if (now - (player.lastSeen || 0) <= 35000) {
      playerMap.set(tabId, player);
    } else {
      localPresenceMap.delete(tabId);
    }
  }

  return Array.from(playerMap.values());
}

let lastApiPlayers = [];

function triggerPresenceBroadcast() {
  const merged = getMergedPlayers(lastApiPlayers);
  notifyPresenceListeners(merged);
}

/**
 * Send Global Presence Heartbeat
 */
async function sendPresenceHeartbeat() {
  const user = getLocalSessionUser();
  const displayName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const avatar = displayName.replace('Guest #', 'G#').charAt(0).toUpperCase();
  const photoURL = user ? (user.photoURL || null) : null;

  const payload = {
    tabId: TAB_SESSION_ID,
    uid: user ? user.uid : TAB_SESSION_ID,
    displayName: displayName,
    avatar: avatar,
    photoURL: photoURL,
    status: getPageLabel(),
    isGuest: !user,
    lastSeen: Date.now(),
    challengeAction: pendingChallengeAction,
    friendAction: pendingFriendAction,
    mazePos: localMazePos
  };
  pendingChallengeAction = null;
  pendingFriendAction = null;

  // Broadcast to other tabs on same machine immediately
  localPresenceMap.set(TAB_SESSION_ID, payload);
  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'PRESENCE_HEARTBEAT', payload }); } catch (e) {}
  }

  function handlePresenceData(data) {
    if (data.players) {
      lastApiPlayers = data.players;
      try { sessionStorage.setItem('elywolf_presence_cache', JSON.stringify(data.players)); } catch (e) {}
    }
    if (Array.isArray(data.challenges)) {
      data.challenges.forEach(c => {
        handleIncomingChallengeInvite(c);
        handleIncomingChallengeResponse(c);
      });
    }
    if (Array.isArray(data.friendRequests)) {
      data.friendRequests.forEach(f => {
        handleIncomingFriendInvite(f);
        handleIncomingFriendResponse(f);
      });
    }
    if (Array.isArray(data.mazePlayers)) {
      mazePlayersListeners.forEach(cb => { try { cb(data.mazePlayers); } catch (e) {} });
    }
  }

  try {
    const res = await fetch(API_PRESENCE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      handlePresenceData(data);
    } else {
      throw new Error('Local endpoint returned non-JSON');
    }
  } catch (err) {
    // Localhost fallback: sync with live production presence API
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const prodRes = await fetch(`${PROD_API_ORIGIN}/api/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          handlePresenceData(prodData);
        }
      } catch (e) {}
    }
  }

  triggerPresenceBroadcast();
}

async function fetchGlobalChat() {
  let fetchedMessages = null;
  try {
    const res = await fetch(API_CHAT);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.messages) fetchedMessages = data.messages;
    }
  } catch (err) {}

  // Localhost fallback: if local endpoint returned HTML (Vite) or failed, pull from cloud production
  if (!fetchedMessages && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      const res = await fetch(`${PROD_API_ORIGIN}/api/chat`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.messages) fetchedMessages = data.messages;
      }
    } catch (e) {}
  }

  if (fetchedMessages && Array.isArray(fetchedMessages)) {
    let hasNew = false;
    fetchedMessages.forEach(m => {
      // Check by exact ID
      if (globalChatCache.some(existing => existing.id === m.id)) return;

      // Check by sender, text, and timestamp proximity (< 4s)
      const existingByContent = globalChatCache.find(existing => 
        existing.sender === m.sender && 
        existing.text === m.text && 
        Math.abs((existing.timestamp || 0) - (m.timestamp || 0)) < 4000
      );
      if (existingByContent) {
        existingByContent.id = m.id;
        return;
      }

      globalChatCache.push(m);
      hasNew = true;
    });

    if (hasNew) {
      notifyChatListeners(globalChatCache);
    }
  }
}

function notifyPresenceListeners(rawPlayers) {
  const user = getLocalSessionUser();
  const currentName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  const currentUid = user ? user.uid : null;

  const processed = rawPlayers.map(p => {
    const pName = (p.displayName || '').trim().toLowerCase();
    const isSameAccount = Boolean((pName && pName === currentName) || (currentUid && p.uid && p.uid === currentUid));
    const isSelfTab = p.tabId === TAB_SESSION_ID;

    return {
      ...p,
      isSelf: isSelfTab,
      isSameAccountTab: !isSelfTab && isSameAccount
    };
  });
  presenceListeners.forEach(cb => { try { cb(processed); } catch (e) {} });
}

function notifyChatListeners(messages) {
  messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  saveUniversalChatHistory(messages);
  chatListeners.forEach(cb => { try { cb(messages); } catch (e) {} });
}

// Global Poll Loop (1.5s interval for snappy real-time sync)
setInterval(() => {
  sendPresenceHeartbeat();
  fetchGlobalChat();
}, 1500);

// Immediate Sync
sendPresenceHeartbeat();
fetchGlobalChat();

/**
 * Send Chat Message to Global Network
 */
export async function sendChatMessage(text) {
  const user = getLocalSessionUser();
  const senderName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const photoURL = user ? (user.photoURL || null) : null;
  const timestamp = Date.now();
  const nowStr = new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const msgId = 'msg_' + timestamp + '_' + Math.random().toString(36).substr(2, 4);

  const newMsg = {
    id: msgId,
    sender: senderName,
    text: text.trim(),
    time: nowStr,
    timestamp: timestamp,
    photoURL: photoURL,
    isSystem: false
  };

  // Add to local cache immediately
  globalChatCache.push(newMsg);
  notifyChatListeners(globalChatCache);

  // Broadcast to other tabs on same machine
  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'CHAT_MESSAGE', payload: newMsg }); } catch (e) {}
  } else {
    try {
      localStorage.setItem('elywolf_chat_broadcast', JSON.stringify(newMsg));
    } catch (e) {}
  }

  const endpoint = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${PROD_API_ORIGIN}/api/chat`
    : API_CHAT;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
    fetchGlobalChat();
  } catch (err) {}
}

/**
 * Send Challenge to Global Network
 */
export async function sendChallenge(targetName, gameName) {
  const user = getLocalSessionUser();
  const senderName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const text = `⚔️ ${senderName} challenged ${targetName} to ${gameName}!`;
  const timestamp = Date.now();
  const nowStr = new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const msgId = 'msg_' + timestamp + '_' + Math.random().toString(36).substr(2, 4);

  const sysMsg = {
    id: msgId,
    sender: 'System 🎮',
    text: text,
    time: nowStr,
    timestamp: timestamp,
    isSystem: true
  };

  globalChatCache.push(sysMsg);
  notifyChatListeners(globalChatCache);

  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'CHAT_MESSAGE', payload: sysMsg }); } catch (e) {}
  } else {
    try {
      localStorage.setItem('elywolf_chat_broadcast', JSON.stringify(sysMsg));
    } catch (e) {}
  }

  const endpoint = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${PROD_API_ORIGIN}/api/chat`
    : API_CHAT;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sysMsg)
    });
    fetchGlobalChat();
  } catch (err) {}
}

/**
 * Send Interactive 1v1 Challenge Offer to a player
 */
export function sendChallengeOffer(targetPlayerName, gameName) {
  const user = getLocalSessionUser();
  const myName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const myPhoto = user ? user.photoURL : null;
  const challengeId = 'chal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  const chal = {
    id: challengeId,
    from: myName,
    fromPhoto: myPhoto,
    to: targetPlayerName,
    game: gameName,
    status: 'pending',
    timestamp: Date.now()
  };

  pendingChallengeAction = { type: 'INVITE', challenge: chal };

  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'CHALLENGE_INVITE', payload: chal }); } catch (e) {}
  }

  // Also post an announcement in chat
  sendChallenge(targetPlayerName, `${gameName} 1v1`);

  sendPresenceHeartbeat();
  return chal;
}

/**
 * Respond to Challenge Offer ('accepted' or 'declined')
 */
export function respondToChallengeOffer(challengeId, responseStatus, gameName, hostName, guestName) {
  const matchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const respData = {
    id: challengeId,
    from: hostName,
    to: guestName,
    game: gameName,
    response: responseStatus,
    status: responseStatus,
    matchId: matchId,
    timestamp: Date.now()
  };

  pendingChallengeAction = { type: 'RESPONSE', challenge: respData };

  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'CHALLENGE_RESPONSE', payload: respData }); } catch (e) {}
  }

  sendPresenceHeartbeat();
  return respData;
}

export function onChallengeOffer(cb) {
  challengeOfferListeners.add(cb);
  return () => challengeOfferListeners.delete(cb);
}

export function onChallengeResponse(cb) {
  challengeResponseListeners.add(cb);
  return () => challengeResponseListeners.delete(cb);
}

/**
 * Send Friend Request
 */
export function sendFriendRequest(targetPlayerName, targetPhoto) {
  const user = getLocalSessionUser();
  const myName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const myPhoto = user ? user.photoURL : null;
  const requestId = 'freq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  const req = {
    id: requestId,
    from: myName,
    fromPhoto: myPhoto,
    to: targetPlayerName,
    toPhoto: targetPhoto || null,
    status: 'pending',
    timestamp: Date.now()
  };

  pendingFriendAction = { type: 'REQUEST', request: req };

  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'FRIEND_REQUEST', payload: req }); } catch (e) {}
  }

  // Also broadcast via window storage fallback
  try {
    localStorage.setItem('elywolf_friend_req_out', JSON.stringify(req));
  } catch (e) {}

  sendPresenceHeartbeat();
  return req;
}

/**
 * Respond to Friend Request ('accepted' or 'declined')
 */
export function respondToFriendRequest(requestId, responseStatus, senderName, senderPhoto) {
  const user = getLocalSessionUser();
  const myName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  const myPhoto = user ? user.photoURL : null;

  const respData = {
    id: requestId,
    from: senderName,
    fromPhoto: senderPhoto || null,
    to: myName,
    toPhoto: myPhoto || null,
    response: responseStatus,
    status: responseStatus,
    timestamp: Date.now()
  };

  pendingFriendAction = { type: 'RESPONSE', request: respData };

  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'FRIEND_RESPONSE', payload: respData }); } catch (e) {}
  }

  // Broadcast via window storage fallback
  try {
    localStorage.setItem('elywolf_friend_resp_out', JSON.stringify(respData));
  } catch (e) {}

  sendPresenceHeartbeat();
  return respData;
}

export function onFriendOffer(cb) {
  friendOfferListeners.add(cb);
  return () => friendOfferListeners.delete(cb);
}

export function onFriendResponse(cb) {
  friendResponseListeners.add(cb);
  return () => friendResponseListeners.delete(cb);
}

/**
 * Live Maze Runner Ghost Synchronization
 */
export function updateMazeRunnerPosition(pos) {
  localMazePos = pos;
  const user = getLocalSessionUser();
  const myName = user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId();
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: 'MAZE_POS',
        payload: {
          username: myName,
          photoURL: user ? user.photoURL : null,
          ...pos,
          lastSeen: Date.now()
        }
      });
    } catch (e) {}
  }
}

export function onMazePlayersUpdate(cb) {
  mazePlayersListeners.add(cb);
  return () => mazePlayersListeners.delete(cb);
}



export function onChatUpdate(callback) {
  chatListeners.add(callback);
  callback(globalChatCache);
  return () => chatListeners.delete(callback);
}

export function onOnlinePlayersUpdate(callback) {
  presenceListeners.add(callback);
  triggerPresenceBroadcast();
  return () => presenceListeners.delete(callback);
}

// ==========================================================================
// AUTHENTICATION METHODS
// ==========================================================================
// Accept either an email or a plain username. Usernames resolve to the
// matching local account's email, or a synthetic arcade email for Firebase.
function resolveLoginEmail(identifier) {
  const id = String(identifier || '').trim();
  if (id.includes('@')) return id.toLowerCase();
  const lower = id.toLowerCase();
  const users = getLocalUsers();
  for (const key of Object.keys(users)) {
    const u = users[key];
    if (u && String(u.displayName || '').trim().toLowerCase() === lower) return key;
  }
  return `${lower.replace(/[^a-z0-9._-]/g, '_')}@elywolf.arcade`;
}

export async function signUpWithEmail(email, password, displayName, photoURL = null) {
  const rawId = String(email || '').trim();
  const isUsername = !rawId.includes('@');
  if (isUsername) {
    const taken = Object.values(getLocalUsers()).some(u => String(u.displayName || '').trim().toLowerCase() === rawId.toLowerCase());
    if (taken) throw new Error("This username is already taken.");
  }
  const cleanEmail = isUsername ? resolveLoginEmail(rawId) : rawId.toLowerCase();
  const name = (displayName || '').trim() || (isUsername ? rawId : cleanEmail.split('@')[0]);

  if (auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const profileUpdates = { displayName: name };
      if (photoURL) profileUpdates.photoURL = photoURL;
      await updateProfile(userCredential.user, profileUpdates);

      const u = { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email, 
        displayName: name,
        photoURL: photoURL
      };
      setLocalSessionUser(u);
      sendPresenceHeartbeat();
      return u;
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-in-use') throw new Error("This email is already registered.");
      if (firebaseErr.code === 'auth/weak-password') throw new Error("Password should be at least 6 characters.");
    }
  }

  const users = getLocalUsers();
  if (users[cleanEmail]) throw new Error("This email is already registered.");

  const newUser = {
    uid: 'usr_' + Math.random().toString(36).substr(2, 9),
    email: cleanEmail,
    password: password,
    displayName: name,
    photoURL: photoURL
  };

  users[cleanEmail] = newUser;
  saveLocalUsers(users);
  setLocalSessionUser(newUser);
  sendPresenceHeartbeat();

  return newUser;
}

export async function signInWithEmail(email, password) {
  const rawId = String(email || '').trim();
  const isUsername = !rawId.includes('@');
  const cleanEmail = resolveLoginEmail(rawId);

  if (auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const localUsers = getLocalUsers();
      const localU = localUsers[cleanEmail];
      const photo = userCredential.user.photoURL || (localU ? localU.photoURL : null);
      const u = { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email, 
        displayName: userCredential.user.displayName || (isUsername ? rawId : cleanEmail.split('@')[0]),
        photoURL: photo
      };
      setLocalSessionUser(u);
      sendPresenceHeartbeat();
      return u;
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        throw new Error("Invalid password. Please check your credentials.");
      }
    }
  }

  const users = getLocalUsers();
  const user = users[cleanEmail];

  if (!user) {
    const newUser = {
      uid: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      password: password,
      displayName: isUsername ? rawId : cleanEmail.split('@')[0],
      photoURL: null
    };
    users[cleanEmail] = newUser;
    saveLocalUsers(users);
    setLocalSessionUser(newUser);
    sendPresenceHeartbeat();
    return newUser;
  }

  if (user.password !== password) throw new Error("Incorrect password.");

  setLocalSessionUser(user);
  sendPresenceHeartbeat();
  return user;
}

export async function updateUserProfilePic(photoURL) {
  const user = getLocalSessionUser();
  if (!user) return;
  user.photoURL = photoURL;
  setLocalSessionUser(user);

  const cleanEmail = (user.email || '').toLowerCase().trim();
  const users = getLocalUsers();
  if (users[cleanEmail]) {
    users[cleanEmail].photoURL = photoURL;
    saveLocalUsers(users);
  }

  if (auth && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { photoURL });
    } catch (e) {}
  }

  sendPresenceHeartbeat();
  try {
    const pName = user.displayName || user.email.split('@')[0];
    if (window.ElyProfiles && window.ElyProfiles.syncProfile) {
      window.ElyProfiles.syncProfile(pName, photoURL);
    }
  } catch (e) {}
  return user;
}

export async function signOutUser() {
  setLocalSessionUser(null);
  sendPresenceHeartbeat();
  if (auth) {
    try { await signOut(auth); } catch (e) {}
  }
}

export function onAuthChange(callback) {
  authListeners.add(callback);
  callback(getLocalSessionUser());
  return () => authListeners.delete(callback);
}

export { auth, db };
