import { Section, Text } from '@react-email/components';

import { formatVerificationCode } from '../format.js';

export default function VerificationCode({ token }: { token: string }) {
  return (
    <Section
      style={{
        backgroundColor: '#fff8ed',
        border: '1px solid #f2d3b6',
        borderRadius: '18px',
        margin: '18px 0 24px',
        padding: '18px 12px',
        textAlign: 'center',
      }}
    >
      <Text
        style={{
          color: '#24483b',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '5px',
          lineHeight: '1.2',
          margin: 0,
        }}
      >
        {formatVerificationCode(token)}
      </Text>
    </Section>
  );
}
