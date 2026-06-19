import type { LocalizedText } from '@/lib/brand';

export type ActionLayerId = 'mountain' | 'field' | 'urban-rural';
export type JoinAudienceId = 'join-youth' | 'join-parents' | 'join-partners';

export type ContentImage = {
  src: string;
  alt: LocalizedText;
  position?: string;
  contain?: boolean;
};

export type ActionLayerContent = {
  id: ActionLayerId;
  order: string;
  level: LocalizedText;
  title: LocalizedText;
  shortTitle: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  homeLine: LocalizedText;
  image: ContentImage;
  details: LocalizedText[];
  signals: LocalizedText[];
};

export type BeliefContent = {
  title: LocalizedText;
  description: LocalizedText;
};

export type JoinAudienceContent = {
  id: JoinAudienceId;
  trigger: LocalizedText;
  heading: LocalizedText;
  intro: LocalizedText;
  rows: Array<{
    label: LocalizedText;
    value: LocalizedText;
  }>;
  closing: LocalizedText;
};

export const siteBeliefs: BeliefContent[] = [
  {
    title: {
      zh: '自然是最好的老师',
      en: 'Nature is the best teacher',
    },
    description: {
      zh: '在自然中重新打开观察、感受与敬畏，找回身体里被城市生活遮蔽的安静力量。',
      en: 'In nature, young people reopen observation, feeling, and reverence, recovering the quiet strength that city life can cover over.',
    },
  },
  {
    title: {
      zh: '真实世界是最深刻的课堂',
      en: 'The real world is the deepest classroom',
    },
    description: {
      zh: '知识不只停留在书本里，而要回到土地、家庭、消费、社区和真实问题中被验证。',
      en: 'Knowledge should not remain on the page; it must be tested in land, families, consumption, community, and real problems.',
    },
  },
  {
    title: {
      zh: '青少年不是未来，而是正在发生的力量',
      en: 'Young people are not only the future',
    },
    description: {
      zh: '他们可以从观察者成为研究者、表达者和行动者，在当下参与社会与生态的修复。',
      en: 'They can move from observers to researchers, storytellers, and actors, joining social and ecological repair now.',
    },
  },
];

