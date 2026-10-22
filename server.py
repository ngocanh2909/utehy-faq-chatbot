# -*- coding: utf-8 -*-
"""
server.py - Máy chủ cục bộ cho Chatbot FAQ UTEHY.

- Phục vụ file tĩnh (index.html, assets/...)
- /api/proxy?url=...   : proxy đọc trang qldaotao.utehy.edu.vn (vượt CORS cho trình duyệt)
                          CHỈ cho phép domain qldaotao.utehy.edu.vn để tránh lạm dụng.
- /api/health          : kiểm tra máy chủ

Chạy:  python server.py   rồi mở http://localhost:8000
"""
import http.server
import json
import os
import socketserver
import sys
import urllib.parse
import urllib.request

PORT = int(os.environ.get("PORT", "8000"))
ROOT = os.path.dirname(os.path.abspath(__file__))
ALLOWED_HOST = "qldaotao.utehy.edu.vn"
UA = "Mozilla/5.0 (UTEHY-FAQ-Chatbot; educational project)"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            return self._json(200, {"ok": True})
        if parsed.path == "/api/proxy":
            qs = urllib.parse.parse_qs(parsed.query)
            url = (qs.get("url") or [""])[0]
            target = urllib.parse.urlparse(url)
            if target.scheme not in ("http", "https") or target.hostname != ALLOWED_HOST:
                return self._json(403, {"error": "Chỉ cho phép truy vấn " + ALLOWED_HOST})
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=25) as r:
                    data = r.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self._json(502, {"error": str(e)})
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stdout.write("[server] " + (fmt % args) + "\n")


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    with ThreadingServer(("", PORT), Handler) as httpd:
        print(f"Chatbot FAQ UTEHY đang chạy tại http://localhost:{PORT}")
        httpd.serve_forever()
