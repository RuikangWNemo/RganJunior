#!/usr/bin/env python3
"""Convert browser-saved WeChat articles into a clean, web-ready content package."""

from __future__ import annotations

import argparse
import csv
import hashlib
import html as html_std
import json
import re
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import unquote, urlparse

from lxml import etree, html
from PIL import Image


SLUGS = {
    1: "summer-co-creation-camp-invitation",
    2: "it-takes-a-village",
    3: "tea-connects-an-american-girl",
    4: "tea-kitchen-and-summer",
    5: "technology-ecology-stars",
}

REMOVE_TAGS = {
    "script",
    "style",
    "link",
    "iframe",
    "video",
    "audio",
    "source",
    "track",
    "form",
    "input",
    "textarea",
    "button",
    "canvas",
    "svg",
    "noscript",
    "mp-style-type",
}

ALLOWED_TAGS = {
    "article",
    "header",
    "footer",
    "main",
    "section",
    "div",
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "small",
    "sup",
    "sub",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
}

BLOCK_TAGS = {
    "article",
    "header",
    "footer",
    "main",
    "section",
    "div",
    "p",
    "blockquote",
    "ul",
    "ol",
    "li",
    "figure",
    "figcaption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
}

IMAGE_EXTENSIONS = {
    "JPEG": "jpg",
    "PNG": "png",
    "GIF": "gif",
    "WEBP": "webp",
    "BMP": "bmp",
    "TIFF": "tif",
    "AVIF": "avif",
}

CN_TZ = timezone(timedelta(hours=8))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Folder containing saved WeChat HTML files")
    parser.add_argument("output", type=Path, help="Destination for the web-ready package")
    return parser.parse_args()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalized_text(value: str | None) -> str:
    if not value:
        return ""
    value = value.replace("\u200b", "").replace("\ufeff", "").replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def xpath_text(document: etree._Element, expression: str) -> str:
    values = document.xpath(expression)
    if not values:
        return ""
    value = values[0]
    if isinstance(value, etree._Element):
        return normalized_text(value.text_content())
    return normalized_text(str(value))


def meta_property(document: etree._Element, property_name: str) -> str:
    escaped = property_name.replace('"', "")
    return xpath_text(document, f'//meta[@property="{escaped}"]/@content')


def parse_publish_time(value: str) -> tuple[str, str]:
    match = re.search(
        r"(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})",
        value,
    )
    if not match:
        return "", value
    year, month, day, hour, minute = map(int, match.groups())
    parsed = datetime(year, month, day, hour, minute, tzinfo=CN_TZ)
    return parsed.isoformat(), parsed.strftime("%Y-%m-%d")


def article_number(path: Path) -> int:
    match = re.match(r"\s*(\d+)", path.name)
    if not match:
        raise ValueError(f"无法从文件名识别文章序号：{path.name}")
    return int(match.group(1))


def stable_id(original_url: str, number: int) -> str:
    parsed = urlparse(original_url)
    token = parsed.path.rstrip("/").split("/")[-1]
    return token or f"article-{number:02d}"


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def markdown_table_cell(value: object) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ").strip()


def image_info(path: Path) -> dict:
    with Image.open(path) as image:
        image_format = image.format or ""
        extension = IMAGE_EXTENSIONS.get(image_format.upper())
        if not extension:
            raise ValueError(f"不支持的图片格式 {image_format or 'unknown'}")
        width, height = image.size
        frames = getattr(image, "n_frames", 1)
    return {
        "format": image_format.upper(),
        "extension": extension,
        "width": width,
        "height": height,
        "frames": frames,
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
    }


def resolve_local_asset(page: Path, src: str) -> Path | None:
    if not src or src.startswith(("http://", "https://", "data:")):
        return None
    parsed = urlparse(src)
    if parsed.scheme == "file":
        candidate = Path(unquote(parsed.path))
    else:
        candidate = page.parent / unquote(parsed.path)
    candidate = candidate.resolve()
    return candidate if candidate.is_file() else None


def remove_element(element: etree._Element) -> None:
    parent = element.getparent()
    if parent is None:
        return
    if element.tail:
        previous = element.getprevious()
        if previous is not None:
            previous.tail = (previous.tail or "") + element.tail
        else:
            parent.text = (parent.text or "") + element.tail
    parent.remove(element)


