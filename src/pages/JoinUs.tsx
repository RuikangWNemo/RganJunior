import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Mic2, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, type LocalizedText, pickLocalized } from '@/lib/brand';

type IdentityId = 'join-youth' | 'join-parents' | 'join-partners';

interface IdentityRow {
  label: LocalizedText;
  value: LocalizedText;
}

interface IdentityContent {
  id: IdentityId;
  trigger: LocalizedText;
  heading: LocalizedText;
  intro: LocalizedText;
  rows: IdentityRow[];
  closing: LocalizedText;
}

const identities: IdentityContent[] = [
  {
    id: 'join-youth',
    trigger: { zh: '成为阿柑少年', en: 'Become R\'gan Junior Youth' },
    heading: { zh: '成为阿柑少年', en: 'Become R\'gan Junior Youth' },
    intro: {
      zh: '如果你感到焦虑、迷茫、疲惫，但仍然渴望真实、自然与意义——阿柑少年欢迎你。在这里，你可以：',
      en: 'If you feel anxious, lost, or exhausted, yet still long for what is real, natural, and meaningful, R\'gan Junior welcomes you. Here, you can:',
    },
    rows: [
      {
        label: { zh: '回归内心', en: 'Return Inward' },
        value: {
          zh: '暂时放下学业压力，回归内心。',
          en: 'Set down academic pressure for a while and return to your inner self.',
        },
      },
      {
        label: { zh: '自然疗愈', en: 'Nature' },
        value: {
          zh: '在自然中找到疗愈与力量。',
          en: 'Find healing and strength in nature.',
        },
      },
      {
        label: { zh: '研究行动', en: 'Research & Action' },
        value: {
          zh: '用研究和行动理解真实世界。',
          en: 'Use research and action to understand the real world.',
        },
      },
      {
        label: { zh: '同行伙伴', en: 'Peers' },
        value: {
          zh: '遇见志同道合的伙伴。',
          en: 'Meet peers who share the same direction.',
        },
      },
    ],
    closing: {
      zh: '正式联系方式将统一发布在下方。',
      en: 'Formal contact details will be published below as one shared set.',
    },
  },
  {
    id: 'join-parents',
    trigger: { zh: '成为阿柑家长', en: 'Become an R\'gan Junior Parent' },
    heading: { zh: '成为阿柑家长', en: 'Become an R\'gan Junior Parent' },
    intro: {
      zh: '如果你希望孩子在真实世界中成长，而不是被焦虑推着向前——欢迎了解并支持我们。阿柑少年提供：',
      en: 'If you hope your child can grow in the real world instead of being pushed forward by anxiety, we invite you to learn about and support us. R\'gan Junior provides:',
    },
    rows: [
      {
        label: { zh: '成长环境', en: 'Environment' },
        value: {
          zh: '安全、有爱的成长环境。',
          en: 'A safe, caring environment for growth.',
        },
      },
      {
        label: { zh: '学习路径', en: 'Learning Path' },
        value: {
          zh: '科学、系统的学习路径。',
          en: 'A scientific and systematic learning path.',
        },
      },
      {
        label: { zh: '实践机会', en: 'Practice' },
        value: {
          zh: '真实、深度的实践机会。',
          en: 'Real and deep opportunities for practice.',
        },
      },
      {
        label: { zh: '陪伴支持', en: 'Support' },
        value: {
          zh: '专业、耐心的陪伴支持。',
          en: 'Professional and patient guidance and support.',
        },
      },
    ],
    closing: {
      zh: '正式联系方式将统一发布在下方。',
      en: 'Formal contact details will be published below as one shared set.',
    },
  },
  {
    id: 'join-partners',
    trigger: { zh: '成为合作伙伴', en: 'Become a Partner' },
    heading: { zh: '成为合作伙伴', en: 'Become a Partner' },
    intro: {
      zh: '如果你希望从研究、教育、来访或合作交流进入阿柑少年，这里是合作伙伴的入口。它适合先判断彼此的方向是否相近，再决定是否继续向前。',
      en: 'If you want to enter R\'gan Junior through research, education, site visits, or collaboration, this is the partner entry point. It is meant for first judging whether the direction is aligned before deciding to go further.',
    },
    rows: [
      {
        label: { zh: '适合', en: 'For' },
        value: {
          zh: '希望发起来访、研究交流、教育合作或资源连接的伙伴。',
          en: 'Partners seeking visits, research exchange, educational collaboration, or resource connection.',
        },
      },
      {
        label: { zh: '可以先了解', en: 'Begin With' },
        value: {
          zh: '项目方向、当前阶段，以及适合进入的合作话题。',
          en: 'The project direction, current stage, and the kinds of collaboration conversations that fit now.',
        },
      },
    ],
    closing: {
      zh: '正式联系方式将统一发布在下方。',
      en: 'Formal contact details will be published below as one shared set.',
    },
  },
];

