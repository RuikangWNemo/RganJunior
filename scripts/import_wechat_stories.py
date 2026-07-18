#!/usr/bin/env python3
"""Import the verified WeChat content package into the website repository."""

from __future__ import annotations

import argparse
from copy import deepcopy
import json
import re
import shutil
from pathlib import Path

from lxml import html


EXPECTED_SLUGS = (
    "summer-co-creation-camp-invitation",
    "it-takes-a-village",
    "tea-connects-an-american-girl",
    "tea-kitchen-and-summer",
    "technology-ecology-stars",
)

GROWTH_STORY_SLUGS = EXPECTED_SLUGS[1:]


def add_class(element: html.HtmlElement, class_name: str) -> None:
    classes = set((element.get("class") or "").split())
    classes.add(class_name)
    element.set("class", " ".join(sorted(classes)))


def normalized_text(element: html.HtmlElement) -> str:
    return re.sub(r"\s+", " ", element.text_content()).strip()


def has_class(element: html.HtmlElement, class_name: str) -> bool:
    return class_name in (element.get("class") or "").split()


def article_flow_root(main: html.HtmlElement) -> html.HtmlElement:
    children = [child for child in main if isinstance(child.tag, str)]
    if len(children) == 1 and children[0].tag.lower() == "div":
        return children[0]
    return main


def is_image_only_block(element: html.HtmlElement) -> bool:
    images = element.xpath(".//img")
    allowed_tags = {"div", "span", "picture", "source", "img"}
    return bool(images) and not normalized_text(element) and all(
        not isinstance(node.tag, str) or node.tag.lower() in allowed_tags
        for node in element.iterdescendants()
    )


def is_caption_block(element: html.HtmlElement) -> bool:
    if element.xpath(".//img") or element.xpath(".//ul | .//ol | .//blockquote"):
        return False

    paragraphs = element.xpath(".//p")
    if not paragraphs or len(paragraphs) > 3:
        return False

    if any(has_class(paragraph, "article-section-heading") for paragraph in paragraphs):
        return False

    if any(has_class(paragraph, "article-photo-caption") for paragraph in paragraphs):
        return True

    texts = [normalized_text(paragraph) for paragraph in paragraphs]
    return (
        all(texts)
        and sum(len(text) for text in texts) <= 36
        and not element.xpath(".//strong | .//b | .//em | .//i | .//a")
    )


def image_orientation(image: html.HtmlElement) -> str:
    try:
        width = int(image.get("width", "0"))
        height = int(image.get("height", "0"))
    except ValueError:
        return "landscape"

    if width <= 0 or height <= 0:
        return "landscape"

    ratio = width / height
    if ratio <= 0.6:
        return "tall"
    if ratio < 0.88:
        return "portrait"
    if ratio <= 1.15:
        return "square"
    return "landscape"


def build_media_caption(caption_block: html.HtmlElement | None) -> html.HtmlElement | None:
    if caption_block is None:
        return None

    caption = html.Element("figcaption")
    add_class(caption, "article-media-caption")

    for paragraph in caption_block.xpath(".//p"):
        text = normalized_text(paragraph)
        if not text or text == "更多照片如下":
            continue
        line = html.Element("span")
        add_class(line, "article-media-caption__line")
        if text.startswith("@"):
            add_class(line, "article-media-caption__date")
        line.text = text
        caption.append(line)

    return caption if len(caption) else None


def build_media_frame(
    image_block: html.HtmlElement,
    caption_block: html.HtmlElement | None,
) -> html.HtmlElement:
    images = image_block.xpath(".//img")
    orientations = [image_orientation(image) for image in images]
    frame = html.Element("figure")
    add_class(frame, "article-media-frame")

    if len(images) == 1:
        add_class(frame, f"article-media-frame--{orientations[0]}")
        image = deepcopy(images[0])
        add_class(image, "article-media-image")
        frame.append(image)
    else:
        add_class(frame, "article-media-frame--collection")
        if all(orientation in {"portrait", "tall"} for orientation in orientations):
            add_class(frame, "article-media-frame--portrait-collection")
        if all(orientation == "landscape" for orientation in orientations):
            add_class(frame, "article-media-frame--landscape-collection")
        grid = html.Element("div")
        add_class(grid, "article-media-grid")
        for source_image, orientation in zip(images, orientations, strict=True):
            item = html.Element("div")
            add_class(item, "article-media-item")
            add_class(item, f"article-media-item--{orientation}")
            image = deepcopy(source_image)
            add_class(image, "article-media-image")
            item.append(image)
            grid.append(item)
        frame.append(grid)

    caption = build_media_caption(caption_block)
    if caption is not None:
        frame.append(caption)
    return frame


def annotate_media_run(media_run: html.HtmlElement) -> None:
    frames = [child for child in media_run if has_class(child, "article-media-frame")]
    portrait_frames = sum(
        has_class(frame, "article-media-frame--portrait")
        or has_class(frame, "article-media-frame--tall")
        for frame in frames
    )
    landscape_frames = sum(
        has_class(frame, "article-media-frame--landscape")
        or has_class(frame, "article-media-frame--collection")
        for frame in frames
    )
    if portrait_frames and landscape_frames:
        add_class(media_run, "article-media-run--mixed")
    if portrait_frames == 1 and landscape_frames:
        add_class(media_run, "article-media-run--single-portrait")
    if frames and all(
        has_class(frame, "article-media-frame--landscape")
        or has_class(frame, "article-media-frame--landscape-collection")
        for frame in frames
    ):
        add_class(media_run, "article-media-run--landscape-only")


