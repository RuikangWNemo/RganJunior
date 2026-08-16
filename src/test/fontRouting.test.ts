/// <reference types="node" />

import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const stylesheet = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const documentTemplate = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

const fontFaceFor = (family: string) => {
  const fontFaces: string[] = stylesheet.match(/@font-face\s*\{[^}]+\}/g) ?? [];
  return fontFaces.find((fontFace) => fontFace.includes(`font-family: '${family}'`)) ?? '';
};

describe('handwriting glyph routing', () => {
  it('routes every audited Tanuki-compatible pictogram code point away from Qiaoqiaohua', () => {
    const tanukiFontFace = fontFaceFor('TanukiMagic Web');
    const patchedCodePoints = [
      'U+4E00', // 一
      'U+4E91', // 云
      'U+4E94', // 五
      'U+4FE1', // 信
      'U+5973', // 女
      'U+5FC3', // 心
      'U+65B9', // 方
      'U+65E5', // 日
      'U+661F', // 星
      'U+6708', // 月
      'U+6C14', // 气
      'U+706B', // 火
      'U+821E', // 舞
      'U+82B1', // 花
      'U+89D2', // 角
      'U+97F3', // 音
    ];

    for (const codePoint of patchedCodePoints) {
      expect(tanukiFontFace).toContain(codePoint);
    }
  });

  it('routes simplified Han glyphs unavailable in Tanuki through the clean patch font', () => {
    const hanPatchFontFace = fontFaceFor('Rgan Han Glyph Patch');

    expect(hanPatchFontFace).toContain('U+4E24'); // 两
    expect(hanPatchFontFace).toContain('U+4EB2'); // 亲
    expect(hanPatchFontFace).toContain('U+5706'); // 圆
    expect(stylesheet).toContain(
      "'TanukiMagic Web', 'Rgan Han Glyph Patch', 'Qiaoqiaohua Critical', 'Qiaoqiaohua Handwriting Full'",
    );
  });

  it('loads the small critical subset first and keeps the complete font as a missing-glyph fallback', () => {
    const criticalFontFace = fontFaceFor('Qiaoqiaohua Critical');
    const fullFontFace = fontFaceFor('Qiaoqiaohua Handwriting Full');
    const criticalPath = resolve(process.cwd(), 'public/fonts/qiaoqiaohua-critical-v1.woff2');
    const fullPath = resolve(process.cwd(), 'public/fonts/qiaoqiaohua-handwriting-full-v1.woff2');

    expect(criticalFontFace).toContain('/fonts/qiaoqiaohua-critical-v1.woff2');
    expect(fullFontFace).toContain('/fonts/qiaoqiaohua-handwriting-full-v1.woff2');
    expect(criticalFontFace).toContain('font-display: swap');
    expect(fullFontFace).toContain('font-display: swap');
    expect(stylesheet.indexOf("'Qiaoqiaohua Critical'")).toBeLessThan(
      stylesheet.indexOf("'Qiaoqiaohua Handwriting Full'"),
    );
    expect(statSync(criticalPath).size).toBeLessThan(statSync(fullPath).size / 10);
    expect(documentTemplate).toContain('rel="preload"');
    expect(documentTemplate).toContain('/fonts/qiaoqiaohua-critical-v1.woff2');
    expect(documentTemplate).not.toContain('qiaoqiaohua-handwriting-full-v1.woff2');
    expect(stylesheet).not.toContain('fonts.googleapis.com');
  });
});
