import type { LocalizedText } from '@/lib/brand';

export type ActionProgramId =
  | 'life-experience-camp'
  | 'life-co-creation-camp'
  | 'action-group'
  | 'public-projects';

export type ProgramImage = {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
};

export type ActionProgramOption = {
  id: ActionProgramId;
  path: string;
  detailPath: string;
  navTitle: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  image: ProgramImage;
  seoDescription: LocalizedText;
  meta: LocalizedText;
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export const actionPrograms: ActionProgramOption[] = [
  {
    id: 'life-experience-camp',
    path: '/programs#life-experience-camp',
    detailPath: '/programs/life-experience-camp',
    navTitle: text('生活体验营', 'Life Discovery Camp'),
    title: text('阿柑少年生活体验营', "R'gan Junior Life Discovery Camp"),
    subtitle: text('先住进生活，再认识彼此', 'Step into daily life and begin to connect'),
    summary: text(
      '用两天一夜走进铁牛村的自然、劳动与日常。为第一次接触阿柑少年的青少年和家庭，提供一个轻盈、真实而被好好照护的生活入口。',
      "A two-day, one-night introduction to nature, work, and everyday life in Tieniu Village for young people and families meeting R'gan Junior for the first time.",
    ),
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-004.webp',
      width: 1080,
      height: 721,
      alt: text('两位青少年在铁牛村菜园里体验劳动', 'Two young people working in a Tieniu Village garden'),
    },
    seoDescription: text(
      '了解阿柑少年两天一夜生活体验营的自然体验、真实劳动、家庭参与、安全照护、费用和常见问题。',
      "Learn about R'gan Junior's two-day Life Discovery Camp, including nature, real work, family participation, safety, fees, and frequently asked questions.",
    ),
    meta: text('2 天 1 夜', '2 days, 1 night'),
  },
  {
    id: 'life-co-creation-camp',
    path: '/programs#life-co-creation-camp',
    detailPath: '/programs/life-co-creation-camp',
    navTitle: text('生活共创营', 'Life Co-creation Camp'),
    title: text('阿柑少年生活共创营', "R'gan Junior Life Co-creation Camp"),
    subtitle: text('共同生活，也共同承担', 'Live together and share responsibility'),
    summary: text(
      '在五天四夜的连续相处中，青少年和家庭通过小队任务、低碳生活与议题共创建立信任，把“共同”变成一次真实、有责任的生活实践。',
      'Across five days and four nights, young people and families build trust through team tasks, low-carbon living, and co-creation, turning shared life into real responsibility.',
    ),
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-020.webp',
      width: 1080,
      height: 810,
      alt: text('青少年和家庭围坐在一起喝茶交流', 'Young people and families sitting together for tea and conversation'),
    },
    seoDescription: text(
      '了解阿柑少年五天四夜生活共创营的共同生活、小队任务、议题共创、安全照护、费用和常见问题。',
      "Learn about R'gan Junior's five-day Life Co-creation Camp, including shared living, team tasks, co-creation, safety, fees, and frequently asked questions.",
    ),
    meta: text('5 天 4 夜', '5 days, 4 nights'),
  },
  {
    id: 'action-group',
    path: '/programs#action-group',
    detailPath: '/programs/action-group',
    navTitle: text('行动小组', 'Action Group'),
    title: text('阿柑少年行动小组', "R'gan Junior Action Group"),
    subtitle: text('共同探索，耕耘社群', 'Explore together and cultivate community'),
    summary: text(
      '以三个月为一个行动周期，把营地中的相遇带回日常。伙伴通过共学、家庭实践、主题行动和分享，持续耕耘彼此支持的社群。',
      'Over a three-month cycle, participants carry camp relationships into daily life through shared learning, family practice, themed action, and reflection.',
    ),
    image: {
      src: '/stories/summer-co-creation-camp-invitation/images/image-016.webp',
      width: 1080,
      height: 500,
      alt: text('阿柑少年伙伴围绕不同主题分组共创', "R'gan Junior participants co-creating in theme groups"),
    },
    seoDescription: text(
      '了解阿柑少年行动小组三个月的持续行动路径、线上共学、家庭实践、线下共创和常见问题。',
      "Learn about the R'gan Junior Action Group's three-month pathway, online learning, family practice, in-person co-creation, and frequently asked questions.",
    ),
    meta: text('持续 3 个月', 'A 3-month cycle'),
  },
  {
    id: 'public-projects',
    path: '/programs#public-projects',
    detailPath: '/programs/public-projects',
    navTitle: text('青少年研究计划', 'Youth Research Programme'),
    title: text('青少年研究计划', 'Youth Research Programme'),
    subtitle: text('齐心协力，回馈社会', 'Work together and give back'),
    summary: text(
      '面向高年级青少年，围绕土地、家庭和公共生活中的真实议题开展访谈、问卷、田野记录与写作，形成自己的公共思考。',
      'For older students, the programme explores real questions about land, family, and public life through interviews, surveys, field notes, and writing.',
    ),
    image: {
      src: '/archive/elements/photos/academic-forum/s16-ctb-poster-presentation.jpg',
      width: 1080,
      height: 720,
      alt: text('阿柑少年在论坛展示可持续农业研究成果', "R'gan Junior presenting sustainable agriculture research at a forum"),
    },
    seoDescription: text(
      '了解阿柑少年青少年研究计划的议题方向、研究方法、田野实践、公共成果、合作方式和常见问题。',
      "Learn about R'gan Junior's Youth Research Programme, including topics, methods, fieldwork, public outcomes, collaboration, and frequently asked questions.",
    ),
    meta: text('面向高年级', 'For older students'),
  },
];

export const actionProgramIds = new Set<ActionProgramId>(actionPrograms.map((program) => program.id));

const legacyActionProgramAliases: Record<string, ActionProgramId> = {
  'life-camp': 'life-co-creation-camp',
};

export function resolveActionProgramId(value: string | null | undefined): ActionProgramId | undefined {
  if (!value) return undefined;
  if (actionProgramIds.has(value as ActionProgramId)) return value as ActionProgramId;
  return legacyActionProgramAliases[value];
}

export function getActionProgram(value: string | null | undefined): ActionProgramOption {
  const resolvedId = resolveActionProgramId(value);
  return actionPrograms.find((program) => program.id === resolvedId) ?? actionPrograms[0];
}

export function findActionProgram(value: string | null | undefined): ActionProgramOption | undefined {
  return actionPrograms.find((program) => program.id === value);
}

export function getActionInquiryPath(program: ActionProgramId): string {
  return `/programs/inquiry?program=${program}`;
}
