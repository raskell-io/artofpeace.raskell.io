"""Tell IndexNow (Bing, Copilot, Yandex, ...) that the book's pages changed.

Run after a build, on a push to main. The site is deployed by Cloudflare Pages on its own
schedule, so this first waits until the live site serves the commit that was just built
(static/build.txt, written by scripts/stamp.py), then submits every URL in the sitemap.
The key is the 32-hex-character .txt file in static/, served at the site root so the
search engines can verify ownership.
"""
import json
import re
import sys
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WAIT_SECONDS = 600
base = tomllib.loads((ROOT / "config.toml").read_text())["base_url"].rstrip("/")


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "artofpeace-indexnow", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode()


def main():
    keys = [p.stem for p in (ROOT / "static").glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", p.stem)]
    if not keys:
        sys.exit("indexnow: no key file in static/")
    key = keys[0]
    commit = (ROOT / "static/build.txt").read_text().strip()
    urls = re.findall(r"<loc>([^<]+)</loc>", (ROOT / "public/sitemap.xml").read_text())
    deadline = time.time() + WAIT_SECONDS
    while True:
        try:
            if fetch(f"{base}/build.txt?{int(time.time())}").strip() == commit:
                break
        except (urllib.error.URLError, OSError):
            pass
        if time.time() > deadline:
            sys.exit(f"indexnow: the live site did not serve build {commit[:8]} within {WAIT_SECONDS}s; nothing submitted")
        time.sleep(15)
    payload = {"host": re.sub(r"^https?://", "", base), "key": key, "keyLocation": f"{base}/{key}.txt", "urlList": urls}
    request = urllib.request.Request("https://api.indexnow.org/indexnow", data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            print(f"indexnow: {response.status} for {len(urls)} urls")
    except urllib.error.HTTPError as error:
        sys.exit(f"indexnow: HTTP {error.code} ({error.read()[:200]!r})")


if __name__ == "__main__":
    main()
