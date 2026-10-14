import reviewHtml from './voices/believe-and-see-camp-review.en.html?raw';
import letterHtml from './voices/chengzi-camp-letter.en.html?raw';

export const articleTranslations: Record<string, {
  title: string;
  excerpt: string;
  excerptZh: string;
  html: string;
}> = {
  'believe-and-see-camp-review': {
    excerptZh: '从替伙伴安排好一切，到学会等待、陪伴和信任，Nate 在五天的共创生活中重新理解了发起人的角色，也学着相信自己。',
    title: 'Believe, and You Will See: Looking Back on the Life Co-creation Camp',
    excerpt: 'Through five days of shared life, small moments with his companions taught Nate to trust their abilities—and his own. A reflection on clear boundaries, patient support, and room to grow.',
    html: reviewHtml,
  },
  'chengzi-camp-letter': {
    excerptZh: '从担心无聊、难以融入，到一起打球、喝茶、生火做饭，橙子在铁牛村找到了放下手机后鲜活而温暖的生活。',
    title: 'A Letter from Orange After the Life Co-creation Camp',
    excerpt: 'Orange expected a dull trip to the countryside. Basketball, shared tea, cooking outdoors, and the kindness of new friends opened up a different kind of village life.',
    html: letterHtml,
  },
};

export const articleAuthorNames: Record<string, string> = {
  '液态氧': 'Nate Shi',
  Nate: 'Nate Shi',
  '橙子': 'Orange',
  '陈若容': 'Rosie Chen',
  '黄若音': 'Ruby Huang',
  '张天时': 'Tianshi Zhang',
};
