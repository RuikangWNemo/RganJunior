import { CONTACT_EMAIL } from '@/lib/brand';

export type PublicContactChannels = {
  email: string;
  phone?: string;
  wechatId?: string;
  wechatQrImage?: string;
};

export const PUBLIC_CONTACT: PublicContactChannels = {
  email: CONTACT_EMAIL,
};

export function getPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