export const actionLayers: ActionLayerContent[] = [
  {
    id: 'mountain',
    order: '01',
    level: {
      zh: '基础层',
      en: 'Foundation Layer',
    },
    title: {
      zh: '山野探索',
      en: 'Mountain & Forest Exploration',
    },
    shortTitle: {
      zh: '山野',
      en: 'Mountain',
    },
    subtitle: {
      zh: '身心修复与感知重建',
      en: 'Restoring the senses and the body',
    },
    description: {
      zh: '回到森林、山路与真实自然，让被城市生活和学业压力钝化的五感重新打开，为后续田野行动储备身心能量。',
      en: 'Returning to forests, mountain paths, and living nature to reopen senses dulled by city life and academic pressure, preparing energy for later field action.',
    },
    homeLine: {
      zh: '先回到山野，重新听见身体和自然。',
      en: 'First return to the wild, and hear the body and nature again.',
    },
    image: {
      src: '/archive/elements/photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
      alt: {
        zh: '青少年在山谷里的再生设计营地合影',
        en: 'Youth group at a regenerative design camp in the valley',
      },
      position: 'center 52%',
    },
    details: [
      {
        zh: '森林、山路、泥土、树木与身体感知练习。',
        en: 'Forests, mountain routes, soil, trees, and body-awareness practice.',
      },
      {
        zh: '让焦虑和疲惫先回到身体，在自然中恢复稳定感。',
        en: 'Let anxiety and fatigue return to the body first, recovering steadiness in nature.',
      },
      {
        zh: '建立对完整生态系统的直觉，为田野研究打下感知基础。',
        en: 'Build an intuitive sense of whole ecosystems as the sensory base for field research.',
      },
    ],
    signals: [
      { zh: '感知', en: 'Senses' },
      { zh: '修复', en: 'Repair' },
      { zh: '自然经验', en: 'Nature' },
    ],
  },
  {
    id: 'field',
    order: '02',
    level: {
      zh: '中间层',
      en: 'Middle Layer',
    },
    title: {
      zh: '田野调查',
      en: 'Field Investigation',
    },
    shortTitle: {
      zh: '田野',
      en: 'Field',
    },
    subtitle: {
      zh: '真实问题调研与跨学科学习',
      en: 'Real-problem research and interdisciplinary learning',
    },
    description: {
      zh: '进入铁牛村、果园、家庭访谈与 CSA 场景，把自然感知转化为问题意识，用行为经济学、社会学与生态学理解真实社区。',
      en: 'Entering Tieniu Village, orchards, family interviews, and CSA settings, turning sensory experience into inquiry through behavioral economics, sociology, and ecology.',
    },
    homeLine: {
      zh: '再进入田野，把感受变成理解真实世界的能力。',
      en: 'Then enter the field, and turn feeling into the ability to understand real life.',
    },
    image: {
      src: '/archive/elements/photos/program-activities/s11-orchard-field-practice.jpg',
      alt: {
        zh: '青少年在果园中进行田野实践',
        en: 'Young people doing field practice in an orchard',
      },
      position: 'center 42%',
    },
    details: [
      {
        zh: '围绕生态农产品消费、价格弹性、信任机制与家庭决策进行调研。',
        en: 'Research ecological food consumption, price elasticity, trust mechanisms, and household decision-making.',
      },
      {
        zh: '把问卷、访谈、观察与真实购买场景放进同一张研究地图。',
        en: 'Place surveys, interviews, observations, and real purchase contexts on one research map.',
      },
      {
        zh: '让青少年从参观者成为研究者、记录者和提问者。',
        en: 'Help young people move from visitors to researchers, documenters, and question-askers.',
      },
    ],
    signals: [
      { zh: '调研', en: 'Research' },
      { zh: 'CSA', en: 'CSA' },
      { zh: '真实问题', en: 'Real Problems' },
    ],
  },
  {
    id: 'urban-rural',
    order: '03',
    level: {
      zh: '应用层',
      en: 'Application Layer',
    },
    title: {
      zh: '城乡行动与山野互动',
      en: 'Urban-Rural Action & Nature Interaction',
    },
    shortTitle: {
      zh: '城乡',
      en: 'Action',
    },
    subtitle: {
      zh: '城乡联动、社群行动与青少年发声',
      en: 'Urban-rural connection, community action, and youth voice',
    },
    description: {
      zh: '把田野调研转化为校园 CSA、生态社区共建、土壤改良和公共表达，让成长进入真实社会关系。',
      en: 'Turning field research into campus CSA, ecological community building, soil improvement, and public voice, so growth enters real social relationships.',
    },
    homeLine: {
      zh: '最后回到城乡行动，让成长进入真实社会关系。',
      en: 'Finally return to urban-rural action, where growth enters real social relationships.',
    },
    image: {
      src: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
      alt: {
        zh: '阿柑少年团队在青年研究论坛展示行动成果',
        en: "R'gan Junior team presenting action outcomes at a youth research forum",
      },
      position: 'center 42%',
    },
    details: [
      {
        zh: '连接校园、家庭、乡村和山野经验，形成可持续的行动网络。',
        en: 'Connect campus, family, village, and nature experience into an ongoing action network.',
      },
      {
        zh: '通过校园 CSA、传播倡导和社区服务，把研究变成真实影响。',
        en: 'Use campus CSA, advocacy, and community service to turn research into real impact.',
      },
      {
        zh: '让青少年成为生态转型的研究者、传播者和行动者。',
        en: 'Let young people become researchers, communicators, and actors in ecological transition.',
      },
    ],
    signals: [
      { zh: '行动', en: 'Action' },
      { zh: '发声', en: 'Voice' },
      { zh: '社群', en: 'Community' },
    ],
  },
];

export const impactProof = [
  {
    value: 'Top 3.6%',
    label: {
      zh: 'CTB 全球青年研究创新论坛',
      en: 'CTB Global Youth Research Forum',
    },
  },
  {
    value: 'YSA Journal',
    label: {
      zh: '研究成果发表',
      en: 'Research publication',
    },
  },
  {
    value: 'Claremont',
    label: {
      zh: '生态文明国际论坛发声',
      en: 'International eco-civilization forum voice',
    },
  },
  {
    value: 'Campus CSA',
    label: {
      zh: '校园生态消费实验',
      en: 'Campus ecological consumption experiment',
    },
  },
];

