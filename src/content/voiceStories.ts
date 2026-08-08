import type { LocalizedText } from '@/lib/brand';
import campInvitationHtml from './voices/summer-co-creation-camp-invitation.html?raw';
import nateStoryHtml from './voices/it-takes-a-village.html?raw';
import nateStoryEnglishHtml from './voices/it-takes-a-village.en.html?raw';
import ruorongStoryHtml from './voices/tea-connects-an-american-girl.html?raw';
import ruorongStoryEnglishHtml from './voices/tea-connects-an-american-girl.en.html?raw';
import ruoyinStoryHtml from './voices/tea-kitchen-and-summer.html?raw';
import ruoyinStoryEnglishHtml from './voices/tea-kitchen-and-summer.en.html?raw';
import tianshiStoryHtml from './voices/technology-ecology-stars.html?raw';
import tianshiStoryEnglishHtml from './voices/technology-ecology-stars.en.html?raw';

export type VoiceStoryKind = 'project-letter' | 'growth-story';

export interface VoiceStory {
  slug: string;
  order: number;
  kind: VoiceStoryKind;
  kindLabel: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  author: LocalizedText;
  displayDate: string;
  originalUrl: string;
  cover: string;
  coverAlt: LocalizedText;
  coverWidth: number;
  coverHeight: number;
  bodyHtml: LocalizedText;
}

