#!/usr/bin/env python3
"""
DripSwitch Studio — Real YouTube to MP3 Converter Backend Server
Supports HTTP 206 Partial Content Byte-Range requests for 100% smooth audio seeking/scrubbing.
"""

import http.server
import socketserver
import os
import json
import urllib.request
import urllib.parse
import sys
import re

user_python_path = "/Users/elywolf/Library/Python/3.9/lib/python/site-packages"
if user_python_path not in sys.path:
    sys.path.append(user_python_path)

import yt_dlp
import imageio_ffmpeg

PORT = 5177
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(DIRECTORY, 'downloads')
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()

class ReuseTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class DripSwitchHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.end_headers()

    def do_GET(self):
        # Strip optional /yt2mp3 prefix for seamless URL routing
        if self.path.startswith('/yt2mp3'):
            self.path = self.path[7:]
            if not self.path:
                self.path = '/'

        # HTTP 206 Byte Range Seeking Handler for MP3 audio files
        if self.path.startswith('/downloads/'):
            filename = os.path.basename(urllib.parse.unquote(self.path))
            file_path = os.path.join(DOWNLOADS_DIR, filename)

            if not os.path.exists(file_path):
                self.send_response(404)
                self.end_headers()
                return

            file_size = os.path.getsize(file_path)
            range_header = self.headers.get('Range', '')

            if range_header:
                # Parse Range: bytes=start-end
                range_match = re.match(r'bytes=(\d+)-(\d+)?', range_header)
                if range_match:
                    start = int(range_match.group(1))
                    end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
                    if end >= file_size:
                        end = file_size - 1

                    length = end - start + 1

                    self.send_response(206)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-Type', 'audio/mpeg')
                    self.send_header('Accept-Ranges', 'bytes')
                    self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                    self.send_header('Content-Length', str(length))
                    self.send_header('Content-Disposition', f'inline; filename="{filename}"')
                    self.end_headers()

                    with open(file_path, 'rb') as f:
                        f.seek(start)
                        self.wfile.write(f.read(length))
                    return

            # Default full HTTP 200 response
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.send_header('Content-Length', str(file_size))
            self.end_headers()

            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
            return
        
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/convert' or self.path == '/yt2mp3/api/convert':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))
                
                yt_url = payload.get('url', '').strip()
                yt_url = yt_url.replace('music.youtube.com', 'www.youtube.com')

                if not yt_url:
                    self.send_error_res("Please provide a valid YouTube URL.")
                    return

                print(f"Extracting audio for exact URL: {yt_url}")

                ydl_opts = {
                    'ffmpeg_location': FFMPEG_PATH,
                    'format': 'bestaudio/best',
                    'outtmpl': os.path.join(DOWNLOADS_DIR, '%(id)s.%(ext)s'),
                    'extractor_args': {'youtube': {'player_client': ['android', 'mweb']}},
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '320',
                    }],
                    'quiet': True,
                    'no_warnings': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(yt_url, download=True)
                    video_id = info.get('id', 'audio')
                    raw_title = info.get('title', 'YouTube Audio Track')
                    uploader = info.get('uploader', 'YouTube Creator')
                    thumbnail = info.get('thumbnail', '')
                    duration = info.get('duration', 0)

                    clean_title = re.sub(r'[^\w\s-]', '', raw_title).strip()
                    mp3_filename = f"{clean_title}.mp3"
                    raw_mp3_path = os.path.join(DOWNLOADS_DIR, f"{video_id}.mp3")
                    target_mp3_path = os.path.join(DOWNLOADS_DIR, mp3_filename)

                    if os.path.exists(raw_mp3_path):
                        os.rename(raw_mp3_path, target_mp3_path)

                    download_link = f"http://localhost:{PORT}/downloads/{urllib.parse.quote(mp3_filename)}"

                    print(f"SUCCESS! Seeking-Enabled MP3 Created: '{raw_title}' -> {download_link}")
                    self.send_json({
                        'success': True,
                        'title': raw_title,
                        'uploader': uploader,
                        'duration': duration,
                        'thumbnail': thumbnail,
                        'download_url': download_link,
                        'filename': mp3_filename
                    })

            except Exception as e:
                print("Extraction error:", e)
                self.send_json({
                    'success': False,
                    'message': f"Extraction error: {str(e)}"
                })
        else:
            super().do_GET()

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_res(self, msg):
        self.send_response(400)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'success': False, 'message': msg}).encode('utf-8'))

if __name__ == '__main__':
    with ReuseTCPServer(("", PORT), DripSwitchHandler) as httpd:
        print(f"DripSwitch Studio HTTP 206 Seeking Server running at http://localhost:{PORT}")
        httpd.serve_forever()
