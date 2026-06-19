import { Link } from 'react-router-dom';
import { ArrowLeft, Film, FileText, Mic2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const futureFormats = [
  {
    icon: FileText,
    label: { zh: '访谈文字', en: 'Interview Notes' },
    status: { zh: '整理中', en: 'In preparation' },
  },
  {
    icon: Mic2,
    label: { zh: '真实音频', en: 'Real Audio' },
    status: { zh: '预留', en: 'Reserved' },
  },
  {
    icon: Film,
    label: { zh: '短片记录', en: 'Short Films' },
    status: { zh: '预留', en: 'Reserved' },
  },
];

export default function Voices() {
  const { lang, t } = useLanguage();

  return (
    <div className="pt-20">
      <section className="pt-20 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 lg:pt-48">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/join"
            data-page-motion="title"
            className="cursor-target inline-flex items-center gap-2 text-sm text-muted-foreground transition-organic hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('返回加入页面', 'Back to Join')}</span>
          </Link>

          <div className="mt-10 max-w-3xl min-w-0">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Voices', 'Voices')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('伙伴之声', 'Partner Voices')}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl break-words text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '这里将只放经过整理的真实声音。当前先保持留白，避免用零散材料填满页面。',
                'This page will hold only carefully prepared real voices. For now, it stays intentionally quiet instead of filling the space with scattered placeholders.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/35 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div data-page-motion="actions" className="grid gap-8 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] md:items-start">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Archive', 'Archive')}
              </p>
              <h2 className="mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('正在整理', 'In Preparation')}
              </h2>
            </div>
            <p className="min-w-0 break-words text-base leading-8 text-muted-foreground">
              {t(
                '后续内容可以从文字访谈开始，再逐步加入音频、播客片段或短片。每一条内容都应来自真实参与者、家长或合作伙伴，而不是临时占位。',
                'Future updates can begin with written interviews, then expand into audio, podcast clips, or short films. Each entry should come from a real participant, parent, or partner rather than a temporary placeholder.'
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border/80">
            {futureFormats.map((format) => {
              const Icon = format.icon;

              return (
                <div
                  key={format.label.en}
                  className="grid gap-4 border-b border-border/80 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/70 bg-background/70 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="font-serif text-xl text-foreground">
                    {format.label[lang]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format.status[lang]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
