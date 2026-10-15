export const impactChapters = [
  { id: "project-data", zh: "项目数据", en: "Program Data" },
  { id: "growth-stories", zh: "成长故事", en: "Growth Stories" },
  { id: "family-observation", zh: "家庭观察", en: "Family Observations" },
  { id: "continuing-actions", zh: "持续行动", en: "Continued Action" },
  { id: "website-visits", zh: "网站访问", en: "Website Visits" },
  { id: "public-records", zh: "获奖与成果", en: "Awards & Achievements" },
] as const;

export type ImpactChapterId = (typeof impactChapters)[number]["id"];

export function readImpactChapterHash(hash: string): ImpactChapterId | null {
  return (
    impactChapters.find((chapter) => `#${chapter.id}` === hash)?.id ?? null
  );
}
