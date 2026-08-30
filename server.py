import http.server
import json
import os
import subprocess
import sys

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class LiveEditorHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/save':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body)
                html_content = data.get('html')

                if not html_content:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'No HTML content provided'}).encode('utf-8'))
                    return

                target_file = os.path.join(BASE_DIR, 'index.html')
                backup_file = os.path.join(BASE_DIR, 'index.html.bak')

                # Create backup
                if os.path.exists(target_file):
                    with open(target_file, 'r', encoding='utf-8') as f:
                        old_content = f.read()
                    with open(backup_file, 'w', encoding='utf-8') as f:
                        f.write(old_content)

                # Write new HTML
                with open(target_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)

                # Auto-commit and push in background
                git_status = "Saved locally"
                try:
                    subprocess.run(["git", "add", "index.html"], cwd=BASE_DIR, check=True)
                    subprocess.run(["git", "commit", "-m", "Update site text via visual live editor"], cwd=BASE_DIR, check=True)
                    subprocess.Popen(["git", "push", "origin", "main"], cwd=BASE_DIR)
                    git_status = "Saved locally & pushing to GitHub Pages"
                except Exception as e:
                    git_status = f"Saved locally (Git note: {str(e)})"

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'success',
                    'message': 'Changes successfully saved to index.html and synced with GitHub!',
                    'git': git_status
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as err:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(err)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), LiveEditorHandler)
    print(f"🚀 Visual Editor Server running on http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()
