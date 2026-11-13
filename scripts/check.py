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
        self.metadata = {}
        self.alternates = {}
        self.canonical = None
        self.in_script = False
        self.in_schema = False
        self.feed(source)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == "meta":
            self.metadata[attrs.get("name") or attrs.get("property")] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "alternate" and "hreflang" in attrs:
            self.alternates[attrs["hreflang"]] = attrs["href"]
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        if tag == "script":
            self.in_script = True
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
            self.in_script = False

    def handle_data(self, text):
        if self.in_schema:
            self.schema.append(json.loads(text))
        if not self.in_script:
            self.text.append(text)


def normalize(text):
    return " ".join(text.replace("’", "'").replace("“", '"').replace("”", '"').replace("*", "").split())


pages = {path: Page(path.read_text()) for path in PUBLIC.rglob("*.html")}
assert len(pages) == 55, f"Expected 55 HTML documents, found {len(pages)}"
for path, page in pages.items():
    assert page.h1 == 1, f"{path}: expected one h1"
    assert len(page.ids) == len(set(page.ids)), f"{path}: duplicate anchors"
    assert len(page.schema) == 2 and page.schema[0]["@type"] == "Book", f"{path}: Book metadata missing"
    relative = path.relative_to(PUBLIC)
    language = relative.parts[0] if relative.parts[0] in ("zh", "ko") else "en"
    edition_base = base + ("/" + language if language != "en" else "")
    source_html = path.read_text()
    expected_lang = "zh-Hans" if language == "zh" else language
    assert f'<html lang="{expected_lang}">' in source_html, f"{path}: wrong document language"
    assert page.schema[0]["inLanguage"] == expected_lang
    if language != "en":
        assert page.schema[0]["translationOfWork"]["@id"] == base + "/#book"
    image_name = "social.png" if language == "en" else f"social.{language}.png"
    assert page.metadata["og:image"] == f"{base}/{image_name}", f"{path}: incorrect social image"
    assert page.metadata["og:image:alt"], f"{path}: image description missing"
    assert 0 < len(page.metadata["description"]) <= 160, f"{path}: invalid description length"
    if path.name != "404.html":
        route_path = str(relative).removesuffix("index.html")
        assert page.canonical == base + "/" + route_path, f"{path}: incorrect canonical URL"
        untranslated = route_path.removeprefix(language + "/") if language != "en" else route_path
        for code, prefix in (("en", ""), ("ko", "ko/"), ("zh-Hans", "zh/"), ("x-default", "")):
            assert page.alternates[code] == base + "/" + prefix + untranslated, f"{path}: wrong alternate {code}"
        for code in ("en", "ko", "zh-Hans", "x-default"):
            assert f'hreflang="{code}"' in source_html, f"{path}: missing language alternate {code}"
    graph = page.schema[1]["@graph"]
    assert graph[0]["@id"] == edition_base + "/#book" and len(graph[0]["hasPart"]) == 15, f"{path}: book parts missing"
    assert graph[0]["datePublished"], f"{path}: publication date missing"
    assert graph[0]["license"].startswith("https://creativecommons.org/licenses/"), f"{path}: licence missing"
    route_slug = str(path.relative_to(PUBLIC).parent)
    if any(part["url"] == f"{base}/{route_slug}/" for part in graph[0]["hasPart"]):
        assert [node["@type"] for node in graph[1:]] == ["Chapter", "BreadcrumbList"], f"{path}: chapter metadata missing"
        assert graph[1]["isPartOf"]["@id"] == edition_base + "/#book", f"{path}: chapter is not part of the book"
    else:
        assert len(graph) == 1, f"{path}: unexpected chapter metadata"
    assert page.schema[0]["@id"] == edition_base + "/#book", f"{path}: incorrect Book identifier"
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

labels = [json.loads((ROOT / f"translations/ui.{code}.json").read_text()) for code in ("en", "zh", "ko")]
assert all(set(label) == set(labels[0]) for label in labels), "UI translation keys differ"
assert all(all(value.strip() for value in label.values()) for label in labels), "Empty UI translation"
for language in ("en", "zh", "ko"):
    edition_dir = PUBLIC if language == "en" else PUBLIC / language
    source, sections = parse_manuscript(language)
    whole = pages[edition_dir / "read/index.html"]
    whole_text = normalize("".join(whole.text))
    count = 0
    for section in sections:
        page = pages[edition_dir / section["slug"] / "index.html"]
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
    assert (edition_dir / "book.md").read_text() == source
    assert (edition_dir / "llms-full.txt").read_text() == source
assert "User-agent: *" in (PUBLIC / "robots.txt").read_text()
sitemap = (PUBLIC / "sitemap.xml").read_text()
assert "<urlset" in sitemap
assert sitemap.count("<lastmod>") == sitemap.count("<loc>") == 54, "sitemap: expected a lastmod for each of 54 pages"
assert sitemap.count('hreflang="zh-Hans"') == 54, "sitemap: missing language alternates"
assert (PUBLIC / "build.txt").read_text().strip(), "build.txt: commit stamp missing"
assert any(re.fullmatch(r"[0-9a-f]{32}\.txt", p.name) for p in PUBLIC.glob("*.txt")), "IndexNow key file missing"
assert "## Contents" in (PUBLIC / "llms.txt").read_text()
assert "## Licence" in (PUBLIC / "llms.txt").read_text()
for image_name in ("social.png", "social.ko.png", "social.zh.png"):
    image_bytes = (PUBLIC / image_name).read_bytes()
    assert image_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert int.from_bytes(image_bytes[16:20]) == 1200 and int.from_bytes(image_bytes[20:24]) == 630
for path in ROOT.glob("themes/shore/static/*.js"):
    assert path.stat().st_size < 16000, f"Unexpectedly large script: {path}"
print(f"Verified {len(pages)} pages, 104 passages in each reading format across three languages, all local links and anchors, Markdown fidelity, and discovery files.")