def unwrap_element(element: etree._Element) -> None:
    try:
        element.drop_tag()
    except (AttributeError, AssertionError):
        remove_element(element)


def clean_text_nodes(root: etree._Element) -> None:
    for element in root.iter():
        if element.text:
            element.text = element.text.replace("\u200b", "").replace("\ufeff", "")
        if element.tail:
            element.tail = element.tail.replace("\u200b", "").replace("\ufeff", "")


def clean_dom(content: etree._Element) -> None:
    for comment in list(content.xpath(".//comment()")):
        parent = comment.getparent()
        if parent is not None:
            parent.remove(comment)

    for element in list(content.iterdescendants()):
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        if tag in REMOVE_TAGS:
            remove_element(element)

    for element in list(content.iterdescendants()):
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        if not tag:
            continue
        if tag == "span":
            unwrap_element(element)
        elif tag not in ALLOWED_TAGS:
            unwrap_element(element)
        elif tag == "section":
            element.tag = "div"

    for element in content.iter():
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        allowed_attrs: set[str]
        if tag == "a":
            allowed_attrs = {"href", "title"}
        elif tag == "img":
            allowed_attrs = {"src", "alt", "width", "height", "loading"}
        elif tag in {"td", "th"}:
            allowed_attrs = {"colspan", "rowspan"}
        else:
            allowed_attrs = set()
        for attribute in list(element.attrib):
            if attribute not in allowed_attrs:
                del element.attrib[attribute]

        if tag == "a":
            href = element.get("href", "")
            if href and not href.startswith(("http://", "https://", "mailto:", "#", "/")):
                element.attrib.pop("href", None)

    clean_text_nodes(content)

    for element in reversed(list(content.iterdescendants())):
        tag = element.tag.lower() if isinstance(element.tag, str) else ""
        if tag not in BLOCK_TAGS:
            continue
        has_media = bool(element.xpath(".//img|.//table|.//hr"))
        if not has_media and not normalized_text(element.text_content()):
            remove_element(element)


def markdown_escape_alt(value: str) -> str:
    return value.replace("[", "\\[").replace("]", "\\]")


def render_markdown_children(element: etree._Element, depth: int = 0) -> str:
    pieces = [element.text or ""]
    for child in element:
        pieces.append(render_markdown(child, depth))
        pieces.append(child.tail or "")
    return "".join(pieces)


def render_markdown(element: etree._Element, depth: int = 0) -> str:
    tag = element.tag.lower() if isinstance(element.tag, str) else ""
    if tag == "img":
        alt = markdown_escape_alt(element.get("alt", "图片"))
        src = element.get("src", "")
        return f"\n\n![{alt}]({src})\n\n"
    if tag == "br":
        return "\n"
    if tag == "hr":
        return "\n\n---\n\n"

    inner = render_markdown_children(element, depth)
    stripped = inner.strip()

    if tag in {"strong", "b"}:
        return f"**{stripped}**" if stripped else ""
    if tag in {"em", "i"}:
        return f"*{stripped}*" if stripped else ""
    if tag == "s":
        return f"~~{stripped}~~" if stripped else ""
    if tag == "a":
        href = element.get("href", "")
        if not stripped or not href or "![" in stripped:
            return inner
        return f"[{stripped}]({href})"
    if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        level = int(tag[1])
        return f"\n\n{'#' * level} {stripped}\n\n" if stripped else ""
    if tag == "blockquote":
        quoted = "\n".join(f"> {line}" if line else ">" for line in stripped.splitlines())
        return f"\n\n{quoted}\n\n" if quoted else ""
    if tag in {"ul", "ol"}:
        lines = []
        items = [child for child in element if isinstance(child.tag, str) and child.tag.lower() == "li"]
        for index, item in enumerate(items, 1):
            item_text = render_markdown_children(item, depth + 1).strip()
            prefix = f"{index}." if tag == "ol" else "-"
            continuation = "\n".join(
                [item_text.splitlines()[0]]
                + ["  " + line for line in item_text.splitlines()[1:]]
            ) if item_text else ""
            if continuation:
                lines.append(f"{'  ' * depth}{prefix} {continuation}")
        return "\n\n" + "\n".join(lines) + "\n\n" if lines else ""
    if tag == "li":
        return inner
    if tag == "table":
        table_html = html.tostring(element, encoding="unicode", method="html")
        return f"\n\n{table_html}\n\n"
    if tag in BLOCK_TAGS:
        return f"\n\n{stripped}\n\n" if stripped else ""
    return inner


