"""Verify generated book fidelity, local links, anchors, and discovery metadata."""
import json
import re
import tomllib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
from prepare import parse_manuscript

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
config = tomllib.loads((ROOT / "config.toml").read_text())
base = config["base_url"].rstrip("/")


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.links = []
        self.text = []
        self.h1 = 0
        self.schema = []
        self.in_schema = False
        self.feed(source)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        if tag in ("a", "link", "script", "img"):
            url = attrs.get("href") or attrs.get("src")
            if url:
                self.links.append(url)
        self.in_schema = tag == "script" and attrs.get("type") == "application/ld+json"

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_schema = False

    def handle_data(self, text):
        if self.in_schema:
            self.schema.append(json.loads(text))
        self.text.append(text)


def normalize(text):
    return " ".join(text.replace("’", "'").replace("“", '"').replace("”", '"').replace("*", "").split())


pages = {path: Page(path.read_text()) for path in PUBLIC.rglob("*.html")}
assert len(pages) == 19, f"Expected 19 HTML documents, found {len(pages)}"
for path, page in pages.items():
    assert page.h1 == 1, f"{path}: expected one h1"
    assert len(page.ids) == len(set(page.ids)), f"{path}: duplicate anchors"
    assert len(page.schema) == 2 and page.schema[0]["@type"] == "Book", f"{path}: Book metadata missing"
    graph = page.schema[1]["@graph"]
    assert graph[0]["@id"] == base + "/#book" and len(graph[0]["hasPart"]) == 15, f"{path}: book parts missing"
    assert graph[0]["datePublished"], f"{path}: publication date missing"
    assert graph[0]["license"].startswith("https://creativecommons.org/licenses/"), f"{path}: licence missing"
    route_slug = str(path.relative_to(PUBLIC).parent)
    if any(part["url"] == f"{base}/{route_slug}/" for part in graph[0]["hasPart"]):
        assert [node["@type"] for node in graph[1:]] == ["Chapter", "BreadcrumbList"], f"{path}: chapter metadata missing"
        assert graph[1]["isPartOf"]["@id"] == base + "/#book", f"{path}: chapter is not part of the book"
    else:
        assert len(graph) == 1, f"{path}: unexpected chapter metadata"
    assert page.schema[0]["@id"] == base + "/#book", f"{path}: incorrect Book identifier"
    assert page.schema[0]["author"]["@id"] == "https://raskell.io/#person", f"{path}: incorrect author identifier"
    route = "/" + str(path.relative_to(PUBLIC)).removesuffix("index.html")
    for link in page.links:
        url = urlparse(urljoin(base + route, link))
        if url.netloc != urlparse(base).netloc or url.scheme not in ("http", "https"):
            continue
        target = PUBLIC / unquote(url.path).lstrip("/")
        if target.is_dir():
            target /= "index.html"
        assert target.is_file(), f"{path}: missing {link}"
        if url.fragment and target.suffix == ".html":
            assert unquote(url.fragment) in pages[target].ids, f"{path}: missing anchor {link}"

source, sections = parse_manuscript()
whole = pages[PUBLIC / "read/index.html"]
whole_text = normalize("".join(whole.text))
count = 0
for section in sections:
    page = pages[PUBLIC / section["slug"] / "index.html"]
    rendered = normalize("".join(page.text))
    assert section["slug"] in whole.ids
    bodies = [p["body"] for p in section["passages"]] if section["roman"] else section["body"].split("\n\n")
    for body in bodies:
        assert normalize(body) in rendered, f"Changed text in {section['title']}"
        assert normalize(body) in whole_text, f"Missing continuous text in {section['title']}"
    for passage in section["passages"]:
        count += 1
        assert f"p{passage['number']}" in page.ids
        assert f"{section['roman'].lower()}-{passage['number']}" in whole.ids
assert count == 104
assert (PUBLIC / "book.md").read_text() == source
assert (PUBLIC / "llms-full.txt").read_text() == source
assert "User-agent: *" in (PUBLIC / "robots.txt").read_text()
sitemap = (PUBLIC / "sitemap.xml").read_text()
assert "<urlset" in sitemap
assert sitemap.count("<lastmod>") == sitemap.count("<loc>") == 18, "sitemap: expected a lastmod for each of 18 pages"
assert (PUBLIC / "build.txt").read_text().strip(), "build.txt: commit stamp missing"
assert any(re.fullmatch(r"[0-9a-f]{32}\.txt", p.name) for p in PUBLIC.glob("*.txt")), "IndexNow key file missing"
assert "## Contents" in (PUBLIC / "llms.txt").read_text()
assert "## Licence" in (PUBLIC / "llms.txt").read_text()
assert (PUBLIC / "social.png").read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
for path in ROOT.glob("themes/shore/static/*.js"):
    assert path.stat().st_size < 16000, f"Unexpectedly large script: {path}"
print(f"Verified {len(pages)} pages, 104 passages in both editions, all local links and anchors, Markdown fidelity, and discovery files.")
