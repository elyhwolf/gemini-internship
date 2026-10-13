from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import time
import urllib.request
import zlib
import base64

# Fixed permanent cloud storage ID for player profiles & XP
PROFILES_ID = "ff808181a09d98f701a132470b1b4def"
IN_MEMORY_PROFILES = {}

# XP rules (must match profile-store.js)
XP_WIN = 30
XP_LOSS = -20
XP_DRAW = 5
XP_PER_LEVEL = 100

MAX_PROFILES = 500
MAX_HISTORY = 20
MAX_SEEN = 60
VALID_RESULTS = ('win', 'loss', 'draw')
VALID_GAMES = ('Shark Bait', 'Album Memory', 'Maze Runner 100', 'Math Gauntlet')


def _fetch_from_cloud(retry=True):
    global IN_MEMORY_PROFILES
    url = f"https://api.restful-api.dev/objects/{PROFILES_ID}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (ElyWolfArcade/1.0)'})
    try:
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, dict) and 'data' in data:
                d = data['data']
                if 'blob' in d:
                    try:
                        raw = zlib.decompress(base64.b64decode(d['blob'])).decode('utf-8')
                        profiles = json.loads(raw)
                        if isinstance(profiles, dict):
                            IN_MEMORY_PROFILES = profiles
                            return IN_MEMORY_PROFILES
                    except Exception:
                        pass
                profiles = d.get('profiles', {})
                if isinstance(profiles, dict) and profiles:
                    IN_MEMORY_PROFILES = profiles
                    return IN_MEMORY_PROFILES
    except Exception:
        if retry:
            time.sleep(0.3)
            return _fetch_from_cloud(retry=False)
    return IN_MEMORY_PROFILES


def _save_to_cloud(profiles, retry=True):
    global IN_MEMORY_PROFILES
    IN_MEMORY_PROFILES = profiles
    url = f"https://api.restful-api.dev/objects/{PROFILES_ID}"
    raw_json = json.dumps(profiles)
    compressed = base64.b64encode(zlib.compress(raw_json.encode('utf-8'))).decode('ascii')
    payload = {
        "name": "elywolf_profiles_v1",
        "data": {"blob": compressed}
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (ElyWolfArcade/1.0)'},
        method='PUT'
    )
    try:
        with urllib.request.urlopen(req, timeout=7):
            return True
    except Exception:
        if retry:
            time.sleep(0.3)
            return _save_to_cloud(profiles, retry=False)
    return False


def _key(name):
    return str(name or '').strip().lower()[:40]


def _clean_name(name):
    return str(name or '').strip()[:40]


def _safe_photo(url):
    if not isinstance(url, str):
        return None
    url = url.strip()
    if url.startswith(('http://', 'https://', 'data:image/')):
        if len(url) <= 100000:
            return url
    return None


def _new_profile(name):
    now = int(time.time() * 1000)
    return {
        'name': name,
        'photoURL': None,
        'xp': 0,
        'matches': 0,
        'wins': 0,
        'losses': 0,
        'draws': 0,
        'streak': 0,
        'bestStreak': 0,
        'games': {},
        'history': [],
        'seen': [],
        'createdAt': now,
        'updatedAt': now,
    }


def _apply_result(profile, game, match_id, result, opponent, ts):
    """Apply a match result once. Returns the actual XP delta or None if duplicate."""
    if match_id in profile['seen']:
        return None

    base = {'win': XP_WIN, 'loss': XP_LOSS, 'draw': XP_DRAW}[result]
    new_xp = max(0, profile['xp'] + base)  # XP can never go below zero
    delta = new_xp - profile['xp']
    profile['xp'] = new_xp

    profile['matches'] += 1
    stats = profile['games'].setdefault(game, {'wins': 0, 'losses': 0, 'draws': 0})
    if result == 'win':
        profile['wins'] += 1
        stats['wins'] += 1
        profile['streak'] += 1
        profile['bestStreak'] = max(profile['bestStreak'], profile['streak'])
    elif result == 'loss':
        profile['losses'] += 1
        stats['losses'] += 1
        profile['streak'] = 0
    else:
        profile['draws'] += 1
        stats['draws'] += 1
        profile['streak'] = 0

    profile['history'].insert(0, {
        'matchId': match_id,
        'game': game,
        'result': result,
        'opponent': opponent,
        'xpDelta': delta,
        'ts': ts,
    })
    profile['history'] = profile['history'][:MAX_HISTORY]
    profile['seen'] = ([match_id] + profile['seen'])[:MAX_SEEN]
    profile['updatedAt'] = ts
    return delta


