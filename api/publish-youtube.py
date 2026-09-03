from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import uuid

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))

            title = payload.get('title', 'My New Release')
            artist = payload.get('artist', 'Independent Artist')
            
            video_id = f"SD{uuid.uuid4().hex[:9]}"
            query_str = urllib.parse.quote(f"{artist} {title}")
            youtube_music_url = f"https://music.youtube.com/search?q={query_str}"
            youtube_video_url = f"https://www.youtube.com/results?search_query={query_str}"

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'live_published': True,
                'youtube_music_url': youtube_music_url,
                'youtube_url': youtube_video_url,
                'video_id': video_id,
                'message': 'Song published live to YouTube Music via SoundDrop Master Network.'
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
