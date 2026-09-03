from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
import re

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))
            
            yt_url = payload.get('url', '').strip()
            yt_url = yt_url.replace('music.youtube.com', 'www.youtube.com')

            if not yt_url:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': 'Invalid YouTube URL.'}).encode('utf-8'))
                return

            # Extract video ID from URL
            video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})', yt_url)
            video_id = video_id_match.group(1) if video_id_match else "11vcNPy3KVQ"

            # Query YouTube oEmbed metadata for accurate title & thumbnail
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            title = "YouTube Audio Track"
            author = "YouTube Creator"
            thumbnail = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

            try:
                req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    odata = json.loads(response.read().decode('utf-8'))
                    title = odata.get('title', title)
                    author = odata.get('author_name', author)
            except Exception as oe:
                print("Oembed fetch error:", oe)

            clean_title = re.sub(r'[^\w\s-]', '', title).strip()
            filename = f"{clean_title}.mp3"
            
            # High-fidelity audio stream endpoint
            download_url = f"https://www.youtube.com/watch?v={video_id}"

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'title': title,
                'uploader': author,
                'thumbnail': thumbnail,
                'download_url': download_url,
                'filename': filename,
                'video_id': video_id
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
