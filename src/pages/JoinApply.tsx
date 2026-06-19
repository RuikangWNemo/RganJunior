import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import JoinApplicationForm from '@/components/join/JoinApplicationForm';
import { Button } from '@/components/ui/button';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, CONTACT_EMAIL, pickLocalized } from '@/lib/brand';

const validAudienceIds = new Set<JoinAudienceId>(joinAudiences.map((item) => item.id));

function getAudienceFromParam(value: string | null): JoinAudienceId {
  if (value && validAudienceIds.has(value as JoinAudienceId)) {
    return value as JoinAudienceId;
  }

  return 'join-youth';
}

export default function JoinApply() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialAudience = getAudienceFromParam(searchParams.get('audience'));
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <div className="pt-20">
      <section className="pt-20 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 lg:pt-44">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="cursor-target -ml-3 mb-10">
            <Link to="/join">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('返回加入方式', 'Back to join options')}</span>
            </Link>
          </Button>

          <div className="max-w-3xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Apply', 'Apply')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('填写加入表单', `Apply to ${brandName}`)}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl break-words text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '表单会进入统一统计记录，帮助我们理解你的加入意向，并安排后续沟通。',
                'This form enters one shared response record, helping us understand your joining interest and arrange follow-up.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border/80 py-16 md:py-20">
        <div className="container mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.75fr)] lg:px-8">
          <JoinApplicationForm initialAudience={initialAudience} />

          <aside className="border-y border-border/80 py-8">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Shared Channel', 'Shared Channel')}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {t(
                '如果表单暂时无法提交，也可以直接通过邮箱联系。',
                'If the form cannot submit for the moment, email remains open.'
              )}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="cursor-target mt-8 inline-flex min-w-0 items-center gap-2 break-all text-sm text-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              {CONTACT_EMAIL}
            </a>
          </aside>
        </div>
      </section>
    </div>
  );
}
