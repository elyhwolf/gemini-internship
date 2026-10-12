/**
 * ElyWolf Arcade - Match Guard
 *
 * Shared by every game that can be launched from a 1v1 challenge
 * (go-fish, memory-card, maze-runner live, math-gauntlet 1v1).
 *
 *  - Adds a RESIGN button while you are inside a challenge match.
 *  - Leaving the page in ANY way (back arrow, closing the tab, reload,
 *    navigating elsewhere) counts as resigning, so you lose the match.
 *  - The opponent is notified instantly and shown a win screen.
 *  - Games call window.ElyMatchGuard.markFinished() when a match ends
 *    naturally, so leaving afterwards is not treated as a loss.
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode !== '1v1' && mode !== 'live') return; // Not a challenge match

  const matchId = params.get('match') || 'default';
  const opponentName = (params.get('opp') || 'Opponent').trim();
  const TAB_ID = 'mg_' + Math.random().toString(36).slice(2, 10);
  const HUB_URL = new URL('../', window.location.href).href;
  const RESULT_KEY = 'elywolf_last_match_result';

  const path = window.location.pathname;
  const GAME_NAME = path.includes('/go-fish') ? 'Shark Bait'
    : path.includes('/memory-card') ? 'Album Memory'
    : path.includes('/maze-runner') ? 'Maze Runner 100'
    : path.includes('/math-gauntlet') ? 'Math Gauntlet'
    : null;

  const channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('elywolf_match_resign_' + matchId)
    : null;

  let finished = false;

  function getMyName() {
    if (window.ElyProfiles) return window.ElyProfiles.getIdentity().name;
    try {
      const raw = localStorage.getItem('elywolf_arcade_session_user') || sessionStorage.getItem('elywolf_arcade_session_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && (u.displayName || u.email)) return u.displayName || u.email.split('@')[0];
      }
    } catch (e) {}
    return sessionStorage.getItem('elywolf_arcade_guest_id') || localStorage.getItem('elywolf_arcade_guest_id') || 'Player';
  }

  // Record this player's XP / stats for the match (idempotent per match)
  function recordOutcome(result) {
    if (!window.ElyProfiles || !GAME_NAME) return null;
    try {
      return window.ElyProfiles.recordMatch({ game: GAME_NAME, matchId, result, opponent: opponentName });
    } catch (e) { return null; }
  }

  function saveResult(result, reason, outcome) {
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify({
        matchId,
        result,
        reason,
        opponent: opponentName,
        xpDelta: outcome ? outcome.xpDelta : 0,
        timestamp: Date.now()
      }));
    } catch (e) {}
  }

  function formatXp(delta) {
    return (delta > 0 ? '+' : delta < 0 ? '-' : '+') + Math.abs(delta) + ' XP';
  }

  function broadcastResign() {
    if (!channel) return;
    try {
      channel.postMessage({ type: 'MATCH_RESIGN', matchId, from: TAB_ID, name: getMyName() });
    } catch (e) {}
  }

  // Forfeit the match (explicit resign or any form of leaving the page)
  function forfeit(reason) {
    if (finished) return;
    finished = true;
    const outcome = recordOutcome('loss');
    saveResult('loss', reason, outcome);
    broadcastResign();
  }

  function resign() {
    if (finished) return;
    forfeit('resigned');
    window.location.href = HUB_URL;
  }

  // ---------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .ely-resign-btn {
      position: fixed;
      left: 16px;
      bottom: 16px;
      z-index: 2147483000;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 12px;
      border: 1px solid rgba(248, 113, 113, 0.55);
      background: rgba(127, 29, 29, 0.82);
      color: #fecaca;
      font: 800 0.72rem/1 'Inter', -apple-system, 'Segoe UI', sans-serif;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }
    .ely-resign-btn:hover {
      background: rgba(185, 28, 28, 0.95);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 10px 26px rgba(185, 28, 28, 0.45);
    }
    .ely-resign-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    .ely-match-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483600;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(2, 6, 23, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
      animation: elyMatchFade 0.25s ease;
    }
    @keyframes elyMatchFade { from { opacity: 0; } to { opacity: 1; } }
    .ely-match-card {
      width: min(92vw, 400px);
      padding: 32px 28px 26px;
      border-radius: 20px;
      text-align: center;
      color: #f8fafc;
      background: linear-gradient(160deg, #0f172a, #1e293b);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    }
    .ely-match-card .ely-match-icon {
      width: 56px; height: 56px; margin: 0 auto 14px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.5);
      color: #4ade80;
    }
    .ely-match-card .ely-match-icon svg { width: 28px; height: 28px; }
    .ely-match-card h2 {
      margin: 0 0 8px;
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #4ade80;
    }
    .ely-match-card p {
      margin: 0 0 22px;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #94a3b8;
    }
    .ely-match-card button {
      width: 100%;
      padding: 13px 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #052e16;
      font: 800 0.8rem/1 'Inter', -apple-system, 'Segoe UI', sans-serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .ely-match-card button.ely-secondary {
      margin-top: 10px;
      background: transparent;
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .ely-match-card.ely-confirm .ely-match-icon {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.5);
      color: #f87171;
    }
    .ely-match-card.ely-confirm h2 { color: #f87171; }
    .ely-match-card.ely-confirm button.ely-danger {
      background: linear-gradient(135deg, #ef4444, #b91c1c);
      color: #ffffff;
    }
    .ely-match-card.ely-loss .ely-match-icon {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.5);
      color: #f87171;
    }
    .ely-match-card.ely-loss h2 { color: #f87171; }
    .ely-match-xp {
      display: inline-block;
      margin: -6px 0 20px;
      padding: 6px 14px;
      border-radius: 999px;
      font: 800 0.85rem/1 'JetBrains Mono', ui-monospace, monospace;
      letter-spacing: 0.06em;
    }
    .ely-match-xp.xp-up { color: #4ade80; background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(34, 197, 94, 0.4); }
    .ely-match-xp.xp-down { color: #f87171; background: rgba(248, 113, 113, 0.14); border: 1px solid rgba(248, 113, 113, 0.4); }
    .ely-match-xp.xp-flat { color: #94a3b8; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.3); }

    .ely-xp-toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483500;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 18px;
      border-radius: 14px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #f8fafc;
      font: 700 0.82rem/1 'Inter', -apple-system, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 34px rgba(0, 0, 0, 0.5);
      animation: elyToastIn 0.3s ease;
    }
    .ely-xp-toast strong { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .ely-xp-toast .xp-up { color: #4ade80; }
    .ely-xp-toast .xp-down { color: #f87171; }
    @keyframes elyToastIn { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }
  `;
  document.head.appendChild(style);

  const FLAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2.5 4.5L17 13H4"/></svg>';
  const TROPHY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z"/></svg>';

  // ---------------------------------------------------------------------
  // Overlays
  // ---------------------------------------------------------------------
  function removeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function showConfirm() {
    if (finished || document.getElementById('elyResignConfirm')) return;
    const overlay = document.createElement('div');
    overlay.className = 'ely-match-overlay';
    overlay.id = 'elyResignConfirm';
    overlay.innerHTML = `
      <div class="ely-match-card ely-confirm" role="dialog" aria-modal="true" aria-labelledby="elyResignTitle">
        <div class="ely-match-icon">${FLAG_SVG}</div>
        <h2 id="elyResignTitle">RESIGN MATCH?</h2>
        <p>You will lose this match (-${Math.abs(window.ElyProfiles ? window.ElyProfiles.RULES.loss : 20)} XP) and ${opponentName.replace(/</g, '&lt;')} will be awarded the win.</p>
        <button type="button" class="ely-danger" id="elyResignYes">Yes, resign</button>
        <button type="button" class="ely-secondary" id="elyResignNo">Keep playing</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#elyResignYes').addEventListener('click', resign);
    overlay.querySelector('#elyResignNo').addEventListener('click', () => removeOverlay('elyResignConfirm'));
  }

  function xpBadge(outcome) {
    if (!outcome || outcome.duplicate) return '';
    const d = outcome.xpDelta;
    const cls = d > 0 ? 'xp-up' : d < 0 ? 'xp-down' : 'xp-flat';
    const level = outcome.profile ? ` &middot; LEVEL ${outcome.profile.level}` : '';
    return `<div class="ely-match-xp ${cls}">${formatXp(d)}${level}</div>`;
  }

  function showXpToast(outcome, result) {
    if (!outcome || outcome.duplicate) return;
    removeOverlay('elyXpToast');
    const d = outcome.xpDelta;
    const label = result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw';
    const toast = document.createElement('div');
    toast.id = 'elyXpToast';
    toast.className = 'ely-xp-toast';
    toast.innerHTML = `<span>${label}</span><strong class="${d >= 0 ? 'xp-up' : 'xp-down'}">${formatXp(d)}</strong>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }

  // Full-screen result card (opponent resigned / opponent finished first)
  function showResultOverlay({ win, title, text, outcome }) {
    removeOverlay('elyResignConfirm');
    if (document.getElementById('elyMatchResult')) return;
    const overlay = document.createElement('div');
    overlay.className = 'ely-match-overlay';
    overlay.id = 'elyMatchResult';
    overlay.innerHTML = `
      <div class="ely-match-card ${win ? '' : 'ely-loss'}" role="dialog" aria-modal="true" aria-labelledby="elyResultTitle">
        <div class="ely-match-icon">${win ? TROPHY_SVG : FLAG_SVG}</div>
        <h2 id="elyResultTitle">${title}</h2>
        <p>${text}</p>
        ${xpBadge(outcome)}
        <button type="button" id="elyResultHub">Return to hub</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#elyResultHub').addEventListener('click', () => {
      window.location.href = HUB_URL;
    });
  }

  function safe(text) {
    return String(text || '').replace(/</g, '&lt;');
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------
  function mountButton() {
    if (document.getElementById('elyResignBtn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'elyResignBtn';
    btn.className = 'ely-resign-btn';
    btn.setAttribute('aria-label', 'Resign from match');
    btn.innerHTML = FLAG_SVG + '<span>Resign</span>';
    btn.addEventListener('click', showConfirm);
    document.body.appendChild(btn);
  }

  function hideButton() {
    const btn = document.getElementById('elyResignBtn');
    if (btn) btn.remove();
  }

  if (channel) {
    channel.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.matchId !== matchId || d.from === TAB_ID) return;
      if (d.type !== 'MATCH_RESIGN' && d.type !== 'MATCH_FINISHED') return;
      if (finished) return;
      finished = true; // Match is decided: leaving afterwards is not a forfeit
      hideButton();

      if (d.type === 'MATCH_RESIGN') {
        const outcome = recordOutcome('win');
        saveResult('win', 'opponent_resigned', outcome);
        showResultOverlay({
          win: true,
          title: 'YOU WIN!',
          text: `${safe(d.name || opponentName)} resigned or left the match. Victory is yours.`,
          outcome
        });
      } else {
        const outcome = recordOutcome('loss');
        saveResult('loss', 'opponent_finished', outcome);
        showResultOverlay({
          win: false,
          title: 'DEFEAT',
          text: `${safe(d.name || opponentName)} finished first.`,
          outcome
        });
      }
    });
  }

  // Any form of leaving the page forfeits the match
  window.addEventListener('pagehide', () => forfeit('left_page'));

  /**
   * Call when the match ends naturally.
   *   result:  'win' | 'loss' | 'draw'  (records XP + stats)
   *   options: { announce: true } also tells the opponent you finished first
   */
  function finish(result, options) {
    if (finished) return null;
    finished = true;
    hideButton();
    removeOverlay('elyResignConfirm');

    if (!['win', 'loss', 'draw'].includes(result)) return null;
    const outcome = recordOutcome(result);
    saveResult(result, 'completed', outcome);
    showXpToast(outcome, result);

    if (result === 'win' && options && options.announce && channel) {
      try {
        channel.postMessage({ type: 'MATCH_FINISHED', matchId, from: TAB_ID, name: getMyName() });
      } catch (err) {}
    }
    return outcome;
  }

  window.ElyMatchGuard = {
    resign,
    finish,
    markFinished: finish,
    isActive() { return !finished; }
  };

  if (document.body) mountButton();
  else document.addEventListener('DOMContentLoaded', mountButton);
})();