def normalize_markdown(value: str) -> str:
    value = value.replace("\r", "")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"(?<=[\u3400-\u9fff]) (?=[\u3400-\u9fff])", "", value)
    value = re.sub(r" +([，。！？；：、）】》])", r"\1", value)
    value = re.sub(r"([（【《]) +", r"\1", value)
    return value.strip() + "\n"


def approximate_word_count(value: str) -> int:
    return len(re.findall(r"[\u3400-\u9fff]|[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*", value))


def copy_cover(asset_dir: Path, article_dir: Path, remote_url: str) -> tuple[dict | None, list[str]]:
    warnings: list[str] = []
    cover_source = asset_dir / "0"
    if not cover_source.is_file():
        return None, ["未找到浏览器保存的本地封面文件"]
    try:
        info = image_info(cover_source)
    except Exception as exc:  # noqa: BLE001 - captured in audit output
        return None, [f"本地封面无法识别：{exc}"]
    cover_name = f"cover.{info['extension']}"
    shutil.copy2(cover_source, article_dir / cover_name)
    return {
        "path": cover_name,
        "remoteUrl": remote_url or None,
        "width": info["width"],
        "height": info["height"],
        "format": info["format"],
        "bytes": info["bytes"],
        "sha256": info["sha256"],
    }, warnings


def localize_images(
    content: etree._Element,
    page: Path,
    article_dir: Path,
    title: str,
) -> tuple[list[dict], int, list[str]]:
    images_dir = article_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    image_records: list[dict] = []
    warnings: list[str] = []
    hash_to_path: dict[str, str] = {}
    reference_count = 0

    for image in list(content.xpath(".//img")):
        reference_count += 1
        source_src = image.get("src", "")
        remote_src = image.get("data-src", "")
        source_alt = normalized_text(image.get("alt"))
        local_source = resolve_local_asset(page, source_src)

        if local_source is None:
            if remote_src.startswith(("http://", "https://")):
                image.set("src", remote_src)
                warnings.append(f"图片 {reference_count} 缺少本地文件，暂时保留远程地址")
            else:
                warnings.append(f"图片 {reference_count} 无可用本地或远程地址，已移除")
                remove_element(image)
            continue

        try:
            info = image_info(local_source)
        except Exception as exc:  # noqa: BLE001 - captured in audit output
            warnings.append(f"图片 {reference_count} 无法识别：{local_source.name}（{exc}）")
            remove_element(image)
            continue

        existing = hash_to_path.get(info["sha256"])
        if existing:
            relative_path = existing
        else:
            relative_path = f"images/image-{len(image_records) + 1:03d}.{info['extension']}"
            shutil.copy2(local_source, article_dir / relative_path)
            hash_to_path[info["sha256"]] = relative_path
            display_alt = source_alt
            if not display_alt or display_alt.lower() in {"图片", "image"}:
                display_alt = f"{title} — 图 {len(image_records) + 1}"
            image_records.append(
                {
                    "path": relative_path,
                    "sourceFile": local_source.name,
                    "remoteUrl": remote_src or None,
                    "sourceAlt": source_alt or None,
                    "alt": display_alt,
                    "width": info["width"],
                    "height": info["height"],
                    "format": info["format"],
                    "frames": info["frames"],
                    "bytes": info["bytes"],
                    "sha256": info["sha256"],
                }
            )

        record = next(item for item in image_records if item["path"] == relative_path)
        image.set("src", relative_path)
        image.set("alt", record["alt"])
        image.set("width", str(record["width"]))
        image.set("height", str(record["height"]))
        image.set("loading", "lazy")

    return image_records, reference_count, warnings


