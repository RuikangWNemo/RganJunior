import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CONTACT_EMAIL, type LocalizedText, pickLocalized } from '@/lib/brand';

interface FitGroup {
  label: LocalizedText;
  items: LocalizedText[];
  tone: 'open' | 'boundary';
}

interface JoinWay {
  index: string;
  title: LocalizedText;
  status: LocalizedText;
  fit: LocalizedText;
  description: LocalizedText;
}

interface JoinStep {
  index: string;
  title: LocalizedText;
  description: LocalizedText;
}

interface JoinFaq {
  question: LocalizedText;
  answer: LocalizedText;
}

interface ContactItem {
  label: LocalizedText;
  value: LocalizedText;
  href?: string;
  internal?: boolean;
  pending?: boolean;
}

const fitGroups: FitGroup[] = [
  {
    label: { zh: '适合愿意', en: 'A good fit if you are willing to' },
    tone: 'open',
    items: [
      { zh: '走进自然和乡村生活', en: 'Step into nature and rural life' },
      { zh: '参与共同生活和小队协作', en: 'Share daily life and work in a small team' },
      {
        zh: '对食物、土地、生态农业和社会议题保持好奇',
        en: "Stay curious about food, land, ecological agriculture, and social issues",
      },
      {
        zh: '和家人、同伴、社区一起学习和成长',
        en: 'Learn and grow with family, peers, and community',
      },
    ],
  },
  {
    label: { zh: '不太适合只期待', en: 'Probably not a fit if you only expect' },
    tone: 'boundary',
    items: [
      { zh: '旅游打卡', en: "Sightseeing just to check places off a list" },
      { zh: '短期成果', en: "Short-term results" },
      { zh: '升学包装', en: "Building an admissions profile" },
      { zh: '完全舒适的城市化服务', en: "All the comforts and services of city life" },
      {
        zh: '只把孩子交给营地、家长不参与理解和支持',
        en: 'Dropping off a child without parental understanding or support',
      },
    ],
  },
];

const joinWays: JoinWay[] = [
  {
    index: '01',
    title: { zh: '生活体验营', en: "Life Immersion Camp" },
    status: { zh: '2天1夜', en: '2 days · 1 night' },
    fit: { zh: '适合第一次接触阿柑少年的家庭', en: 'For families meeting R-Gan Junior for the first time' },
    description: {
      zh: '部分周末或小长假开放，轻量体验自然、食物、茶、运动和社区生活。',
      en: 'Offered on selected weekends and short holidays, with a light introduction to nature, food, tea, movement, and community life.',
    },
  },
  {
    index: '02',
    title: { zh: '生活共创营', en: "Life Co-creation Camp" },
    status: { zh: '5天4夜', en: '5 days · 4 nights' },
    fit: { zh: '通常在寒暑假或节假日开展', en: 'Usually offered during school breaks and holidays' },
    description: {
      zh: '深度进入共同生活、小队任务和社区共创，建立关系、兴趣和信任。',
      en: "Build relationships, explore interests, and develop trust by living together, taking on team tasks, and creating together in the community.",
    },
  },
  {
    index: '03',
    title: { zh: '阿柑少年行动小组', en: 'R-Gan Junior Action Group' },
    status: { zh: '持续开放', en: 'Ongoing' },
    fit: { zh: '适合参加过活动、希望继续连接的孩子', en: 'For young people who want to stay connected after an activity' },
    description: {
      zh: '通过线上茶会、七日挑战、低碳生活小行动和同伴支持，把营地中的连接延续到日常生活。',
      en: 'Online tea gatherings, seven-day challenges, low-carbon actions, and peer support carry camp relationships into daily life.',
    },
  },
  {
    index: '04',
    title: { zh: '青少年研究与公共议题项目', en: "R-Gan Junior Research Program" },
    status: { zh: '可申请加入', en: 'Application based' },
    fit: { zh: '面向有深入探索兴趣的高年级学生', en: 'For older students ready for deeper inquiry' },
    description: {
      zh: '围绕生态农业、家庭消费、可持续生活和公共政策开展观察、访谈、写作和表达。',
      en: "Explore ecological agriculture, household consumption, sustainable living, and public policy through observation, interviews, writing, and sharing ideas.",
    },
  },
];

