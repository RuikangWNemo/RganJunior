import type { LocalizedText } from "@/lib/brand";

// Curated excerpts stay separate from voiceStories, which imports complete article HTML.
// Dates describe the source article or pictured event, never an inferred follow-up.
export type ImpactStoryPhoto = {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  caption: LocalizedText;
};

export const campParticipation = {
  title: {
    zh: "2026 夏 · 生活共创营",
    en: "Summer 2026 · Life Co-creation Camp",
  },
  context: {
    zh: "7 月 28 日，伙伴们从中美两地来到南宝山和铁牛村。这是这一期营地的参与记录。",
    en: "On July 28, participants from China and the United States came to Nanbao Mountain and Tieniu Village. These figures describe this camp alone.",
  },
  metrics: [
    { value: "11", label: { zh: "位青少年", en: "young people" } },
    { value: "10", label: { zh: "个家庭", en: "families" } },
    { value: "7", label: { zh: "座来源城市", en: "home cities" } },
  ],
  sourceTitle: {
    zh: "《相信就会看见》营地回顾",
    en: "Believe, and You Will See: Camp Reflections",
  },
  sourceHref: "/community-stories/believe-and-see-camp-review",
  scope: {
    zh: "据本期营地回顾整理；城市指参与者来源城市。以上为单期数据，不作项目累计人数或持续参与统计。",
    en: "Drawn from this camp’s reflection article. Cities refer to participants’ home cities. These are single-camp figures, not cumulative or continuing-participation totals.",
  },
};

export const featuredGrowthStory = {
  author: { zh: "张天时", en: "Tianshi Zhang" },
  title: {
    zh: "在科技与生态之间寻找星辰大海",
    en: "Finding a Sea of Stars Between Technology and Ecology",
  },
  publishedAt: "2026-07-18",
  href: "/community-stories/technology-ecology-stars",
  intro: {
    zh: "习惯用电脑、代码和线上工具解决问题的天时，在铁牛村参与早餐制作、采摘和共同生活，开始重新理解人与土地、食物和伙伴的关系。",
    en: "Used to solving problems with computers, code, and online tools, Tianshi began exploring his relationships with land, food, and others by preparing breakfast, harvesting, and sharing daily life in Tieniu Village.",
  },
  quote: {
    zh: "一个人也需要会生活，会吃饭，会和人合作，也需要在一杯茶、一顿饭、一片土地面前慢下来。",
    en: "We also need to learn everyday life skills, eat well, and work with others. We need to slow down over a cup of tea or a meal, or while spending time on the land.",
  },
  moment: {
    title: { zh: "一个具体的生活片段", en: "A moment from everyday life" },
    text: {
      zh: "回到铁牛村后，他参与丑美生活馆的轮值早餐，也和伙伴一起采摘。这些并不熟悉的小事，让他把关于生态的理解放回身体和生活。",
      en: "On returning to Tieniu Village, he took a turn preparing breakfast at Choumei Life House and harvested with others. These unfamiliar tasks helped him connect ecological ideas with his body and daily life.",
    },
  },
  intention: {
    title: { zh: "他希望继续的事", en: "What he hopes to continue" },
    text: {
      zh: "从科技和社群的方向，为阿柑少年提供另一种力量，让数字工具回到土地和真实生活的需要中。",
      en: "Contribute to R-Gan Junior through technology and community, bringing digital tools into work with the land and the needs of everyday life.",
    },
  },
  photos: [
    {
      src: "/stories/technology-ecology-stars/images/image-007.webp",
      width: 909,
      height: 854,
      alt: {
        zh: "天时文章中的杭州西湖大学参访合照",
        en: "A group photograph from the Westlake University visit in Tianshi’s story",
      },
      caption: {
        zh: "杭州西湖大学参访 · 2023",
        en: "Visiting Westlake University · 2023",
      },
    },
    {
      src: "/stories/technology-ecology-stars/images/image-009.webp",
      width: 1080,
      height: 1619,
      alt: {
        zh: "天时参与丑美生活馆轮值早餐制作",
        en: "Tianshi taking a turn preparing breakfast at Choumei Life House",
      },
      caption: {
        zh: "参与丑美生活馆轮值早餐 · 2026",
        en: "Preparing breakfast at Choumei Life House · 2026",
      },
    },
  ] satisfies ImpactStoryPhoto[],
};

