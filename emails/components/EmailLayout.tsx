import type { ReactNode } from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
} from '@react-email/components';

import type { EmailLocale } from '../types.js';
import EmailFooter from './EmailFooter.js';
import EmailLogo from './EmailLogo.js';

export default function EmailLayout({
  children,
  locale,
  preview,
  title,
}: {
  children: ReactNode;
  locale: EmailLocale;
  preview: string;
  title: string;
}) {
  return (
    <Html lang={locale === 'zh-CN' ? 'zh-CN' : 'en'}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f5f0e6', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '28px 12px' }}>
        <Container
          style={{
            backgroundColor: '#fffdf8',
            border: '1px solid #ebe2d3',
            borderRadius: '24px',
            boxShadow: '0 16px 44px rgba(42, 70, 58, 0.08)',
            margin: '0 auto',
            maxWidth: '580px',
            overflow: 'hidden',
          }}
        >
          <Section style={{ backgroundColor: '#ea6a2a', height: '6px' }} />
          <Section style={{ padding: '34px 28px 30px' }}>
            <Section aria-hidden="true" style={{ color: '#ea6a2a', fontSize: '12px', letterSpacing: '8px', marginBottom: '22px', textAlign: 'center' }}>
              ● <span style={{ color: '#5b8566' }}>—</span> ●
            </Section>
            <EmailLogo locale={locale} />
            <Heading
              style={{
                color: '#24483b',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.4px',
                lineHeight: '38px',
                margin: '30px 0 14px',
                textAlign: 'center',
              }}
            >
              {title}
            </Heading>
            {children}
            <EmailFooter locale={locale} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