const joinSteps: JoinStep[] = [
  {
    index: '01',
    title: { zh: '提交参与意向', en: 'Share your interest' },
    description: {
      zh: '告诉我们孩子的年龄、兴趣、家庭期待，以及想了解的项目方向。',
      en: "Tell us your child's age and interests, your family's hopes, and which programs you would like to learn about.",
    },
  },
  {
    index: '02',
    title: { zh: '等待合适活动通知', en: "Wait for updates on suitable activities" },
    description: {
      zh: '如果近期有生活体验营、生活共创营或线上活动，我们会优先通知已提交意向的家庭。',
      en: "When registration opens for a Life Immersion Camp, Life Co-creation Camp, or online activity, we notify families who have registered their interest first.",
    },
  },
  {
    index: '03',
    title: { zh: '申请持续项目', en: 'Apply for an ongoing project' },
    description: {
      zh: '如果孩子已经参加过活动，或对行动小组、研究项目有兴趣，可以申请进一步加入。',
      en: 'Young people who have joined before, or who are interested in the action group or research projects, can apply to continue.',
    },
  },
  {
    index: '04',
    title: { zh: '预约一次沟通', en: 'Book a conversation' },
    description: {
      zh: '如果还不确定是否适合，可以先和我们聊一聊。',
      en: 'If you are still unsure whether it is a fit, start with a conversation.',
    },
  },
];

const faqs: JoinFaq[] = [
  {
    question: { zh: '现在没有明确营期，还可以报名吗？', en: 'Can we register when no camp dates are published?' },
    answer: {
      zh: '可以。你可以先提交参与意向，我们会在合适活动开放时联系你。',
      en: "Yes. Register your interest first, and we will contact you when a suitable activity opens for registration.",
    },
  },
  {
    question: { zh: '有些项目可以随时加入吗？', en: 'Can some projects be joined at any time?' },
    answer: {
      zh: '行动小组、线上茶会、主题分享和部分研究项目会持续开展，适合的孩子可以申请加入。',
      en: 'Action groups, online tea gatherings, thematic sessions, and selected research projects run continuously. Young people who are a good fit may apply.',
    },
  },
  {
    question: { zh: '孩子没有基础可以参加吗？', en: 'Can a young person join without prior experience?' },
    answer: {
      zh: '可以。只要愿意观察、参与和合作。',
      en: 'Yes, as long as they are willing to observe, participate, and collaborate.',
    },
  },
  {
    question: { zh: '家长需要参加吗？', en: 'Do parents need to participate?' },
    answer: {
      zh: '不同项目安排不同。部分活动亲子共参，部分环节以青少年为主。',
      en: "It depends on the program. Some activities involve parents and young people together; some mainly involve young participants.",
    },
  },
  {
    question: { zh: '安全如何保障？', en: 'How is safety supported?' },
    answer: {
      zh: '线下活动会提前说明保险、医疗资源、应急联系人和安全安排。',
      en: "Before in-person activities, we explain insurance, available medical support, emergency contacts, and safety arrangements.",
    },
  },
  {
    question: { zh: '是否有升学帮助？', en: 'Does this help with school admissions?' },
    answer: {
      zh: '阿柑少年不是升学包装项目。但真实投入和持续反思，会自然成为孩子理解自己和社会的重要经历。',
      en: "R-Gan Junior is not designed merely to build an admissions profile. Genuine participation and ongoing reflection can become meaningful experiences that help young people understand themselves and society.",
    },
  },
];