def _public(profile):
    out = dict(profile)
    out.pop('seen', None)
    out['level'] = profile['xp'] // XP_PER_LEVEL + 1
    return out


def _summary(profile):
    return {
        'name': profile['name'],
        'photoURL': profile.get('photoURL'),
        'xp': profile['xp'],
        'level': profile['xp'] // XP_PER_LEVEL + 1,
        'matches': profile['matches'],
        'wins': profile['wins'],
        'losses': profile['losses'],
    }


def _is_guest(name):
    return str(name).lower().startswith('guest #')


class handler(BaseHTTPRequestHandler):
    def _send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        try:
            query = parse_qs(urlparse(self.path).query)
            profiles = _fetch_from_cloud()
            name = (query.get('name') or [''])[0]

            if name:
                profile = profiles.get(_key(name))
                if not profile:
                    self._send_json({'error': 'not_found'}, 404)
                    return
                self._send_json({'profile': _public(profile)})
                return

            # Leaderboard (guests are excluded; they are session-only names)
            ranked = [p for p in profiles.values() if not _is_guest(p.get('name', ''))]
            ranked.sort(key=lambda p: (p.get('xp', 0), p.get('wins', 0)), reverse=True)
            self._send_json({'leaderboard': [_summary(p) for p in ranked[:25]]})
        except Exception as e:
            self._send_json({'error': str(e)}, 500)

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))

            name = _clean_name(body.get('name'))
            if not name:
                self._send_json({'error': 'name required'}, 400)
                return

            action = body.get('action')
            match_id = str(body.get('matchId') or '')[:80]

            # Direct profile photo sync
            if action == 'sync_profile' or ('photoURL' in body and not match_id):
                photo = _safe_photo(body.get('photoURL'))
                profiles = dict(_fetch_from_cloud())
                key = _key(name)
                profile = profiles.get(key)
                if not profile:
                    profile = _new_profile(name)
                if photo:
                    profile['photoURL'] = photo
                    profile['updatedAt'] = int(time.time() * 1000)
                    profiles[key] = profile
                    _save_to_cloud(profiles)
                self._send_json({'success': True, 'profile': _public(profile)})
                return

            # Full profile sync / set_stats
            if action in ('set_stats', 'sync_full_profile'):
                stats = body.get('profile') or {}
                profiles = dict(_fetch_from_cloud())
                key = _key(name)
                p = profiles.get(key) or _new_profile(name)
                for f in ('xp', 'wins', 'losses', 'draws', 'matches', 'streak', 'bestStreak', 'games', 'history', 'photoURL'):
                    if f in stats:
                        p[f] = stats[f]
                p['updatedAt'] = int(time.time() * 1000)
                profiles[key] = p
                _save_to_cloud(profiles)
                self._send_json({'success': True, 'profile': _public(p)})
                return

            result = body.get('result')
            game = body.get('game')
            match_id = str(body.get('matchId') or '')[:80]
            if result not in VALID_RESULTS or game not in VALID_GAMES or not match_id:
                self._send_json({'error': 'invalid match result'}, 400)
                return

            opponent = _clean_name(body.get('opponent')) or 'Opponent'
            ts = int(time.time() * 1000)

            profiles = dict(_fetch_from_cloud())
            key = _key(name)
            profile = profiles.get(key)
            if not profile:
                if len(profiles) >= MAX_PROFILES:
                    self._send_json({'error': 'profile limit reached'}, 429)
                    return
                profile = _new_profile(name)

            photo = _safe_photo(body.get('photoURL'))
            if photo:
                profile['photoURL'] = photo

            delta = _apply_result(profile, game, match_id, result, opponent, ts)
            profiles[key] = profile

            # Universally record opposite outcome for opponent so both players always match
            if opponent and not _is_guest(opponent) and opponent.lower() != name.lower():
                opp_key = _key(opponent)
                opp_profile = profiles.get(opp_key) or _new_profile(opponent)
                opp_result = 'loss' if result == 'win' else ('win' if result == 'loss' else 'draw')
                _apply_result(opp_profile, game, match_id, opp_result, name, ts)
                profiles[opp_key] = opp_profile

            if delta is not None or photo:
                _save_to_cloud(profiles)

            self._send_json({
                'success': True,
                'duplicate': delta is None,
                'xpDelta': delta or 0,
                'profile': _public(profile),
            })
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
