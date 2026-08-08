import ecoBox from '@/assets/eco-box.webp';
import nateFounder from '@/assets/nate-founder.jpg';
import villageIllustration from '@/assets/village-illustration.webp';
import youthLooking from '@/assets/youth-looking.webp';
import youthWriting from '@/assets/youth-writing.webp';
import type { LocalizedText } from '@/lib/brand';

export type FieldNoteIdentity = 'founder' | 'partner' | 'parent' | 'collaborator';

export interface FieldNotePerson {
  slug: string;
  name: LocalizedText;
  identity: FieldNoteIdentity;
  identityLabel: LocalizedText;
  introduction: LocalizedText;
  avatar: string;
}

export interface FieldNoteTopic {
  slug: string;
  name: LocalizedText;
  shortName: LocalizedText;
  description: LocalizedText;
}

export type FieldNoteBlock =
  | { type: 'heading'; text: LocalizedText }
  | { type: 'paragraph'; text: LocalizedText }
  | { type: 'quote'; text: LocalizedText; attribution?: LocalizedText }
  | { type: 'list'; items: LocalizedText[] }
  | { type: 'action-card'; prompt: LocalizedText; response: LocalizedText };

export interface FieldNote {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  authorSlugs: string[];
  topicSlugs: FieldNoteTopic['slug'][];
  publishedAt: string;
  readingMinutes: number;
  featuredRank?: number;
  cover: string;
  coverAlt: LocalizedText;
  body: FieldNoteBlock[];
  contentHtml?: string;
  authors?: FieldNotePerson[];
  topics?: FieldNoteTopic[];
  preview: boolean;
}

export const fieldNotePeople: FieldNotePerson[] = [
  {
    slug: 'nate',
    name: { zh: 'Nate', en: 'Nate' },
    identity: 'founder',
    identityLabel: { zh: '创始人', en: 'Founder' },
    introduction: {
      zh: '从个人成长、共同生活和社会研究出发，记录问题如何从真实经验里长出来。',
      en: 'Writing from personal growth, shared life, and social research, tracing how questions emerge from lived experience.',
    },
    avatar: nateFounder,
  },
  {
    slug: 'youth-group',
    name: { zh: '少年共创小组', en: 'Youth Co-creation Group' },
    identity: 'partner',
    identityLabel: { zh: '阿柑少年伙伴', en: "R-Gan Junior Partners" },
    introduction: {
      zh: '用行动卡、原话和共同复盘，保存少年对生活最直接的判断。',
      en: 'Preserving young people’s direct judgments through action cards, original words, and shared reflection.',
    },
    avatar: youthWriting,
  },
  {
    slug: 'ruby',
    name: { zh: 'Ruby', en: 'Ruby' },
    identity: 'partner',
    identityLabel: { zh: '阿柑少年伙伴', en: "R-Gan Junior Partner" },
    introduction: {
      zh: '从厨房、茶与共同生活切入，观察一群人怎样真正开始协作。',
      en: 'Looking at how a group begins to collaborate through kitchens, tea, and shared daily life.',
    },
    avatar: youthLooking,
  },
  {
    slug: 'lin-parent',
    name: { zh: '林妈妈', en: "Lin's Mother" },
    identity: 'parent',
    identityLabel: { zh: '家长', en: 'Parent' },
    introduction: {
      zh: '从家庭关系里观察孩子的变化，也重新理解陪伴与放手。',
      en: 'Observing change through family life and reconsidering what it means to accompany and let go.',
    },
    avatar: villageIllustration,
  },
  {
    slug: 'tianshi',
    name: { zh: '张天时', en: 'Tianshi Zhang' },
    identity: 'collaborator',
    identityLabel: { zh: '合作者', en: 'Collaborator' },
    introduction: {
      zh: '连接技术、生态和研究方法，把抽象议题带回可以验证的现场。',
      en: 'Connecting technology, ecology, and research methods to bring abstract questions back to testable settings.',
    },
    avatar: ecoBox,
  },
];