def article_html(
    title: str,
    description: str,
    account_name: str,
    author: str,
    published_at: str,
    display_date: str,
    original_url: str,
    content: etree._Element,
) -> str:
    content_inner = "\n".join(
        html.tostring(child, encoding="unicode", method="html", pretty_print=True)
        for child in content
    )
    description_html = (
        f"\n      <p>{html_std.escape(description)}</p>" if description else ""
    )
    byline = " · ".join(part for part in [author, account_name] if part)
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{html_std.escape(description, quote=True)}">
  <title>{html_std.escape(title)}</title>
</head>
<body>
  <article>
    <header>
      <h1>{html_std.escape(title)}</h1>
      <p>{html_std.escape(byline)} · <time datetime="{html_std.escape(published_at, quote=True)}">{html_std.escape(display_date)}</time></p>{description_html}
    </header>
    <main>
{content_inner}
    </main>
    <footer>
      <p><a href="{html_std.escape(original_url, quote=True)}">查看微信原文</a></p>
    </footer>
  </article>
</body>
</html>
"""


def article_markdown(metadata: dict, body_markdown: str) -> str:
    cover_path = metadata.get("coverImage", {}).get("path", "") if metadata.get("coverImage") else ""
    lines = [
        "---",
        f"id: {yaml_string(metadata['id'])}",
        f"slug: {yaml_string(metadata['slug'])}",
        f"title: {yaml_string(metadata['title'])}",
        f"description: {yaml_string(metadata['description'])}",
        f"accountName: {yaml_string(metadata['accountName'])}",
        f"author: {yaml_string(metadata['author'])}",
        f"publishedAt: {yaml_string(metadata['publishedAt'])}",
        f"originalUrl: {yaml_string(metadata['originalUrl'])}",
        f"coverImage: {yaml_string(cover_path)}",
        f"imageCount: {metadata['imageCount']}",
        "---",
        "",
        f"# {metadata['title']}",
        "",
        f"{metadata['author'] or metadata['accountName']} · {metadata['displayDate']}",
    ]
    if metadata["description"]:
        lines.extend(["", f"> {metadata['description']}"])
    lines.extend(["", body_markdown.rstrip(), "", f"[查看微信原文]({metadata['originalUrl']})", ""])
    return "\n".join(lines)


def process_article(page: Path, output_articles: Path) -> dict:
    parser = html.HTMLParser(encoding="utf-8", recover=True, remove_comments=False, huge_tree=True)
    document = html.fromstring(page.read_bytes(), parser=parser)
    number = article_number(page)
    slug = SLUGS.get(number, f"article-{number:02d}")
    article_dir = output_articles / slug
    article_dir.mkdir(parents=True, exist_ok=True)

    title = meta_property(document, "og:title") or xpath_text(document, '//*[@id="activity-name"]')
    description = meta_property(document, "og:description")
    account_name = xpath_text(document, '//*[@id="js_name"]')
    author = xpath_text(document, '//*[@id="js_author_name"]')
    publish_text = xpath_text(document, '//*[@id="publish_time"]')
    published_at, display_date = parse_publish_time(publish_text)
    original_url = meta_property(document, "og:url")
    cover_remote_url = meta_property(document, "og:image")
    content_matches = document.xpath('//*[@id="js_content"]')
    if not content_matches:
        raise ValueError("页面缺少 #js_content 正文节点")
    content = content_matches[0]

    asset_dir = page.with_name(f"{page.stem}_files")
    warnings: list[str] = []
    if not asset_dir.is_dir():
        warnings.append("未找到浏览器资源目录")

    images, image_reference_count, image_warnings = localize_images(
        content,
        page,
        article_dir,
        title,
    )
    warnings.extend(image_warnings)
    cover, cover_warnings = copy_cover(asset_dir, article_dir, cover_remote_url)
    warnings.extend(cover_warnings)

    clean_dom(content)
    body_text = normalized_text(content.text_content())
    body_markdown = normalize_markdown(render_markdown_children(content))
    word_count = approximate_word_count(body_text)
    article_id = stable_id(original_url, number)

    metadata = {
        "schemaVersion": "1.0",
        "id": article_id,
        "order": number,
        "slug": slug,
        "title": title,
        "description": description,
        "accountName": account_name,
        "author": author,
        "publishedAt": published_at,
        "displayDate": display_date,
        "originalUrl": original_url,
        "sourceFile": page.name,
        "sourceResourceDirectory": asset_dir.name,
        "sourceHtmlSha256": sha256_file(page),
        "coverImage": cover,
        "images": images,
        "imageCount": len(images),
        "imageReferenceCount": image_reference_count,
        "textLength": len(body_text),
        "wordCountApprox": word_count,
        "status": "success" if not warnings else "success_with_warnings",
        "warnings": warnings,
        "paths": {
            "markdown": "article.md",
            "html": "content.html",
            "metadata": "metadata.json",
        },
    }

    clean_html = article_html(
        title,
        description,
        account_name,
        author,
        published_at,
        display_date,
        original_url,
        content,
    )
    markdown = article_markdown(metadata, body_markdown)
    metadata["contentHtmlSha256"] = sha256_text(clean_html)
    metadata["markdownSha256"] = sha256_text(markdown)

    (article_dir / "content.html").write_text(clean_html, encoding="utf-8")
    (article_dir / "article.md").write_text(markdown, encoding="utf-8")
    (article_dir / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return metadata


def manifest_entry(metadata: dict) -> dict:
    slug = metadata["slug"]
    cover = metadata.get("coverImage")
    return {
        "id": metadata["id"],
        "order": metadata["order"],
        "slug": slug,
        "title": metadata["title"],
        "description": metadata["description"],
        "accountName": metadata["accountName"],
        "author": metadata["author"],
        "publishedAt": metadata["publishedAt"],
        "displayDate": metadata["displayDate"],
        "originalUrl": metadata["originalUrl"],
        "coverImage": f"articles/{slug}/{cover['path']}" if cover else None,
        "imageCount": metadata["imageCount"],
        "imageReferenceCount": metadata["imageReferenceCount"],
        "textLength": metadata["textLength"],
        "wordCountApprox": metadata["wordCountApprox"],
        "status": metadata["status"],
        "warnings": metadata["warnings"],
        "paths": {
            "markdown": f"articles/{slug}/article.md",
            "html": f"articles/{slug}/content.html",
            "metadata": f"articles/{slug}/metadata.json",
        },
    }


def write_manifest(output: Path, metadata_items: list[dict]) -> None:
    generated_at = datetime.now(CN_TZ).isoformat(timespec="seconds")
    entries = [manifest_entry(item) for item in sorted(metadata_items, key=lambda item: item["order"])]
    manifest = {
        "schemaVersion": "1.0",
        "generatedAt": generated_at,
        "source": "Wechat_Article browser-saved pages",
        "articleCount": len(entries),
        "articles": entries,
    }
    (output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    fieldnames = [
        "order",
        "id",
        "slug",
        "title",
        "description",
        "accountName",
        "author",
        "publishedAt",
        "originalUrl",
        "coverImage",
        "imageCount",
        "imageReferenceCount",
        "textLength",
        "wordCountApprox",
        "status",
        "markdownPath",
        "htmlPath",
        "metadataPath",
    ]
    with (output / "manifest.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for entry in entries:
            writer.writerow(
                {
                    **{key: entry.get(key, "") for key in fieldnames},
                    "markdownPath": entry["paths"]["markdown"],
                    "htmlPath": entry["paths"]["html"],
                    "metadataPath": entry["paths"]["metadata"],
                }
            )

    index_lines = [
        "# 阿柑少年微信文章内容索引",
        "",
        f"生成时间：{generated_at}",
        "",
        "| 序号 | 日期 | 标题 | 作者 | 图片 | 状态 |",
        "|---:|---|---|---|---:|---|",
    ]
    for entry in entries:
        index_lines.append(
            f"| {entry['order']} | {entry['displayDate']} | "
            f"[{markdown_table_cell(entry['title'])}]({entry['paths']['markdown']}) | "
            f"{markdown_table_cell(entry['author'] or entry['accountName'])} | "
            f"{entry['imageCount']} | {markdown_table_cell(entry['status'])} |"
        )
    (output / "INDEX.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")


def write_readme(output: Path, metadata_items: list[dict]) -> None:
    total_images = sum(item["imageCount"] for item in metadata_items)
    readme = f"""# 阿柑少年微信文章网站内容包

