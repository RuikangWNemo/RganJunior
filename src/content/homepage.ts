import type { LocalizedText } from '@/lib/brand';

export type HomeImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
  alt: LocalizedText;
  position?: string;
};

export type HomeBelief = {
  number: string;
  title: LocalizedText;
  body: LocalizedText;
  image: HomeImage;
};

export type HomeProgram = {
  title: LocalizedText;
  duration?: LocalizedText;
  body: LocalizedText;
  href: string;
  image?: HomeImage;
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

const responsiveHomeScene = (src: string) => ({
  src: `${src.slice(0, -5)}-1280.webp`,
  srcSet: `${src.slice(0, -5)}-640.webp 640w, ${src.slice(0, -5)}-1280.webp 1280w`,
  sizes: '(max-width: 767px) 100vw, min(100vw, 1280px)',
});

export const homeBeliefs: HomeBelief[] = [
  {
    number: '01',
    title: text('自然是最好的老师', 'Nature is the best teacher'),
    body: text(
      '走进森林、茶山和田野，重新打开身体、观察和感受。',
      "Step into forests, tea-growing hills, and fields to reconnect with your body and renew your ability to observe and feel.",
    ),
    image: {
      src: '/images/home/belief-nature-teacher.webp',
      width: 560,
      height: 420,
      alt: text('阿柑少年在山林溪流边观察自然', "R-Gan Junior participants observing nature beside a mountain stream"),
      position: 'center 48%',
    },
  },
  {
    number: '02',
    title: text('真实世界是最深刻的课堂', "The Real World Is Our Most Powerful Classroom"),
    body: text(
      '在食物、茶、运动、劳动和社区中，让知识回到真实生活里。',
      "Through food, tea, physical activity, hands-on work, and community life, we connect knowledge with everyday experience.",
    ),
    image: {
      src: '/images/home/belief-real-world-classroom.webp',
      width: 560,
      height: 420,
      alt: text('阿柑少年在乡村与城市之间记录真实世界', "R-Gan Junior participants documenting life between village and city"),
      position: 'center 50%',
    },
  },
  {
    number: '03',
    title: text('青少年是当下正在发生的力量', 'Young people are a force already in motion'),
    body: text(
      '通过小队、任务和议题共创，从观察者成为表达者和行动者。',
      "Through teamwork, shared tasks, and collaborative exploration of real-world issues, young people move from observing to expressing their ideas and taking action.",
    ),
    image: {
      src: '/images/home/belief-young-people-now.webp',
      width: 560,
      height: 420,
      alt: text('一群阿柑少年一起种植、记录和表达', "A group of R-Gan Junior participants planting, documenting, and speaking"),
      position: 'center 46%',
    },
  },
];

export const homeBeliefFeatureImage: HomeImage = {
  src: '/images/home/belief-field-gardening-1280.webp',
  srcSet: '/images/home/belief-field-gardening-640.webp 640w, /images/home/belief-field-gardening-1280.webp 1280w',
  sizes: '(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(100vw - 4rem), 42vw',
  width: 1536,
  height: 1024,
  alt: text('青少年和伙伴在田野中一起劳动与学习', 'Young people and partners working and learning together in the field'),
  position: 'center 48%',
};

export const homePrograms: HomeProgram[] = [
  {
    title: text('生活体验营', "Life Immersion Camp"),
    duration: text('2 天 1 夜', '2 days, 1 night'),
    body: text(
      '面向初次接触的家庭与孩子，轻量体验真实生活里的松弛、连接与力量。',
      'A gentle introduction for families and young people new to the program, offering a sense of ease, connection, and strength through everyday life.',
    ),
    href: '/programs/life-experience-camp',
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-004.webp',
      srcSet: '/stories/summer-co-creation-camp-invitation/images/image-004-640.webp 640w, /stories/summer-co-creation-camp-invitation/images/image-004.webp 1080w',
      sizes: '(max-width: 767px) calc(100vw - 4rem), 56vw',
      width: 1080,
      height: 721,
      alt: text('两位青少年在铁牛村菜园里体验劳动', 'Two young people working in a Tieniu Village garden'),
      position: 'center 48%',
    },
  },
  {
    title: text('生活共创营', 'Life Co-creation Camp'),
    duration: text('5 天 4 夜', '5 days, 4 nights'),
    body: text(
      '假期 5 天 4 夜，通过小队任务、议题共创和低碳生活实践，建立情感与信任，为后续持续行动打下基础。',
      "Over five days and four nights during school breaks, team tasks, collaborative exploration of real-world issues, and low-carbon living build relationships and trust as a foundation for continued action.",
    ),
    href: '/programs/life-co-creation-camp',
    image: {
      src: '/images/programs/life-co-creation-camp-1280.webp',
      srcSet: '/images/programs/life-co-creation-camp-640.webp 640w, /images/programs/life-co-creation-camp-1280.webp 1280w',
      sizes: '(max-width: 767px) calc(100vw - 4rem), 56vw',
      width: 5552,
      height: 3701,
      alt: text('生活共创营伙伴们围绕自然创作成果合影', 'Life Co-creation Camp participants gathered around a collaborative nature artwork'),
      position: 'center 45%',
    },
  },
  {
    title: text('行动小组', 'Action Group'),
    body: text(
      '营后持续跟进与陪伴，支持青少年把兴趣和感受延续到城市日常生活中。',
      "Ongoing support after camp helps young people carry their interests and experiences into everyday city life.",
    ),
    href: '/programs/action-group',
    image: {
      src: '/images/programs/action-group-1280.webp',
      srcSet: '/images/programs/action-group-640.webp 640w, /images/programs/action-group-1280.webp 1280w',
      sizes: '(max-width: 767px) calc(100vw - 4rem), 56vw',
      width: 5346,
      height: 3564,
      alt: text('行动小组伙伴们带着竹篮走在山林道路上', 'Action Group participants walking along a mountain road with bamboo baskets'),
      position: 'center 48%',
    },
  },
  {
    title: text('青少年研究计划', "R-Gan Junior Research Program"),
    body: text(
      '面对感兴趣的青少年，围绕社区的各类真实议题，用田野观察、访谈和写作，学习理解真实问题，形成自己的公共思考。',
      "Young people interested in research explore real community issues through field observation, interviews, and writing, learning to understand those issues and develop their own perspectives on public life.",
    ),
    href: '/programs/public-projects',
    image: {
      src: '/images/programs/youth-research-programme-1280.webp',
      srcSet: '/images/programs/youth-research-programme-640.webp 640w, /images/programs/youth-research-programme-1280.webp 1280w',
      sizes: '(max-width: 767px) calc(100vw - 4rem), 56vw',
      width: 3168,
      height: 2113,
      alt: text('青少年研究计划团队在 CTB 研究创新论坛展示研究成果', "R-Gan Junior Research Program team presenting their work at the CTB Research and Innovation Forum"),
      position: 'center 46%',
    },
  },
];

