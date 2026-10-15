import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { JSDOM } from 'jsdom';
import { createFieldNoteSnapshot } from '../src/lib/field-note-document/server.js';

// Local-only content preparation; never connects to a database or publishes.
const editor = ServerBlockNoteEditor.create();
const root = resolve(import.meta.dirname, '..');
const downloads = process.argv[2];
if (!downloads) throw new Error('Usage: npx tsx scripts/prepare-author-articles.ts /path/to/Downloads');
const stories = [
  { slug: 'believe-and-see-camp-review', authorSlug: 'nate', authorName: 'Nate-液态氧', requiresAccount: true, title: '相信就会看见 | 阿柑少年生活共创营回顾', folder: '相信就会看见 _ 阿柑少年生活共创营回顾' },
  { slug: 'chengzi-camp-letter', authorSlug: 'chengzi', authorName: '橙子', title: '少年来信｜“橙子”写在阿柑少年生活共创营后', folder: '少年来信｜“橙子”写在阿柑少年生活共创营后' },
  { slug: 'it-takes-a-village', authorSlug: 'nate', authorName: 'Nate-液态氧', requiresAccount: true, title: '一个孩子的成长，真的需要一整个村庄' },
  { slug: 'tea-connects-an-american-girl', authorSlug: 'ruorong', authorName: '陈若容', title: '一碗茶，如何让一个美国女孩走进阿柑少年' },
  { slug: 'tea-kitchen-and-summer', authorSlug: 'ruoyin', authorName: '黄若音', title: '茶、厨房、阿柑少年，还有这个夏天' },
  { slug: 'technology-ecology-stars', authorSlug: 'tianshi', authorName: '张天时', title: '在科技与生态之间寻找星辰大海' },
];
const result = [];
for (const story of stories) {
  let blocks;
  if (story.folder) {
    const source = resolve(downloads, story.folder);
    const target = resolve(root, 'public/stories', story.slug);
    await mkdir(target, { recursive: true });
    await cp(resolve(source, 'images'), resolve(target, 'images'), { recursive: true });
    const markdown = (await readFile(resolve(source, 'article.md'), 'utf8'))
      .replace(/^# .*\n+/, '')
      .replaceAll('](images/', `](/stories/${story.slug}/images/`)
      .replace(/\*\*\*\*/g, '');
    blocks = await editor.tryParseMarkdownToBlocks(markdown);
  } else {
    const html = await readFile(resolve(root, `src/content/voices/${story.slug}.html`), 'utf8');
    const dom = new JSDOM(html);
    const fragments: string[] = [];
    // BlockNote treats a figure as one media block. Flatten editorial groups
    // into individual images and captions before importing the editable draft.
    const walk = (node: Node) => {
      if (node.nodeType === 3) {
        if (node.textContent?.trim()) {
          const p = dom.window.document.createElement('p');
          p.textContent = node.textContent;
          fragments.push(p.outerHTML);
        }
        return;
      }
      const element = node as Element;
      const tag = element.tagName?.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'img'].includes(tag)) {
        fragments.push(element.outerHTML);
      } else if (tag === 'figcaption') {
        fragments.push(`<p>${element.innerHTML}</p>`);
      } else {
        node.childNodes.forEach(walk);
      }
    };
    walk(dom.window.document.body as unknown as Node);
    blocks = await editor.tryParseHTMLToBlocks(fragments.join('\n'));
    const sourceImages = dom.window.document.querySelectorAll('img').length;
    const blockImages = blocks.filter((block) => block.type === 'image').length;
    if (sourceImages !== blockImages) throw new Error(`${story.slug}: image count changed (${sourceImages} -> ${blockImages})`);
    dom.window.close();
  }
  const snapshot = await createFieldNoteSnapshot(blocks);
  for (const match of snapshot.html.matchAll(/src="(\/[^"?]+)"/g)) {
    await access(resolve(root, 'public', match[1].slice(1)));
  }
  // Stable IDs keep regenerated artifacts reviewable.
  let index = 0;
  const stable = JSON.parse(JSON.stringify(snapshot.blocks), (key, value) => key === 'id' ? `${story.slug}-${++index}` : value);
  result.push({ slug: story.slug, authorSlug: story.authorSlug, authorName: story.authorName, requiresAccount: story.requiresAccount ?? false, title: story.title, excerpt: snapshot.plainText.replace(/\s+/g, ' ').slice(0, 140), content: snapshot.plainText, contentHtml: snapshot.html, contentJson: stable });
}
await mkdir(resolve(root, 'src/content/article-imports'), { recursive: true });
await writeFile(resolve(root, 'src/content/article-imports/catalog.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`Prepared ${result.length} articles with validated local image references.`);
