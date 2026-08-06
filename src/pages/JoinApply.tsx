import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Sprout } from 'lucide-react';
import JoinApplicationForm from '@/components/join/JoinApplicationForm';
import { Button } from '@/components/ui/button';
import mascotWide from '@/assets/mascot-wide.png';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { CONTACT_EMAIL, pickLocalized } from '@/lib/brand';

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
  const activeAudience = joinAudiences.find((item) => item.id === initialAudience) ?? joinAudiences[0];

  return (
    <div className="join-apply-page paper-texture bg-background pt-20">
      <section className="join-apply-hero relative isolate overflow-hidden bg-forest text-forest-foreground">
        <div className="join-apply-orbit join-apply-orbit--top" aria-hidden="true" />
        <div className="join-apply-orbit join-apply-orbit--bottom" aria-hidden="true" />

        <div className="join-apply-hero-shell container relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24">
          <Button
            asChild
            variant="ghost"
            className="join-apply-back cursor-target -ml-3 mb-10 text-forest-foreground/75 hover:bg-forest-foreground/10 hover:text-forest-foreground sm:mb-14"
          >
            <Link to="/join">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('返回加入方式', 'Back to join options')}</span>
            </Link>
          </Button>

          <div className="join-apply-hero-grid grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
            <div className="join-apply-copy relative z-20 max-w-3xl">
              <p data-page-motion="title" className="join-mobile-kicker text-xs uppercase text-forest-foreground/60">
                {t('种子社群 · 加入申请', 'Seed Community · Apply')}
              </p>
              <h1 data-page-motion="title" className="mt-5 text-balance font-serif text-4xl leading-tight text-forest-foreground md:text-5xl lg:text-6xl">
                {t('填写加入表单', 'Let’s get to know each other')}
              </h1>
              <p data-page-motion="lead" className="mt-7 max-w-xl text-pretty text-base leading-8 text-forest-foreground/72 md:text-lg">
                {t(
                  '每一种同行，都从一次真诚的认识开始。留下你的想法，我们会认真读完，再好好回应。',
                  'Every journey together begins with an honest hello. Share what is on your mind—we will read it with care and get back to you.'
                )}
              </p>

              <div className="join-apply-path mt-8" aria-label={t('当前加入身份', 'Selected way to join')}>
                <svg viewBox="0 0 460 72" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 6 50 C 120 50 138 12 238 24 S 350 65 454 30" />
                </svg>
                <div className="join-apply-path-label">
                  <span aria-hidden="true" />
                  <span>{pickLocalized(activeAudience.trigger, lang)}</span>
                </div>
              </div>
            </div>

            <div className="join-apply-mascot-wrap" aria-hidden="true">
              <div className="join-apply-speech">
                {t('很高兴认识你，慢慢写。', 'So glad to meet you. Take your time.')}
              </div>
              <img
                src={mascotWide}
                alt=""
                width={1125}
                height={705}
                className="join-apply-mascot h-auto w-full select-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="join-apply-form-section relative py-14 sm:py-20 lg:py-24">
        <div className="join-apply-grid container relative z-10 mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:items-start lg:gap-10 lg:px-8">
          <div className="join-apply-form-card">
            <div className="join-apply-form-intro">
              <div>
                <p className="join-apply-form-kicker">{t('从认识你开始', 'A little about you')}</p>
                <h2 className="mt-2 text-balance font-serif text-2xl leading-tight text-foreground sm:text-3xl">
                  {t('没有标准答案，写下真实的你就好。', 'There are no perfect answers—just be yourself.')}
                </h2>
              </div>
              <span className="join-apply-time">{t('约 2 分钟', 'About 2 min')}</span>
            </div>
            <JoinApplicationForm initialAudience={initialAudience} />
          </div>

          <aside className="join-apply-aside lg:sticky lg:top-28">
            <Sprout className="size-6 text-[#ff6a1f]" aria-hidden="true" />
            <p className="mt-5 font-serif text-xl leading-snug text-forest-foreground">
              {t('一颗种子不需要立刻知道，自己会长成什么样。', 'A seed does not need to know right away what it will become.')}
            </p>
            <p className="mt-5 text-sm leading-7 text-forest-foreground/68">
              {t(
                '先让我们知道你从哪里来、在意什么。后面的路，可以在对话里一起找到。',
                'Tell us where you are coming from and what matters to you. We can find the next step together in conversation.'
              )}
            </p>

            <div className="join-apply-email">
              <p>{t('也可以直接写信给我们', 'Or write to us directly')}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="cursor-target mt-3 inline-flex min-w-0 items-center gap-2 break-all text-sm text-forest-foreground transition-colors hover:text-[#ffb17f]"
              >
                <Mail className="size-4 shrink-0 text-[#ff6a1f]" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
