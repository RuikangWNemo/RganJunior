import type { LocalizedText } from '@/lib/brand';

export interface Participant {
  id: string;
  name: LocalizedText;
  natureName: LocalizedText;
  city?: LocalizedText;
  bio: LocalizedText;
  interests: LocalizedText;
  favorite?: LocalizedText;
  portrait: string;
  portraitSmall: string;
  position: string;
  width: number;
  height: number;
  storyPath?: string;
  guardianId?: string;
}

// Shared by About, the public participant directory, Community and Impact.
// Public fields intentionally exclude birthdays, contact details and precise addresses.
export const participants: readonly Participant[] = [
  {
    "id": "tianshi",
    "width": 800,
    "height": 800,
    "name": {
      "zh": "张天时",
      "en": "Tianshi Zhang"
    },
    "natureName": {
      "zh": "水松",
      "en": "Water pine"
    },
    "bio": {
      "zh": "喜欢编程、游戏引擎与人工智能，也关心团队如何一起完成事情。日常喜欢打羽毛球和台球。",
      "en": "Interested in programming, game engines, and AI, and in how teams get things done together. Enjoys badminton and pool."
    },
    "interests": {
      "zh": "编程 · 人工智能 · 羽毛球 · 台球",
      "en": "Programming · AI · Badminton · Pool"
    },
    "portrait": "/images/participants/tianshi-800.webp",
    "portraitSmall": "/images/participants/tianshi-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "郑州",
      "en": "Zhengzhou"
    },
    "favorite": {
      "zh": "蕨类森林徒步",
      "en": "Hiking in the fern forest"
    },
    "storyPath": "/community-stories/all?person=article-author-tianshi"
  },
  {
    "id": "rosie",
    "width": 800,
    "height": 800,
    "name": {
      "zh": "陈若容",
      "en": "Rosie Chen"
    },
    "natureName": {
      "zh": "满天星",
      "en": "Baby’s breath"
    },
    "bio": {
      "zh": "喜欢骑马、画画和武术，也喜欢喝茶。在营地，森林徒步和与伙伴一起喝茶是最喜欢的时刻。",
      "en": "Enjoys horse riding, drawing, martial arts, and tea. Favorite camp moments include forest walks and sharing tea with others."
    },
    "interests": {
      "zh": "骑马 · 画画 · 武术 · 喝茶",
      "en": "Horse riding · Drawing · Martial arts · Tea"
    },
    "portrait": "/images/participants/rosie-800.webp",
    "portraitSmall": "/images/participants/rosie-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "上海",
      "en": "Shanghai"
    },
    "favorite": {
      "zh": "蕨类森林徒步、喝茶",
      "en": "Hiking in the fern forest and drinking tea"
    },
    "storyPath": "/community-stories/all?person=article-author-ruorong"
  },
  {
    "id": "ruby",
    "width": 800,
    "height": 1200,
    "name": {
      "zh": "黄若音",
      "en": "Ruby Huang"
    },
    "natureName": {
      "zh": "含羞草",
      "en": "Mimosa"
    },
    "bio": {
      "zh": "喜欢跳舞、烘焙和钩织，擅长芭蕾舞。最喜欢和伙伴共创午餐，也喜欢走进森林。",
      "en": "Enjoys dancing, baking, and crochet, with a particular skill in ballet. Favorite activities include cooking lunch together and walking in the forest."
    },
    "interests": {
      "zh": "跳舞 · 烘焙 · 钩织 · 芭蕾舞",
      "en": "Dance · Baking · Crochet · Ballet"
    },
    "portrait": "/images/participants/ruby-800.webp",
    "portraitSmall": "/images/participants/ruby-400.webp",
    "position": "50% 35%",
    "favorite": {
      "zh": "共创午餐、森林徒步",
      "en": "Making lunch together and forest hiking"
    },
    "storyPath": "/community-stories/all?person=article-author-ruoyin"
  },
  {
    "id": "chengzi",
    "width": 800,
    "height": 533,
    "name": {
      "zh": "橙子",
      "en": "Chengzi"
    },
    "natureName": {
      "zh": "橙子",
      "en": "Tangerine"
    },
    "bio": {
      "zh": "喜欢踢足球、打篮球，擅长羽毛球和大提琴。在这次营地活动里，最喜欢的是做茶。",
      "en": "Enjoys football and basketball, and plays badminton and the cello. Tea-making was a favorite camp activity."
    },
    "interests": {
      "zh": "足球 · 篮球 · 羽毛球 · 大提琴",
      "en": "Football · Basketball · Badminton · Cello"
    },
    "portrait": "/images/participants/chengzi-800.webp",
    "portraitSmall": "/images/participants/chengzi-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "深圳",
      "en": "Shenzhen"
    },
    "favorite": {
      "zh": "做茶",
      "en": "Tea-making"
    },
    "storyPath": "/community-stories/all?person=article-author-chengzi"
  },
  {
    "id": "amber",
    "width": 800,
    "height": 1199,
    "name": {
      "zh": "安安 · Amber",
      "en": "Amber"
    },
    "natureName": {
      "zh": "H₂O",
      "en": "H₂O"
    },
    "bio": {
      "zh": "喜欢画画、做手工和音乐。最喜欢的营地活动是走进蕨类森林。",
      "en": "Enjoys drawing, crafts, and music. Exploring the fern forest was a favorite camp activity."
    },
    "interests": {
      "zh": "画画 · 手工 · 音乐",
      "en": "Drawing · Crafts · Music"
    },
    "portrait": "/images/participants/amber-800.webp",
    "portraitSmall": "/images/participants/amber-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "深圳",
      "en": "Shenzhen"
    },
    "favorite": {
      "zh": "蕨类森林",
      "en": "The fern forest"
    }
  },
  {
    "id": "eddie",
    "width": 800,
    "height": 1151,
    "name": {
      "zh": "Eddie",
      "en": "Eddie"
    },
    "natureName": {
      "zh": "蜂蜜",
      "en": "Honey"
    },
    "bio": {
      "zh": "喜欢打游戏，也喜欢做茶。",
      "en": "Enjoys video games and tea-making."
    },
    "interests": {
      "zh": "打游戏 · 做茶",
      "en": "Video games · Tea-making"
    },
    "portrait": "/images/participants/eddie-800.webp",
    "portraitSmall": "/images/participants/eddie-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "北京",
      "en": "Beijing"
    }
  },
  {
    "id": "xiaoshu",
    "width": 800,
    "height": 534,
    "name": {
      "zh": "小树",
      "en": "Xiaoshu"
    },
    "natureName": {
      "zh": "小树",
      "en": "Little Tree"
    },
    "bio": {
      "zh": "喜欢打网球，这期营地里最喜欢的活动是打篮球。",
      "en": "Enjoys tennis. Basketball was a favorite activity at camp."
    },
    "interests": {
      "zh": "网球 · 篮球",
      "en": "Tennis · Basketball"
    },
    "portrait": "/images/participants/xiaoshu-800.webp",
    "portraitSmall": "/images/participants/xiaoshu-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "上海",
      "en": "Shanghai"
    },
    "favorite": {
      "zh": "打篮球",
      "en": "Basketball"
    }
  },
  {
    "id": "qingtai",
    "width": 800,
    "height": 800,
    "name": {
      "zh": "青苔",
      "en": "Qingtai"
    },
    "natureName": {
      "zh": "青苔",
      "en": "Moss"
    },
    "bio": {
      "zh": "日常喜欢打篮球和打游戏，会弹钢琴、打小军鼓，也喜欢围棋和篮球。",
      "en": "Enjoys basketball and video games, plays piano and snare drum, and also enjoys Go."
    },
    "interests": {
      "zh": "篮球 · 游戏 · 钢琴 · 小军鼓 · 围棋",
      "en": "Basketball · Video games · Piano · Snare drum · Go"
    },
    "portrait": "/images/participants/qingtai-800.webp",
    "portraitSmall": "/images/participants/qingtai-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "北京",
      "en": "Beijing"
    }
  },
  {
    "id": "baomao",
    "width": 800,
    "height": 1199,
    "name": {
      "zh": "豹猫",
      "en": "Baomao"
    },
    "natureName": {
      "zh": "豹猫",
      "en": "Leopard Cat"
    },
    "bio": {
      "zh": "喜欢足球，擅长篮球和中国象棋。这期营地最喜欢的活动是狼人杀。",
      "en": "Enjoys football and is good at basketball and Chinese chess. Werewolf was a favorite camp game."
    },
    "interests": {
      "zh": "足球 · 篮球 · 中国象棋",
      "en": "Football · Basketball · Chinese chess"
    },
    "portrait": "/images/participants/baomao-800.webp",
    "portraitSmall": "/images/participants/baomao-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "广州",
      "en": "Guangzhou"
    },
    "favorite": {
      "zh": "狼人杀",
      "en": "Werewolf"
    }
  },
  {
    "id": "luobo",
    "width": 800,
    "height": 533,
    "name": {
      "zh": "萝卜",
      "en": "Luobo"
    },
    "natureName": {
      "zh": "萝卜",
      "en": "Radish"
    },
    "bio": {
      "zh": "喜欢画画、音乐和运动，用图画记录森林、茶和球场。",
      "en": "Enjoys drawing, music, and sports. The introduction card includes drawings of a forest, tea, and a basketball court."
    },
    "interests": {
      "zh": "画画 · 音乐 · 运动",
      "en": "Drawing · Music · Sports"
    },
    "portrait": "/images/participants/luobo-800.webp",
    "portraitSmall": "/images/participants/luobo-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "成都",
      "en": "Chengdu"
    }
  },
  {
    "id": "baixiangguo",
    "guardianId": "qiu-lu",
    "width": 800,
    "height": 578,
    "name": {
      "zh": "秋鹭",
      "en": "Qiu Lu"
    },
    "natureName": {
      "zh": "百香果",
      "en": "Passion Fruit"
    },
    "bio": {
      "zh": "喜欢篮球和唱歌，擅长讲冷笑话，也喜欢在森林里睡觉。这期最喜欢树的冥想。",
      "en": "Enjoys basketball and singing, telling corny jokes, and resting in the forest. Tree meditation was a favorite camp activity."
    },
    "interests": {
      "zh": "篮球 · 唱歌 · 冷笑话",
      "en": "Basketball · Singing · Corny jokes"
    },
    "portrait": "/images/participants/baixiangguo-800.webp",
    "portraitSmall": "/images/participants/baixiangguo-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "深圳",
      "en": "Shenzhen"
    },
    "favorite": {
      "zh": "树的冥想",
      "en": "Tree meditation"
    }
  },
  {
    "id": "ruikang",
    "guardianId": "wang-ruikang",
    "width": 800,
    "height": 612,
    "name": {
      "zh": "王睿康",
      "en": "Wang Ruikang"
    },
    "natureName": {
      "zh": "澜生",
      "en": "Lansheng"
    },
    "bio": {
      "zh": "喜欢与人和自然打交道，喜欢摄影、音乐和旅行。",
      "en": "Enjoys connecting with people and nature, as well as photography, music, and travel."
    },
    "interests": {
      "zh": "摄影 · 音乐 · 旅行",
      "en": "Photography · Music · Travel"
    },
    "portrait": "/images/participants/ruikang-800.webp",
    "portraitSmall": "/images/participants/ruikang-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "北京",
      "en": "Beijing"
    }
  },
  {
    "id": "xiaohongmei",
    "width": 800,
    "height": 670,
    "name": {
      "zh": "小红莓",
      "en": "Xiaohongmei"
    },
    "natureName": {
      "zh": "小红莓",
      "en": "Little Cranberry"
    },
    "bio": {
      "zh": "来自上海，也与铁牛村相连。喜欢手作、游泳和喝茶，最喜欢和大家一起喝茶。",
      "en": "Comes from Shanghai and also has a connection to Tieniu Village. Enjoys crafts, swimming, and tea, especially sharing tea with others."
    },
    "interests": {
      "zh": "手作 · 游泳 · 喝茶",
      "en": "Crafts · Swimming · Tea"
    },
    "portrait": "/images/participants/xiaohongmei-800.webp",
    "portraitSmall": "/images/participants/xiaohongmei-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "上海",
      "en": "Shanghai"
    },
    "favorite": {
      "zh": "和大家一起喝茶",
      "en": "Sharing tea with everyone"
    }
  },
  {
    "id": "nate",
    "width": 800,
    "height": 1199,
    "name": {
      "zh": "Nate",
      "en": "Nate"
    },
    "natureName": {
      "zh": "野薄荷",
      "en": "Wild mint"
    },
    "bio": {
      "zh": "来自上海，在村庄生活了六年。喜欢交朋友、游泳和做饭，擅长公开演讲，喜欢与伙伴一起共创。",
      "en": "From Shanghai, with six years of village life described on the camp card. Enjoys making friends, swimming, cooking, and co-creation, and is skilled at public speaking."
    },
    "interests": {
      "zh": "交朋友 · 游泳 · 做饭 · 公开演讲",
      "en": "Making friends · Swimming · Cooking · Public speaking"
    },
    "portrait": "/images/participants/nate-800.webp",
    "portraitSmall": "/images/participants/nate-400.webp",
    "position": "50% 35%",
    "city": {
      "zh": "上海",
      "en": "Shanghai"
    },
    "favorite": {
      "zh": "共创",
      "en": "Co-creation"
    },
    "storyPath": "/community-stories/all?person=nateshi-94403ff7"
  }
] as const;

export const getParticipant = (id: string) => participants.find((person) => person.id === id);
export const participantPath = (id: string) => `/about/participants/${id}`;

export const getGuardianParticipant = (guardianId: string) => participants.find(person => person.guardianId === guardianId);

// People already introduced as founders, co-creators, or guardians stay in their
// original sections. Keep their source profiles for existing stories and links.
const separatelyFeaturedIds = new Set(['tianshi', 'rosie', 'ruby', 'ruikang', 'baixiangguo', 'nate', 'xiaohongmei']);
export const campCompanions = participants.filter(person => !separatelyFeaturedIds.has(person.id));
