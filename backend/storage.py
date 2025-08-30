import json, threading
from pathlib import Path

DATA = Path(__file__).parent / "devices.sample.json"
_lock = threading.Lock()

def read_devices():
    with _lock:
        with open(DATA, "r", encoding="utf-8") as f:
            return json.load(f)

def write_devices(devs):
    with _lock:
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(devs, f, ensure_ascii=False, indent=2)