本目录由浏览器保存的 5 篇微信文章离线整理而成，可作为后续网站文章系统的内容源。

## 内容概览

- 文章：{len(metadata_items)} 篇
- 正文图片：{total_images} 个本地文件
- 每篇包含：Markdown、干净 HTML、JSON 元数据、封面和正文图片
- 全局索引：`manifest.json`、`manifest.csv`、`INDEX.md`
- 核验结果：`reports/audit.md`

## 使用建议

1. 内容系统优先读取 `manifest.json`。
2. 文章列表使用 `title`、`description`、`publishedAt`、`author`、`coverImage`。
3. 文章详情可渲染 `article.md`，或直接使用 `content.html` 中的语义化正文。
4. 图片路径均相对于各文章目录；迁移时保持文章目录整体结构即可。
5. `metadata.json` 中保留微信原文链接、源文件名、图片尺寸和哈希，方便追踪与去重。

## 内容边界

本内容包不包含微信导航、评论、推荐阅读、赞赏、公众号名片二维码、头像、追踪脚本或页面级 CSS/JS。作者主动插入正文、用于活动咨询的二维码属于文章内容，会正常保留。原始网页文件没有被移动或修改。
"""
    (output / "README.md").write_text(readme, encoding="utf-8")


def write_playbook(output: Path) -> None:
    playbook = """# 微信文章离线整理范本