export const fieldNoteTopics: FieldNoteTopic[] = [
  {
    slug: 'reflection',
    name: { zh: '生活随笔与反思', en: 'Essays and Reflections' },
    shortName: { zh: '生活与反思', en: 'Life and Reflection' },
    description: {
      zh: '从一段关系、一次选择和日常细节开始，写下仍在形成中的理解。',
      en: 'Understanding still in formation, beginning with relationships, choices, and details of daily life.',
    },
  },
  {
    slug: 'camp-review',
    name: { zh: '共创营复盘与启发', en: 'Camp Reviews and Insights' },
    shortName: { zh: '共创营复盘', en: 'Camp Reviews' },
    description: {
      zh: '记录共同生活中的冲突、协商、行动和下一次可以怎样做。',
      en: 'Documenting conflict, negotiation, action, and what could be tried differently next time.',
    },
  },
  {
    slug: 'research',
    name: { zh: '研究内容与实验设计', en: 'Research and Experiment Design' },
    shortName: { zh: '研究与实验', en: 'Research and Experiments' },
    description: {
      zh: '把生态、低碳与公共议题转化为可观察、可讨论、可验证的问题。',
      en: 'Turning ecology, low-carbon living, and public issues into observable, discussable, testable questions.',
    },
  },
];

export const fieldNotes: FieldNote[] = [
  {
    slug: 'growth-on-a-road-we-have-walked',
    title: {
      zh: '在一条真正走过的路上，重新理解成长',
      en: 'Understanding Growth on a Road We Have Actually Walked',
    },
    excerpt: {
      zh: '当成长不再只是成绩和年龄，我们还能用什么辨认一个人正在发生的变化？',
      en: 'When growth is no longer measured only by grades and age, how else can we recognize change in a person?',
    },
    authorSlugs: ['nate'],
    topicSlugs: ['reflection'],
    publishedAt: '2026-08-01',
    readingMinutes: 7,
    featuredRank: 1,
    cover: nateFounder,
    coverAlt: { zh: 'Nate 站在书架与阳光之间', en: 'Nate standing between bookshelves and sunlight' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '过去我很容易把成长理解成抵达。读完一本书、完成一项任务、得到一个结果，好像就可以在清单上画勾。但在铁牛村和一次次共同生活里，我慢慢发现，成长更像一个人开始对自己经历的事情产生真实回应。',
          en: 'I used to understand growth as arrival. Finish a book, complete a task, get a result, and the box could be checked. Through Tieniu Village and repeated experiences of shared life, I began to see growth as the moment a person starts responding honestly to what they have lived.',
        },
      },
      {
        type: 'heading',
        text: { zh: '先有经验，才有自己的语言', en: 'Experience comes before one’s own language' },
      },
      {
        type: 'paragraph',
        text: {
          zh: '如果问题从来没有经过身体和关系，它很容易只停留在漂亮的词语里。我们走进山野、厨房和村庄，不是为了收集活动项目，而是让问题真正落在生活中。一个少年开始问食物从哪里来、冲突为什么发生、自己愿意承担什么，这些问题本身就是变化。',
          en: 'A question that never passes through the body or a relationship can remain only a polished phrase. We enter forests, kitchens, and villages not to collect activities but to let questions land in life. When a young person asks where food comes from, why conflict happens, or what they are willing to take responsibility for, the questions themselves are evidence of change.',
        },
      },
      {
        type: 'quote',
        text: {
          zh: '成长不是更快地回答，而是终于愿意把问题留在身边。',
          en: 'Growth is not answering faster. It is becoming willing to keep a question close.',
        },
        attribution: { zh: 'Nate 的田野记录', en: "Nate's field record" },
      },
      {
        type: 'paragraph',
        text: {
          zh: '田野笔记想保存的正是这些尚未完成的时刻。它不是成果展，也不是唯一答案，而是一条可以被别人继续追问的经验线索。',
          en: 'Field Notes exists to preserve these unfinished moments. It is neither a showcase nor a final answer, but a trail of experience that others can continue to question.',
        },
      },
    ],
  },
  {
    slug: 'shared-life-is-not-simply-being-together',
    title: {
      zh: '共同生活，不只是把一群孩子放在一起',
      en: 'Shared Life Is More Than Putting Young People Together',
    },
    excerpt: {
      zh: '一次生活共创营之后，我们重新拆解规则、冲突和真正的共同决定。',
      en: 'After a co-creation camp, we reconsidered rules, conflict, and what a shared decision really means.',
    },
    authorSlugs: ['ruby', 'nate'],
    topicSlugs: ['camp-review'],
    publishedAt: '2026-07-28',
    readingMinutes: 8,
    featuredRank: 2,
    cover: villageIllustration,
    coverAlt: { zh: '村庄、土地与共同生活场景插画', en: 'An illustration of village, land, and shared life' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '共创营最难的部分往往不是设计活动，而是让每个人发现，自己的节奏会影响别人。谁来做饭、什么时候出发、有人不想参加怎么办，这些小问题把“共同”从口号变成了具体关系。',
          en: 'The hardest part of a co-creation camp is rarely designing activities. It is helping everyone notice that their rhythm affects others. Who cooks, when the group leaves, and what happens when someone does not want to join turn the word shared into a concrete relationship.',
        },
      },
      {
        type: 'heading',
        text: { zh: '规则需要经过一次共同解释', en: 'Rules need a shared explanation' },
      },
      {
        type: 'list',
        items: [
          { zh: '先说明规则想保护什么，而不是只宣布不能做什么。', en: 'Explain what a rule protects instead of only announcing what is forbidden.' },
          { zh: '冲突发生后，让当事人先描述事实，再谈感受和选择。', en: 'After conflict, let those involved describe the facts before discussing feelings and choices.' },
          { zh: '把下一次怎么做写成可以观察的行动，而不是一句态度。', en: 'Write the next attempt as an observable action rather than an attitude.' },
        ],
      },
      {
        type: 'paragraph',
        text: {
          zh: '这次复盘没有给我们一个完美流程，但留下了更清楚的判断：共同生活的价值，不在于大家一直和谐，而在于不和谐时仍然可以练习理解、表达和修复。',
          en: 'The review did not give us a perfect process. It left us with a clearer judgment: the value of shared life is not constant harmony, but the ability to practice understanding, expression, and repair when harmony breaks.',
        },
      },
    ],
  },
  {
    slug: 'how-many-questions-around-an-orange-tree',
    title: {
      zh: '一棵橙树周围，能提出多少个真实问题？',
      en: 'How Many Real Questions Can Grow Around an Orange Tree?',
    },
    excerpt: {
      zh: '从土壤、劳动与销售开始，设计一项青少年可以真正参与的生态研究。',
      en: 'Starting with soil, labor, and sales, we design an ecological study young people can genuinely take part in.',
    },
    authorSlugs: ['tianshi', 'youth-group'],
    topicSlugs: ['research'],
    publishedAt: '2026-07-24',
    readingMinutes: 9,
    featuredRank: 3,
    cover: ecoBox,
    coverAlt: { zh: '关于生态观察与食物系统的阿柑盒子', en: 'An R-gan box for observing ecology and food systems' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '一棵橙树不是一个孤立的自然对象。它连接土壤、水、种植者的劳动、运输、价格和一个家庭的饮食选择。研究设计的第一步，是让这些连接可以被看见。',
          en: 'An orange tree is not an isolated natural object. It connects soil, water, growers’ labor, transport, prices, and a family’s food choices. The first step in research design is making those connections visible.',
        },
      },
      {
        type: 'heading',
        text: { zh: '把大问题变成现场任务', en: 'Turn a large question into field tasks' },
      },
      {
        type: 'list',
        items: [
          { zh: '观察同一片地里不同位置的土壤湿度和覆盖情况。', en: 'Observe soil moisture and ground cover in different parts of the same plot.' },
          { zh: '访谈种植者，记录一年中最耗费时间的三个环节。', en: 'Interview growers and record the three most time-consuming parts of the year.' },
          { zh: '比较直销与普通零售路径中价格和损耗的变化。', en: 'Compare price and loss across direct-sale and ordinary retail routes.' },
        ],
      },
      {
        type: 'paragraph',
        text: {
          zh: '这些任务不是为了快速证明一种农业方式更好，而是训练我们区分观察、推测和价值判断。只有把三者分开，讨论才可能真正发生。',
          en: 'These tasks are not designed to prove quickly that one agricultural model is better. They train us to distinguish observation, inference, and value judgment. Discussion becomes possible only when those are separated.',
        },
      },
    ],
  },
  {
    slug: 'action-cards-before-conclusions',
    title: {
      zh: '孩子写下的行动卡，比结论更重要',
      en: 'A Young Person’s Action Card Matters More Than a Conclusion',
    },
    excerpt: {
      zh: '三张行动卡和三句原话，记录一次营地讨论如何回到日常选择。',
      en: 'Three action cards and three original phrases show how a camp discussion returned to daily choices.',
    },
    authorSlugs: ['youth-group'],
    topicSlugs: ['camp-review'],
    publishedAt: '2026-07-20',
    readingMinutes: 5,
    cover: youthWriting,
    coverAlt: { zh: '少年在桌边书写自己的行动卡', en: 'A young person writing an action card at a table' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '讨论结束时，我们没有要求每个人总结“学到了什么”，而是请大家写下一件回到家后愿意试七天的事。行动必须足够小，也必须能够被自己观察。',
          en: 'At the end of the discussion, we did not ask everyone to summarize what they had learned. We asked each person to write one thing they were willing to try for seven days at home. The action had to be small and observable.',
        },
      },
      {
        type: 'action-card',
        prompt: { zh: '我想改变的一件小事', en: 'One small thing I want to change' },
        response: { zh: '吃饭前不拿手机，先问清楚今天的菜从哪里来。', en: 'Before eating, I will put away my phone and ask where today’s food came from.' },
      },
      {
        type: 'action-card',
        prompt: { zh: '我怎么知道自己做到了', en: 'How I will know I did it' },
        response: { zh: '每天画一个小格子，不让爸爸妈妈提醒。', en: 'I will mark one box each day without asking my parents to remind me.' },
      },
      {
        type: 'paragraph',
        text: {
          zh: '行动卡不是承诺书。它允许失败，也要求下一次复盘具体到发生了什么。正是这种具体，让少年的原话不会在活动结束后消失。',
          en: 'An action card is not a pledge. It allows failure and asks the next review to describe what actually happened. That specificity keeps young people’s own words from disappearing after the activity ends.',
        },
      },
    ],
  },
  {
    slug: 'when-i-stopped-asking-what-did-you-learn',
    title: {
      zh: '当我不再追问“今天学到了什么”',
      en: 'When I Stopped Asking, What Did You Learn Today?',
    },
    excerpt: {
      zh: '一位家长观察到，少问一个结果问题之后，孩子反而说出了更多经历。',
      en: 'A parent noticed that asking one fewer outcome question made room for a child to share more experience.',
    },
    authorSlugs: ['lin-parent'],
    topicSlugs: ['reflection'],
    publishedAt: '2026-07-16',
    readingMinutes: 6,
    cover: youthLooking,
    coverAlt: { zh: '少年在自然环境中安静观察', en: 'A young person observing quietly in nature' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '以前孩子参加完活动，我的第一个问题总是“今天学到了什么”。这个问题听起来关心成长，却常常让谈话立刻变成一次汇报。孩子说“没什么”，我就继续追问，最后两个人都很疲惫。',
          en: 'After every activity, my first question used to be, What did you learn today? It sounded caring, but it often turned the conversation into a report. My child would say, Nothing much. I would keep asking, and both of us ended up tired.',
        },
      },
      {
        type: 'quote',
        text: {
          zh: '后来我改问：今天有没有一个瞬间让你意外？',
          en: 'Later I asked instead: Was there one moment today that surprised you?',
        },
      },
      {
        type: 'paragraph',
        text: {
          zh: '回答从一个同伴忘记关水龙头开始，绕到大家怎样商量轮值，再说到他自己为什么没有当场提醒。那天没有标准答案，却让我第一次听见孩子如何理解自己在群体里的位置。',
          en: 'The answer began with a peer forgetting to turn off a tap, moved through how the group arranged duties, and ended with why my child had not spoken up. There was no standard answer, but for the first time I heard how my child understood their place in a group.',
        },
      },
    ],
  },
  {
    slug: 'csa-begins-with-a-basket-of-vegetables',
    title: {
      zh: '从一篮蔬菜开始理解 CSA',
      en: 'Understanding CSA Through a Basket of Vegetables',
    },
    excerpt: {
      zh: '把消费者、农场和季节风险放进一张关系图，重新理解“支持”意味着什么。',
      en: 'Mapping consumers, farms, and seasonal risk to reconsider what support really means.',
    },
    authorSlugs: ['tianshi'],
    topicSlugs: ['research'],
    publishedAt: '2026-07-12',
    readingMinutes: 8,
    cover: ecoBox,
    coverAlt: { zh: '装有生态农产品的阿柑盒子', en: 'An R-gan box containing ecological farm products' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: 'CSA 常被翻译为社区支持农业，但“支持”很容易被理解成一次购买。我们从一篮当季蔬菜开始，追踪价格、品种、损耗、配送与天气风险，发现购买只是关系的一小部分。',
          en: 'CSA is usually expanded as community-supported agriculture, but support can easily be reduced to a purchase. Beginning with a basket of seasonal vegetables, we traced price, variety, loss, delivery, and weather risk. Buying turned out to be only one part of the relationship.',
        },
      },
      {
        type: 'heading',
        text: { zh: '研究关系，而不只研究产品', en: 'Study the relationship, not only the product' },
      },
      {
        type: 'paragraph',
        text: {
          zh: '青少年访谈种植者和家庭，分别询问他们愿意承担什么、不确定什么、需要怎样的信息。两组答案放在一起后，CSA 不再是一个概念，而是一种持续协商风险与信任的方法。',
          en: 'Young people interviewed growers and families, asking what each was willing to carry, what remained uncertain, and what information they needed. Placing the answers together turned CSA from a concept into an ongoing way to negotiate risk and trust.',
        },
      },
    ],
  },
  {
    slug: 'seven-day-low-carbon-experiment',
    title: {
      zh: '把低碳生活变成一个七天实验',
      en: 'Turning Low-Carbon Living into a Seven-Day Experiment',
    },
    excerpt: {
      zh: '不从宏大口号开始，而是记录出行、饮食和一次真实的选择冲突。',
      en: 'Beginning not with a slogan but with travel, food, and one real conflict between choices.',
    },
    authorSlugs: ['youth-group', 'tianshi'],
    topicSlugs: ['research'],
    publishedAt: '2026-07-08',
    readingMinutes: 6,
    cover: youthWriting,
    coverAlt: { zh: '少年在桌边记录生活实验', en: 'A young person recording a daily-life experiment' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '“低碳”太大时，每个人都能表示赞同，却很难知道今天可以做什么。我们把它缩成七天，只记录三件事：一次出行、一顿饭和一次因为方便而改变原计划的时刻。',
          en: 'When low-carbon living is too large, everyone can agree with it but few know what to do today. We reduced it to seven days and recorded only three things: one journey, one meal, and one moment when convenience changed the original plan.',
        },
      },
      {
        type: 'heading',
        text: { zh: '实验不是比赛', en: 'An experiment is not a competition' },
      },
      {
        type: 'paragraph',
        text: {
          zh: '记录不用于比较谁更环保，而是寻找选择背后的条件。有时公共交通并不可达，有时家庭时间比包装更难改变。理解这些限制，才能设计下一次更现实的尝试。',
          en: 'The record was not used to compare who was greener. It was used to find the conditions behind choices. Sometimes public transport was inaccessible. Sometimes family schedules were harder to change than packaging. Understanding those limits made the next attempt more realistic.',
        },
      },
    ],
  },
  {
    slug: 'from-john-locke-to-the-community-nearby',
    title: {
      zh: '从 John Locke 论文回到身边的共同体',
      en: 'From a John Locke Essay Back to the Community Nearby',
    },
    excerpt: {
      zh: '一篇关于个人与共同体的论文，怎样被重新放进村庄、家庭和行动小组？',
      en: 'How can an essay about individuals and community return to villages, families, and action groups?',
    },
    authorSlugs: ['nate'],
    topicSlugs: ['reflection', 'research'],
    publishedAt: '2026-07-03',
    readingMinutes: 10,
    cover: nateFounder,
    coverAlt: { zh: 'Nate 在书架旁思考与阅读', en: 'Nate reading and thinking beside bookshelves' },
    preview: true,
    body: [
      {
        type: 'paragraph',
        text: {
          zh: '写论文时，个人与共同体很容易成为两个抽象名词。回到行动小组，我发现这个问题其实每天都在发生：一个人的选择什么时候只属于自己，什么时候已经影响同伴，群体又可以要求一个人承担多少？',
          en: 'In an essay, the individual and the community can easily become two abstract nouns. Back in an action group, I found the question unfolding every day. When does a choice belong only to oneself? When does it affect a peer? How much can a group ask a person to carry?',
        },
      },
      {
        type: 'heading',
        text: { zh: '让概念接受生活的检验', en: 'Let concepts be tested by life' },
      },
      {
        type: 'paragraph',
        text: {
          zh: '论文提供了一套讨论语言，田野则不断提醒我，语言必须解释真实的人。把两者放在一起，不是用理论证明生活，而是让生活暴露理论没有看见的部分。',
          en: 'The essay offered a language for discussion. Field experience kept reminding me that language must explain real people. Putting the two together does not use theory to prove life. It lets life reveal what theory has failed to see.',
        },
      },
      {
        type: 'quote',
        text: {
          zh: '好的研究不是离生活更远，而是让我们更准确地回到生活。',
          en: 'Good research does not move farther from life. It helps us return to life more precisely.',
        },
      },
    ],
  },
];

export function getFieldNotePerson(slug: string): FieldNotePerson | undefined {
  return fieldNotePeople.find((person) => person.slug === slug);
}

export function getFieldNoteTopic(slug: string): FieldNoteTopic | undefined {
  return fieldNoteTopics.find((topic) => topic.slug === slug);
}
