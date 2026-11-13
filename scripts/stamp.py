"""Record when the book last changed and which commit this build is.

Writes data/build.json for the sitemap's lastmod dates and static/build.txt so that
scripts/indexnow.py can tell when the live site serves this commit.
"""
import datetime
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ["manuscript.md", "translations", "scripts/prepare.py", "config.toml", "data/edition.toml", "templates", "themes"]


def git(*args):
    try:
        return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def main():
    # A shallow clone may not hold the commit that last touched the sources; fall back to HEAD, then today.
    modified = (git("log", "-1", "--format=%cs", "--", *SOURCES) or git("log", "-1", "--format=%cs")
                or datetime.date.today().isoformat())
    commit = (os.environ.get("CF_PAGES_COMMIT_SHA") or os.environ.get("GITHUB_SHA")
              or git("rev-parse", "HEAD") or "unknown")
    for relative, text in (("data/build.json", json.dumps({"modified": modified, "commit": commit}) + "\n"),
                           ("static/build.txt", commit + "\n")):
        path = ROOT / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists() or path.read_text() != text:
            path.write_text(text)
    print(f"Stamped build {commit[:8]}, last modified {modified}")


if __name__ == "__main__":
    main()
