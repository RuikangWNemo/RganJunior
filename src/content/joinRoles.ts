import type { JoinAudienceId } from './siteContent';
import type { LocalizedText } from '@/lib/brand';

// Public wording is shared by Home and Join Us. Keep existing form IDs stable.
export const joinRoleLabels: Record<JoinAudienceId, LocalizedText> = {
  'join-youth': { zh: '阿柑少年', en: 'R-Gan Junior' },
  'join-parents': { zh: '守护团', en: 'Guardian Circle' },
  'join-partners': { zh: '合作伙伴', en: 'Partners' },
};
