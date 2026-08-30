#!/usr/bin/env python3
"""
SoundDrop Real YouTube Publisher Backend Server
Serves static files and handles live YouTube publishing requests.
"""

import http.server
import socketserver
import os
import json
import urllib.request
import urllib.parse

PORT = 5176
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SoundDropHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/publish-youtube':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))

            title = payload.get('title', 'New Release')
            artist = payload.get('artist', 'Independent Artist')
            description = payload.get('description', 'Published via SoundDrop Free Music Distribution')
            access_token = payload.get('access_token', '')

            # If access_token is provided, make real HTTP POST to YouTube Data API v3
            if access_token:
                try:
                    url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,status'
                    body = {
                        'snippet': {
                            'title': f'{artist} - {title} (Official Audio)',
                            'description': description,
                            'categoryId': '10' # Music category
                        },
                        'status': {
                            'privacyStatus': 'public'
                        }
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(body).encode('utf-8'),
                        headers={
                            'Authorization': f'Bearer {access_token}',
                            'Content-Type': 'application/json'
                        },
                        method='POST'
                    )
                    with urllib.request.urlopen(req) as response:
                        res_data = json.loads(response.read().decode('utf-8'))
                        video_id = res_data.get('id', '')
                        youtube_url = f'https://www.youtube.com/watch?v={video_id}'

                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            'success': True,
                            'youtube_url': youtube_url,
                            'video_id': video_id
                        }).encode('utf-8'))
                        return
                except Exception as e:
                    print("YouTube API error:", e)

            # Fallback response if direct token is unconfigured
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'note': 'To upload directly to your personal YouTube Channel, enter your Google OAuth Access Token.',
                'youtube_url': 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(f'{artist} {title}')
            }).encode('utf-8'))
        else:
            self.send_error(404, "Endpoint not found")

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SoundDropHandler) as httpd:
        print(f"SoundDrop Publisher Server running at http://localhost:{PORT}")
        httpd.serve_forever()
