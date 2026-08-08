import type { ActionProgramId } from '@/content/actionPrograms';
import type { LocalizedText } from '@/lib/brand';

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export type ProgramFaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type ProgramContentItem = {
  title: LocalizedText;
  body: LocalizedText;
};

export type ProgramRhythmItem = ProgramContentItem & {
  period: LocalizedText;
};

export const lifeExperienceMoments: ProgramContentItem[] = [
  {
    title: text('让身体先打开', 'Open the senses'),
    body: text(
      '在森林、茶山和村庄里慢下来，用行走、观察和游戏重新感受身体与自然。',
      'Slow down in forests, tea mountains, and the village, using movement, observation, and play to reconnect with body and nature.',
    ),
  },
  {
    title: text('做一件真实的事', 'Do something real'),
    body: text(
      '从菜园、厨房或社区任务开始，在真实劳动里发现自己与他人的关系。',
      'Begin with a garden, kitchen, or community task and discover relationships through real work.',
    ),
  },
  {
    title: text('围坐下来相遇', 'Meet around the table'),
    body: text(
      '一起吃饭、喝茶、聊天，把一天里的感受说出来，也认真听见别人的故事。',
      'Share food, tea, and conversation, giving language to the day while listening carefully to one another.',
    ),
  },
];

export const lifeExperienceRhythm: ProgramRhythmItem[] = [
  {
    period: text('第一天 · 白天', 'Day one · Daytime'),
    title: text('走进现场', 'Enter the place'),
    body: text('认识伙伴和村庄，通过自然探索与真实任务建立最初的安全感。', 'Meet the group and the village through nature exploration and a real shared task.'),
  },
  {
    period: text('第一天 · 夜晚', 'Day one · Evening'),
    title: text('一起生活', 'Live together'),
    body: text('共同准备晚餐、整理空间，在围坐交流中感受群体生活。', 'Prepare dinner, care for the shared space, and experience group life through conversation.'),
  },
  {
    period: text('第二天', 'Day two'),
    title: text('带走一个发现', 'Carry one discovery home'),
    body: text('完成主题体验与分享，让一次短暂相遇留下可以回到日常的观察。', 'Complete the themed experience and reflection, carrying one useful observation into daily life.'),
  },
];

export const lifeCoCreationPractices: ProgramContentItem[] = [
  {
    title: text('自然与身体', 'Nature and the body'),
    body: text('森林徒步、运动与茶，让感知重新回到身体。', 'Forest walks, movement, and tea bring attention back to the body.'),
  },
  {
    title: text('共同生活', 'Shared daily life'),
    body: text('低碳生活、小队任务与日常劳动，让每个人承担真实责任。', 'Low-carbon living, team tasks, and daily work give everyone real responsibility.'),
  },
  {
    title: text('共创与表达', 'Co-creation and expression'),
    body: text('社区共创与成果分享，把经历整理成可以交流的表达。', 'Community co-creation and final sharing turn experience into something that can be communicated.'),
  },
  {
    title: text('信任与关系', 'Trust and relationships'),
    body: text('在冲突、协商与彼此照护中，练习表达需要，也回应共同体。', 'Practise naming needs and responding to the group through conflict, negotiation, and mutual care.'),
  },
];

export const lifeCoCreationRhythm: ProgramRhythmItem[] = [
  {
    period: text('第 1—2 天', 'Days 1–2'),
    title: text('进入关系', 'Enter relationships'),
    body: text('认识场域和伙伴，从身体活动、自然探索与共同约定建立安全感。', 'Meet the place and one another, building safety through movement, nature, and shared agreements.'),
  },
  {
    period: text('第 3—4 天', 'Days 3–4'),
    title: text('共同承担', 'Share responsibility'),
    body: text('通过小队任务、生活劳动和议题共创，在真实分歧中练习协作。', 'Use team tasks, daily work, and co-creation to practise collaboration through real differences.'),
  },
  {
    period: text('第 5 天', 'Day 5'),
    title: text('表达与继续', 'Express and continue'),
    body: text('整理共同成果与个人发现，为回到日常后的持续行动留下一个起点。', 'Share collective outcomes and personal discoveries, leaving a starting point for action after camp.'),
  },
];

