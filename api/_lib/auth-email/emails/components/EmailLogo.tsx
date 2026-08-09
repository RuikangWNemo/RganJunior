import { Img, Section, Text } from '@react-email/components';

import type { EmailLocale } from '../types.js';

const LOGO_URL = 'https://www.rganjunior.org/brand/rgan-junior-email-logo.png';

export default function EmailLogo({ locale }: { locale: EmailLocale }) {
  const brand = locale === 'zh-CN' ? '阿柑少年' : 'R-Gan Junior';
  const alt = locale === 'zh-CN' ? '阿柑少年官方标志' : 'Official R-Gan Junior logo';
  return (
    <Section style={{ textAlign: 'center' }}>
      <Img
        alt={alt}
        height="64"
        src={LOGO_URL}
        style={{ borderRadius: '18px', display: 'inline-block' }}
        width="64"
      />
      <Text style={{ color: '#24483b', fontSize: '17px', fontWeight: 700, margin: '12px 0 0' }}>
        {brand}
      </Text>
    </Section>
  );
}
