#!/usr/bin/env python3
"""Apply the reusable growth-story media structure to existing HTML fragments."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from lxml import html

from import_wechat_stories import GROWTH_STORY_SLUGS, annotate_growth_story_media


def normalize_fragment(source: Path) -> str:
    fragment_parent = html.fragment_fromstring(
        source.read_text(encoding="utf-8"),
        create_parent="main",
    )
    annotate_growth_story_media(fragment_parent)
    fragment = "\n".join(
        html.tostring(child, encoding="unicode", method="html")
        for child in fragment_parent
    )
    fragment = re.sub(r"\n{3,}", "\n\n", fragment).strip()
    return f"{fragment}\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", type=Path, help="Website repository root")
    return parser.parse_args()


def main() -> None:
    repository = parse_args().repository.resolve()
    fragments = repository / "src" / "content" / "voices"
    for slug in GROWTH_STORY_SLUGS:
        source = fragments / f"{slug}.html"
        source.write_text(normalize_fragment(source), encoding="utf-8")
        print(f"normalized {source.relative_to(repository)}")


if __name__ == "__main__":
    main()
