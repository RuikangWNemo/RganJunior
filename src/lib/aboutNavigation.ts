export const ABOUT_CHAPTER_CHANGE_EVENT = 'rgan:about-chapter-change';
export const ABOUT_CHAPTER_SELECT_EVENT = 'rgan:about-chapter-select';

export const ABOUT_CHAPTER_IDS = ['mission', 'story', 'team'] as const;

export type AboutChapterId = (typeof ABOUT_CHAPTER_IDS)[number];

export function isAboutChapterId(value: string): value is AboutChapterId {
  return ABOUT_CHAPTER_IDS.includes(value as AboutChapterId);
}

export function readAboutChapterHash(hash: string): AboutChapterId | null {
  const chapterId = hash.replace(/^#/, '');
  return isAboutChapterId(chapterId) ? chapterId : null;
}

export function announceAboutChapter(chapterId: AboutChapterId) {
  window.dispatchEvent(
    new CustomEvent<AboutChapterId>(ABOUT_CHAPTER_CHANGE_EVENT, { detail: chapterId }),
  );
}

export function requestAboutChapter(chapterId: AboutChapterId) {
  window.dispatchEvent(
    new CustomEvent<AboutChapterId>(ABOUT_CHAPTER_SELECT_EVENT, { detail: chapterId }),
  );
}
