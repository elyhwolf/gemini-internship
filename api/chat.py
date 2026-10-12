from http.server import BaseHTTPRequestHandler
import json
import time
import urllib.request

# Fixed permanent cloud storage ID for chat
ACTIVE_CHAT_ID = "ff808181a09d98f701a1284d66e238fa"
IN_MEMORY_MESSAGES = [
    { 'id': 'm1', 'sender': 'System 🤖', 'text': 'Welcome to ElyWolf Arcade Global Lobby Chat!', 'time': 'System', 'isSystem': True, 'timestamp': 0 }
]

def _fetch_from_cloud(retry=True):
    global IN_MEMORY_MESSAGES
    url = f"https://api.restful-api.dev/objects/{ACTIVE_CHAT_ID}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (ElyWolfArcade/1.0)'})
    try:
        with urllib.request.urlopen(req, timeout=7) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, dict) and 'data' in data:
                msgs = data['data'].get('messages', [])
                if isinstance(msgs, list) and msgs:
                    # Merge with in-memory messages
                    existing_ids = {m.get('id') for m in msgs if isinstance(m, dict) and 'id' in m}
                    for mem in IN_MEMORY_MESSAGES:
                        if mem.get('id') and mem.get('id') not in existing_ids:
                            msgs.append(mem)
                    msgs.sort(key=lambda x: x.get('timestamp', 0) if isinstance(x.get('timestamp'), (int, float)) else 0)
                    IN_MEMORY_MESSAGES = msgs[-150:]
                    return IN_MEMORY_MESSAGES
    except Exception as e:
        if retry:
            time.sleep(0.3)
            return _fetch_from_cloud(retry=False)
    return IN_MEMORY_MESSAGES

def _save_to_cloud(messages, retry=True):
    global IN_MEMORY_MESSAGES
    messages.sort(key=lambda x: x.get('timestamp', 0) if isinstance(x.get('timestamp'), (int, float)) else 0)
    IN_MEMORY_MESSAGES = messages[-150:]
    url = f"https://api.restful-api.dev/objects/{ACTIVE_CHAT_ID}"
    payload = {
        "name": "elywolf_chat_v3",
        "data": { "messages": IN_MEMORY_MESSAGES }
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
    except Exception as e:
        if retry:
            time.sleep(0.3)
            return _save_to_cloud(messages, retry=False)
    return False

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
        messages = _fetch_from_cloud()
        self._send_json({'messages': messages})

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            payload = json.loads(body_bytes.decode('utf-8'))

            sender = payload.get('sender', 'Guest')
            text = payload.get('text', '').strip()
            is_system = payload.get('isSystem', False)
            client_time = payload.get('time')
            timestamp = payload.get('timestamp', int(time.time() * 1000))

            if not text:
                self._send_json({'error': 'Empty message'}, 400)
                return

            msg_id = payload.get('id')
            if not msg_id:
                msg_id = 'msg_' + str(timestamp) + '_' + str(int(time.time()))

            messages = list(_fetch_from_cloud())
            now_str = client_time if client_time else time.strftime("%I:%M %p")

            # Avoid adding duplicate message on server
            already_exists = False
            for m in messages:
                if m.get('id') == msg_id:
                    already_exists = True
                    break
                if m.get('sender') == sender and m.get('text') == text and abs(m.get('timestamp', 0) - timestamp) < 4000:
                    already_exists = True
                    break

            if not already_exists:
                new_msg = {
                    'id': msg_id,
                    'sender': sender,
                    'text': text,
                    'time': now_str,
                    'timestamp': timestamp,
                    'isSystem': is_system,
                    'photoURL': payload.get('photoURL')
                }
                messages.append(new_msg)
                _save_to_cloud(messages)

            self._send_json({'success': True, 'messages': messages})
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
