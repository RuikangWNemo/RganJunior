import OptimizedImage from '@/components/OptimizedImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

const repairPractices = [
  {
    title: {
      zh: '停止除草剂，让草重新长出来',
      en: "Stop using herbicides and let ground cover return",
    },
    body: {
      zh: '地被植物重新覆盖土壤，减少裸地，也为昆虫、根系和微生物恢复创造条件。',
      en: "Ground-cover plants cover the soil again, reducing bare ground and creating conditions for insects, roots, and microorganisms to recover.",
    },
  },
  {
    title: {
      zh: '从单一种植回到多层生态',
      en: "Move from monoculture back to a multi-layered ecosystem",
    },
    body: {
      zh: '乔木、果树、地被、水体和动物重新建立关系，让林盘不只是一片果园。',
      en: "Trees, fruit trees, ground-cover plants, water, and animals become connected again, making the linpan landscape more than an orchard.",
    },
  },
  {
    title: {
      zh: '把修复变成真实的生活经验',
      en: "Make ecological restoration part of everyday life",
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
    label: { zh: '一个林盘修复样本', en: "a linpan restoration site (0.6 hectares)" },
  },
  {
    value: '40',
    unit: { zh: '亩', en: 'mu' },
    label: { zh: '正在发生的生态实践', en: 'ecological practice in progress (about 2.67 hectares)' },
  },
  {
    value: '9900',
    unit: { zh: '亩', en: 'mu' },
    label: { zh: '一个村庄的生态家园想象', en: 'a village imagined as an ecological home (660 hectares)' },
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
            "Land restoration is an ongoing practice. Begin by understanding the problems, then look at each change in turn.",
          )}
        </p>
      </header>

      <div className="about-land-repair__problem">
        <figure>
          <OptimizedImage
            src="/archive/elements/photos/site-ecology/s04-soil-root-damage.jpg"
            alt={t('板结土壤与受损根系的现场照片', 'Compacted soil and damaged roots on site')}
            loading="lazy"
          />
          <figcaption>{t('板结与根系损伤', 'Soil compaction and root damage')}</figcaption>
        </figure>

        <div className="about-land-repair__problem-copy">
          <p>{t('土地曾经面对什么', "The challenges the land faced")}</p>
          <h4>{t('当土地只剩一种作物，生态系统也开始失去层次。', "When only one crop was grown, the ecosystem began to lose its diversity and structure.")}</h4>
          <p>
            {t(
              '单一种植、化肥、除草剂和高强度管理，让大树、鸟类、昆虫和地被植物逐渐退场。土壤失去孔隙后，根系、微生物和水分也很难重新形成健康关系。',
              "Monoculture, fertilizers, herbicides, and intensive management gradually displaced large trees, birds, insects, and ground-cover plants. As the soil lost pore space, it became harder for roots, microorganisms, and water to interact in a healthy ecosystem.",
            )}
          </p>
          <div className="about-land-repair__soil-number">
            <strong>1.7%</strong>
            <span>
              {t(
                '刚来到这里时的土壤有机质含量。健康且有营养的土壤通常需要达到 4% - 5%。',
                "The soil organic matter content when we first arrived. The stated reference level for healthy, nutrient-rich soil is 4%–5%.",
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="about-land-repair__practice">
        <div className="about-land-repair__practice-copy">
          <h4>{t('修复从可持续的小事开始', "Restoration begins with small, sustainable steps")}</h4>
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
          <OptimizedImage
            src="/archive/elements/graphics/infographics/s05-linpan-biodiversity-restoration-diagram.png"
            alt={t('林盘生物多样性修复前后示意图', 'Diagram comparing linpan biodiversity before and after restoration')}
            loading="lazy"
          />
          <figcaption>
            {t(
              '修复不是增加装饰性的绿色，而是让乔木、地被、水体、作物和动物重新形成结构。',
              "Restoration means rebuilding an ecosystem of trees, ground-cover plants, water, crops, and animals, rather than simply adding greenery.",
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
          <small>{t('土壤有机质的阶段性变化', "Changes in soil organic matter over this period")}</small>
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
          : `${brandName} did not simply come to Tieniu Village to run activities. It grew out of the work of restoring this land.`}
      </blockquote>
    </section>
  );
}
