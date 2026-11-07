#!/usr/bin/env python3
"""Archive a static article as Markdown, offline HTML and paginated PDF."""
import argparse
import base64
import hashlib
import html
import json
import mimetypes
import re
import shutil
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote_to_bytes, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify
from playwright.sync_api import sync_playwright
from pypdf import PdfReader

MATHJAX = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js'
PRINT_CSS = '''
body { background: white; color: #222; }
main.archive-main { margin: 24px auto; max-width: 900px; padding: 0 24px; }
img, svg { max-width: 100%; }
.archive-source { font-size: 12px; overflow-wrap: anywhere; }
@page { size: A4; margin: 16mm 15mm 18mm; }
@media print {
  :root { --main-width: 100%; --gap: 0px; --content-gap: 16px; }
  body { font-size: 10pt; background: white !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  main.archive-main, .main { margin: 0; padding: 0; max-width: none; }
  article, .post-content { font-size: 10pt; line-height: 1.5; }
  h1 { font-size: 19pt; } h2 { font-size: 15pt; }
  h1, h2, h3, h4 { break-after: avoid; }
  figure, pre, blockquote, tr, mjx-container[display="true"] { break-inside: avoid; }
  figure img { max-height: 210mm; object-fit: contain; }
  table { width: 100%; font-size: 9pt; } thead { display: table-header-group; }
  td, th { overflow-wrap: anywhere; }
  pre, pre code { white-space: pre-wrap; overflow-wrap: anywhere; }
  p { orphans: 3; widows: 3; }
}
'''


def normalize(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text))


def to_markdown(article):
    copy = BeautifulSoup(str(article), 'html.parser')
    for node in copy.select('.toc, a.anchor'):
        node.decompose()
    tokens = {}
    for node in list(copy.find_all(string=True)):
        if node.find_parent(['pre', 'code', 'style', 'script']):
            continue
        def protect(match):
            key = f'ARCHIVEMATHTOKEN{len(tokens):06d}END'
            tokens[key] = match.group(0)
            return key
        node.replace_with(re.sub(r'\$\$[\s\S]*?\$\$|(?<!\\)\$[^$\n]+?(?<!\\)\$', protect, str(node)))
    text = markdownify(str(copy), heading_style='ATX', bullets='-', escape_underscores=False)
    for key, formula in tokens.items():
        text = text.replace(key, formula)
    return text


