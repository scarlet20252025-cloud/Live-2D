#!/usr/bin/env python3
"""Verify the exported sticker GIF set against the DisplayInfo animation table."""
from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DISPLAY_CSV = ROOT / "DisplayInfo" / "Animations.csv"
EXPORT_DIR = ROOT / "export-all"
EXPECTED_SIZE = 240
EXPECTED_DELAY_CS = 3  # 30 ms per frame = 33.3 fps


def gif_info(path: Path) -> tuple[int, int, int, set[int]]:
    from PIL import Image

    with Image.open(path) as image:
        frames = getattr(image, "n_frames", 0)
        delays = set()
        for index in range(frames):
            image.seek(index)
            duration = image.info.get("duration")
            if duration is not None:
                delays.add(round(duration / 10))
        return image.size[0], image.size[1], frames, delays


def main() -> int:
    with DISPLAY_CSV.open(encoding="utf-8-sig", newline="") as handle:
        names = [row["AnimationName"] for row in csv.DictReader(handle)]
    missing = []
    bad_size = []
    bad_delay = []
    empty = []
    total_bytes = 0
    for name in names:
        path = EXPORT_DIR / (name.replace("/", "_") + ".gif")
        if not path.exists():
            missing.append(name)
            continue
        total_bytes += path.stat().st_size
        width, height, frames, delays = gif_info(path)
        if frames == 0:
            empty.append(name)
        if (width, height) != (EXPECTED_SIZE, EXPECTED_SIZE):
            bad_size.append((name, width, height))
        if delays and delays != {EXPECTED_DELAY_CS}:
            bad_delay.append((name, sorted(delays)))
    print(f"expected: {len(names)}")
    print(f"found: {len(names) - len(missing)}")
    print(f"missing: {len(missing)}")
    for name in missing:
        print("  MISSING", name)
    print(f"empty: {len(empty)}")
    for name in empty:
        print("  EMPTY", name)
    print(f"bad size: {len(bad_size)}")
    for row in bad_size[:10]:
        print("  SIZE", row)
    print(f"bad delay: {len(bad_delay)}")
    for row in bad_delay[:10]:
        print("  DELAY", row)
    print(f"total size: {total_bytes / 1048576:.1f} MB")
    return 0 if not (missing or empty or bad_size or bad_delay) else 1


if __name__ == "__main__":
    sys.exit(main())