export const moreGrowthStories = [
  {
    slug: "tea-connects-an-american-girl",
    author: { zh: "陈若容", en: "Rosie Chen" },
    title: {
      zh: "一碗茶，如何让一个在美国生活的女孩走进阿柑少年",
      en: "How a Bowl of Tea Brought a Girl Living in the U.S. to R-Gan Junior",
    },
    summary: {
      zh: "从和阿公种下小茶苗，到一次次回到茶山，若容记录了自己与家人、自然和伙伴的连接。",
      en: "From planting a tea seedling with her grandfather to returning to the tea mountain, Rosie writes about her connections with family, nature, and others.",
    },
    publishedAt: "2026-07-16",
    photo: {
      src: "/stories/tea-connects-an-american-girl/images/image-005.webp",
      width: 1080,
      height: 718,
      alt: {
        zh: "若容和阿公一起种小茶苗",
        en: "Rosie planting a tea seedling with her grandfather",
      },
      caption: {
        zh: "和阿公种小茶苗 · 2021",
        en: "Planting a tea seedling with her grandfather · 2021",
      },
    },
  },
  {
    slug: "tea-kitchen-and-summer",
    author: { zh: "黄若音", en: "Ruby Huang" },
    title: {
      zh: "茶、厨房、阿柑少年，还有这个夏天",
      en: "Tea, the Kitchen, R-Gan Junior, and This Summer",
    },
    summary: {
      zh: "泡茶、下厨和分工合作，让若音开始更加留意食物，也希望把茶山学到的生活态度带回日常。",
      en: "Making tea, cooking, and working with others helped Ruby pay closer attention to food. She hopes to carry what she learned into everyday life.",
    },
    publishedAt: "2026-07-17",
    photo: {
      src: "/stories/tea-kitchen-and-summer/images/image-008.webp",
      width: 1080,
      height: 1439,
      alt: {
        zh: "若音在茶山参与做饭",
        en: "Ruby helping to cook on the tea mountain",
      },
      caption: {
        zh: "在茶山做饭 · 2024",
        en: "Cooking on the tea mountain · 2024",
      },
    },
  },
];

export const familyVoices = [
  {
    id: "nate-family",
    attribution: { zh: "Nate 的家长", en: "Nate’s parents" },
    quote: {
      zh: "我们带着孩子来到铁牛村，本来只是换一种生活，后来发现，这片土地也在慢慢改变孩子。他在这里看见自然、社区、责任，也开始问自己可以做什么。",
      en: "We brought our child to Tieniu Village simply to try a different way of life. Over time, we realized that the land was changing him, too. Here, he discovered nature, community, and responsibility, and began asking what he could do.",
    },
  },
  {
    id: "tianshi-family",
    attribution: { zh: "天时的家长", en: "Tianshi’s parents" },
    quote: {
      zh: "作为城市家庭，我们曾经只是通过一棵柑橘树和铁牛村发生连接。后来我们发现，这种连接不只关于食物，也关于孩子如何理解土地、自然和生活。",
      en: "As a family from the city, our connection with Tieniu Village began with a single citrus tree. Later, we realized that the connection was about more than food. It was also about how our child came to understand the land, nature, and everyday life.",
    },
  },
];

export const familyVoicesSource = {
  href: "/community-stories/summer-co-creation-camp-invitation",
  publishedAt: "2026-07-13",
  title: {
    zh: "生活共创营发起信 · 家长寄语",
    en: "Life Co-creation Camp invitation · A word from our parents",
  },
  context: {
    zh: "以下摘自营地发起时的家长寄语，记录家庭长期陪伴的视角。",
    en: "These excerpts from the camp invitation share parents’ perspectives on supporting their children over time.",
  },
};

export const actionPossibilities: LocalizedText[] = [
  { zh: "低碳生活实验", en: "Low-carbon living experiments" },
  { zh: "家庭早餐", en: "Family breakfasts" },
  { zh: "自然观察", en: "Nature observation" },
  { zh: "线上茶会", en: "Online tea gatherings" },
  { zh: "社群打卡", en: "Community check-ins" },
  { zh: "三个月行动计划", en: "Three-month action plans" },
];