export const actionGroupRhythm: ProgramRhythmItem[] = [
  {
    period: text('第一个月', 'Month one'),
    title: text('重新连接', 'Reconnect'),
    body: text(
      '从线上茶会、读书会、共学或主题分享开始，延续营地里形成的伙伴关系。',
      'Begin with online tea gatherings, reading circles, shared learning, or themed conversations.',
    ),
  },
  {
    period: text('第二个月', 'Month two'),
    title: text('进入日常', 'Bring it into daily life'),
    body: text(
      '发起七日挑战、低碳生活小行动和家庭实践，让想法进入真实生活。',
      'Try a seven-day challenge, a small low-carbon action, or a family practice at home.',
    ),
  },
  {
    period: text('第三个月', 'Month three'),
    title: text('分享与再相遇', 'Share and meet again'),
    body: text(
      '在线上整理和分享实践，也为下一次线下共创找到共同关心的问题。',
      'Reflect and share online, then identify a shared question for the next in-person co-creation.',
    ),
  },
];

export const publicProjectMethods: ProgramContentItem[] = [
  {
    title: text('我们关心的议题', 'Questions we care about'),
    body: text(
      '生态农业、CSA、家庭消费、行为经济学与公共政策。议题从伙伴真实接触的生活问题中形成。',
      'Ecological agriculture, CSA, household consumption, behavioral economics, and public policy. Topics emerge from questions participants encounter in daily life.',
    ),
  },
  {
    title: text('我们使用的方法', 'How we investigate'),
    body: text(
      '通过访谈、问卷、田野观察与持续记录，把好奇转化为可以讨论的证据。',
      'Interviews, surveys, field observation, and sustained documentation turn curiosity into evidence that can be discussed.',
    ),
  },
  {
    title: text('我们形成的成果', 'What we create'),
    body: text(
      '形成文章、研究记录与公共分享，让问题被更多人看见，也让思考进入真实行动。',
      'Articles, research notes, and public sharing help more people see the questions and connect reflection with action.',
    ),
  },
];

