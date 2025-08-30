from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from copy import deepcopy
from storage import read_devices, write_devices

app = FastAPI(title="Chimera Device API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/devices")
def get_devices():
    return read_devices()

@app.get("/api/summary")
def get_summary():
    devs = read_devices()
    total = len(devs)
    active = sum(1 for d in devs if d.get("is_active"))

    by_group: Dict[str, int] = {}
    by_category: Dict[str, int] = {}

    for d in devs:
        g = d["group"]["name"]
        by_group[g] = by_group.get(g, 0) + 1

        c = d["ai_classification"]["device_category"]
        by_category[c] = by_category.get(c, 0) + 1

    return {
        "total": total,
        "active": active,
        "by_group": by_group,
        "by_category": by_category,
    }

def _find_device(devs, did: int):
    for i, d in enumerate(devs):
        if d["id"] == did:
            return i, d
    return None, None

@app.patch("/api/devices/{did}")
def patch_device(did: int, patch: Dict[str, Any]):
    devs = read_devices()
    idx, d = _find_device(devs, did)
    if d is None:
        raise HTTPException(status_code=404, detail="Device not found")

    updated = deepcopy(d)

    # allowed keys
    if "given_name" in patch:
        updated["given_name"] = patch["given_name"]

    if "group" in patch and isinstance(patch["group"], dict) and "id" in patch["group"]:
        gid = patch["group"]["id"]
        groups = {
            1: {"name": "Default Group", "is_default": True},
            2: {"name": "Staff", "is_default": False},
            3: {"name": "Guests", "is_default": False},
            4: {"name": "IoT", "is_default": False},
        }
        if gid not in groups:
            raise HTTPException(status_code=400, detail="Unknown group id")
        updated["group"] = {"id": gid, **groups[gid]}

    if "blocklist" in patch and isinstance(patch["blocklist"], dict):
        for k, v in patch["blocklist"].items():
            if k in updated["blocklist"] and isinstance(v, bool):
                updated["blocklist"][k] = v
                updated["has_custom_blocklist"] = True

    devs[idx] = updated
    write_devices(devs)
    return updated

@app.post("/api/devices/{did}/actions")
def post_action(did: int, body: Dict[str, Any]):
    devs = read_devices()
    idx, d = _find_device(devs, did)
    if d is None:
        raise HTTPException(status_code=404, detail="Device not found")

    action = body.get("action")
    category = body.get("category")
    block = d["blocklist"]

    if action == "isolate":
        for k in block.keys():
            block[k] = True
        block["safesearch"] = True
        d["has_custom_blocklist"] = True

    elif action == "release":
        for k in block.keys():
            block[k] = False
        block["safesearch"] = True
        d["has_custom_blocklist"] = True

    elif action == "toggle_block":
        if not category or category not in block:
            raise HTTPException(status_code=400, detail="Unknown or missing blocklist category")
        block[category] = not block[category]
        d["has_custom_blocklist"] = True

    else:
        raise HTTPException(status_code=400, detail="Unknown action")

    devs[idx] = d
    write_devices(devs)
    return d
