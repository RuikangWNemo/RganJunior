import { resolveActionProgramId, type ActionProgramId } from '@/content/actionPrograms';

export const PROGRAM_SECTION_CHANGE_EVENT = 'rgan:program-section-change';
export const PROGRAM_SECTION_SELECT_EVENT = 'rgan:program-section-select';

export const PROGRAM_SECTION_IDS = [
  'life-experience-camp',
  'life-co-creation-camp',
  'action-group',
  'public-projects',
] as const satisfies readonly ActionProgramId[];

export function isProgramSectionId(value: unknown): value is ActionProgramId {
  return typeof value === 'string' && PROGRAM_SECTION_IDS.includes(value as ActionProgramId);
}

export function readProgramSectionHash(hash: string): ActionProgramId | null {
  const sectionId = hash.replace(/^#/, '');
  return resolveActionProgramId(sectionId) ?? null;
}

export function readProgramLocation(
  pathname: string,
  hash: string,
  search = '',
): ActionProgramId | null {
  if (pathname === '/programs') return readProgramSectionHash(hash) ?? 'life-experience-camp';
  if (pathname === '/programs/inquiry') {
    const requestedId = new URLSearchParams(search).get('program');
    return resolveActionProgramId(requestedId) ?? 'life-experience-camp';
  }

  const detailId = pathname.match(/^\/programs\/([^/]+)\/?$/)?.[1];
  return resolveActionProgramId(detailId) ?? null;
}

export function announceProgramSection(sectionId: ActionProgramId) {
  window.dispatchEvent(
    new CustomEvent<ActionProgramId>(PROGRAM_SECTION_CHANGE_EVENT, { detail: sectionId }),
  );
}

export function requestProgramSection(sectionId: ActionProgramId) {
  window.dispatchEvent(
    new CustomEvent<ActionProgramId>(PROGRAM_SECTION_SELECT_EVENT, { detail: sectionId }),
  );
}