## 适用场景

将浏览器“网页，全部”保存的微信公众号文章整理成可供网站使用的 HTML、Markdown、图片和元数据内容包。

## 标准流程

1. 每篇文章保存为主 HTML 和同名 `_files` 资源目录。
2. 先盘点主 HTML 数量、标题、日期、原链接和 `#js_content` 正文节点。
3. 只从 `#js_content` 提取正文；禁止直接复制完整微信页面。
4. 枚举正文实际引用的图片，优先使用浏览器保存的本地 `src` 文件。
5. 通过文件内容识别真实图片格式，按正文顺序规范命名并改写相对路径。
6. 将资源目录中的 `0` 大图作为封面候选；必须核验尺寸，排除页面级公众号二维码和头像。
7. 清除脚本、表单、iframe、微信专用属性和追踪节点，输出干净 HTML。
8. 同步生成 Markdown、单篇 JSON、全局 JSON/CSV/Markdown 索引。
9. 自动核验文章计数、正文非空、图片路径、脚本残留和绝对本机路径。
10. 原始网页保持只读；所有整理结果写入独立 `web-ready` 目录。

## 增量更新

- 新文章继续按编号保存到原始目录。
- 在转换脚本的 `SLUGS` 中增加稳定 slug，或允许脚本使用自动编号。
- 重新生成到一个空的暂存目录并完成核验，再替换交付目录。
- 以微信原文 URL 尾部标识作为稳定 ID，以图片 SHA-256 处理重复资源。

## 验收清单

