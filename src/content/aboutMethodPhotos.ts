import type { AboutMethodPhoto } from '@/components/about/AboutMethodPhotoReel';

const photo = (
  src: string,
  width: number,
  height: number,
  zh: string,
  en: string,
  position?: string,
): AboutMethodPhoto => ({
  src,
  width,
  height,
  alt: { zh, en },
  position,
});

export const aboutMethodPhotoGroups: readonly (readonly AboutMethodPhoto[])[] = [
  [
    photo('/images/about/methods/01/01-shared-life.webp', 1919, 1279, '大人与孩子在菜地里一起劳作', 'An adult and child working together in a vegetable garden'),
    photo('/images/about/methods/01/02-mountain-basketball.webp', 1920, 1281, '青少年在南宝山的球场上一起打篮球', 'Young people playing basketball together in Nanbaoshan'),
    photo('/images/about/methods/01/03-cooking-together.webp', 1920, 1280, '伙伴们围着柴火灶学习做饭', 'Participants learning to cook together around a wood-fired stove'),
    photo('/images/about/methods/01/04-life-moment.webp', 1080, 810, '伙伴们在厨房一起准备食物', 'Participants preparing food together in the kitchen'),
    photo('/images/about/methods/01/05-life-portrait.webp', 1014, 1352, '伙伴坐在窗边安静地喝茶', 'A participant sharing a quiet tea moment beside the window', 'center 42%'),
  ],
  [
    photo('/images/about/methods/02/01-community-visit.webp', 1920, 1280, '社区伙伴在展板前分享实践经验', 'Community partners sharing their experience beside an exhibition board'),
    photo('/images/about/methods/02/02-community-field.webp', 1920, 1284, '社区伙伴围坐交流彼此的经验', 'Community partners sitting in a circle and exchanging experiences'),
    photo('/images/about/methods/02/03-community-conversation.webp', 1902, 1268, '不同年龄的社区伙伴在饭桌边相聚', 'Community members of different ages gathering around a shared table'),
    photo('/images/about/methods/02/04-community-practice.webp', 1920, 1281, '伙伴们在社区户外空间共同展示成果', 'Participants presenting their work together in an outdoor community space'),
    photo('/images/about/methods/02/05-community-observation.webp', 1539, 1029, '社区伙伴围着刚收获的蔬菜合影', 'Community partners gathering around freshly harvested vegetables'),
    photo('/images/about/methods/02/06-community-connection.webp', 1920, 1282, '青少年与成人伙伴在共创空间合影', 'Young people and adult partners gathering in a co-creation space'),
  ],
  [
    photo('/images/about/methods/03/01-issue-workshop.webp', 1080, 973, '茶席上的植物、花朵与观察记录', 'Plants, flowers, and observation notes arranged on a tea table'),
    photo('/images/about/methods/03/02-local-conversation.webp', 1280, 1920, '伙伴从地方食物与调味中观察生活议题', 'A participant exploring everyday questions through local food and flavors', 'center 48%'),
    photo('/images/about/methods/03/03-farming-practice.webp', 1280, 1920, '伙伴们在田地里一起进行农耕实践', 'Participants working together during a farming practice', 'center 48%'),
    photo('/images/about/methods/03/04-field-inquiry.webp', 1440, 1920, '茶山与农田构成的真实研究现场', 'Tea fields and farmland forming a real-world research site', 'center 52%'),
    photo('/images/about/methods/03/05-public-question.webp', 1440, 1920, '茶树新叶呈现生态农业的细节', 'New tea leaves revealing the details of ecological agriculture', 'center 50%'),
    photo('/images/about/methods/03/06-shared-research.webp', 1080, 720, '柑橘树与果实成为田野观察对象', 'Citrus trees and fruit becoming subjects of field observation'),
    photo('/images/about/methods/03/07-group-reflection.webp', 1920, 1080, '云雾、茶山与社区构成相互连接的生态现场', 'Clouds, tea mountains, and community forming an interconnected ecological site'),
  ],
  [
    photo('/images/about/methods/04/01-youth-led-moment.webp', 1920, 1281, '青少年向伙伴展示自己的观察记录', 'A young person presenting their observations to the group'),
    photo('/images/about/methods/04/02-youth-led-team.webp', 1920, 1281, '青少年与陪伴者一起整理并表达想法', 'A young person and mentor organizing and expressing ideas together'),
    photo('/images/about/methods/04/03-youth-led-action.webp', 1920, 1280, '青少年围坐讨论并共同作出决定', 'Young people discussing and making decisions in a circle'),
    photo('/images/about/methods/04/04-cooking-together.webp', 1920, 1281, '青少年在厨房分工完成共同任务', 'Young people sharing roles to complete a kitchen task'),
    photo('/images/about/methods/04/05-tea-harvest.webp', 1920, 1280, '青少年背着工具走向茶山实践现场', 'Young people carrying their tools toward a tea-field practice'),
    photo('/images/about/methods/04/06-co-creation-one.webp', 1920, 1282, '青少年趴在地板上记录小组讨论', 'Young people documenting their group discussion on the floor'),
    photo('/images/about/methods/04/07-co-creation-two.webp', 1920, 1280, '青少年用物件和图卡共同梳理议题', 'Young people mapping an issue together with objects and cards'),
    photo('/images/about/methods/04/08-farming-action.webp', 1280, 1920, '青少年在田地里观察并参与劳作', 'Young people observing and taking part in work in the field', 'center 46%'),
    photo('/images/about/methods/04/09-closing-reflection.webp', 1920, 1281, '青少年一起完成一顿饭的烹饪', 'Young people cooking a shared meal together'),
  ],
] as const;
