import argparse
import contextlib
import functools
import http.server
import importlib.util
import io
import json
import shutil
import struct
import tempfile
import threading
import unittest
import zlib
from pathlib import Path

from bs4 import BeautifulSoup

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/archive_web.py'
spec = importlib.util.spec_from_file_location('archive_web', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ArchiveTests(unittest.TestCase):
    def test_tex_is_not_escaped_by_markdown(self):
        article = BeautifulSoup(r'<article><h1>Example</h1><p>Use $c_s=\rho_s$.</p><p>$$x^*=\arg\max_x f(x)$$</p></article>', 'html.parser')
        text = module.to_markdown(article)
        self.assertIn(r'$c_s=\rho_s$', text)
        self.assertIn(r'$$x^*=\arg\max_x f(x)$$', text)

    def test_resource_schemes_are_restricted(self):
        with tempfile.TemporaryDirectory(dir='/tmp/opencode') as temp:
            with self.assertRaises(ValueError):
                module.Resources(Path(temp)).fetch('file:///etc/passwd')

    def test_static_archive_offline_integration(self):
        chromium = shutil.which('chromium')
        if not chromium:
            self.skipTest('System Chromium required for PDF integration')
        with tempfile.TemporaryDirectory(dir='/tmp/opencode', prefix='test-archive-') as temp:
            root = Path(temp)
            web = root / 'web'
            web.mkdir()
            def chunk(kind, data):
                return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)
            png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', 2, 2, 8, 2, 0, 0, 0))
            png += chunk(b'IDAT', zlib.compress((b'\0' + b'\xff\0\0'*2)*2)) + chunk(b'IEND', b'')
            (web / 'figure.png').write_bytes(png)
            (web / 'style.css').write_text('@import "extra.css"; article {font-family: Arial} figure {width:200px}')
            (web / 'extra.css').write_text('h1 {color: #123456}')
            (web / 'index.html').write_text('''<!doctype html><html><head><meta charset="utf-8">
<meta name="author" content="Fixture Author"><meta property="article:published_time" content="2026-07-04">
<link rel="stylesheet" href="style.css"><title>Fixture Article</title></head><body>
<nav>Do not archive this menu</nav><article><h1>Fixture Article</h1><p>Complete original introduction.</p>
<h2>Method</h2><figure><img data-src="figure.png" src="placeholder-missing.png"><figcaption>Original caption.</figcaption></figure>
<table><tr><th>Name</th><th>Value</th></tr><tr><td>One</td><td>1</td></tr></table>
<p><a href="relative-link">Reference link</a></p><h2>References</h2><p>Last original reference.</p>
<script>throw new Error('Must not execute');</script></article></body></html>''')
            class QuietHandler(http.server.SimpleHTTPRequestHandler):
                def log_message(self, *args):
                    pass
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(web)))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            args = argparse.Namespace(url=f'http://127.0.0.1:{server.server_port}/index.html', output=str(root / 'output'),
                                      selector=None, title=None, author=None, date=None, chromium=chromium)
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    module.archive(args)
                out = root / 'output'
                state = json.loads((out / 'verification.json').read_text())
                self.assertEqual(state['imageCount'], 1)
                self.assertEqual(state['offlineRemoteRequests'], [])
                self.assertEqual(state['missingHeadingsInPDF'], [])
                self.assertEqual(state['javascriptErrors'], [])
                md = (out / 'article.md').read_text()
                self.assertIn('Last original reference.', md)
                self.assertIn('Original caption.', md)
                self.assertIn('| Name | Value |', md)
                self.assertNotIn('Do not archive this menu', md)
                frozen = BeautifulSoup((out / 'index.html').read_text(), 'html.parser')
                self.assertFalse(frozen.select('script'))
                metadata = json.loads((out / 'metadata.csl.json').read_text())[0]
                self.assertEqual(metadata['title'], 'Fixture Article')
                self.assertEqual(metadata['issued']['date-parts'], [[2026, 7, 4]])
                self.assertEqual(metadata['author'][0]['literal'], 'Fixture Author')
                with self.assertRaises(FileExistsError):
                    module.archive(args)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()


if __name__ == '__main__':
    unittest.main()