- 输入主 HTML 数 = 输出文章目录数。
- 每篇都有 `article.md`、`content.html`、`metadata.json`。
- 标题、作者、发布时间、摘要和原链接一致。
- 所有本地图片引用存在，图片格式与扩展名一致。
- 输出不含 `<script>`、微信运行资源或 `/Users/...` 绝对路径。
- 失败和警告全部进入 `reports/audit.md`。
"""
    (output / "PLAYBOOK.md").write_text(playbook, encoding="utf-8")


def audit_package(output: Path, metadata_items: list[dict], input_count: int) -> dict:
    checks: list[dict] = []
    success = 0
    warning_count = 0

    for metadata in sorted(metadata_items, key=lambda item: item["order"]):
        article_dir = output / "articles" / metadata["slug"]
        required = [article_dir / "article.md", article_dir / "content.html", article_dir / "metadata.json"]
        missing_required = [path.name for path in required if not path.is_file()]
        clean_html = (article_dir / "content.html").read_text(encoding="utf-8") if not missing_required else ""
        markdown = (article_dir / "article.md").read_text(encoding="utf-8") if not missing_required else ""
        image_paths = [article_dir / image["path"] for image in metadata["images"]]
        missing_images = [str(path.relative_to(article_dir)) for path in image_paths if not path.is_file()]
        has_script = bool(re.search(r"<script\b", clean_html, re.I))
        has_absolute_path = "/Users/" in clean_html or "/Users/" in markdown
        has_wechat_residue = bool(
            re.search(r"data-src=|rich_media|js_content|wx_fmt=|mmbiz\.qpic\.cn", clean_html, re.I)
        )
        body_ok = metadata["textLength"] > 100
        article_ok = (
            not missing_required
            and not missing_images
            and not has_script
            and not has_absolute_path
            and not has_wechat_residue
            and body_ok
        )
        if article_ok:
            success += 1
        warning_count += len(metadata["warnings"])
        checks.append(
            {
                "slug": metadata["slug"],
                "title": metadata["title"],
                "ok": article_ok,
                "missingRequired": missing_required,
                "missingImages": missing_images,
                "hasScript": has_script,
                "hasAbsolutePath": has_absolute_path,
                "hasWechatResidue": has_wechat_residue,
                "bodyOk": body_ok,
                "warnings": metadata["warnings"],
            }
        )

    audit = {
        "inputCount": input_count,
        "outputCount": len(metadata_items),
        "passedCount": success,
        "failedCount": len(metadata_items) - success,
        "warningCount": warning_count,
        "totalImages": sum(item["imageCount"] for item in metadata_items),
        "checks": checks,
    }
    reports = output / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    (reports / "audit.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# 内容包完整性审计",
        "",
        f"- 输入文章：{input_count}",
        f"- 输出文章：{len(metadata_items)}",
        f"- 通过核心检查：{success}",
        f"- 未通过核心检查：{len(metadata_items) - success}",
        f"- 正文图片文件：{audit['totalImages']}",
        f"- 警告：{warning_count}",
        "",
        "| 文章 | 正文 | 必需文件 | 图片路径 | 脚本清除 | 微信残留清除 | 绝对路径清除 | 警告 |",
        "|---|---|---|---|---|---|---|---:|",
    ]
    for check in checks:
        lines.append(
            f"| {markdown_table_cell(check['title'])} | {'通过' if check['bodyOk'] else '失败'} | "
            f"{'通过' if not check['missingRequired'] else '失败'} | "
            f"{'通过' if not check['missingImages'] else '失败'} | "
            f"{'通过' if not check['hasScript'] else '失败'} | "
            f"{'通过' if not check['hasWechatResidue'] else '失败'} | "
            f"{'通过' if not check['hasAbsolutePath'] else '失败'} | {len(check['warnings'])} |"
        )
        for warning in check["warnings"]:
            lines.append(f"\n  - `{check['slug']}`：{warning}")
    (reports / "audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return audit


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    output = args.output.resolve()
    if not source.is_dir():
        raise SystemExit(f"源目录不存在：{source}")
    pages = sorted(source.glob("*.html"), key=article_number)
    if not pages:
        raise SystemExit("源目录中没有主 HTML 文件")
    if output.exists() and any(output.iterdir()):
        raise SystemExit(f"输出目录必须为空：{output}")

    output.mkdir(parents=True, exist_ok=True)
    output_articles = output / "articles"
    output_articles.mkdir(parents=True, exist_ok=True)

    metadata_items: list[dict] = []
    failures: list[dict] = []
    for page in pages:
        try:
            metadata_items.append(process_article(page, output_articles))
        except Exception as exc:  # noqa: BLE001 - continue batch and report
            failures.append({"sourceFile": page.name, "error": str(exc)})

    write_manifest(output, metadata_items)
    write_readme(output, metadata_items)
    write_playbook(output)
    audit = audit_package(output, metadata_items, len(pages))
    audit["processingFailures"] = failures
    (output / "reports" / "audit.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    summary = {
        "input": len(pages),
        "output": len(metadata_items),
        "passed": audit["passedCount"],
        "warnings": audit["warningCount"],
        "images": audit["totalImages"],
        "failures": failures,
        "outputPath": str(output),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if not failures and audit["passedCount"] == len(pages) else 1


if __name__ == "__main__":
    raise SystemExit(main())
