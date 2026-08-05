#!/usr/bin/env python3
"""Fetch DJ FOLSOE follower total from Twitch Helix and write public JSON."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BROADCASTER_ID = os.getenv("TWITCH_BROADCASTER_ID", "756562979").strip()
CHANNEL_LOGIN = os.getenv("TWITCH_CHANNEL_LOGIN", "djfolsoe").strip()
CLIENT_ID = os.getenv("TWITCH_CLIENT_ID", "").strip()
USER_ACCESS_TOKEN = os.getenv("TWITCH_USER_ACCESS_TOKEN", "").strip()
OUTPUT = Path(os.getenv("FOLLOWERS_OUTPUT", "assets/data/followers.json"))

def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)

if not CLIENT_ID:
    fail("Missing repository secret TWITCH_CLIENT_ID.")
if not USER_ACCESS_TOKEN:
    fail("Missing repository secret TWITCH_USER_ACCESS_TOKEN.")
if not BROADCASTER_ID.isdigit():
    fail("TWITCH_BROADCASTER_ID must contain the numeric Twitch user ID.")

query = urllib.parse.urlencode({
    "broadcaster_id": BROADCASTER_ID,
    "first": "1",
})
url = f"https://api.twitch.tv/helix/channels/followers?{query}"
request = urllib.request.Request(
    url,
    headers={
        "Client-Id": CLIENT_ID,
        "Authorization": f"Bearer {USER_ACCESS_TOKEN}",
        "Accept": "application/json",
        "User-Agent": "DJ-FOLSOE-GitHub-Follower-Sync/25010.1",
    },
)

try:
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.load(response)
except urllib.error.HTTPError as error:
    detail = error.read().decode("utf-8", errors="replace")
    fail(f"Twitch Helix returned HTTP {error.code}: {detail}")
except Exception as error:
    fail(f"Unable to reach Twitch Helix: {error}")

total = payload.get("total")
if not isinstance(total, int) or total < 0:
    fail(f"Twitch response did not contain a valid total: {payload!r}")

result = {
    "ok": True,
    "followers": total,
    "broadcasterId": BROADCASTER_ID,
    "channel": CHANNEL_LOGIN,
    "source": "github-actions-twitch-helix",
    "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
temporary = OUTPUT.with_suffix(OUTPUT.suffix + ".tmp")
temporary.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
temporary.replace(OUTPUT)

print(f"Follower total: {total}")
print(f"Updated: {OUTPUT}")
