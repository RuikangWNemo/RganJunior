import type { LocalizedText } from '@/lib/brand';

export type HomeImage = {
  src: string;
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
  duration: LocalizedText;
  body: LocalizedText;
  href: string;
  image?: HomeImage;
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export const homeBeliefs: HomeBelief[] = [
  {
    number: '01',
    title: text('自然是最好的老师', 'Nature is the best teacher'),
    body: text(
      '走进森林、茶山和田野，重新打开身体、观察和感受。',
      'Forests, tea mountains, and fields reopen the body, helping young people understand the world through attention and feeling.',
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
    title: text('真实世界是最深刻的课堂', 'The real world is the deepest classroom'),
    body: text(
      '在食物、茶、运动、劳动和社区中，让知识回到真实生活里。',
      'Food, tea, movement, work, and community turn knowledge toward questions that matter in everyday life.',
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
      'Through teams, shared tasks, and real issues, young people grow from observers into voices and actors.',
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
  src: '/stories/summer-co-creation-camp-invitation/images/image-012.webp',
  width: 1080,
  height: 720,
  alt: text('青少年和伙伴在田野中一起劳动与学习', 'Young people and partners working and learning together in the field'),
  position: 'center 48%',
};

export const homePrograms: HomeProgram[] = [
  {
    title: text('生活体验营', 'Life Discovery Camp'),
    duration: text('2 天 1 夜', '2 days, 1 night'),
    body: text(
      '面向初次接触的家庭与孩子，轻量体验真实生活里的松弛、连接与力量。',
      'A gentle first experience for young people and families to find ease, connection, and strength in real daily life.',
    ),
    href: '/programs/life-experience-camp',
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-004.webp',
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
      'Team tasks, co-created questions, and low-carbon living build the trust needed for action that continues beyond camp.',
    ),
    href: '/programs/life-co-creation-camp',
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-020.webp',
      width: 1080,
      height: 810,
      alt: text('青少年和家庭围坐在一起喝茶交流', 'Young people and families sitting in a circle for tea and conversation'),
      position: 'center 45%',
    },
  },
  {
    title: text('行动小组', 'Action Group'),
    duration: text('持续 3 个月', 'A 3-month cycle'),
    body: text(
      '营后持续三个月，支持青少年把兴趣和感受延续到城市日常生活中。',
      'Camp is a beginning. Young people carry their interests home and continue observing, trying, and acting in daily life.',
    ),
    href: '/programs/action-group',
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-016.webp',
      width: 1080,
      height: 500,
      alt: text('阿柑少年伙伴围坐讨论自己的行动计划', "R-Gan Junior participants discussing their action plans"),
      position: 'center 48%',
    },
  },
  {
    title: text('青少年研究计划', 'Youth Research Programme'),
    duration: text('面向高年级', 'For older students'),
    body: text(
      '面向高年级学生，围绕社区的各类真实议题，用田野观察、访谈和写作，学习理解真实问题，形成自己的公共思考。',
      'Field observation, interviews, and writing help older students understand community questions and form a public point of view.',
    ),
    href: '/programs/public-projects',
    image: {
      src: '/archive/elements/photos/academic-forum/s16-ctb-poster-presentation.jpg',
      width: 1080,
      height: 720,
      alt: text('阿柑少年在论坛展示生态农业研究成果', "R-Gan Junior presenting ecological agriculture research at a forum"),
      position: 'center 46%',
    },
  },
];

export const homeSceneImages: HomeImage[] = [
  {
    src: '/images/home/life-camp-01-arrival-road.webp',
    width: 1920,
    height: 1440,
    alt: text('车队沿着林间小路驶入南宝山', 'A small convoy arriving in Nanbaoshan along a forest road'),
    position: 'center 50%',
  },
  {
    src: '/images/home/life-camp-02-forest-circle.webp',
    width: 1920,
    height: 1280,
    alt: text('青少年在森林里围坐交流', 'Young people gathering and talking in the forest'),
    position: 'center 57%',
  },
  {
    src: '/images/home/life-camp-03-basketball.webp',
    width: 1920,
    height: 1281,
    alt: text('青少年在山林球场上一起打篮球', 'Young people playing basketball together on a court in the mountains'),
    position: 'center 47%',
  },
  {
    src: '/images/home/life-camp-04-forest-tea.webp',
    width: 1920,
    height: 1280,
    alt: text('小队徒步后坐在林间喝茶休息', 'The group resting and sharing tea during a forest hike'),
    position: 'center 52%',
  },
  {
    src: '/images/home/life-camp-05-tea-craft.webp',
    width: 1920,
    height: 1441,
    alt: text('青少年在茶厂里一起学习制茶', 'Young people learning to make tea together at the tea workshop'),
    position: 'center 50%',
  },
  {
    src: '/images/home/life-camp-06-indoor-co-creation.webp',
    width: 1920,
    height: 1280,
    alt: text('青少年在室内聆听分享并共同创作', 'Young people listening and creating together indoors'),
    position: 'center 52%',
  },
  {
    src: '/images/home/life-camp-07-tea-field.webp',
    width: 1920,
    height: 1280,
    alt: text('青少年与陪伴者在茶山上观察茶树', 'A young person and mentor observing tea plants on the mountain'),
    position: 'center 51%',
  },
  {
    src: '/images/home/life-camp-08-tea-harvest.webp',
    width: 1920,
    height: 1280,
    alt: text('青少年完成采茶后在茶厂合影', 'Young people posing together with their tea harvest'),
    position: 'center 53%',
  },
  {
    src: '/images/home/life-camp-09-closing-gathering.webp',
    width: 1920,
    height: 1280,
    alt: text('生活共创营的青少年与家庭在收官时合影', 'Young people and families gathering for a closing photograph'),
    position: 'center 52%',
  },
];
