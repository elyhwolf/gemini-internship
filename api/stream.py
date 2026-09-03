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

            stream_url = None

            # 1. Cobalt high-speed direct audio stream API
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
                print("Cobalt API exception in stream.py:", ce)

            # 2. Piped API audio stream fallback
            if not stream_url:
                try:
                    piped_url = f"https://pipedapi.kavin.rocks/streams/{video_id}"
                    preq = urllib.request.Request(piped_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(preq) as pres:
                        pdata = json.loads(pres.read().decode('utf-8'))
                        audio_streams = pdata.get('audioStreams', [])
                        if audio_streams:
                            stream_url = audio_streams[0].get('url')
                except Exception as pe:
                    print("Piped API exception in stream.py:", pe)

            if stream_url:
                self.send_response(307)
                self.send_header('Location', stream_url)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            else:
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b"Could not retrieve audio stream.")

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))
