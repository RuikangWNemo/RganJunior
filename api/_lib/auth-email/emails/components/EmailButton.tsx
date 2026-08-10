import { Button, Section } from '@react-email/components';

export default function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ margin: '28px 0', textAlign: 'center' }}>
      <Button
        href={href}
        style={{
          backgroundColor: '#285848',
          borderRadius: '999px',
          color: '#ffffff',
          display: 'inline-block',
          fontSize: '15px',
          fontWeight: 700,
          padding: '13px 24px',
          textDecoration: 'none',
        }}
      >
        {label}
      </Button>
    </Section>
  );
}
