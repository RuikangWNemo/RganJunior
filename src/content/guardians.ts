import type { LocalizedText } from '@/lib/brand';

export type GuardianMember = {
  id: string;
  photo: string;
  name?: LocalizedText;
  bio?: LocalizedText;
};

// One public roster for the carousel, directory, and individual profiles.
// Keep IDs stable when adding confirmed names and biographies.
export const guardianMembers: readonly GuardianMember[] = [
  { id: 'zhao-jing', photo: '/images/about/adult-support/zhao-jing.jpg', name: { zh: '赵璟', en: 'Zhao Jing' } },
  { id: 'qiu-lu', photo: '/images/about/adult-support/adult-support-05.webp', name: { zh: '秋鹭', en: 'Qiu Lu' } },
  { id: 'wang-ruikang', photo: '/images/about/adult-support/adult-support-06.webp', name: { zh: '王睿康', en: 'Wang Ruikang' } },
  { id: 'teacher-deng', photo: '/images/about/adult-support/adult-support-07.webp', name: { zh: '邓老师', en: 'Teacher Deng' } },
  { id: 'zhiyu', photo: '/images/about/adult-support/adult-support-08.webp', name: { zh: '知予', en: 'Zhiyu' } },
  { id: 'guardian-01', photo: '/images/about/adult-support/adult-support-03.webp' },
  { id: 'guardian-02', photo: '/images/about/adult-support/adult-support-04.webp' },
  { id: 'guardian-03', photo: '/images/about/parent-guardian/parent-guardian-03.webp' },
  { id: 'guardian-04', photo: '/images/about/parent-guardian/parent-guardian-04.webp' },
  { id: 'guardian-05', photo: '/images/about/parent-guardian/parent-guardian-05.webp' },
  { id: 'guardian-06', photo: '/images/about/parent-guardian/parent-guardian-06.webp' },
  { id: 'guardian-07', photo: '/images/about/parent-guardian/parent-guardian-07.webp' },
  { id: 'guardian-08', photo: '/images/about/parent-guardian/parent-guardian-08.webp' },
  { id: 'guardian-09', photo: '/images/about/parent-guardian/parent-guardian-09.webp' },
];

export function guardianProfilePath(member: GuardianMember) {
  return `/about/guardians/${member.id}`;
}