export const programFaqs: Record<ActionProgramId, ProgramFaqItem[]> = {
  'life-experience-camp': [
    {
      question: text('生活体验营适合谁？', 'Who is the Life Discovery Camp for?'),
      answer: text('主要面向第一次接触阿柑少年的 12-18 岁青少年和家庭。每期如有更细的年龄或参与要求，会在当期说明中明确。', "It is mainly for young people aged 12-18 and families meeting R'gan Junior for the first time. Any narrower requirements are stated in the session brief."),
    },
    {
      question: text('家长需要全程共同参加吗？', 'Do parents need to attend the full camp?'),
      answer: text('体验营会根据主题采用青少年独立体验、亲子共同参与或家长单独交流等形式，具体安排会在当期说明中明确。', 'The format may involve young people independently, families together, or a separate parent conversation. Each session explains its arrangement clearly.'),
    },
    {
      question: text('两天一夜会经历什么？', 'What happens during the two days?'),
      answer: text('每期围绕一个具体主题，在自然探索、真实劳动、共同用餐和围坐交流中完成一次短而完整的生活体验。', 'Each session follows one theme through nature exploration, real work, shared meals, and conversation, forming a short but complete experience.'),
    },
    {
      question: text('安全、医疗和保险如何安排？', 'How are safety, medical support, and insurance handled?'),
      answer: text('每期活动会根据路线和内容制定照护方案，并在开放报名时说明附近医疗配套、活动保险、人员配置和紧急联系流程。', 'Each session has a care plan based on its route and activities. Nearby medical support, insurance, staffing, and emergency contacts are explained when registration opens.'),
    },
    {
      question: text('费用如何确定？', 'How are fees determined?'),
      answer: text('费用根据住宿、餐食、活动材料和家庭参与方式确定，并在正式开放时完整公布。', 'Fees depend on accommodation, meals, materials, and the family participation format, and are published in full when registration opens.'),
    },
    {
      question: text('参加前需要准备什么？', 'How should participants prepare?'),
      answer: text('确认参与后会收到行前说明，包括衣物与个人用品清单、健康信息收集、集合安排和共同生活约定。', 'Confirmed participants receive a preparation guide covering clothing, personal items, health information, meeting arrangements, and shared-life agreements.'),
    },
  ],
  'life-co-creation-camp': [
    {
      question: text('哪些年龄的青少年适合参加？', 'What ages is the camp designed for?'),
      answer: text('主要面向 12-18 岁青少年和家庭。五天共同生活需要一定的独立性和参与意愿，团队会在活动前与家庭充分沟通。', 'The camp is primarily for young people aged 12-18 and their families. Five days of shared life requires some independence and willingness to participate, discussed with families in advance.'),
    },
    {
      question: text('必须先参加生活体验营吗？', 'Must I join the Life Discovery Camp first?'),
      answer: text('不作为硬性条件。第一次参与的伙伴也可以报名生活共创营，团队会通过前期沟通判断营期是否适合。', 'It is not a strict requirement. First-time participants may join, with a conversation beforehand to make sure the format is suitable.'),
    },
    {
      question: text('五天里需要承担哪些共同责任？', 'What shared responsibilities are involved?'),
      answer: text('伙伴会参与小队任务、用餐与空间整理、主题共创和成果表达。责任会根据年龄、能力与当期场域合理安排。', 'Participants join team tasks, meals and space care, themed co-creation, and final sharing. Responsibilities are adapted to age, ability, and place.'),
    },
    {
      question: text('家长需要全程共同参加吗？', 'Do parents need to attend throughout?'),
      answer: text('不同营期会采用不同的家庭参与方式。报名开放时会明确青少年独立参与、家庭共同参与和家长交流的具体安排。', 'Family participation varies by session. Registration information explains whether young people attend independently, families join together, or parents join dedicated conversations.'),
    },
    {
      question: text('安全、医疗和保险如何安排？', 'How are safety, medical support, and insurance handled?'),
      answer: text('每期活动会根据路线和内容制定照护方案，并说明附近医疗配套、活动保险、人员配置、住宿管理和紧急联系流程。', 'Each session has a care plan covering nearby medical support, insurance, staffing, accommodation management, and emergency contacts.'),
    },
    {
      question: text('费用和行前准备如何确认？', 'How are fees and preparation confirmed?'),
      answer: text('费用会根据住宿、餐食、活动材料和人员配置完整公布。确认参与后会收到健康信息、物品清单、集合安排和共同生活约定。', 'Fees are published in full based on accommodation, meals, materials, and staffing. Confirmed participants receive health forms, a packing list, meeting details, and shared-life agreements.'),
    },
    {
      question: text('营地结束后还能继续参与吗？', 'Can participation continue after camp?'),
      answer: text('可以。伙伴可以根据自己的兴趣进入后续行动小组、家庭实践或新的线下共创，但不会被要求完成固定路径。', 'Yes. Participants may continue through an Action Group, family practice, or another co-creation, without being required to follow a fixed pathway.'),
    },
  ],
  'action-group': [
    {
      question: text('必须先参加生活共创营吗？', 'Do I need to attend the camp first?'),
      answer: text('行动小组主要承接营后形成的伙伴关系。若某一期向其他认同项目理念的伙伴开放，会在招募说明中单独写明。', 'The group primarily continues relationships formed through camp. If a cycle opens to other participants who share the project values, this is stated in the call for participants.'),
    },
    {
      question: text('三个月中需要投入多少时间？', 'How much time does the three-month cycle require?'),
      answer: text('每期会根据主题安排线上相遇、个人或家庭实践和一次阶段分享。具体频率会在周期开始前与伙伴共同确认。', 'Each cycle includes online meetings, individual or family practice, and a stage reflection. The exact rhythm is confirmed with participants before the cycle begins.'),
    },
    {
      question: text('线上活动会有哪些形式？', 'What forms do the online sessions take?'),
      answer: text('可能包括线上茶会、读书会、共学、主题分享和实践复盘。形式服务于当期伙伴真正关心的问题。', 'Online sessions may include tea gatherings, reading circles, shared learning, themed conversations, and practice reflection, shaped around the questions participants care about.'),
    },
    {
      question: text('家庭实践需要家长参加吗？', 'Do parents take part in family practice?'),
      answer: text('家庭实践鼓励家人共同参与，但不会要求所有任务都由家长陪同。每项行动会说明适合的参与方式。', 'Family practice welcomes participation from family members, but not every task requires a parent. Each action explains an appropriate way to take part.'),
    },
    {
      question: text('如果中途错过一次活动怎么办？', 'What happens if I miss a session?'),
      answer: text('行动小组重视持续参与，也理解真实生活中的时间变化。伙伴可以通过记录、补充交流和后续实践重新接上进度。', 'The group values continuity while recognising that schedules change. Participants can reconnect through notes, follow-up conversations, and later practice.'),
    },
    {
      question: text('下一次线下共创如何发生？', 'How does the next in-person co-creation happen?'),
      answer: text('三个月中的分享会帮助伙伴找到共同关心的问题。具备条件后，团队会围绕这些问题提出下一次线下共创安排。', 'Reflection during the cycle helps participants identify shared questions. When conditions allow, the team develops the next in-person co-creation around those questions.'),
    },
  ],
  'public-projects': [
    {
      question: text('谁可以参与公共议题项目？', 'Who can join a public-issues project?'),
      answer: text('参与条件会根据议题、研究方法和合作周期确定。青少年、家庭伙伴和相关领域协作者都可能成为项目成员。', 'Participation depends on the topic, research method, and collaboration period. Young people, family partners, and relevant collaborators may all take part.'),
    },
    {
      question: text('没有研究经验可以参加吗？', 'Can I join without research experience?'),
      answer: text('可以。项目会从提出问题、访谈准备、记录方法和资料整理开始共学，不把既有研究经验作为唯一门槛。', 'Yes. Projects begin with shared learning about questions, interview preparation, documentation, and organising evidence. Prior research experience is not the only entry requirement.'),
    },
    {
      question: text('研究议题如何确定？', 'How are research topics chosen?'),
      answer: text('议题来自伙伴在土地、家庭消费、食物系统和公共生活中遇到的真实问题，并结合可接触的社区与资料共同判断。', 'Topics come from real questions participants encounter in land, household consumption, food systems, and public life, considered alongside accessible communities and evidence.'),
    },
    {
      question: text('通常需要投入多长时间？', 'How much time does a project require?'),
      answer: text('公共议题项目以持续研究为主，不预设统一周期。每个项目会在启动时说明阶段目标、协作节奏和预计投入。', 'Public-issues work is sustained research rather than a fixed programme. Each project sets out its stages, collaboration rhythm, and expected commitment at the start.'),
    },
    {
      question: text('项目会形成哪些成果？', 'What outcomes can a project produce?'),
      answer: text('根据议题形成访谈记录、问卷分析、田野笔记、文章和公共分享。成果以真实、可讨论和尊重参与者为基本原则。', 'Depending on the topic, outcomes may include interview records, survey analysis, field notes, articles, and public sharing, guided by accuracy, openness to discussion, and respect for participants.'),
    },
    {
      question: text('机构或专业伙伴可以合作吗？', 'Can organisations or specialist partners collaborate?'),
      answer: text('可以。欢迎能够提供议题经验、研究支持、场域连接或公共传播资源的伙伴先与团队沟通合作边界和方式。', 'Yes. Partners who can contribute topic expertise, research support, field access, or public communication are welcome to discuss the scope and form of collaboration with the team.'),
    },
  ],
};

export function getProgramFaqs(programId: ActionProgramId): ProgramFaqItem[] {
  return programFaqs[programId];
}
