#!/usr/bin/env python3
"""Independently verify a generated WeChat web-ready content package."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path

from lxml import html
from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path, help="Generated web-ready package")
    return parser.parse_args()


def main() -> int:
    root = parse_args().package.resolve()
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    articles = manifest["articles"]
    errors: list[str] = []
    total_unique = 0
    total_references = 0

    if manifest.get("articleCount") != len(articles):
        errors.append("manifest articleCount 与 articles 数组不一致")
    if len({item["id"] for item in articles}) != len(articles):
        errors.append("文章 ID 不唯一")
    if len({item["slug"] for item in articles}) != len(articles):
        errors.append("文章 slug 不唯一")

    for entry in articles:
        slug = entry["slug"]
        article_dir = root / "articles" / slug
        try:
            metadata = json.loads((article_dir / "metadata.json").read_text(encoding="utf-8"))
            clean_html = (article_dir / "content.html").read_text(encoding="utf-8")
            markdown = (article_dir / "article.md").read_text(encoding="utf-8")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{slug}: 必需文件读取失败（{exc}）")
            continue

        document = html.fromstring(clean_html.encode("utf-8"))
        if document.xpath("//script"):
            errors.append(f"{slug}: HTML 仍含 script")
        if re.search(
            r"data-src=|rich_media|js_content|wx_fmt=|mmbiz\.qpic\.cn|/Users/",
            clean_html,
            re.I,
        ):
            errors.append(f"{slug}: HTML 仍含微信运行残留或绝对路径")
        if "/Users/" in markdown:
            errors.append(f"{slug}: Markdown 仍含绝对路径")

        html_image_refs = document.xpath("//main//img/@src")
        markdown_image_refs = re.findall(r"!\[[^\]]*\]\((images/[^)]+)\)", markdown)
        expected_references = metadata["imageReferenceCount"]
        if len(html_image_refs) != expected_references:
            errors.append(
                f"{slug}: HTML 图片引用 {len(html_image_refs)} != {expected_references}"
            )
        if len(markdown_image_refs) != expected_references:
            errors.append(
                f"{slug}: Markdown 图片引用 {len(markdown_image_refs)} != {expected_references}"
            )

        for image in metadata["images"]:
            image_path = article_dir / image["path"]
            if not image_path.is_file():
                errors.append(f"{slug}: 缺少图片 {image['path']}")
                continue
            digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
            if digest != image["sha256"]:
                errors.append(f"{slug}: 图片哈希不一致 {image['path']}")
            try:
                with Image.open(image_path) as source_image:
                    if source_image.size != (image["width"], image["height"]):
                        errors.append(f"{slug}: 图片尺寸不一致 {image['path']}")
            except OSError as exc:
                errors.append(f"{slug}: 图片无法打开 {image['path']}（{exc}）")

        cover = metadata.get("coverImage")
        if not cover or not (article_dir / cover["path"]).is_file():
            errors.append(f"{slug}: 缺少本地封面")

        total_unique += metadata["imageCount"]
        total_references += metadata["imageReferenceCount"]

    try:
        with (root / "manifest.csv").open(encoding="utf-8-sig", newline="") as handle:
            csv_rows = list(csv.DictReader(handle))
        if len(csv_rows) != len(articles):
            errors.append("manifest.csv 行数与文章数不一致")
    except OSError as exc:
        errors.append(f"manifest.csv 读取失败（{exc}）")

    report = {
        "articleCount": len(articles),
        "uniqueImageCount": total_unique,
        "imageReferenceCount": total_references,
        "valid": not errors,
        "errors": errors,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
