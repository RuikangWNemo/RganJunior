import type { LocalizedText } from '@/lib/brand';

export type ImpactMetric = {
  id: string;
  value: string;
  label: LocalizedText;
  detail: LocalizedText;
  observedAt: string;
  sourceLabel: LocalizedText;
};

export type ImpactRelationship = {
  id: 'family' | 'peers' | 'place' | 'public';
  title: LocalizedText;
  description: LocalizedText;
};

export type ImpactGrowthTrack = {
  id: 'youth' | 'parents';
  title: LocalizedText;
  intro: LocalizedText;
  observationFields: LocalizedText[];
};

export type ImpactAction = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
  dateLabel: LocalizedText;
};

export type ImpactRhythm = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type ImpactEvidence = {
  id: string;
  category: 'competition' | 'publication' | 'forum';
  categoryLabel: LocalizedText;
  date: string;
  title: LocalizedText;
  summary: LocalizedText;
  facts: LocalizedText[];
  image: string;
  imageAlt: LocalizedText;
  secondaryImage?: string;
  secondaryImageAlt?: LocalizedText;
  sourceLabel: LocalizedText;
};

export type ImpactSnapshot = {
  verifiedAt: string;
  metrics: ImpactMetric[];
  relationships: ImpactRelationship[];
  growthTracks: ImpactGrowthTrack[];
  actions: ImpactAction[];
  rhythm: ImpactRhythm[];
  evidence: ImpactEvidence[];
};

