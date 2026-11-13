"""Keep generated inputs current while Zola serves the book."""
import os
import signal
import subprocess
import time
from pathlib import Path
from prepare import main as prepare

root = Path(__file__).resolve().parents[1]
os.chdir(root)
prepare()
watched = [root / "manuscript.md", root / "config.toml", root / "scripts/prepare.py", *sorted((root / "translations").glob("*"))]
stamps = [p.stat().st_mtime_ns for p in watched]
server = subprocess.Popen(["mise", "exec", "zola@0.22.1", "--", "zola", "serve", "--interface", "127.0.0.1", "--port", os.environ.get("BOOK_PORT", "1118"), "--extra-watch-path", "data"], start_new_session=True)


def stop(signum, frame):
    raise KeyboardInterrupt


signal.signal(signal.SIGTERM, stop)
try:
    while server.poll() is None:
        time.sleep(0.5)
        changed = [p.stat().st_mtime_ns for p in watched]
        if changed != stamps:
            subprocess.run(["python3", "scripts/prepare.py"], check=True)
            stamps = changed
except KeyboardInterrupt:
    pass
finally:
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    try:
        os.killpg(server.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        os.killpg(server.pid, signal.SIGKILL)
        server.wait()
raise SystemExit(server.returncode if server.returncode and server.returncode > 0 else 0)
