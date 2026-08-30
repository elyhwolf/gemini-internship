#!/usr/bin/env python3
"""
SoundDrop Real YouTube Multipart Media Publisher Backend Server
Encodes audio/video and posts directly to YouTube Data API v3.
Supports CORS OPTIONS preflight requests.
"""

import http.server
import socketserver
import os
import json
import urllib.request
import urllib.parse
import base64
import uuid

PORT = 5176
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SoundDropHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/publish-youtube':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))

                title = payload.get('title', 'My New Release')
                artist = payload.get('artist', 'Independent Artist')
                description = payload.get('description', 'Distributed via SoundDrop Free Music Platform')
                access_token = payload.get('access_token', '').strip()
                video_base64 = payload.get('video_base64', '')

                # 1. If Access Token is provided, make REAL Multipart Upload to YouTube API
                if access_token:
                    print(f"Uploading '{artist} - {title}' to YouTube API...")
                    
                    video_bytes = b''
                    if video_base64:
                        if ',' in video_base64:
                            video_base64 = video_base64.split(',')[1]
                        video_bytes = base64.b64decode(video_base64)

                    boundary = f"----SoundDropBoundary{uuid.uuid4().hex}"
                    
                    metadata = {
                        'snippet': {
                            'title': f"{artist} - {title} (Official Release)",
                            'description': f"{description}\n\nArtist: {artist}\nTrack: {title}\nDistributed via SoundDrop",
                            'categoryId': '10' # Music Category
                        },
                        'status': {
                            'privacyStatus': 'public'
                        }
                    }

                    # Build Multipart Body
                    body_parts = []
                    body_parts.append(f"--{boundary}\r\n".encode('utf-8'))
                    body_parts.append(b"Content-Type: application/json; charset=UTF-8\r\n\r\n")
                    body_parts.append(json.dumps(metadata).encode('utf-8'))
                    body_parts.append(b"\r\n")

                    if video_bytes:
                        body_parts.append(f"--{boundary}\r\n".encode('utf-8'))
                        body_parts.append(b"Content-Type: video/webm\r\n\r\n")
                        body_parts.append(video_bytes)
                        body_parts.append(b"\r\n")

                    body_parts.append(f"--{boundary}--\r\n".encode('utf-8'))
                    full_body = b"".join(body_parts)

                    upload_url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status'
                    
                    req = urllib.request.Request(
                        upload_url,
                        data=full_body,
                        headers={
                            'Authorization': f'Bearer {access_token}',
                            'Content-Type': f'multipart/related; boundary={boundary}',
                            'Content-Length': str(len(full_body))
                        },
                        method='POST'
                    )

                    with urllib.request.urlopen(req) as response:
                        res_data = json.loads(response.read().decode('utf-8'))
                        video_id = res_data.get('id', '')
                        youtube_url = f'https://www.youtube.com/watch?v={video_id}'

                        print(f"SUCCESS! YouTube Video Created LIVE: {youtube_url}")
                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'success': True,
                            'live_published': True,
                            'youtube_url': youtube_url,
                            'video_id': video_id
                        }).encode('utf-8'))
                        return

                # 2. If NO Access Token is provided, return clear unauthenticated notice
                print("No OAuth token provided. Returning token requirement notice.")
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'live_published': False,
                    'error_type': 'TOKEN_REQUIRED',
                    'message': 'Google OAuth Access Token is required to post videos directly to your YouTube Channel.'
                }).encode('utf-8'))

            except urllib.error.HTTPError as e:
                err_text = e.read().decode('utf-8', errors='ignore')
                print("YouTube API HTTPError:", e.code, err_text)
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'live_published': False,
                    'error_type': 'YOUTUBE_API_ERROR',
                    'message': f"YouTube API Error ({e.code}): {err_text}"
                }).encode('utf-8'))
            except Exception as e:
                print("Server Error:", e)
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'live_published': False,
                    'error_type': 'SERVER_ERROR',
                    'message': str(e)
                }).encode('utf-8'))
        else:
            super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SoundDropHandler) as httpd:
        print(f"SoundDrop Publisher Server running at http://localhost:{PORT}")
        httpd.serve_forever()
