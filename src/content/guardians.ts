import type { LocalizedText } from '@/lib/brand';

export type GuardianMember = {
  id: string;
  aliases?: readonly string[];
  photo: string;
  name?: LocalizedText;
  bio?: LocalizedText;
  cardScale?: number;
  cardPosition?: string;
  fullPhotoInProfile?: boolean;
};

// One public roster for the carousel, directory, and individual profiles.
// Keep IDs stable when adding confirmed names and biographies.
export const guardianMembers: readonly GuardianMember[] = [
  { id: 'zhao-jing', photo: '/images/about/adult-support/zhao-jing.jpg', name: { zh: '赵璟', en: 'Jing Zhao' } },
  { id: 'he-chaochao', photo: '/images/about/adult-support/adult-support-02.webp', name: { zh: '贺超超', en: 'Chaochao He' } },
  { id: 'qiu-lu', photo: '/images/about/adult-support/adult-support-05.webp', name: { zh: '秋鹭', en: 'Qiu Lu' } },
  { id: 'wang-ruikang', photo: '/images/about/adult-support/adult-support-06.webp', name: { zh: '王睿康', en: 'Ruikang Wang' } },
  { id: 'teacher-deng', photo: '/images/about/adult-support/adult-support-07.webp', name: { zh: '邓老师', en: 'Teacher Deng' } },
  { id: 'zhiyu', photo: '/images/about/adult-support/adult-support-08.webp', name: { zh: '知予', en: 'Zhiyu' } },
  { id: 'guardian-01', photo: '/images/about/adult-support/adult-support-03.webp' },
  { id: 'guardian-02', photo: '/images/about/guardians/cha-jingling-20261013.jpg', name: { zh: '茶精灵', en: 'Cha Jingling' }, fullPhotoInProfile: true },
  { id: 'guardian-03', photo: '/images/about/guardians/da-yumi-20261013.jpg', name: { zh: '大玉米', en: 'Big Corn' }, fullPhotoInProfile: true },
  { id: 'guardian-04', photo: '/images/about/parent-guardian/parent-guardian-04.webp' },
  { id: 'guardian-05', photo: '/images/about/guardians/mulan-20261013.jpg', name: { zh: '木兰', en: 'Mulan' }, cardScale: 1.25, fullPhotoInProfile: true },
  { id: 'guardian-06', photo: '/images/about/parent-guardian/parent-guardian-06.webp' },
  { id: 'guardian-07', photo: '/images/about/parent-guardian/parent-guardian-07.webp' },
  { id: 'zhuo-fei', aliases: ['guardian-08'], photo: '/images/about/guardians/zhuo-fei-20261014-upright.png', name: { zh: '卓霏', en: 'Fei Zhuo' }, cardPosition: '50% 50%', fullPhotoInProfile: true },
  { id: 'guardian-09', photo: '/images/about/parent-guardian/parent-guardian-09.webp' },
];

export function guardianProfilePath(member: GuardianMember) {
  return `/about/guardians/${member.id}`;
}