const contactLedger: LocalizedText[] = [
  { zh: '邮箱', en: 'Email' },
  { zh: '微信', en: 'WeChat' },
  { zh: '电话', en: 'Phone' },
  { zh: '地址', en: 'Address' },
  { zh: '社交平台', en: 'Social Channels' },
];

const voiceEpisodes = [
  {
    episode: '01',
    speaker: {
      zh: '阿柑少年参与者',
      en: 'R’gan Junior participant',
    },
    title: {
      zh: '山野之后，我重新听见了自己',
      en: 'After the mountains, I could hear myself again',
    },
    quote: {
      zh: '那几天没有人催我快一点。我在泥土、树和同伴的沉默里，第一次感觉焦虑可以慢慢松开。',
      en: 'For those days, no one pushed me to move faster. In the soil, trees, and quiet company of peers, I felt anxiety loosen for the first time.',
    },
    length: {
      zh: '短音频 · 03:20',
      en: 'Short audio · 03:20',
    },
  },
  {
    episode: '02',
    speaker: {
      zh: '家长观察',
      en: 'Parent reflection',
    },
    title: {
      zh: '孩子开始把餐桌和土地联系起来',
      en: 'My child began connecting the table with the land',
    },
    quote: {
      zh: '他不只是问价格贵不贵，也开始问这个橘子怎么长出来、为什么值得信任。',
      en: 'He no longer only asks whether something is expensive; he asks how the orange was grown and why it can be trusted.',
    },
    length: {
      zh: '播客片段 · 04:10',
      en: 'Podcast clip · 04:10',
    },
  },
  {
    episode: '03',
    speaker: {
      zh: '合作伙伴',
      en: 'Partner voice',
    },
    title: {
      zh: '乡村不是素材，而是共同学习的现场',
      en: 'The village is not material; it is a shared learning site',
    },
    quote: {
      zh: '阿柑少年最打动我的地方，是他们愿意把研究、情感和行动放回同一个真实社区里。',
      en: 'What moved me most is their willingness to place research, emotion, and action back into one real community.',
    },
    length: {
      zh: '访谈摘录 · 05:00',
      en: 'Interview excerpt · 05:00',
    },
  },
];

const contentById = new Map(identities.map((item) => [item.id, item]));

