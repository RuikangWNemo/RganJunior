import natePortrait from '@/assets/about-team/nate-shi.webp';
import rosiePortrait from '@/assets/about-team/rossie-chen.webp';
import rubyPortrait from '@/assets/about-team/ruby-huang.webp';
import tianshiPortrait from '@/assets/about-team/zhang-tianshi.webp';
import chengziPortrait from '@/assets/about-team/chengzi.png';

// Public author slugs verified against the published article credits.
// Reuse the portraits already shown on About; never infer identity from an article image.
export const articleAuthorPortraits: Readonly<Record<string, string>> = {
  'nateshi-94403ff7': natePortrait,
  'article-author-ruorong': rosiePortrait,
  'article-author-ruoyin': rubyPortrait,
  'article-author-tianshi': tianshiPortrait,
  'article-author-chengzi': chengziPortrait,
};