export const voiceStories: VoiceStory[] = [
  {
    slug: 'summer-co-creation-camp-invitation',
    order: 1,
    kind: 'project-letter',
    kindLabel: { zh: '项目发起信', en: 'Project Letter' },
    title: {
      zh: '阿柑少年生活共创营｜来自阿柑少年的一份邀请',
      en: "R-Gan Junior Life Co-creation Camp: An Invitation",
    },
    description: {
      zh: '这个暑假，Nate 与天时邀请同龄人走进森林、田野和真实社区，在共同生活中重新理解土地、食物和自己的责任。',
      en: 'Nate and Tianshi invite their peers into forests, fields, and community life to reconnect with land, food, and responsibility.',
    },
    author: {
      zh: 'Nate、张天时与阿柑少年发起小组',
      en: "Nate, Tianshi, and the R-Gan Junior initiating group",
    },
    displayDate: '2026-07-13',
    originalUrl: 'https://mp.weixin.qq.com/s/tR160-ThkMAFroQFxSvtvQ',
    cover: '/stories/summer-co-creation-camp-invitation/cover.jpg',
    coverAlt: {
      zh: '两位少年站在菜园中的阿柑少年生活共创营封面',
      en: "R-Gan Junior camp cover showing two young people in a garden",
    },
    coverWidth: 1280,
    coverHeight: 545,
    bodyHtml: { zh: campInvitationHtml, en: campInvitationHtml },
  },
  {
    slug: 'it-takes-a-village',
    order: 2,
    kind: 'growth-story',
    kindLabel: { zh: '成长故事', en: 'Growth Story' },
    title: {
      zh: '一个孩子的成长，真的需要一整个村庄',
      en: 'It Really Takes a Village to Raise a Child',
    },
    description: {
      zh: '阿柑少年从一个城市孩子的孤独、一片森林的空气和许多人一次次的接纳与托举里慢慢长出来。',
      en: "R-Gan Junior grew from a city child's loneliness, the air of a forest, and the care of a whole community.",
    },
    author: { zh: 'Nate Shi', en: 'Nate Shi' },
    displayDate: '2026-07-15',
    originalUrl: 'https://mp.weixin.qq.com/s/UniZWyr_eC39kbla6HjJMg',
    cover: '/stories/it-takes-a-village/cover.jpg',
    coverAlt: {
      zh: 'Nate 在书架前闭目感受阳光的成长故事封面',
      en: 'Nate standing in sunlight beside bookshelves',
    },
    coverWidth: 1280,
    coverHeight: 544,
    bodyHtml: { zh: nateStoryHtml, en: nateStoryEnglishHtml },
  },
  {
    slug: 'tea-connects-an-american-girl',
    order: 3,
    kind: 'growth-story',
    kindLabel: { zh: '成长故事', en: 'Growth Story' },
    title: {
      zh: '一碗茶，如何让一个美国女孩走进阿柑少年',
      en: "How a Bowl of Tea Brought an American Girl to R-Gan Junior",
    },
    description: {
      zh: '若容从一碗茶和一次次回到中国的经历出发，找到与伙伴共同走进森林、乡村和内心的方式。',
      en: 'Ruorong traces how tea and repeated returns to China led her toward the forest, the village, and a shared youth community.',
    },
    author: { zh: '陈若容', en: 'Ruorong Chen' },
    displayDate: '2026-07-16',
    originalUrl: 'https://mp.weixin.qq.com/s/lkxawkrQ-iGeaetu3TClBw',
    cover: '/stories/tea-connects-an-american-girl/cover.jpg',
    coverAlt: {
      zh: '若容张开双臂面对乡村田野的成长故事封面',
      en: 'Ruorong looking over rural fields with her arms open',
    },
    coverWidth: 1280,
    coverHeight: 545,
    bodyHtml: { zh: ruorongStoryHtml, en: ruorongStoryEnglishHtml },
  },
  {
    slug: 'tea-kitchen-and-summer',
    order: 4,
    kind: 'growth-story',
    kindLabel: { zh: '成长故事', en: 'Growth Story' },
    title: {
      zh: '茶、厨房、阿柑少年，还有这个夏天',
      en: "Tea, the Kitchen, R-Gan Junior, and This Summer",
    },
    description: {
      zh: '若音在作茶、下厨和亲近自然的日常里放慢脚步，也邀请更多青少年重新感受生活。',
      en: 'Ruoyin slows down through tea making, cooking, and time in nature, then invites other young people to do the same.',
    },
    author: { zh: '黄若音', en: 'Ruoyin Huang' },
    displayDate: '2026-07-17',
    originalUrl: 'https://mp.weixin.qq.com/s/vGXstVJT7v-E_Y-ymVq6FA',
    cover: '/stories/tea-kitchen-and-summer/cover.jpg',
    coverAlt: {
      zh: '若音在树林中回望镜头的成长故事封面',
      en: 'Ruoyin looking toward the camera beneath trees',
    },
    coverWidth: 1280,
    coverHeight: 544,
    bodyHtml: { zh: ruoyinStoryHtml, en: ruoyinStoryEnglishHtml },
  },
  {
    slug: 'technology-ecology-stars',
    order: 5,
    kind: 'growth-story',
    kindLabel: { zh: '成长故事', en: 'Growth Story' },
    title: {
      zh: '在科技与生态之间寻找星辰大海',
      en: 'Finding a Sea of Stars Between Technology and Ecology',
    },
    description: {
      zh: '张天时希望把科技带回真实生活，把 AI 和数字工具带到土地现场，为阿柑少年提供来自科技与社群的力量。',
      en: "Tianshi wants to bring technology back into daily life and connect AI, digital tools, land, and R-Gan Junior's community.",
    },
    author: { zh: '张天时', en: 'Tianshi Zhang' },
    displayDate: '2026-07-18',
    originalUrl: 'https://mp.weixin.qq.com/s/wBHWZw3OASCSjO-9GMrmjg',
    cover: '/stories/technology-ecology-stars/cover.jpg',
    coverAlt: {
      zh: '张天时在一面展示墙前思考的成长故事封面',
      en: 'Tianshi reflecting in front of an exhibition wall',
    },
    coverWidth: 1280,
    coverHeight: 545,
    bodyHtml: { zh: tianshiStoryHtml, en: tianshiStoryEnglishHtml },
  },
];

export function getVoiceStory(slug: string | undefined): VoiceStory | undefined {
  return voiceStories.find((story) => story.slug === slug);
}

export function getNextVoiceStory(story: VoiceStory): VoiceStory {
  const currentIndex = voiceStories.findIndex((candidate) => candidate.slug === story.slug);
  return voiceStories[(currentIndex + 1) % voiceStories.length];
}
