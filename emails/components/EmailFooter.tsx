import { Hr, Link, Text } from '@react-email/components';

import type { EmailLocale } from '../types.js';

export default function EmailFooter({ locale }: { locale: EmailLocale }) {
  return (
    <>
      <Hr style={{ borderColor: '#e5ded0', margin: '32px 0 20px' }} />
      <Text style={{ color: '#718078', fontSize: '12px', lineHeight: '20px', margin: 0, textAlign: 'center' }}>
        {locale === 'zh-CN' ? '阿柑少年 · 在真实世界中，长成自己' : 'R-Gan Junior · Grow into yourself in the real world'}
        <br />
        <Link href="https://www.rganjunior.org" style={{ color: '#285848', textDecoration: 'none' }}>
          rganjunior.org
        </Link>
      </Text>
    </>
  );
}
