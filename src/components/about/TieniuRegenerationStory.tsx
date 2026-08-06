import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

const repairPractices = [
  {
    title: {
      zh: '停止除草剂，让草重新长出来',
      en: 'Stop herbicide and let ground cover return',
    },
    body: {
      zh: '地被植物重新覆盖土壤，减少裸地，也为昆虫、根系和微生物恢复创造条件。',
      en: 'Ground cover protects exposed soil and creates conditions for insects, roots, and microorganisms to return.',
    },
  },
  {
    title: {
      zh: '从单一种植回到多层生态',
      en: 'Move from monoculture back to layered ecology',
    },
    body: {
      zh: '乔木、果树、地被、水体和动物重新建立关系，让林盘不只是一片果园。',
      en: 'Trees, orchards, ground cover, water, and animals rebuild relationships, so Linpan becomes more than an orchard.',
    },
  },
  {
    title: {
      zh: '把修复变成真实的生活经验',
      en: 'Turn repair into lived experience',
    },
    body: {
      zh: '少年在劳动和观察中理解食物从哪里来，也理解土地、家庭消费与社区行动如何彼此影响。',
      en: 'Through work and observation, young people learn where food comes from and how land, household choices, and community action affect one another.',
    },
  },
];

const landScales = [
  {
    value: '9',
    unit: { zh: '亩', en: 'mu' },
    label: { zh: '一个林盘修复样本', en: 'one Linpan repair site' },
  },
  {
    value: '40',
    unit: { zh: '亩', en: 'mu' },
    label: { zh: '正在发生的生态实践', en: 'ecological practice in progress' },
  },
  {
    value: '9900',
    unit: { zh: '亩', en: 'mu' },
    label: { zh: '一个村庄的生态家园想象', en: 'a village imagined as an ecological home' },
  },
];

export default function TieniuRegenerationStory() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <section className="about-land-repair" aria-labelledby="land-repair-title">
      <header className="about-land-repair__header">
        <h3 id="land-repair-title">{t('一片土地，如何慢慢恢复', 'How a piece of land slowly recovers')}</h3>
        <p>
          {t(
            '土地修复不是一张需要跟随滚动阅读的地图，而是一段仍在持续的实践。先看清问题，再理解每一个改变。',
            'Land repair is not a map to decode while scrolling. It is an ongoing practice: first understand the problem, then see each change clearly.',
          )}
        </p>
      </header>

      <div className="about-land-repair__problem">
        <figure>
          <img
            src="/archive/elements/photos/site-ecology/s04-soil-root-damage.jpg"
            alt={t('板结土壤与受损根系的现场照片', 'Compacted soil and damaged roots on site')}
            loading="lazy"
          />
          <figcaption>{t('板结与根系损伤', 'Soil compaction and root damage')}</figcaption>
        </figure>

        <div className="about-land-repair__problem-copy">
          <p>{t('土地曾经面对什么', 'What the land was facing')}</p>
          <h4>{t('当土地只剩一种作物，生态系统也开始失去层次。', 'When the land kept only one crop, the ecosystem began to lose its layers.')}</h4>
          <p>
            {t(
              '单一种植、化肥、除草剂和高强度管理，让大树、鸟类、昆虫和地被植物逐渐退场。土壤失去孔隙后，根系、微生物和水分也很难重新形成健康关系。',
              'Monoculture, fertilizer, herbicide, and intensive management pushed trees, birds, insects, and ground cover away. As soil lost pore space, roots, microorganisms, and water struggled to form healthy relationships.',
            )}
          </p>
          <div className="about-land-repair__soil-number">
            <strong>1.7%</strong>
            <span>
              {t(
                '刚来到这里时的土壤有机质含量。健康且有营养的土壤通常需要达到 4% - 5%。',
                'Soil organic matter when the work began. Fertile soil commonly needs to reach 4% to 5%.',
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="about-land-repair__practice">
        <div className="about-land-repair__practice-copy">
          <h4>{t('修复从可持续的小事开始', 'Repair begins with sustainable daily choices')}</h4>
          <div className="about-land-repair__practice-list">
            {repairPractices.map((practice) => (
              <article key={practice.title.zh}>
                <h5>{pickLocalized(practice.title, lang)}</h5>
                <p>{pickLocalized(practice.body, lang)}</p>
              </article>
            ))}
          </div>
        </div>

        <figure className="about-land-repair__diagram">
          <img
            src="/archive/elements/graphics/infographics/s05-linpan-biodiversity-restoration-diagram.png"
            alt={t('林盘生物多样性修复前后示意图', 'Diagram comparing Linpan biodiversity before and after restoration')}
            loading="lazy"
          />
          <figcaption>
            {t(
              '修复不是增加装饰性的绿色，而是让乔木、地被、水体、作物和动物重新形成结构。',
              'Repair is not decorative greening. It rebuilds relationships among trees, ground cover, water, crops, and animals.',
            )}
          </figcaption>
        </figure>
      </div>

      <div className="about-land-repair__response">
        <div>
          <p>{t('土地开始回应', 'The land begins to respond')}</p>
          <h4>{t('蚯蚓洞重新出现，草与根系重新进入土壤。', 'Earthworm tunnels return, along with ground cover and roots.')}</h4>
        </div>
        <div className="about-land-repair__change">
          <span>1.7%</span>
          <i aria-hidden="true" />
          <strong>2.5%</strong>
          <small>{t('土壤有机质的阶段性变化', 'A measured change in soil organic matter')}</small>
        </div>
      </div>

      <div className="about-land-repair__scales">
        {landScales.map((scale) => (
          <article key={scale.value}>
            <p>
              <strong>{scale.value}</strong>
              <span>{pickLocalized(scale.unit, lang)}</span>
            </p>
            <small>{pickLocalized(scale.label, lang)}</small>
          </article>
        ))}
      </div>

      <blockquote className="about-land-repair__closing">
        {lang === 'zh'
          ? `${brandName}不是来到铁牛村做活动，而是从这片土地的修复中长出来。`
          : `${brandName} did not simply come to Tieniu for activities. It grew out of this land's repair.`}
      </blockquote>
    </section>
  );
}
