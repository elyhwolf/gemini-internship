from http.server import BaseHTTPRequestHandler
import json
import time
import urllib.request

# Fixed permanent cloud presence & challenge storage ID
ACTIVE_PRESENCE_ID = "ff808181a09d98f701a1284d689438fb"
IN_MEMORY_PRESENCE = {}
IN_MEMORY_CHALLENGES = {}

def _fetch_from_cloud(retry=True):
    global IN_MEMORY_PRESENCE, IN_MEMORY_CHALLENGES
    url = f"https://api.restful-api.dev/objects/{ACTIVE_PRESENCE_ID}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (ElyWolfArcade/1.0)'})
    try:
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, dict) and 'data' in data:
                res_map = data['data'].get('presence', {})
                if isinstance(res_map, dict) and res_map:
                    IN_MEMORY_PRESENCE = res_map
                chals = data['data'].get('challenges', {})
                if isinstance(chals, dict):
                    IN_MEMORY_CHALLENGES.update(chals)
                return IN_MEMORY_PRESENCE, IN_MEMORY_CHALLENGES
    except Exception:
        if retry:
            time.sleep(0.3)
            return _fetch_from_cloud(retry=False)
    return IN_MEMORY_PRESENCE, IN_MEMORY_CHALLENGES

def _save_to_cloud(presence_map, challenges_map, retry=True):
    global IN_MEMORY_PRESENCE, IN_MEMORY_CHALLENGES
    IN_MEMORY_PRESENCE = presence_map
    IN_MEMORY_CHALLENGES = challenges_map
    url = f"https://api.restful-api.dev/objects/{ACTIVE_PRESENCE_ID}"
    payload = {
        "name": "elywolf_presence_v3",
        "data": { 
            "presence": presence_map,
            "challenges": challenges_map
        }
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
            return _save_to_cloud(presence_map, challenges_map, retry=False)
    return False

def _clean_expired(presence_map, challenges_map):
    now = time.time() * 1000
    clean_players = {}
    for tab_id, player in list(presence_map.items()):
        if now - player.get('lastSeen', 0) <= 35000:
            clean_players[tab_id] = player

    clean_challenges = {}
    for cid, chal in list(challenges_map.items()):
        # Expire challenges after 45 seconds
        if now - chal.get('timestamp', 0) <= 45000:
            clean_challenges[cid] = chal

    return clean_players, clean_challenges

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
        presence_map, challenges_map = _fetch_from_cloud()
        clean_players, clean_challenges = _clean_expired(presence_map, challenges_map)

        # Collect live maze runners
        maze_players = []
        for p in clean_players.values():
            if 'mazePos' in p and p['mazePos']:
                maze_players.append({
                    'username': p.get('displayName'),
                    'photoURL': p.get('photoURL'),
                    'level': p['mazePos'].get('level'),
                    'x': p['mazePos'].get('x'),
                    'y': p['mazePos'].get('y'),
                    'vx': p['mazePos'].get('vx', 0),
                    'vy': p['mazePos'].get('vy', 0),
                    'facing': p['mazePos'].get('facing', 1),
                    'lastSeen': p.get('lastSeen')
                })

        self._send_json({
            'players': list(clean_players.values()),
            'count': len(clean_players),
            'challenges': list(clean_challenges.values()),
            'mazePlayers': maze_players
        })

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            payload = json.loads(body_bytes.decode('utf-8'))

            tab_id = payload.get('tabId')
            display_name = payload.get('displayName', 'Player')
            avatar = payload.get('avatar', 'P')
            status = payload.get('status', 'In Arcade Hub')
            is_guest = payload.get('isGuest', True)
            maze_pos = payload.get('mazePos')
            challenge_action = payload.get('challengeAction')

            if not tab_id:
                self._send_json({'error': 'Missing tabId'}, 400)
                return

            now = time.time() * 1000
            presence_map, challenges_map = _fetch_from_cloud()
            clean_players, clean_challenges = _clean_expired(presence_map, challenges_map)

            # Update this player's presence
            clean_players[tab_id] = {
                'tabId': tab_id,
                'uid': payload.get('uid', tab_id),
                'displayName': display_name,
                'avatar': avatar,
                'photoURL': payload.get('photoURL'),
                'status': status,
                'lastSeen': now,
                'isGuest': is_guest,
                'mazePos': maze_pos
            }

            # Handle challenge invite or response
            if challenge_action and isinstance(challenge_action, dict):
                act_type = challenge_action.get('type')
                chal_data = challenge_action.get('challenge') or {}
                cid = chal_data.get('id')
                if cid:
                    if act_type == 'INVITE':
                        clean_challenges[cid] = {
                            'id': cid,
                            'from': chal_data.get('from', display_name),
                            'fromPhoto': chal_data.get('fromPhoto'),
                            'to': chal_data.get('to'),
                            'game': chal_data.get('game', 'Shark Bait'),
                            'status': 'pending',
                            'timestamp': now
                        }
                    elif act_type == 'RESPONSE':
                        resp = chal_data.get('response') # 'accepted' or 'declined'
                        match_id = chal_data.get('matchId')
                        if cid in clean_challenges:
                            clean_challenges[cid]['status'] = resp
                            if match_id:
                                clean_challenges[cid]['matchId'] = match_id
                        else:
                            clean_challenges[cid] = {
                                'id': cid,
                                'from': chal_data.get('from'),
                                'to': chal_data.get('to'),
                                'game': chal_data.get('game', 'Shark Bait'),
                                'status': resp,
                                'matchId': match_id,
                                'timestamp': now
                            }

            _save_to_cloud(clean_players, clean_challenges)

            # Collect live maze runners
            maze_players = []
            for p in clean_players.values():
                if 'mazePos' in p and p['mazePos']:
                    maze_players.append({
                        'username': p.get('displayName'),
                        'photoURL': p.get('photoURL'),
                        'level': p['mazePos'].get('level'),
                        'x': p['mazePos'].get('x'),
                        'y': p['mazePos'].get('y'),
                        'vx': p['mazePos'].get('vx', 0),
                        'vy': p['mazePos'].get('vy', 0),
                        'facing': p['mazePos'].get('facing', 1),
                        'lastSeen': p.get('lastSeen')
                    })

            self._send_json({
                'success': True,
                'players': list(clean_players.values()),
                'count': len(clean_players),
                'challenges': list(clean_challenges.values()),
                'mazePlayers': maze_players
            })
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