export const impactSnapshot: ImpactSnapshot = {
  verifiedAt: '2026-08-07',
  metrics: [
    {
      id: 'participants-2023',
      value: '28',
      label: { zh: '名同学及家长参与', en: 'students and parents joined' },
      detail: {
        zh: '2023 年 10 月，为同龄人设计的可持续农业活动记录。',
        en: "A record of a sustainable agriculture activity designed for peers in October 2023.",
      },
      observedAt: '2023.10',
      sourceLabel: { zh: '阿柑少年 2.0 项目记录', en: "R-Gan Junior 2.0 project record" },
    },
  ],
  relationships: [
    {
      id: 'family',
      title: { zh: '家庭', en: 'Family' },
      description: {
        zh: '把营地与田野中的问题带回饮食、消费和陪伴等日常选择。',
        en: 'Bring questions from camp and fieldwork into daily choices around food, consumption, and care.',
      },
    },
    {
      id: 'peers',
      title: { zh: '伙伴', en: 'Peers' },
      description: {
        zh: '在共同生活、协作和复盘中学习表达，也学习回应别人。',
        en: 'Learn to speak and respond to others through shared life, collaboration, and reflection.',
      },
    },
    {
      id: 'place',
      title: { zh: '土地与社区', en: 'Land and community' },
      description: {
        zh: '让问题回到果园、村庄、劳动与真实生活条件中。',
        en: 'Return questions to orchards, villages, labor, and the conditions of real life.',
      },
    },
    {
      id: 'public',
      title: { zh: '公共行动', en: 'Public action' },
      description: {
        zh: '把观察整理成研究、表达、服务或可以继续的小行动。',
        en: 'Turn observation into research, communication, service, or a small action that can continue.',
      },
    },
  ],
  growthTracks: [
    {
      id: 'youth',
      title: { zh: '成长故事', en: 'Growth stories' },
      intro: {
        zh: '记录孩子从第一次参加，到后续继续参与中的真实变化。成长不会被一次活动结果概括，而会放回时间和生活里被看见。',
        en: 'We record real changes from a young person’s first program through the ways they continue participating. Growth is seen over time and in daily life, not reduced to one activity outcome.',
      },
      observationFields: [
        { zh: '孩子的原话', en: 'The young person’s own words' },
        { zh: '小队任务', en: 'Team tasks' },
        { zh: '行动卡', en: 'Action cards' },
        { zh: '一个被看见的变化', en: 'One change that was noticed' },
        { zh: '营后愿意继续做的一件小事', en: 'One small action they choose to continue afterward' },
      ],
    },
    {
      id: 'parents',
      title: { zh: '家庭观察', en: 'Family observation' },
      intro: {
        zh: '记录家长看到的孩子变化，以及家庭愿意如何继续支持。这里呈现观察的方法，不公开未经授权的家庭细节。',
        en: "We record the changes parents notice in their child and how they hope to continue supporting them. Here, we explain how we gather those observations; family details are shared only with permission.",
      },
      observationFields: [
        { zh: '我看到孩子的一个变化是：', en: 'One change I have seen in my child is:' },
        { zh: '我最被孩子打动的一点是：', en: 'What moved me most about my child is:' },
        { zh: '我愿意支持他／她继续做的一件事是：', en: 'One thing I am willing to support them in continuing is:' },
      ],
    },
  ],
  actions: [
    {
      id: 'orchard-practice',
      title: { zh: '进入果园劳动', en: 'Work in the orchard' },
      description: {
        zh: '从土地和劳动出发，理解食物并不是抽象的商品。',
        en: 'Begin with land and labor, and see that food is more than an abstract product.',
      },
      image: '/archive/elements/photos/program-activities/s11-orchard-field-practice.jpg',
      imageAlt: { zh: '少年在果园中进行田野劳动', en: "A young participant working in an orchard" },
      dateLabel: { zh: '阿柑少年 1.0 记录', en: "R-Gan Junior 1.0 record" },
    },
    {
      id: 'community-cleanup',
      title: { zh: '参与社区清洁', en: 'Join community cleanup' },
      description: {
        zh: '让公共责任从讨论落到身边可以完成的具体事情。',
        en: "Put public responsibility into practice through small, concrete tasks close to home.",
      },
      image: '/archive/elements/photos/program-activities/s11-community-service-cleanup.jpg',
      imageAlt: { zh: '孩子与伙伴一起参与社区清洁', en: 'Young people and partners taking part in community cleanup' },
      dateLabel: { zh: '阿柑少年 1.0 记录', en: "R-Gan Junior 1.0 record" },
    },
    {
      id: 'research-presentation',
      title: { zh: '把研究讲给别人听', en: "Share research with others" },
      description: {
        zh: '把问卷、观察和实践整理成可以被提问的公开表达。',
        en: 'Turn surveys, observation, and practice into public work that others can question.',
      },
      image: '/archive/elements/photos/academic-forum/s16-ctb-poster-presentation.jpg',
      imageAlt: { zh: '青少年在 CTB 论坛进行研究海报展示', en: 'Young people presenting a research poster at the CTB forum' },
      dateLabel: { zh: 'CTB 论坛，2024', en: 'CTB forum, 2024' },
    },
    {
      id: 'shared-practice',
      title: { zh: '把行动放进共同生活', en: 'Practice through shared life' },
      description: {
        zh: '在乡村实践与共同创作中，继续练习协作和回应真实需要。',
        en: 'Keep practicing collaboration and responding to real needs through rural work and co-creation.',
      },
      image: '/archive/elements/photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
      imageAlt: { zh: '铁牛青年乡建实践营参与者合影', en: "Participants in the Tieniu Youth Rural Development Camp" },
      dateLabel: { zh: '铁牛青年乡建实践营，2025', en: "Tieniu Youth Rural Development Camp, 2025" },
    },
  ],
  rhythm: [
    {
      id: 'meet',
      title: { zh: '线上相遇', en: 'Meet online' },
      description: {
        zh: '围绕真实经历提出问题，与伙伴确认这一阶段想继续做的事。',
        en: 'Begin with real experience, form questions, and decide what to continue with peers.',
      },
    },
    {
      id: 'practice',
      title: { zh: '个人与家庭实践', en: "Individual and family activities" },
      description: {
        zh: '把七日挑战、低碳生活或家庭小行动带回日常，并留下过程记录。',
        en: 'Bring a seven-day challenge, low-carbon habit, or family action into daily life and record the process.',
      },
    },
    {
      id: 'reflect',
      title: { zh: '阶段分享', en: 'Share and reflect' },
      description: {
        zh: '整理发生了什么、哪里没有做到，以及下一次愿意怎样继续。',
        en: 'Review what happened, what did not work, and how the next attempt can continue.',
      },
    },
  ],
  evidence: [
    {
      id: 'ctb-global-forum',
      category: 'competition',
      categoryLabel: { zh: '竞赛', en: 'Competition' },
      date: '2024.02',
      title: { zh: 'CTB 全球青年研究创新论坛', en: "CTB Global Youth Research and Innovation Forum" },
      summary: {
        zh: '围绕青少年参与可持续农业的研究，从全国论坛继续进入全球英文论坛。',
        en: "The research project on youth participation in sustainable agriculture advanced from the national forum to the CTB global forum, held in English.",
      },
      facts: [
        { zh: '从 2,000+ 支参赛队伍中进入前 72 名', en: 'Advanced to the top 72 among more than 2,000 teams' },
        { zh: '留有 Most Popular Project 奖牌实物记录', en: 'Physical record of a Most Popular Project medal' },
      ],
      image: '/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg',
      imageAlt: { zh: '阿柑少年团队在 CTB 青年研究创新论坛展位合影', en: "R-Gan Junior team at the CTB youth research forum booth" },
      secondaryImage: '/archive/elements/photos/academic-forum/s16-ctb-award-medal.jpg',
      secondaryImageAlt: { zh: 'CTB Most Popular Project 奖牌', en: 'CTB Most Popular Project medal' },
      sourceLabel: { zh: 'CTB 论坛现场与项目记录', en: 'CTB forum and project records' },
    },
    {
      id: 'ysa-journal',
      category: 'publication',
      categoryLabel: { zh: '发表', en: 'Publication' },
      date: '2024',
      title: { zh: 'YSA Journal 论文发表', en: 'YSA Journal publication' },
      summary: {
        zh: '研究成果整理为中英文论文，讨论青少年如何参与可持续农业与乡村发展。',
        en: "The research was written up as a paper on youth participation in sustainable agriculture and rural development, with Chinese and English abstracts.",
      },
      facts: [
        { zh: '论文包含中英文摘要', en: 'The paper includes Chinese and English abstracts' },
        { zh: '初步调研关注 11-15 岁青少年', en: 'Initial research focused on young people aged 11-15' },
      ],
      image: '/archive/elements/graphics/publications/s17-ysa-journal-spread.png',
      imageAlt: { zh: 'YSA Journal 论文中英文摘要内页', en: 'Chinese and English abstract spread from the YSA Journal paper' },
      sourceLabel: { zh: 'YSA Journal 论文资料', en: 'YSA Journal paper material' },
    },
    {
      id: 'claremont-eco-forum',
      category: 'forum',
      categoryLabel: { zh: '论坛', en: 'Forum' },
      date: '2024.05',
      title: { zh: '克莱蒙生态文明国际论坛', en: "Claremont International Forum on Ecological Civilization" },
      summary: {
        zh: '阿柑少年团队在线分享青少年参与可持续农业的研究与实践。',
        en: "The R-Gan Junior team shared research and practice on youth participation in sustainable agriculture online.",
      },
      facts: [
        { zh: '第 17 届克莱蒙生态文明国际论坛青少年线上特别活动', en: "Youth online special event of the 17th Claremont International Forum on Ecological Civilization" },
        { zh: '活动海报列出 Tianli Agan Youth Team', en: 'The event poster lists the Tianli Agan Youth Team' },
      ],
      image: '/archive/elements/graphics/publications/s18-claremont-forum-poster.png',
      imageAlt: { zh: '2024 克莱蒙生态文明国际论坛青少年活动海报', en: "Poster for the 2024 Claremont International Forum on Ecological Civilization youth event" },
      secondaryImage: '/archive/elements/graphics/publications/s18-claremont-online-forum-screenshot.png',
      secondaryImageAlt: { zh: '克莱蒙生态文明国际论坛线上分享截图', en: "Screenshot from the Claremont International Forum on Ecological Civilization online session" },
      sourceLabel: { zh: '论坛海报与线上活动记录', en: 'Forum poster and online event record' },
    },
  ],
};
