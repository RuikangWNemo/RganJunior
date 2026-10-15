// Approved in the 2026-10-15 proofreading sheet. Apply only exact excerpts in
// these published stories; preserve authors, visibility, and all other edits.
const corrections: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  'it-takes-a-village': [
    [
      '阿柑少年计划：通过一颗柑橘参与可持续性发展农业的调研和实践',
      '阿柑少年计划：通过一颗柑橘参与可持续性发展农业的调研和实践（论文及当时的 CTB 项目使用英文名 Agan Junior，项目现统一使用 R-Gan Junior）',
    ],
    ['“行为经济学学习社团”关于CSA研究课题调研问卷', '行为经济学学习社团的 CSA 研究问卷。'],
    ['更多照片请上下滑动', '上下滑动查看更多照片。'],
  ],
  'tea-connects-an-american-girl': [
    ['一碗茶，如何让一个美国女孩走进阿柑少年', '一碗茶，如何让一个在美国生活的女孩走进阿柑少年'],
  ],
  'tea-kitchen-and-summer': [
    ['共同的兴趣兴趣', '共同的兴趣'],
    ['从小，他经常到茶山参加禅茶课，去义工。', '从我小时候起，他就经常到茶山参加禅茶课、做义工。'],
  ],
  'technology-ecology-stars': [
    ['为科技少年，我想做什么', '作为科技少年，我想做什么'],
  ],
  'chengzi-camp-letter': [
    ['2026年2月', '2026年1月'],
  ],
};

export function correctedArticleCopy(slug: string, value: string): string {
  return (corrections[slug] ?? []).reduce(
    (text, [before, after]) => after.includes(before)
      ? text.split(after).map((part) => part.split(before).join(after)).join(after)
      : text.split(before).join(after),
    value,
  );
}