def annotate_growth_story_media(main: html.HtmlElement) -> None:
    flow = article_flow_root(main)
    for frame in flow.xpath(
        './/figure[contains(concat(" ", normalize-space(@class), " "), " article-media-frame--collection ")]'
    ):
        items = frame.xpath(
            './div[contains(concat(" ", normalize-space(@class), " "), " article-media-grid ")]'
            '/div[contains(concat(" ", normalize-space(@class), " "), " article-media-item ")]'
        )
        if items and all(has_class(item, "article-media-item--landscape") for item in items):
            add_class(frame, "article-media-frame--landscape-collection")
    for media_run in flow.xpath(
        './div[contains(concat(" ", normalize-space(@class), " "), " article-media-run ")]'
    ):
        annotate_media_run(media_run)
    children = list(flow)
    output: list[html.HtmlElement] = []
    index = 0

    while index < len(children):
        child = children[index]
        if not is_image_only_block(child):
            output.append(child)
            index += 1
            continue

        frames: list[html.HtmlElement] = []
        while index < len(children) and is_image_only_block(children[index]):
            image_block = children[index]
            caption_block = None
            if index + 1 < len(children) and is_caption_block(children[index + 1]):
                caption_block = children[index + 1]
                index += 1
            frames.append(build_media_frame(image_block, caption_block))
            index += 1

        if len(frames) == 1:
            output.append(frames[0])
        else:
            media_run = html.Element("div")
            add_class(media_run, "article-media-run")
            for frame in frames:
                media_run.append(frame)
            annotate_media_run(media_run)
            output.append(media_run)

    for child in children:
        flow.remove(child)
    for child in output:
        flow.append(child)


def annotate_article_structure(main: html.HtmlElement) -> None:
    for paragraph in main.xpath(".//p"):
        text = normalized_text(paragraph)
        children = [child for child in paragraph if isinstance(child.tag, str)]
        if (
            text
            and len(text) <= 32
            and len(children) == 1
            and children[0].tag.lower() in {"strong", "b"}
            and text == normalized_text(children[0])
            and not text.endswith(("。", "！", "!"))
        ):
            add_class(paragraph, "article-section-heading")

        if text == "更多照片请左右滑动":
            paragraph.clear()
            paragraph.text = "更多照片如下"

    for container in main.xpath(".//div"):
        direct_paragraphs = container.xpath("./p")
        paragraph_texts = [normalized_text(paragraph) for paragraph in direct_paragraphs]
        has_photo_meta = any(text.startswith("@") or "更多照片如下" in text for text in paragraph_texts)
        if (
            direct_paragraphs
            and len(direct_paragraphs) <= 3
            and has_photo_meta
            and all(len(text) <= 80 for text in paragraph_texts)
        ):
            for paragraph in direct_paragraphs:
                add_class(paragraph, "article-photo-caption")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package", type=Path, help="Verified web-ready package root")
    parser.add_argument("repository", type=Path, help="Website repository root")
    return parser.parse_args()


def extract_main_fragment(source: Path, slug: str) -> str:
    document = html.parse(str(source))
    main_nodes = document.xpath("//main")
    if len(main_nodes) != 1:
        raise ValueError(f"{slug}: expected one <main>, found {len(main_nodes)}")

    main = main_nodes[0]
    annotate_article_structure(main)
    for image in list(main.xpath(".//img")):
        wrapper = image.getparent()
        if wrapper is None or len(wrapper) != 1 or (wrapper.text or "").strip():
            continue
        previous_wrapper = wrapper.getprevious()
        if (
            previous_wrapper is not None
            and len(previous_wrapper) == 1
            and previous_wrapper[0].tag == "img"
            and previous_wrapper[0].get("src") == image.get("src")
        ):
            wrapper.getparent().remove(wrapper)

    if slug in GROWTH_STORY_SLUGS:
        annotate_growth_story_media(main)

    fragment = "\n".join(
        html.tostring(child, encoding="unicode", method="html")
        for child in main
    )
    fragment = fragment.replace('src="images/', f'src="/stories/{slug}/images/')
    fragment = fragment.replace("—", "-").replace("–", "-")
    fragment = re.sub(r"\n{3,}", "\n\n", fragment).strip()
    return f"{fragment}\n"


def import_story(package_root: Path, repository: Path, slug: str) -> dict[str, object]:
    source = package_root / "articles" / slug
    metadata_path = source / "metadata.json"
    if not metadata_path.is_file():
        raise FileNotFoundError(f"{slug}: missing metadata.json")

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("slug") != slug or metadata.get("status") != "success":
        raise ValueError(f"{slug}: package metadata is not verified")

    public_target = repository / "public" / "stories" / slug
    images_target = public_target / "images"
    fragments_target = repository / "src" / "content" / "voices"
    images_target.mkdir(parents=True, exist_ok=True)
    fragments_target.mkdir(parents=True, exist_ok=True)

    shutil.copy2(source / "cover.jpg", public_target / "cover.jpg")
    for image_record in metadata["images"]:
        relative_path = Path(str(image_record["path"]))
        if relative_path.parts[0] != "images":
            raise ValueError(f"{slug}: unexpected image path {relative_path}")
        shutil.copy2(source / relative_path, public_target / relative_path)

    fragment = extract_main_fragment(source / "content.html", slug)
    (fragments_target / f"{slug}.html").write_text(fragment, encoding="utf-8")

    return {
        "slug": slug,
        "imageCount": metadata["imageCount"],
        "fragmentBytes": len(fragment.encode("utf-8")),
    }


def main() -> None:
    args = parse_args()
    package_root = args.package.resolve()
    repository = args.repository.resolve()
    results = [import_story(package_root, repository, slug) for slug in EXPECTED_SLUGS]
    print(json.dumps({"stories": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