class Resources:
    def __init__(self, output):
        self.output = output
        self.session = requests.Session()
        self.manifest = {}

    def fetch(self, url):
        if urlparse(url).scheme not in ('http', 'https'):
            raise ValueError(f'Unsupported resource URL scheme: {urlparse(url).scheme}')
        response = self.session.get(url, timeout=90)
        response.raise_for_status()
        return response

    def save(self, url):
        if url.startswith('#'):
            return url
        if url in self.manifest:
            return self.manifest[url]['path']
        if url.startswith('data:'):
            header, payload = url.split(',', 1)
            data = base64.b64decode(payload) if ';base64' in header else unquote_to_bytes(payload)
            ext = mimetypes.guess_extension(header[5:].split(';')[0]) or '.bin'
            basename = 'embedded' + ext
        else:
            data = self.fetch(url).content
            basename = Path(urlparse(url).path).name or 'resource.bin'
        basename = re.sub(r'[^A-Za-z0-9._-]', '-', basename)[:100]
        filename = hashlib.sha256(url.encode()).hexdigest()[:12] + '-' + basename
        relative = 'assets/' + filename
        (self.output / relative).write_bytes(data)
        # Data URLs can contain the entire image; do not duplicate them in the manifest.
        self.manifest[url] = {'source': url if not url.startswith('data:') else 'data:' + hashlib.sha256(data).hexdigest(),
                              'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        return relative

    def css(self, text, base, seen=None):
        seen = set(seen or [])
        def imported(match):
            url = urljoin(base, match.group(1) or match.group(2) or match.group(3))
            if url in seen:
                return ''
            seen.add(url)
            imported_css = self.css(self.fetch(url).text, url, seen)
            media = (match.group(4) or '').strip()
            return f'@media {media} {{\n{imported_css}\n}}' if media else imported_css
        text = re.sub(r'''@import\s+(?:url\(\s*["']?([^\s"')]+)["']?\s*\)|"([^"]+)"|'([^']+)')\s*([^;]*);''', imported, text)
        def resource(match):
            url = match.group(1).strip().strip('"\'')
            if not url or url.startswith(('#', 'data:')):
                return match.group(0)
            return 'url("' + self.save(urljoin(base, url)) + '")'
        return re.sub(r'url\(\s*([^)]*?)\s*\)', resource, text)


def meta(soup, selector):
    tag = soup.select_one(selector)
    return (tag.get('content') or tag.get('datetime') or tag.get_text(' ', strip=True)) if tag else ''


def bib_escape(value):
    return value.replace('\\', '\\textbackslash{}').replace('{', '\\{').replace('}', '\\}').replace('\n', ' ')


def archive(args):
    output = Path(args.output).expanduser().resolve()
    output.mkdir(parents=True, exist_ok=False)
    (output / 'assets').mkdir()
    resources = Resources(output)
    response = resources.fetch(args.url)
    source_url = response.url
    (output / 'source.html').write_bytes(response.content)
    soup = BeautifulSoup(response.content, 'html.parser')
    candidates = soup.select(args.selector) if args.selector else soup.select('article')
    if not candidates:
        raise ValueError('No article container found; inspect the page and supply --selector. No full archive was claimed.')
    if args.selector and len(candidates) != 1:
        raise ValueError('The selector must identify exactly one complete article container.')
    article = max(candidates, key=lambda n: len(n.get_text()))
    for node in article.select('nav, script, style, .post-footer, .post-nav, .share-buttons, a.anchor'):
        node.decompose()
    if not article.get_text(strip=True):
        raise ValueError('The selected container has no article text.')
    unsupported = [node.name for node in article.select('canvas, video, audio, iframe, object, embed')]
    for node in article.select('canvas, video, audio, iframe, object, embed'):
        replacement = soup.new_tag('p')
        replacement.string = '[Offline archive limitation: original ' + node.name + ' content requires manual preservation.]'
        node.replace_with(replacement)
    original_text = article.get_text(' ', strip=True)
    headings = [node.get_text(' ', strip=True) for node in article.select('h1, h2, h3')]
    title_node = article.select_one('h1')
    title = args.title or (title_node.get_text(' ', strip=True) if title_node else meta(soup, 'meta[property="og:title"]')) or meta(soup, 'title')
    author = args.author or meta(soup, 'meta[name="author"]')
    date = args.date or meta(soup, 'meta[property="article:published_time"], meta[name="date"], time[datetime]')
    if not title:
        raise ValueError('Title is unknown; inspect the article and provide --title.')

    css = []
    # The selected article may have been detached only after resource extraction; head remains available.
    for link in soup.select('link[rel~="stylesheet"]'):
        url = urljoin(source_url, link['href'])
        css.append(resources.css(resources.fetch(url).text, url))
    for style in soup.select('head style'):
        css.append(resources.css(style.get_text(), source_url))
    for source in article.select('picture source'):
        source.decompose()
    for node in article.find_all(True):
        for attribute in list(node.attrs):
            if attribute.lower().startswith('on'):
                del node[attribute]
        if node.get('style'):
            node['style'] = resources.css(node['style'], source_url)
    images = article.select('img')
    for image in images:
        src = image.get('data-src') or image.get('data-original') or image.get('src')
        if not src or (src.startswith('data:') and image.get('data-lazy-src')):
            src = image.get('data-lazy-src') or src
        if not src:
            raise ValueError('An image has no accessible src; inspect srcset/dynamic rendering manually.')
        image['src'] = resources.save(urljoin(source_url, src))
        image['loading'] = 'eager'
        for key in ('srcset', 'sizes', 'data-src', 'data-original', 'data-lazy-src', 'data-srcset'):
            image.attrs.pop(key, None)
    for link in article.select('a[href]'):
        href = link['href']
        link['href'] = urljoin(source_url, href) if not href.startswith('#') else href
        if link['href'].lower().startswith(('javascript:', 'data:')):
            del link['href']
    for details in article.select('details'):
        details['open'] = ''
    assert original_text == article.get_text(' ', strip=True)
    provenance = f'> Original: {source_url}\n> Author: {author or "unknown"} · Published: {date or "unknown"}\n\n'
    md = to_markdown(article)
    if not title_node:
        md = '# ' + title + '\n\n' + md
    (output / 'article.md').write_text(provenance + md, encoding='utf-8')

    math_script = ''
    if 'mathjax' in response.text.lower() and not article.select('mjx-container'):
        local_script = resources.save(MATHJAX)
        math_script = r'''<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\(','\\)']],displayMath:[['$$','$$'],['\\[','\\]']],processEscapes:true,processEnvironments:true},svg:{fontCache:'local'},options:{enableMenu:false}};</script>'''
        math_script += f'<script defer src="{local_script}"></script>'
    css_block = '\n'.join(css + [PRINT_CSS]).replace('</style', '<\\/style')
    document = f'''<!doctype html><html lang="{html.escape(soup.html.get('lang', 'en') if soup.html else 'en', quote=True)}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title>
<style>{css_block}</style>{math_script}</head><body><main class="main archive-main">
<p class="archive-source">Original: <a href="{html.escape(source_url, quote=True)}">{html.escape(source_url)}</a></p>
{article}</main></body></html>'''
    entry = output / 'index.html'
    entry.write_text(document, encoding='utf-8')
    chromium = args.chromium or next((shutil.which(n) for n in ['chromium', 'chromium-browser', 'google-chrome'] if shutil.which(n)), None)
    with sync_playwright() as p:
        launch = {'executable_path': chromium} if chromium else {}
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'], **launch)
        context = browser.new_context(color_scheme='light', viewport={'width': 1100, 'height': 900})
        remote, errors = [], []
        def route_request(route):
            if route.request.url.startswith(('http://', 'https://')):
                remote.append(route.request.url)
                route.abort()
            else:
                route.continue_()
        context.route('**/*', route_request)
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(entry.as_uri(), wait_until='load')
        page.evaluate('''async () => {
            if(window.MathJax?.startup?.promise) await MathJax.startup.promise;
            await document.fonts.ready;
            await Promise.all([...document.images].map(i=>i.decode()));
        }''')
        report = page.evaluate('''() => ({
            imageCount:document.images.length,
            images:[...document.images].map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight})),
            mathCount:document.querySelectorAll('mjx-container').length,
            mathErrors:[...document.querySelectorAll('[data-mml-node="merror"],.katex-error')].map(x=>x.textContent)
        })''')
        if remote or errors or report['mathErrors'] or any(not i['width'] for i in report['images']):
            raise ValueError('Offline resource/math validation failed: ' + json.dumps({'requests': remote, 'errors': errors, 'mathErrors': report['mathErrors']}))
        if math_script and not report['mathCount']:
            raise ValueError('MathJax was detected but no formula was rendered; inspect the original markup.')
        page.evaluate("() => document.querySelectorAll('script').forEach(s=>s.remove())")
        entry.write_text('<!doctype html>\n' + page.locator('html').evaluate('(e)=>e.outerHTML'), encoding='utf-8')
        page.reload(wait_until='load')
        page.evaluate('async () => { await document.fonts.ready; await Promise.all([...document.images].map(i=>i.decode())); }')
        if remote or errors:
            raise ValueError('Frozen HTML still requested external resources or raised errors.')
        page.screenshot(path=str(output / 'preview.png'))
        page.pdf(path=str(output / 'article.pdf'), format='A4', prefer_css_page_size=True, print_background=True,
                 display_header_footer=True, header_template='<span></span>',
                 footer_template='<div style="width:100%;text-align:center;font:8px Arial;color:#777"><span class="pageNumber"></span> / <span class="totalPages"></span></div>')
        browser.close()

    reader = PdfReader(output / 'article.pdf')
    pdf_text = '\n'.join(page.extract_text() for page in reader.pages)
    missing = [h for h in headings if normalize(h) not in normalize(pdf_text)]
    report.update({'status': 'generated-needs-manual-review', 'pdfPages': len(reader.pages),
                   'pdfImageObjects': sum(len(page.images) for page in reader.pages),
                   'missingHeadingsInPDF': missing, 'unsupportedMedia': unsupported,
                   'sourceTextCharacters': len(original_text), 'sourceTextPreservedBeforeMath': True,
                   'offlineRemoteRequests': remote, 'javascriptErrors': errors})
    (output / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    metadata = {'type': 'post-weblog', 'title': title, 'URL': source_url}
    if author:
        metadata['author'] = [{'literal': author}]
    if re.match(r'^\d{4}-\d{2}-\d{2}', date):
        metadata['issued'] = {'date-parts': [[int(n) for n in date[:10].split('-')]]}
    (output / 'metadata.csl.json').write_text(json.dumps([metadata], ensure_ascii=False, indent=2), encoding='utf-8')
    fields = {'title': title, 'url': source_url}
    if author:
        fields['author'] = author
    if date:
        fields['date'] = date
    (output / 'citation.bib').write_text('@misc{webarticle,\n' + '\n'.join(f'  {k} = {{{bib_escape(v)}}},' for k, v in fields.items()) + '\n}\n', encoding='utf-8')
    manifest = {'url': source_url, 'requestedUrl': args.url, 'title': title, 'author': author or None,
                'published': date or None, 'archivedAt': datetime.now(timezone.utc).isoformat(),
                'sourceSha256': hashlib.sha256(response.content).hexdigest(),
                'assets': list(resources.manifest.values()), 'zoteroImport': 'not-attempted'}
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    if missing:
        raise ValueError('PDF heading verification failed; inspect verification.json before delivering.')
    print(json.dumps({'directory': str(output), 'verification': report, 'zoteroImport': 'not-attempted'}, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('url')
    parser.add_argument('--output', required=True, help='New directory; existing directories are never overwritten.')
    parser.add_argument('--selector')
    parser.add_argument('--title')
    parser.add_argument('--author')
    parser.add_argument('--date')
    parser.add_argument('--chromium')
    args = parser.parse_args()
    archive(args)


if __name__ == '__main__':
    main()
