from http.server import BaseHTTPRequestHandler
import json
import time
import urllib.request

# Primary and fallback cloud storage IDs
ACTIVE_CHAT_ID = "ff808181a09d98f701a1284d66e238fa"
IN_MEMORY_MESSAGES = [
    { 'id': 'm1', 'sender': 'System 🤖', 'text': 'Welcome to ElyWolf Arcade Global Lobby Chat!', 'time': 'System', 'isSystem': True }
]

def _create_new_cloud_chat():
    global ACTIVE_CHAT_ID
    try:
        url = "https://api.restful-api.dev/objects"
        payload = json.dumps({"name": "elywolf_chat_v3", "data": {"messages": IN_MEMORY_MESSAGES}}).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}, method='POST')
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, dict) and 'id' in data:
                ACTIVE_CHAT_ID = data['id']
                return ACTIVE_CHAT_ID
    except Exception:
        pass
    return ACTIVE_CHAT_ID

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

    def _get_cloud_messages(self):
        global IN_MEMORY_MESSAGES
        try:
            url = f"https://api.restful-api.dev/objects/{ACTIVE_CHAT_ID}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if isinstance(data, dict) and 'data' in data:
                    msgs = data['data'].get('messages', [])
                    if msgs:
                        IN_MEMORY_MESSAGES = msgs
                    return IN_MEMORY_MESSAGES
        except Exception:
            # If 403 or failure, try self-healing creation once
            _create_new_cloud_chat()

        return IN_MEMORY_MESSAGES

    def _save_cloud_messages(self, messages):
        global IN_MEMORY_MESSAGES
        IN_MEMORY_MESSAGES = messages[-60:]
        try:
            url = f"https://api.restful-api.dev/objects/{ACTIVE_CHAT_ID}"
            payload = {
                "name": "elywolf_chat_v3",
                "data": { "messages": IN_MEMORY_MESSAGES }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
                method='PUT'
            )
            with urllib.request.urlopen(req, timeout=3):
                pass
        except Exception:
            _create_new_cloud_chat()

    def do_GET(self):
        messages = self._get_cloud_messages()
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
                msg_id = 'msg_' + str(timestamp)

            messages = list(self._get_cloud_messages())
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
                    'isSystem': is_system
                }
                messages.append(new_msg)
                self._save_cloud_messages(messages)

            self._send_json({'success': True, 'messages': messages})
        except Exception as e:
            self._send_json({'error': str(e)}, 500)

