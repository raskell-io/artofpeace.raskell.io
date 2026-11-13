"""Generate Zola inputs from the book's sole editable manuscript."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"]


def write(relative, text):
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    # Avoid triggering Zola's watcher for unchanged files.
    if not path.exists() or path.read_text() != text:
        path.write_text(text)


def parse_manuscript():
    source = (ROOT / "manuscript.md").read_text()
    parts = re.split(r"^## (.+)\n", source, flags=re.M)
    sections = []
    for heading, body in zip(parts[1::2], parts[2::2]):
        match = re.fullmatch(r"([IVX]+)\. (.+)", heading)
        roman, title = match.groups() if match else ("", heading)
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        if roman:
            blocks = re.split(r"^### (\d+)\n", body, flags=re.M)
            if blocks[0].strip():
                raise ValueError(f"Unexpected text before the first passage in {title}")
            passages = [{"number": int(number), "body": text.strip()}
                        for number, text in zip(blocks[1::2], blocks[2::2])]
            if [p["number"] for p in passages] != list(range(1, 9)):
                raise ValueError(f"Expected passages 1 to 8 in {title}; preserve published numbering")
        else:
            passages = []
        sections.append({"title": title, "roman": roman, "slug": slug,
                         "body": "" if roman else body.strip(), "passages": passages})
    if [s["roman"] for s in sections if s["roman"]] != ROMANS:
        raise ValueError("Expected thirteen chapters in order")
    if len(sections) != 15 or sections[0]["slug"] != "before-the-shore" or sections[-1]["slug"] != "returning":
        raise ValueError("Expected the opening and closing around the thirteen chapters")
    return source, sections


def frontmatter(title, template, extra="", description=""):
    return (f'+++\n# Generated from manuscript.md by scripts/prepare.py\ntitle = {json.dumps(title)}\ntemplate = "{template}"\n'
            f'description = {json.dumps(description)}\n{extra}+++\n')


def main():
    import tomllib
    config = tomllib.loads((ROOT / "config.toml").read_text())
    base = config["base_url"].rstrip("/")
    source, sections = parse_manuscript()
    edition = tomllib.loads((ROOT / "data/edition.toml").read_text())
    write("data/book.json", json.dumps({"sections": sections, "passage_count": 104}, ensure_ascii=False, indent=2) + "\n")
    generated = {"_index.md", "read.md", "about.md"}
    write("content/_index.md", frontmatter("The Art of Peace", "index.html", description=config["description"]))
    write("content/read.md", frontmatter("Read the book", "read.html", description=config["extra"]["page_descriptions"]["read"]))
    write("content/about.md", frontmatter("About the book", "about.html", description=config["extra"]["page_descriptions"]["about"]))
    for index, section in enumerate(sections):
        filename = section["slug"] + ".md"
        generated.add(filename)
        write("content/" + filename, frontmatter(section["title"], "chapter.html", f"[extra]\nbook_index = {index}\n", description=config["extra"]["page_descriptions"][section["slug"]]))
    # This directory contains generated files only. Remove stale generated pages.
    for path in (ROOT / "content").glob("*.md"):
        if path.name not in generated and path.read_text().startswith("+++\n# Generated from manuscript.md by scripts/prepare.py\n"):
            path.unlink()
    write("static/book.md", source)
    write("static/llms-full.txt", source)
    links = "\n".join(f'- [{s["title"]}]({base}/{s["slug"]}/)' for s in sections)
    write("static/llms.txt", f"# The Art of Peace\n\n> {config['extra']['subtitle']}\n\n"
          f"By {config['extra']['author']}. First manuscript. Original philosophical prose about preserving peace among people who remain free to disagree.\n\n"
          f"## Editions\n\n- [Complete web book]({base}/read/)\n- [Markdown manuscript]({base}/book.md)\n"
          f"- [Full text]({base}/llms-full.txt)\n- [About the book]({base}/about/)\n\n## Licence\n\n"
          f"The text is © {edition['published'][:4]} {config['extra']['author']}, licensed [{edition['licence']}]({edition['licence_url']}): "
          f"share it unchanged, with credit and a link to {base}/, for non-commercial purposes. "
          f"Translations, adaptations, and commercial use need the author's permission.\n\n## Contents\n\n{links}\n")
    print(f"Prepared {len(sections)} sections and 104 passages from manuscript.md")


if __name__ == "__main__":
    main()
