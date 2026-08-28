#!/usr/bin/env python3
"""Local preview server that mirrors GitHub Pages URL handling.

The site links to pages without the ``.html`` extension (for example
``href="projects"``) and relies on GitHub Pages' "clean URL" behaviour to
resolve them to the matching ``.html`` file. Python's stock
``http.server`` serves paths literally, so those links 404 during local
preview. This server adds the same fallbacks GitHub Pages provides:

    /projects      -> projects.html
    /some/dir      -> some/dir/index.html
    missing path   -> 404.html (if present), else a plain 404

Usage:
    python3 serve.py [port]      # defaults to 8000
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local_path = super().translate_path(path)

        if os.path.isdir(local_path):
            return local_path
        if os.path.exists(local_path):
            return local_path

        # Mirror GitHub Pages: "/projects" -> "projects.html".
        html_candidate = local_path + ".html"
        if os.path.exists(html_candidate):
            return html_candidate

        return local_path

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            not_found = os.path.join(os.getcwd(), "404.html")
            if os.path.exists(not_found):
                self.error_message_format = ""
                try:
                    with open(not_found, "rb") as handle:
                        body = handle.read()
                    self.send_response(404)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    if self.command != "HEAD":
                        self.wfile.write(body)
                    return
                except OSError:
                    pass
        super().send_error(code, message, explain)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(("0.0.0.0", port), CleanURLHandler)
    print(f"Serving {os.getcwd()} at http://localhost:{port} (clean URLs enabled)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