export const joinAudiences: JoinAudienceContent[] = [
  {
    id: 'join-youth',
    trigger: { zh: '成为阿柑少年', en: "Become R'gan Junior Youth" },
    heading: { zh: '成为阿柑少年', en: "Become R'gan Junior Youth" },
    intro: {
      zh: '如果你感到焦虑、迷茫、疲惫，但仍然渴望真实、自然与意义，阿柑少年欢迎你进入这段长期同行。',
      en: "If you feel anxious, lost, or exhausted, yet still long for what is real, natural, and meaningful, R'gan Junior welcomes you into this long companionship.",
    },
    rows: [
      {
        label: { zh: '山野', en: 'Mountain' },
        value: {
          zh: '在自然中恢复感受力和身体里的稳定感。',
          en: 'Recover sensitivity and bodily steadiness in nature.',
        },
      },
      {
        label: { zh: '田野', en: 'Field' },
        value: {
          zh: '进入真实社区，用研究理解复杂问题。',
          en: 'Enter real communities and use research to understand complex problems.',
        },
      },
      {
        label: { zh: '同行', en: 'Peers' },
        value: {
          zh: '遇见认知相近、愿意长期行动的伙伴。',
          en: 'Meet peers with shared cognition and long-term willingness to act.',
        },
      },
    ],
    closing: {
      zh: '填写表单，进入小规模深度探索。',
      en: 'Submit the form to enter the small-scale deep exploration stage.',
    },
  },
  {
    id: 'join-parents',
    trigger: { zh: '成为阿柑家长', en: "Become an R'gan Junior Parent" },
    heading: { zh: '成为阿柑家长', en: "Become an R'gan Junior Parent" },
    intro: {
      zh: '如果你希望孩子在真实世界中成长，而不是只被焦虑推着向前，欢迎先了解我们的路径、节奏与陪伴方式。',
      en: 'If you hope your child can grow in the real world instead of being pushed only by anxiety, we invite you to first understand our path, rhythm, and care.',
    },
    rows: [
      {
        label: { zh: '环境', en: 'Setting' },
        value: {
          zh: '真实社区、小规模同行和清晰边界。',
          en: 'Real community, small-scale companionship, and clear boundaries.',
        },
      },
      {
        label: { zh: '成长', en: 'Growth' },
        value: {
          zh: '从感知修复到研究能力，再到公共行动。',
          en: 'From sensory repair to research capacity, then to public action.',
        },
      },
      {
        label: { zh: '沟通', en: 'Communication' },
        value: {
          zh: '当前通过官方联系方式统一沟通，后续补充更多渠道。',
          en: 'Current communication happens through official contact channels, with more channels to follow.',
        },
      },
    ],
    closing: {
      zh: '填写表单，预约进一步沟通。',
      en: 'Submit the form to arrange a deeper conversation.',
    },
  },
  {
    id: 'join-partners',
    trigger: { zh: '成为合作伙伴', en: 'Become a Partner' },
    heading: { zh: '成为合作伙伴', en: 'Become a Partner' },
    intro: {
      zh: '如果你希望从研究、教育、来访或资源连接进入阿柑少年，这里是合作伙伴的入口。',
      en: "If you want to enter R'gan Junior through research, education, visits, or resource connection, this is the partner entry point.",
    },
    rows: [
      {
        label: { zh: '适合', en: 'For' },
        value: {
          zh: '学校、教育者、研究者、乡村社区伙伴与生态行动伙伴。',
          en: 'Schools, educators, researchers, rural community partners, and ecological action partners.',
        },
      },
      {
        label: { zh: '合作', en: 'Collaboration' },
        value: {
          zh: '可从田野来访、课程共创、研究交流或社群行动开始。',
          en: 'Begin with field visits, curriculum co-creation, research exchange, or community action.',
        },
      },
    ],
    closing: {
      zh: '填写表单，发起合作沟通。',
      en: 'Submit the form to start a collaboration conversation.',
    },
  },
];
