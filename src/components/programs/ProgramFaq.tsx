import type { ActionProgramOption } from '@/content/actionPrograms';
import { getProgramFaqs } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProgramFaq({ program }: { program: ActionProgramOption }) {
  const { lang, t } = useLanguage();
  const faqs = getProgramFaqs(program.id);

  return (
    <section aria-labelledby="program-faq-title" className="program-faq">
      <div className="program-faq__grid">
        <div>
          <p>{t('参与之前', 'Before joining')}</p>
          <h2 id="program-faq-title" className="text-balance">
            {t('常见问题', 'Frequently asked questions')}
          </h2>
          <p className="text-pretty">
            {t(
              '这里整理了参与前最常见的问题。具体安排仍以当期项目说明为准。',
              'These are the questions people most often ask before joining. Session-specific information remains the final reference.',
            )}
          </p>
        </div>

        <Accordion type="single" collapsible className="program-faq__accordion">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question.zh} value={`${program.id}-faq-${index}`}>
              <AccordionTrigger className="py-6 text-left font-serif text-lg leading-7 text-foreground hover:no-underline sm:text-xl">
                {pickLocalized(faq.question, lang)}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-sm leading-8 text-muted-foreground sm:text-base">
                {pickLocalized(faq.answer, lang)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
