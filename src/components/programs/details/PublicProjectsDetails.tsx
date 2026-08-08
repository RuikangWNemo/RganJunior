import { publicProjectMethods } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function PublicProjectsDetails() {
  const { lang, t } = useLanguage();

  return (
    <div>
      <section aria-labelledby="public-method-title" className="py-16 md:py-24">
        <div className="max-w-3xl">
          <h2 id="public-method-title" className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            {t('从真实问题开始研究', 'Research begins with real questions')}
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {t(
              '项目不先设定漂亮结论，而是从伙伴真实接触的生活问题出发，判断可以访问的场域、资料与相关人群，再共同建立研究路径。',
              'The project does not begin with a polished conclusion. It starts with questions participants encounter, then considers accessible settings, evidence, and people before building a research path together.',
            )}
          </p>
        </div>

        <div className="mt-12 border-t border-border">
          {publicProjectMethods.map((item) => (
            <article
              key={item.title.zh}
              className="grid gap-4 border-b border-border py-9 md:grid-cols-[minmax(13rem,0.65fr)_minmax(0,1.35fr)] md:gap-12"
            >
              <h3 className="font-serif text-2xl text-foreground sm:text-3xl">
                {pickLocalized(item.title, lang)}
              </h3>
              <p className="text-sm leading-8 text-muted-foreground sm:text-base">
                {pickLocalized(item.body, lang)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="public-collaboration-title" className="border-t border-border py-16 md:py-24">
        <h2 id="public-collaboration-title" className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          {t('参与与合作', 'Participation and collaboration')}
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          <p className="text-base leading-8 text-muted-foreground">
            {t(
              '青少年和家庭伙伴可以从问题提出、访谈、问卷、田野记录、资料整理和文章写作中找到适合自己的角色。',
              'Young people and family partners can contribute through questions, interviews, surveys, field records, evidence organisation, and writing.',
            )}
          </p>
          <p className="text-base leading-8 text-muted-foreground">
            {t(
              '也欢迎能够提供议题经验、研究支持、场域连接或公共传播资源的机构与专业伙伴共同讨论合作方式。',
              'Organisations and specialist partners who can contribute topic expertise, research support, field access, or public communication are welcome to discuss collaboration.',
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
