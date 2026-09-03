from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            video_id = query.get('id', [''])[0]

            if not video_id:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing video id")
                return

            # Query Cobalt high-speed direct stream API
            stream_url = None
            try:
                cobalt_req = urllib.request.Request(
                    "https://api.cobalt.tools/api/json",
                    data=json.dumps({
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "isAudioOnly": True,
                        "aFormat": "mp3",
                        "audioBitrate": "320"
                    }).encode('utf-8'),
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    }
                )
                with urllib.request.urlopen(cobalt_req) as c_res:
                    c_data = json.loads(c_res.read().decode('utf-8'))
                    if c_data.get('url'):
                        stream_url = c_data.get('url')
            except Exception as ce:
                print("Stream fetch error:", ce)

            if stream_url:
                self.send_response(302)
                self.send_header('Location', stream_url)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            else:
                self.send_response(302)
                self.send_header('Location', f"https://y2mate.is/download?url=https://www.youtube.com/watch?v={video_id}")
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))
