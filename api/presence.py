from http.server import BaseHTTPRequestHandler
import json
import time
import urllib.request

# Primary and fallback cloud presence storage IDs
ACTIVE_PRESENCE_ID = "ff808181a09d98f701a1284d689438fb"
IN_MEMORY_PRESENCE = {}

def _create_new_cloud_presence():
    global ACTIVE_PRESENCE_ID
    try:
        url = "https://api.restful-api.dev/objects"
        payload = json.dumps({"name": "elywolf_presence_v3", "data": {"presence": IN_MEMORY_PRESENCE}}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}, method='POST')
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, dict) and 'id' in data:
                ACTIVE_PRESENCE_ID = data['id']
                return ACTIVE_PRESENCE_ID
    except Exception:
        pass
    return ACTIVE_PRESENCE_ID

class handler(BaseHTTPRequestHandler):
    def _send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _get_cloud_presence(self):
        global IN_MEMORY_PRESENCE
        try:
            url = f"https://api.restful-api.dev/objects/{ACTIVE_PRESENCE_ID}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if isinstance(data, dict) and 'data' in data:
                    res_map = data['data'].get('presence', {})
                    if res_map:
                        IN_MEMORY_PRESENCE = res_map
                    return IN_MEMORY_PRESENCE
        except Exception:
            _create_new_cloud_presence()

        return IN_MEMORY_PRESENCE

    def _save_cloud_presence(self, presence_map):
        global IN_MEMORY_PRESENCE
        IN_MEMORY_PRESENCE = presence_map
        try:
            url = f"https://api.restful-api.dev/objects/{ACTIVE_PRESENCE_ID}"
            payload = {
                "name": "elywolf_presence_v3",
                "data": { "presence": presence_map }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
                method='PUT'
            )
            with urllib.request.urlopen(req, timeout=6):
                pass
        except Exception:
            _create_new_cloud_presence()

    def do_GET(self):
        now = time.time() * 1000
        presence_map = self._get_cloud_presence()
        
        # Filter active sessions (seen within 35 seconds)
        active_users = []
        clean_map = {}
        for tab_id, player in presence_map.items():
            if now - player.get('lastSeen', 0) <= 35000:
                clean_map[tab_id] = player
                active_users.append(player)

        if len(clean_map) != len(presence_map):
            self._save_cloud_presence(clean_map)

        self._send_json({'players': active_users, 'count': len(active_users)})

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

            if not tab_id:
                self._send_json({'error': 'Missing tabId'}, 400)
                return

            now = time.time() * 1000
            presence_map = self._get_cloud_presence()
            uid = payload.get('uid', tab_id)

            # Clean dead entries older than 35 seconds
            clean_map = {}
            for k, v in presence_map.items():
                if (now - v.get('lastSeen', 0)) <= 35000:
                    clean_map[k] = v

            clean_map[tab_id] = {
                'tabId': tab_id,
                'uid': uid,
                'displayName': display_name,
                'avatar': avatar,
                'photoURL': payload.get('photoURL'),
                'status': status,
                'lastSeen': now,
                'isGuest': is_guest
            }

            self._save_cloud_presence(clean_map)
            active_users = list(clean_map.values())

            self._send_json({'success': True, 'players': active_users, 'count': len(active_users)})
        except Exception as e:
            self._send_json({'error': str(e)}, 500)

