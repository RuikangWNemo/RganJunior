import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fontSource = resolve(root, 'public/fonts/qiaoqiaohua-handwriting-full-v1.woff2');
const fontOutput = resolve(root, 'public/fonts/qiaoqiaohua-critical-v1.woff2');

const criticalTextInputs = [
  'index.html',
  'src/pages/Index.tsx',
  'src/components/Layout.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/components/BrandWordmark.tsx',
  'src/components/home',
  'src/content/homepage.ts',
  'src/content/actionPrograms.ts',
  'src/lib/brand.ts',
];

const responsiveImages = [
  ...Array.from({ length: 9 }, (_, index) => ({
    input: `public/images/home/life-camp-${String(index + 1).padStart(2, '0')}-${[
      'arrival-road',
      'forest-circle',
      'basketball',
      'forest-tea',
      'tea-craft',
      'indoor-co-creation',
      'tea-field',
      'tea-harvest',
      'closing-gathering',
    ][index]}.webp`,
    widths: [640, 1280],
  })),
  {
    input: 'public/stories/summer-co-creation-camp-invitation/images/image-004.webp',
    widths: [640],
  },
  { input: 'public/images/programs/life-co-creation-camp.jpg', widths: [640, 1280] },
  { input: 'public/images/programs/action-group.jpg', widths: [640, 1280] },
  { input: 'public/images/programs/youth-research-programme.jpg', widths: [640, 1280] },
  { input: 'public/images/home/belief-field-gardening.png', widths: [640, 1280] },
  { input: 'src/assets/nate-founder-portrait.jpg', widths: [640, 1280] },
];

function sourceFiles(path) {
  const absolutePath = resolve(root, path);
  if (!statSync(absolutePath).isDirectory()) return [absolutePath];
  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = join(absolutePath, entry.name);
    if (entry.isDirectory()) return sourceFiles(relative(root, child));
    return /\.(?:ts|tsx|html)$/.test(entry.name) ? [child] : [];
  });
}

function criticalUnicodes() {
  const characters = new Set();
  for (const input of criticalTextInputs.flatMap(sourceFiles)) {
    for (const character of readFileSync(input, 'utf8')) {
      const codePoint = character.codePointAt(0);
      if (codePoint && codePoint > 0x7f) characters.add(codePoint);
    }
  }
  return [...characters]
    .sort((left, right) => left - right)
    .map((codePoint) => `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(',');
}

function buildCriticalFont() {
  execFileSync('pyftsubset', [
    fontSource,
    `--output-file=${fontOutput}`,
    `--unicodes=${criticalUnicodes()}`,
    '--flavor=woff2',
    '--layout-features=*',
    '--glyph-names',
    '--symbol-cmap',
    '--legacy-cmap',
    '--notdef-glyph',
    '--notdef-outline',
    '--recommended-glyphs',
    '--name-IDs=*',
    '--name-legacy',
    '--name-languages=*',
  ], { stdio: 'inherit' });
}

function outputFor(input, width) {
  const extension = extname(input);
  return `${input.slice(0, -extension.length)}-${width}.webp`;
}

function buildResponsiveImages() {
  for (const image of responsiveImages) {
    const input = resolve(root, image.input);
    for (const width of image.widths) {
      const output = resolve(root, outputFor(image.input, width));
      mkdirSync(dirname(output), { recursive: true });
      execFileSync('cwebp', [
        '-quiet',
        '-mt',
        '-q',
        '76',
        '-metadata',
        'none',
        '-resize',
        String(width),
        '0',
        input,
        '-o',
        output,
      ], { stdio: 'inherit' });
    }
  }
}

buildCriticalFont();
buildResponsiveImages();
