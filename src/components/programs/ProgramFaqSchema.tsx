import type { ActionProgramOption } from '@/content/actionPrograms';
import { getProgramFaqs } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function ProgramFaqSchema({ program }: { program: ActionProgramOption }) {
  const { lang } = useLanguage();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: pickLocalized(program.title, lang),
    mainEntity: getProgramFaqs(program.id).map((faq) => ({
      '@type': 'Question',
      name: pickLocalized(faq.question, lang),
      acceptedAnswer: {
        '@type': 'Answer',
        text: pickLocalized(faq.answer, lang),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      data-schema-id={`program-faq-${program.id}`}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
