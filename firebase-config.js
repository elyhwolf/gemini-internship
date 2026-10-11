/* ==========================================================================
   ELYWOLF ARCADE - GLOBAL REAL-TIME CROSS-DEVICE PRESENCE & CHAT SERVICE
   ========================================================================== */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
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

const googleProvider = new GoogleAuthProvider();

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
let globalChatCache = [];

// BroadcastChannel for instant zero-latency cross-tab communication
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_arcade_sync') : null;
const localPresenceMap = new Map();

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
  return 'In Arcade Hub';
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

  // 2. Add local tab presence (valid within 10s)
  for (const [tabId, player] of localPresenceMap.entries()) {
    if (now - (player.lastSeen || 0) <= 10000) {
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

  const payload = {
    tabId: TAB_SESSION_ID,
    uid: user ? user.uid : TAB_SESSION_ID,
    displayName: displayName,
    avatar: avatar,
    status: getPageLabel(),
    isGuest: !user,
    lastSeen: Date.now()
  };

  // Purge any ghost tabs for the same user
  for (const [id, entry] of localPresenceMap.entries()) {
    if (id !== TAB_SESSION_ID) {
      const eName = (entry.displayName || '').trim().toLowerCase();
      if ((eName && eName === displayName.trim().toLowerCase()) || (user && entry.uid === user.uid)) {
        localPresenceMap.delete(id);
      }
    }
  }

  // Broadcast to other tabs on same machine immediately
  localPresenceMap.set(TAB_SESSION_ID, payload);
  if (syncChannel) {
    try { syncChannel.postMessage({ type: 'PRESENCE_HEARTBEAT', payload }); } catch (e) {}
  }

  try {
    const res = await fetch(API_PRESENCE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.players) {
        lastApiPlayers = data.players;
      }
    }
  } catch (err) {
    // API fail fallback
  }

  triggerPresenceBroadcast();
}

/**
 * Fetch Global Chat Messages
 */
async function fetchGlobalChat() {
  try {
    const res = await fetch(API_CHAT);
    if (res.ok) {
      const data = await res.json();
      if (data && data.messages) {
        let hasNew = false;
        data.messages.forEach(m => {
          // Check by exact ID
          if (globalChatCache.some(existing => existing.id === m.id)) return;

          // Check by sender, text, and timestamp proximity (< 4s)
          const existingByContent = globalChatCache.find(existing => 
            existing.sender === m.sender && 
            existing.text === m.text && 
            Math.abs((existing.timestamp || 0) - (m.timestamp || 0)) < 4000
          );
          if (existingByContent) {
            existingByContent.id = m.id; // reconcile ID without duplicating
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
  } catch (err) {}
}

function notifyPresenceListeners(rawPlayers) {
  const user = getLocalSessionUser();
  const currentName = (user ? (user.displayName || user.email.split('@')[0]) : getOrCreateGuestId()).trim().toLowerCase();
  const currentUid = user ? user.uid : null;

  const processed = rawPlayers.map(p => {
    const pName = (p.displayName || '').trim().toLowerCase();
    const isSelfName = Boolean(pName && pName === currentName);
    const isSelfUid = Boolean(currentUid && p.uid && p.uid === currentUid);
    const isSelfTab = p.tabId === TAB_SESSION_ID;

    return {
      ...p,
      isSelf: isSelfTab || isSelfName || isSelfUid
    };
  });
  presenceListeners.forEach(cb => { try { cb(processed); } catch (e) {} });
}

function notifyChatListeners(messages) {
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
  const timestamp = Date.now();
  const nowStr = new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const msgId = 'msg_' + timestamp + '_' + Math.random().toString(36).substr(2, 4);

  const newMsg = {
    id: msgId,
    sender: senderName,
    text: text.trim(),
    time: nowStr,
    timestamp: timestamp,
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

  try {
    await fetch(API_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msgId,
        sender: senderName,
        text: text.trim(),
        time: nowStr,
        timestamp: timestamp,
        isSystem: false
      })
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

  try {
    await fetch(API_CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msgId,
        sender: 'System 🎮',
        text: text,
        time: nowStr,
        timestamp: timestamp,
        isSystem: true
      })
    });
    fetchGlobalChat();
  } catch (err) {}
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
export async function signUpWithEmail(email, password, displayName) {
  const cleanEmail = email.toLowerCase().trim();
  const name = displayName.trim() || cleanEmail.split('@')[0];

  if (auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      const u = { uid: userCredential.user.uid, email: userCredential.user.email, displayName: name };
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
    displayName: name
  };

  users[cleanEmail] = newUser;
  saveLocalUsers(users);
  setLocalSessionUser(newUser);
  sendPresenceHeartbeat();

  return newUser;
}

export async function signInWithEmail(email, password) {
  const cleanEmail = email.toLowerCase().trim();

  if (auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const u = { uid: userCredential.user.uid, email: userCredential.user.email, displayName: userCredential.user.displayName || cleanEmail.split('@')[0] };
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
      displayName: cleanEmail.split('@')[0]
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

export async function signInWithGoogle() {
  if (auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = { uid: result.user.uid, email: result.user.email, displayName: result.user.displayName || "Google Player" };
      setLocalSessionUser(u);
      sendPresenceHeartbeat();
      return u;
    } catch (err) {}
  }

  const googleUser = {
    uid: 'goog_' + Math.random().toString(36).substr(2, 9),
    email: 'google.player@gmail.com',
    displayName: 'Google Player'
  };

  setLocalSessionUser(googleUser);
  sendPresenceHeartbeat();
  return googleUser;
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