// Keep the arrival-road aerial photograph first. New photos use locally encoded
// 640px and 1280px WebP variants in public/images/home.
export const homeSceneImages: HomeImage[] = [
  {
    ...responsiveHomeScene('/images/home/life-camp-01-arrival-road.webp'),
    width: 1920,
    height: 1440,
    alt: text('车队沿着林间小路驶入南宝山', 'A convoy arriving at Nanbao Mountain along a forest road'),
    position: 'center 50%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-misty-mountains-20261017.webp'),
    width: 1920,
    height: 1280,
    alt: text('云雾环绕山林与层叠的山峦', 'Mist drifting through forested mountain ridges'),
    position: 'center 55%',
  },
  {
    ...responsiveHomeScene('/images/programs/life-co-creation-camp.webp'),
    width: 5552,
    height: 3701,
    alt: text('营地伙伴围着共同完成的森林画卷合影', 'Camp participants gathered around the forest artwork they created together'),
    position: 'center 45%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-02-forest-circle.webp'),
    width: 1920,
    height: 1280,
    alt: text('青少年在森林里围坐交流', 'Young people gathering and talking in the forest'),
    position: 'center 57%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-03-basketball.webp'),
    width: 1920,
    height: 1281,
    alt: text('青少年在山林球场上一起打篮球', 'Young people playing basketball together on a court in the mountains'),
    position: 'center 47%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-07-tea-field.webp'),
    width: 1920,
    height: 1280,
    alt: text('青少年与陪伴者在茶山上观察茶树', 'Young people and their companions observing tea plants on a hillside'),
    position: 'center 51%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-tea-basket-20261017.webp'),
    width: 1440,
    height: 960,
    alt: text('手提竹篮里的新鲜茶叶与一朵淡紫色小花', 'Fresh tea leaves and a pale purple flower in a hand-held bamboo basket'),
    position: 'center 50%',
  },
  {
    src: '/images/about/methods/01/03-cooking-together.webp',
    width: 1920,
    height: 1280,
    alt: text('伙伴们在乡村厨房一起生火做饭', 'Camp participants tending the fire and cooking together in the village kitchen'),
    position: 'center 60%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-night-walk-20261017.webp'),
    width: 1440,
    height: 960,
    alt: text('伙伴们在路灯下结伴走过夜晚的山路', 'Companions walking together along a mountain road under streetlights at night'),
    position: 'center 50%',
  },
  {
    ...responsiveHomeScene('/images/home/life-camp-09-closing-gathering.webp'),
    width: 1920,
    height: 1280,
    alt: text('生活共创营的青少年与家庭在收官时合影', 'Young people and families at the closing of the Life Co-creation Camp'),
    position: 'center 52%',
  },
];
