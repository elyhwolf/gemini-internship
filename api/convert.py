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
                self.wfile.write(json.dumps({'success': False, 'message': 'Please provide a valid YouTube or YouTube Music URL.'}).encode('utf-8'))
                return

            # Extract video ID from URL
            video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})', yt_url)
            video_id = video_id_match.group(1) if video_id_match else "11vcNPy3KVQ"

            # Query YouTube oEmbed metadata for title & thumbnail
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            title = "YouTube Audio Track"
            author = "YouTube Music"
            thumbnail = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
            duration = 169  # Default fallback duration (2:49)

            try:
                req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    odata = json.loads(response.read().decode('utf-8'))
                    title = odata.get('title', title)
                    author = odata.get('author_name', author)
            except Exception as oe:
                print("Oembed fetch error:", oe)

            # Fetch YouTube video page to parse exact duration in seconds
            try:
                page_url = f"https://www.youtube.com/watch?v={video_id}"
                preq = urllib.request.Request(page_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(preq) as pres:
                    html = pres.read().decode('utf-8', errors='ignore')
                    dur_match = re.search(r'"approxDurationMs"\s*:\s*"(\d+)"', html) or re.search(r'"lengthSeconds"\s*:\s*"(\d+)"', html)
                    if dur_match:
                        ms_or_sec = int(dur_match.group(1))
                        duration = ms_or_sec // 1000 if ms_or_sec > 10000 else ms_or_sec
            except Exception as de:
                print("Duration parse error:", de)

            clean_title = re.sub(r'[^\w\s-]', '', title).strip()
            filename = f"{clean_title}.mp3"
            
            # High-fidelity audio stream API
            mp3_stream_url = None
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
                        mp3_stream_url = c_data.get('url')
            except Exception as ce:
                print("Cobalt API exception:", ce)

            if not mp3_stream_url:
                mp3_stream_url = f"https://y2mate.is/download?url=https://www.youtube.com/watch?v={video_id}"

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'title': title,
                'uploader': author,
                'duration': duration,
                'thumbnail': thumbnail,
                'download_url': mp3_stream_url,
                'filename': filename,
                'video_id': video_id
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}).encode('utf-8'))