const panelTransition = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function JoinUs() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const [activeId, setActiveId] = useState<IdentityId>('join-youth');

  const activeContent = useMemo(
    () => contentById.get(activeId) ?? identities[0],
    [activeId]
  );

  return (
    <div className="pt-20">
      <section className="pt-20 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 lg:pt-48">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Join', 'Join')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('加入阿柑少年', `Join ${brandName}`)}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '先听见参与者、家长与合作伙伴的真实感受，再选择适合你的加入方式。',
                `Hear from participants, parents, and partners first, then choose the path that fits how you want to join ${brandName}.`
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="voices" className="join-voices-section border-y border-border/70 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] md:items-end">
            <div>
              <p className="join-motion join-stage-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Voices', 'Voices')}
              </p>
              <h2 className="join-motion join-stage-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('伙伴之声', 'Partner Voices')}
              </h2>
            </div>
            <p className="join-motion join-stage-intro max-w-2xl text-base leading-8 text-muted-foreground md:justify-self-end">
              {t(
                '我们把参与者、家长与合作伙伴的感悟整理为短音频和播客片段，让新的同行者先听见真实的人。',
                'We collect reflections from participants, parents, and partners as short audio and podcast clips, so new companions can first hear real people.'
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {voiceEpisodes.map((episode) => (
              <article key={episode.episode} className="join-voice-card rounded-md border border-border/70 bg-card/70 p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="join-voice-icon inline-flex h-11 w-11 items-center justify-center rounded-md border border-border/70 bg-background/70 text-primary">
                    <Mic2 className="h-5 w-5" />
                  </span>
                  <span className="join-voice-meta text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    EP {episode.episode}
                  </span>
                </div>
                <p className="join-voice-meta mt-8 text-xs uppercase tracking-[0.2em] text-primary/70">
                  {pickLocalized(episode.speaker, lang)}
                </p>
                <h3 className="join-voice-title mt-4 font-serif text-xl leading-snug text-foreground">
                  {pickLocalized(episode.title, lang)}
                </h3>
                <p className="join-voice-quote mt-5 text-sm leading-7 text-muted-foreground">
                  “{pickLocalized(episode.quote, lang)}”
                </p>
                <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
                  <span className="join-voice-meta text-xs text-muted-foreground">
                    {pickLocalized(episode.length, lang)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    {t('采集中', 'Recording')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div data-page-motion="actions" className="border-b border-border/80">
            <div
              role="tablist"
              aria-label={t('加入身份选择', 'Join identity selector')}
              className="flex flex-wrap gap-6 md:gap-10"
            >
              {identities.map((identity) => {
                const isActive = activeId === identity.id;

                return (
                  <button
                    key={identity.id}
                    type="button"
                    id={`join-tab-${identity.id}`}
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive}
                    aria-controls={`join-panel-${identity.id}`}
                    onClick={() => setActiveId(identity.id)}
                    className={`join-identity-tab -mb-px border-b pb-4 text-left font-serif text-lg transition-organic md:text-xl ${
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {pickLocalized(identity.trigger, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            key={activeId}
            id={`join-panel-${activeId}`}
            role="tabpanel"
            aria-labelledby={`join-tab-${activeId}`}
            variants={panelTransition}
            initial="initial"
            animate="animate"
            className="join-panel mt-14 max-w-3xl"
          >
            <p className="join-motion join-motion-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Identity', 'Identity')}
            </p>
            <h2 className="join-motion join-motion-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {pickLocalized(activeContent.heading, lang)}
            </h2>
            <p className="join-motion join-motion-intro mt-8 max-w-xl text-base leading-8 text-muted-foreground">
              {pickLocalized(activeContent.intro, lang)}
            </p>

            <dl className="join-motion join-motion-rows mt-10 border-t border-border/80">
              {activeContent.rows.map((row) => (
                <div
                  key={pickLocalized(row.label, lang)}
                  className="join-detail-row grid gap-2 border-b border-border/80 py-5 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8"
                >
                  <dt className="join-detail-label text-xs uppercase tracking-[0.18em] text-primary/70">
                    {pickLocalized(row.label, lang)}
                  </dt>
                  <dd className="join-detail-value text-sm leading-7 text-foreground/88">
                    {pickLocalized(row.value, lang)}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href="#contact-ledger"
              className="join-motion join-motion-link mt-8 inline-flex items-center gap-2 text-sm text-foreground transition-organic hover:text-primary"
            >
              <span>{pickLocalized(activeContent.closing, lang)}</span>
              <ArrowDownRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="max-w-3xl">
            <p className="join-motion join-stage-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('当前阶段', 'Current Stage')}
            </p>
            <h2 className="join-motion join-stage-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {t('我们正处于小规模深度探索阶段', 'We are in a small-scale, in-depth exploration stage')}
            </h2>
            <p className="join-motion join-stage-intro mt-8 max-w-2xl text-base leading-8 text-muted-foreground">
              {t(
                '名额有限。如果你认同我们的理念，请通过官方渠道联系我们。',
                'Limited availability. If you share our values, please contact us through official channels.'
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="contact-ledger" className="border-t border-border/80 py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="max-w-3xl">
            <p className="join-motion join-contact-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Contact', 'Contact')}
            </p>
            <h2 className="join-motion join-contact-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {t('统一联系方式', 'Shared Contact Ledger')}
            </h2>
            <p className="join-motion join-contact-intro mt-8 max-w-2xl text-base leading-8 text-muted-foreground">
              {t(
                '正式联系方式整理中，将统一更新于此。',
                'Formal contact details are being prepared and will be updated here as one shared set.'
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border/80">
            {contactLedger.map((item) => (
              <div
                key={pickLocalized(item, lang)}
                className="join-contact-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/80 py-5"
              >
                <p className="join-contact-label font-serif text-xl text-foreground">
                  {pickLocalized(item, lang)}
                </p>
                <p className="join-contact-status text-sm text-muted-foreground">
                  {t('整理中', 'Coming Soon')}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            {t(
              '面向青少年、家长与合作伙伴的正式联络入口，将统一发布在这一处。',
              'The formal entry point for youth, parents, and partners will be published here as one shared contact set.'
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