const contacts: ContactItem[] = [
  {
    label: { zh: '微信 / 电话', en: 'WeChat / Phone' },
    value: { zh: '待更新', en: 'To be updated' },
    pending: true,
  },
  {
    label: { zh: '邮箱', en: 'Email' },
    value: { zh: CONTACT_EMAIL, en: CONTACT_EMAIL },
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    label: { zh: '参与意向表', en: 'Interest form' },
    value: { zh: '在线填写', en: 'Open the form' },
    href: '/join/apply',
    internal: true,
  },
  {
    label: { zh: '地点', en: 'Location' },
    value: {
      zh: '四川成都蒲江铁牛村麦昆塔社区',
      en: "Mykunda Community, Tieniu Village, Pujiang, Chengdu, Sichuan",
    },
  },
];

function AccordionHeading({
  index,
  title,
  summary,
}: {
  index: string;
  title: string;
  summary: string;
}) {
  return (
    <span className="join-ways-trigger__layout">
      <span className="join-ways-trigger__index">{index}</span>
      <span className="join-ways-trigger__copy">
        <span className="join-ways-trigger__title">{title}</span>
        <span className="join-ways-trigger__summary">{summary}</span>
      </span>
    </span>
  );
}

export default function JoinWaysAccordion() {
  const { lang, t } = useLanguage();
  const [openSection, setOpenSection] = useState('ways');

  const openContact = () => setOpenSection('contact');

  return (
    <section className="join-ways-section paper-texture" aria-labelledby="join-ways-title">
      <div className="join-ways-shell container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="join-ways-intro">
          <div className="join-ways-intro__sticky">
            <p className="join-ways-kicker">WAYS TO JOIN</p>
            <h2 id="join-ways-title">{t('当前参与方式', 'Ways to Join')}</h2>
            <p className="join-ways-lead">
              {t('走进自然、生活与真实世界', 'Step into nature, daily life, and the real world')}
            </p>
            <p className="join-ways-description">
              {t(
                '阿柑少年面向 12–18 岁青少年及家庭。我们希望孩子在自然、食物、茶、运动、共同生活和真实社区中，重新感受自己，认识同伴，理解土地，并找到愿意继续探索的问题。',
                'R-Gan Junior welcomes young people ages 12–18 and their families. Through nature, food, tea, movement, shared living, and real communities, we hope each young person can reconnect with themselves, meet peers, understand the land, and find questions worth continuing to explore.'
              )}
            </p>

            <div className="join-ways-actions">
              <Button asChild className="join-ways-primary cursor-target group/join-primary">
                <Link to="/join/apply">
                  {t('提交参与意向', 'Share Your Interest')}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <a
                href="#join-contact"
                onClick={openContact}
                className="join-ways-secondary cursor-target group/join-secondary"
              >
                {t('预约沟通', 'Book a Conversation')}
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="join-ways-directory">
          <div className="join-ways-directory__meta" aria-hidden="true">
            <span>R-Gan Junior</span>
            <span>12—18 / CHENGDU</span>
          </div>

          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="join-ways-accordion"
          >
            <AccordionItem value="fit" className="join-ways-item">
              <AccordionTrigger className="join-ways-trigger cursor-target">
                <AccordionHeading
                  index="01"
                  title={t('适合谁', 'Who It Is For')}
                  summary={t('理解彼此的期待与边界', 'Align expectations and boundaries')}
                />
              </AccordionTrigger>
              <AccordionContent className="join-ways-content">
                <div className="join-fit-grid">
                  {fitGroups.map((group) => (
                    <article key={group.tone} className="join-fit-group" data-tone={group.tone}>
                      <p className="join-fit-group__label">{pickLocalized(group.label, lang)}</p>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.zh}>
                            <span aria-hidden="true" />
                            <span>{pickLocalized(item, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ways" className="join-ways-item">
              <AccordionTrigger className="join-ways-trigger cursor-target">
                <AccordionHeading
                  index="02"
                  title={t('当前参与方式', 'Current Ways to Join')}
                  summary={t('从一次体验到持续行动', 'From a first experience to ongoing action')}
                />
              </AccordionTrigger>
              <AccordionContent className="join-ways-content">
                <div className="join-program-list">
                  {joinWays.map((way) => (
                    <article key={way.index} className="join-program-row">
                      <span className="join-program-row__index">{way.index}</span>
                      <div className="join-program-row__copy">
                        <h4>{pickLocalized(way.title, lang)}</h4>
                        <p className="join-program-row__fit">{pickLocalized(way.fit, lang)}</p>
                        <p>{pickLocalized(way.description, lang)}</p>
                      </div>
                      <span className="join-program-row__status">{pickLocalized(way.status, lang)}</span>
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process" className="join-ways-item">
              <AccordionTrigger className="join-ways-trigger cursor-target">
                <AccordionHeading
                  index="03"
                  title={t('如何加入', 'How to Join')}
                  summary={t('四步找到合适的入口', 'Four steps toward the right entry point')}
                />
              </AccordionTrigger>
              <AccordionContent className="join-ways-content">
                <ol className="join-process-list">
                  {joinSteps.map((step) => (
                    <li key={step.index}>
                      <span className="join-process-list__index">{step.index}</span>
                      <div>
                        <h4>{pickLocalized(step.title, lang)}</h4>
                        <p>{pickLocalized(step.description, lang)}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="join-process-actions">
                  <Link to="/join/apply" className="cursor-target group/process-apply">
                    {t('开始填写意向', 'Start the Interest Form')}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <a href="#join-contact" onClick={openContact} className="cursor-target">
                    {t('查看联系方式', 'See Contact Details')}
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq" className="join-ways-item">
              <AccordionTrigger className="join-ways-trigger cursor-target">
                <AccordionHeading
                  index="04"
                  title={t('常见问题', 'Common Questions')}
                  summary={t('报名、参与、家长与安全', 'Registration, participation, parents, and safety')}
                />
              </AccordionTrigger>
              <AccordionContent className="join-ways-content">
                <Accordion type="single" collapsible className="join-faq-list">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.question.zh} value={`faq-${index}`} className="join-faq-item">
                      <AccordionTrigger className="join-faq-trigger cursor-target">
                        <span className="join-faq-trigger__index" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{pickLocalized(faq.question, lang)}</span>
                      </AccordionTrigger>
                      <AccordionContent className="join-faq-answer">
                        <p>{pickLocalized(faq.answer, lang)}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem id="join-contact" value="contact" className="join-ways-item scroll-mt-24">
              <AccordionTrigger className="join-ways-trigger cursor-target">
                <AccordionHeading
                  index="05"
                  title={t('联系我们', 'Contact Us')}
                  summary={t('先聊一聊，再判断是否适合', 'Start with a conversation and decide together')}
                />
              </AccordionTrigger>
              <AccordionContent className="join-ways-content">
                <dl className="join-contact-list">
                  {contacts.map((item) => (
                    <div key={item.label.zh}>
                      <dt>{pickLocalized(item.label, lang)}</dt>
                      <dd data-pending={item.pending || undefined}>
                        {item.href ? (
                          item.internal ? (
                            <Link to={item.href} className="cursor-target group/contact-link">
                              {pickLocalized(item.value, lang)}
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          ) : (
                            <a href={item.href} className="cursor-target">
                              {pickLocalized(item.value, lang)}
                            </a>
                          )
                        ) : (
                          pickLocalized(item.value, lang)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="join-ways-invitation">
          <p>
            {t(
              '欢迎先提交参与意向。当合适的活动或项目开放时，我们会和你一起判断孩子是否适合加入。',
              "You are welcome to register your interest first. When registration opens for a suitable activity or program, we will discuss with you whether it is right for your child."
            )}
          </p>
          <span aria-hidden="true">R-Gan Junior / WAYS TO JOIN</span>
        </div>
      </div>
    </section>
  );
}
