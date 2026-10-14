import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Operator-only command. Generated assets are checked in; application builds need no encoder.
const root = resolve(import.meta.dirname, '..');
const outputDirectory = join(root, 'public/images/optimized');
const sourceDirectory = join(root, 'src');
const urls = new Set();

function discover(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'generated') discover(path);
    } else if (/\.(?:tsx?|css|html|json)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/\/(?:images|stories|archive)\/[\w./-]+\.(?:jpe?g|png|webp)\b/gi)) {
        if (!match[0].startsWith('/images/optimized/')) urls.add(match[0]);
      }
      if (entry.name === 'archiveContent.ts') {
        for (const match of source.matchAll(/['"]((?:photos|graphics)\/[\w./-]+\.(?:jpe?g|png|webp))['"]/gi)) {
          urls.add(`/archive/elements/${match[1]}`);
        }
      }
    }
  }
}

discover(sourceDirectory);
mkdirSync(outputDirectory, { recursive: true });
const manifest = {};
const statistics = [];

for (const url of [...urls].sort()) {
  const input = join(root, 'public', url);
  if (!existsSync(input)) continue; // References may point to remote-managed content.
  const originalBytes = statSync(input).size;
  if (/\.webp$/i.test(url) && originalBytes < 200_000) continue;
  const dimensions = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', input], { encoding: 'utf8' });
  const width = Number(dimensions.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(dimensions.match(/pixelHeight: (\d+)/)?.[1]);
  if (!width || !height) throw new Error(`Cannot read dimensions: ${url}`);
  const lossless = url.includes('/graphics/');
  const hash = createHash('sha256').update(readFileSync(input)).update(`webp-v1:${lossless ? 'lossless' : 'q76'}`).digest('hex').slice(0, 16);
  const widths = [...new Set([640, 1280, 1920].map((candidate) => Math.min(candidate, width)))];
  const candidates = [];
  for (const candidate of widths) {
    const filename = `${hash}-${candidate}.webp`;
    const output = join(outputDirectory, filename);
    if (!existsSync(output)) {
      execFileSync('cwebp', [
        '-quiet', ...(lossless ? ['-lossless'] : ['-q', '76']), '-metadata', 'none',
        ...(candidate < width ? ['-resize', String(candidate), '0'] : []), input, '-o', output,
      ]);
    }
    candidates.push({ src: `/images/optimized/${filename}`, width: candidate, bytes: statSync(output).size });
  }
  const defaultImage = candidates.find((candidate) => candidate.width >= Math.min(width, 1280)) ?? candidates.at(-1);
  if (defaultImage.bytes >= originalBytes) continue;
  manifest[url] = {
    src: defaultImage.src,
    srcSet: candidates.map((candidate) => `${candidate.src} ${candidate.width}w`).join(', '),
    width,
    height,
  };
  statistics.push({ source: url, originalBytes, defaultBytes: defaultImage.bytes, candidates });
}

mkdirSync(join(sourceDirectory, 'generated'), { recursive: true });
const retained = new Set(Object.values(manifest).flatMap((image) => image.srcSet.split(', ').map((candidate) => candidate.split(' ')[0].split('/').at(-1))));
for (const filename of readdirSync(outputDirectory)) {
  // This dedicated directory contains only generated assets; never touch original media.
  if (/^[a-f0-9]{16}-\d+\.webp$/.test(filename) && !retained.has(filename)) unlinkSync(join(outputDirectory, filename));
}
writeFileSync(join(sourceDirectory, 'generated/static-images.json'), `${JSON.stringify(manifest, null, 2)}\n`);
const cssPath = join(sourceDirectory, 'index.css');
writeFileSync(cssPath, readFileSync(cssPath, 'utf8').replace(
  /(\/\* WebP source: ([^\s]+) \*\/\s*)url\('[^']+'\)/g,
  (_, comment, source) => `${comment}url('${manifest[source]?.src ?? source}')`,
));
for (const image of [
  { input: 'src/assets/about-team/chengzi.png', output: 'src/assets/about-team/chengzi-512.webp', width: 512 },
  { input: 'src/assets/nate-founder-story-sunset.jpg', output: 'src/assets/nate-founder-story-sunset-1280.webp', width: 1280 },
  { input: 'src/assets/nate-founder-story-sunset.jpg', output: 'src/assets/nate-founder-story-sunset-640.webp', width: 640 },
  { input: 'src/assets/about-team-photo.jpg', output: 'src/assets/about-team-photo-1280.webp', width: 1280 },
  { input: 'src/assets/about-team-photo.jpg', output: 'src/assets/about-team-photo-640.webp', width: 640 },
  { input: 'src/assets/about-team/zhang-tianshi.webp', output: 'src/assets/about-team/zhang-tianshi-640.webp', width: 640 },
]) {
  const dimensions = execFileSync('sips', ['-g', 'pixelWidth', join(root, image.input)], { encoding: 'utf8' });
  if (Number(dimensions.match(/pixelWidth: (\d+)/)?.[1]) < image.width) {
    throw new Error(`Refusing to upscale ${image.input}`);
  }
  execFileSync('cwebp', ['-quiet', '-q', '76', '-metadata', 'none', '-resize', String(image.width), '0',
    join(root, image.input), '-o', join(root, image.output)]);
}
mkdirSync(join(root, 'outputs/image-loading-audit-2026-10-14'), { recursive: true });
writeFileSync(join(root, 'outputs/image-loading-audit-2026-10-14/webp-generation.json'), `${JSON.stringify(statistics, null, 2)}\n`);
const originals = statistics.reduce((sum, image) => sum + image.originalBytes, 0);
const defaults = statistics.reduce((sum, image) => sum + image.defaultBytes, 0);
console.log(`Generated ${statistics.length} image mappings: ${(originals / 1e6).toFixed(2)} MB → ${(defaults / 1e6).toFixed(2)} MB at default sizes.`);
