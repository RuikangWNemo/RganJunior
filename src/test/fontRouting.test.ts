/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const stylesheet = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

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
      "'TanukiMagic Web', 'Rgan Han Glyph Patch', 'Qiaoqiaohua Handwriting'",
    );
  });
});
