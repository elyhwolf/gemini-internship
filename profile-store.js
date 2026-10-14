/**
 * ElyWolf Arcade - Profile Store
 *
 * XP, levels and match stats shared by the hub, the match games and the
 * profile page. Local-first: every result is applied instantly to this
 * browser's copy, then synced to the cloud (/api/profiles) so other players
 * can view it. Failed syncs are queued and retried automatically.
 *
 * XP rules (mirrored server-side in api/profiles.py):
 *   win  +30    loss -20 (XP never drops below 0)    draw +5
 *   every 100 XP is one level.
 */
(function () {
  'use strict';
  if (window.ElyProfiles) return;

  const LOCAL_KEY = 'elywolf_profiles_v1';
  const PENDING_KEY = 'elywolf_profile_pending';
  const PROD_API_ORIGIN = 'https://gemini-internship.vercel.app';
  const RULES = { win: 30, loss: -20, draw: 5, perLevel: 100 };
  const MAX_HISTORY = 20;
  const MAX_SEEN = 60;
  const GAMES = ['Shark Bait', 'Album Memory', 'Maze Runner 100', 'Math Gauntlet'];

  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // ---------------------------------------------------------------------
  // Identity (same rules the rest of the arcade uses)
  // ---------------------------------------------------------------------
  function getIdentity() {
    try {
      const raw = sessionStorage.getItem('elywolf_arcade_session_user') || localStorage.getItem('elywolf_arcade_session_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && (u.displayName || u.email)) {
          return {
            name: (u.displayName || u.email.split('@')[0]).trim(),
            photoURL: u.photoURL || null,
            isGuest: false
          };
        }
      }
    } catch (e) {}
    let guest = sessionStorage.getItem('elywolf_arcade_guest_id') || localStorage.getItem('elywolf_arcade_guest_id');
    if (!guest) {
      guest = 'Guest #' + Math.floor(1000 + Math.random() * 9000);
      sessionStorage.setItem('elywolf_arcade_guest_id', guest);
    }
    return { name: guest, photoURL: null, isGuest: true };
  }

  // ---------------------------------------------------------------------
  // Levels
  // ---------------------------------------------------------------------
  function levelFor(xp) {
    return Math.floor(Math.max(0, xp) / RULES.perLevel) + 1;
  }

  function progressFor(xp) {
    const safe = Math.max(0, xp);
    const into = safe % RULES.perLevel;
    return {
      level: levelFor(safe),
      into,
      needed: RULES.perLevel,
      pct: Math.round((into / RULES.perLevel) * 100)
    };
  }

  function titleFor(level) {
    if (level >= 12) return 'Legend';
    if (level >= 8) return 'Elite';
    if (level >= 5) return 'Veteran';
    if (level >= 3) return 'Contender';
    return 'Rookie';
  }

  // ---------------------------------------------------------------------
  // Local storage
  // ---------------------------------------------------------------------
  const keyOf = (name) => String(name || '').trim().toLowerCase().slice(0, 40);

  function loadAll() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
  }

  const FRIENDS_KEY = 'elywolf_friends_v1';

  function getFriends() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function saveFriends(list) {
    try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function isFriend(name) {
    if (!name) return false;
    const clean = String(name).trim().toLowerCase();
    return getFriends().some(f => String(f.name || f).trim().toLowerCase() === clean);
  }

  function addFriend(friendObj) {
    if (!friendObj) return;
    const name = typeof friendObj === 'string' ? friendObj : friendObj.name;
    if (!name) return;
    const clean = String(name).trim().toLowerCase();
    const me = getIdentity();
    if (me.name && me.name.trim().toLowerCase() === clean) return; // Cannot friend self

    const list = getFriends();
    if (list.some(f => String(f.name || f).trim().toLowerCase() === clean)) return;

    const item = {
      name: String(name).trim(),
      photoURL: typeof friendObj === 'object' ? (friendObj.photoURL || null) : null,
      addedAt: Date.now()
    };
    list.unshift(item);
    saveFriends(list);
    return item;
  }

  function removeFriend(name) {
    if (!name) return;
    const clean = String(name).trim().toLowerCase();
    const list = getFriends().filter(f => String(f.name || f).trim().toLowerCase() !== clean);
    saveFriends(list);
  }

  const DEFAULT_AVATARS = {
    'elylegend33': 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%20fill%3D%22none%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%3E%3Crect%20width%3D%2232%22%20height%3D%2232%22%20rx%3D%2216%22%20fill%3D%22%230f172a%22/%3E%3Cpolygon%20points%3D%2216%2C3%2028%2C12%2024%2C29%208%2C29%204%2C12%22%3E%3C/polygon%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2216%22%20r%3D%222%22%20fill%3D%22%2338bdf8%22%3E%3C/circle%3E%3Ccircle%20cx%3D%2221%22%20cy%3D%2216%22%20r%3D%222%22%20fill%3D%22%2338bdf8%22%3E%3C/circle%3E%3Cpolygon%20points%3D%2216%2C21%2013%2C25%2019%2C25%22%20fill%3D%22%2338bdf8%22%3E%3C/polygon%3E%3C/svg%3E'
  };

  function findLocalPhoto(name) {
    if (!name) return null;
    const clean = String(name).trim().toLowerCase();
    const me = getIdentity();
    if (me && me.name && me.name.toLowerCase() === clean && me.photoURL) {
      return me.photoURL;
    }
    try {
      const users = JSON.parse(localStorage.getItem('elywolf_arcade_users_db') || '{}');
      for (const email of Object.keys(users)) {
        const u = users[email];
        if (u && (u.displayName || '').trim().toLowerCase() === clean && u.photoURL) {
          return u.photoURL;
        }
      }
    } catch (e) {}
    if (DEFAULT_AVATARS[clean]) {
      return DEFAULT_AVATARS[clean];
    }
    return null;
  }

  function emptyProfile(name) {
    const now = Date.now();
    return {
      name: String(name || 'Player').trim(),
      photoURL: findLocalPhoto(name),
      xp: 0,
      level: 1,
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      bestStreak: 0,
      games: {},
      history: [],
      seen: [],
      createdAt: now,
      updatedAt: now
    };
  }

  function getLocalProfile(name) {
    return loadAll()[keyOf(name)] || null;
  }

  // Same math as api/profiles.py. Returns the actual XP delta, or null if duplicate.
  function applyResult(profile, ev) {
    profile.seen = profile.seen || [];
    if (profile.seen.includes(ev.matchId)) return null;

    const base = RULES[ev.result];
    const newXp = Math.max(0, profile.xp + base);
    const delta = newXp - profile.xp;
    profile.xp = newXp;
    profile.level = levelFor(newXp);

    profile.matches += 1;
    profile.games = profile.games || {};
    const stats = profile.games[ev.game] || (profile.games[ev.game] = { wins: 0, losses: 0, draws: 0 });
    if (ev.result === 'win') {
      profile.wins += 1; stats.wins += 1;
      profile.streak += 1;
      profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
    } else if (ev.result === 'loss') {
      profile.losses += 1; stats.losses += 1;
      profile.streak = 0;
    } else {
      profile.draws += 1; stats.draws += 1;
      profile.streak = 0;
    }

    const ts = Date.now();
    profile.history = [{
      matchId: ev.matchId,
      game: ev.game,
      result: ev.result,
      opponent: ev.opponent,
      xpDelta: delta,
      ts
    }].concat(profile.history || []).slice(0, MAX_HISTORY);
    profile.seen = [ev.matchId].concat(profile.seen).slice(0, MAX_SEEN);
    profile.updatedAt = ts;
    return delta;
  }

  async function apiFetch(path, options) {
    const attempt = async (origin) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const fetchOpts = Object.assign({}, options || {}, { signal: controller.signal });
        const res = await fetch(origin + path, fetchOpts);
        clearTimeout(timer);
        const type = res.headers.get('content-type') || '';
        if (!type.includes('application/json')) throw new Error('non-json');
        return { status: res.status, data: await res.json() };
      } catch (e) {
        clearTimeout(timer);
        throw e;
      }
    };
    try {
      return await attempt('');
    } catch (err) {
      if (PROD_API_ORIGIN && !window.location.origin.includes('gemini-internship.vercel.app')) {
        try {
          return await attempt(PROD_API_ORIGIN);
        } catch (e2) {}
      }
      throw err;
    }
  }

  function loadPending() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function savePending(list) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-50))); } catch (e) {}
  }

  let flushing = false;
  async function flushPending() {
    if (flushing) return;
    const queue = loadPending();
    if (!queue.length) return;
    flushing = true;
    const remaining = [];
    for (const ev of queue) {
      try {
        const out = await apiFetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
          keepalive: true
        });
        if (out.status >= 500) remaining.push(ev); // server hiccup: retry later
        // 2xx (including duplicate) and 4xx (invalid) are dropped
      } catch (e) {
        remaining.push(ev);
      }
    }
    savePending(remaining);
    flushing = false;
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------
  /**
   * Record a finished match for the current player. Idempotent per matchId.
   * Returns { duplicate, xpDelta, profile }.
   */
  function recordMatch({ game, matchId, result, opponent }) {
    if (!GAMES.includes(game) || !['win', 'loss', 'draw'].includes(result) || !matchId) {
      return { duplicate: true, xpDelta: 0, profile: null };
    }
    const me = getIdentity();
    const all = loadAll();
    const key = keyOf(me.name);
    const profile = all[key] || emptyProfile(me.name);
    if (me.photoURL) {
      profile.photoURL = me.photoURL;
    }

    const ev = { game, matchId: String(matchId), result, opponent: opponent || 'Opponent' };
    const delta = applyResult(profile, ev);
    all[key] = profile;
    saveAll(all);

    if (delta === null) return { duplicate: true, xpDelta: 0, profile };

    const pending = loadPending();
    pending.push(Object.assign({ name: me.name, photoURL: profile.photoURL }, ev));
    savePending(pending);
    flushPending();

    return { duplicate: false, xpDelta: delta, profile };
  }

  async function findPhotoFromAnySource(name) {
    if (!name) return null;
    const clean = String(name).trim().toLowerCase();

    // 1. Current identity or local DB
    const local = findLocalPhoto(name);
    if (local) return local;

    // 2. Local profile store cache
    try {
      const all = loadAll();
      const p = all[keyOf(name)];
      if (p && p.photoURL) return p.photoURL;
    } catch (e) {}

    // 3. Presence cache in sessionStorage / localStorage
    try {
      const presRaw = sessionStorage.getItem('elywolf_presence_cache') || localStorage.getItem('elywolf_presence_cache');
      if (presRaw) {
        const list = JSON.parse(presRaw);
        if (Array.isArray(list)) {
          const match = list.find(p => String(p.displayName || p.name || '').trim().toLowerCase() === clean && p.photoURL);
          if (match && match.photoURL) return match.photoURL;
        }
      }
    } catch (e) {}

    // 4. Universal chat history cache
    try {
      const chat = JSON.parse(localStorage.getItem('elywolf_universal_chat_history') || '[]');
      if (Array.isArray(chat)) {
        for (let i = chat.length - 1; i >= 0; i--) {
          const m = chat[i];
          if (m && String(m.sender || '').trim().toLowerCase() === clean && m.photoURL) {
            return m.photoURL;
          }
        }
      }
    } catch (e) {}

    // 5. Query live presence endpoint
    try {
      const out = await apiFetch('/api/presence');
      if (out && out.data && Array.isArray(out.data.players)) {
        try { sessionStorage.setItem('elywolf_presence_cache', JSON.stringify(out.data.players)); } catch (e) {}
        const match = out.data.players.find(p => String(p.displayName || '').trim().toLowerCase() === clean && p.photoURL);
        if (match && match.photoURL) return match.photoURL;
      }
    } catch (e) {}

    // 6. Built-in arcade default avatars
    if (DEFAULT_AVATARS[clean]) {
      return DEFAULT_AVATARS[clean];
    }

    return null;
  }

  async function syncProfile(name, photoURL) {
    if (!name) return;
    const key = keyOf(name);
    const all = loadAll();
    if (all[key]) {
      if (photoURL) all[key].photoURL = photoURL;
      saveAll(all);
    }
    if (photoURL) {
      try {
        await apiFetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync_profile', name, photoURL })
        });
      } catch (e) {}
    }
  }

  async function syncFullProfile(name, profileData) {
    if (!name || !profileData) return;
    try {
      await apiFetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_full_profile', name, profile: profileData })
      });
    } catch (e) {}
  }

  /**
   * Fetch a profile by name. Cloud is the universal source of truth
   * so all players across all devices see identical match counts and XP.
   */
  async function fetchProfile(name) {
    let server = null;
    try {
      const out = await apiFetch('/api/profiles?name=' + encodeURIComponent(name));
      if (out.status === 200 && out.data && out.data.profile) server = out.data.profile;
    } catch (e) {}

    const local = getLocalProfile(name);

    // Server is the universal ground truth
    let chosen = server;
    if (!chosen) {
      chosen = local || emptyProfile(name);
      if (local && (local.matches > 0 || local.xp > 0)) {
        syncFullProfile(name, local);
      }
    } else {
      // Keep local storage synchronized with universal server data
      const all = loadAll();
      all[keyOf(name)] = chosen;
      saveAll(all);
    }

    if (!chosen.photoURL) {
      const photo = await findPhotoFromAnySource(name);
      if (photo) {
        chosen.photoURL = photo;
        const all = loadAll();
        all[keyOf(name)] = chosen;
        saveAll(all);
        syncProfile(name, photo);
      }
    }
    chosen.level = levelFor(chosen.xp);
    return { profile: chosen, exists: Boolean(server || local), source: server ? 'cloud' : (local ? 'local' : 'new') };
  }

  async function fetchLeaderboard() {
    try {
      const out = await apiFetch('/api/profiles');
      if (out.data && Array.isArray(out.data.leaderboard)) return out.data.leaderboard;
    } catch (e) {}
    return [];
  }

  // Retry any queued results shortly after load
  setTimeout(flushPending, 1500);

  // Auto-sync current user's profile and photo on load
  try {
    const me = getIdentity();
    if (me && me.name && me.photoURL) {
      setTimeout(() => syncProfile(me.name, me.photoURL), 800);
    }
  } catch (e) {}

  window.ElyProfiles = {
    RULES,
    GAMES,
    getIdentity,
    levelFor,
    progressFor,
    titleFor,
    recordMatch,
    fetchProfile,
    fetchLeaderboard,
    getLocalProfile,
    flushPending,
    findPhotoFromAnySource,
    syncProfile,
    syncFullProfile,
    getFriends,
    isFriend,
    addFriend,
    removeFriend
  };
})();
