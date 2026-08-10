import { Link } from 'react-router-dom';
import TieniuRegenerationStory from '@/components/about/TieniuRegenerationStory';
import TieniuStoryMap from '@/components/about/TieniuStoryMap';
import { useLanguage } from '@/contexts/LanguageContext';

const placeFacts = [
  {
    value: { zh: '成都 · 蒲江', en: 'Pujiang · Chengdu' },
    label: { zh: '西来镇铁牛村', en: 'Tieniu Village, Xilai Town' },
  },
  {
    value: { zh: '约 5.8 公里', en: 'About 5.8 km' },
    label: { zh: '距离西来站', en: 'From Xilai Station' },
  },
  {
    value: { zh: '果园 · 鱼塘 · 林盘', en: 'Orchards · Ponds · Linpan' },
    label: { zh: '共同组成生活生态', en: 'A living ecology held together' },
  },
] as const;

export default function TieniuStory() {
  const { lang, t } = useLanguage();

  return (
    <div className="tieniu-story-page pt-20">
      <header className="tieniu-story-hero">
        <div className="tieniu-story-shell">
          <Link className="tieniu-story-back-link" to="/about#places">
            <span aria-hidden="true">←</span>
            <span>{t('返回真实场域', 'Back to Living Labs')}</span>
          </Link>

          <div className="tieniu-story-hero__grid">
            <div className="tieniu-story-hero__copy">
              <p>{t('铁牛村 · 社区大本营', 'Tieniu Village · Community Home Base')}</p>
              <h1>{t('铁牛村的故事', 'The Story of Tieniu Village')}</h1>
              <h2>
                {t(
                  '阿柑少年从一片正在修复的土地中长出来。',
                  "R-Gan Junior grew from a piece of land undergoing repair.",
                )}
              </h2>
              <p>
                {t(
                  '这里不是活动背景。果园、鱼塘、林盘、新老村民和城市家庭在这里相遇，青少年也从一颗柑橘开始，理解食物、劳动、消费、生态与社区之间真实的关系。',
                  'This is not an activity backdrop. Orchards, ponds, Linpan landscapes, villagers, and urban families meet here. Beginning with one citrus fruit, young people encounter the real relationships among food, work, consumption, ecology, and community.',
                )}
              </p>
            </div>

            <figure className="tieniu-story-hero__figure">
              <img
                src="/images/s06-linpan-aerial-overview.jpg"
                alt={t('铁牛村林盘、果园、鱼塘和院落的航拍图', 'Aerial view of Tieniu Village, its Linpan landscape, orchards, ponds, and homes')}
                width="2890"
                height="2218"
                loading="eager"
              />
              <figcaption>{t('铁牛村的林盘生活生态', 'The living ecology of Tieniu Village')}</figcaption>
            </figure>
          </div>
        </div>
      </header>

      <main>
        <section className="tieniu-story-context" aria-labelledby="tieniu-context-title">
          <div className="tieniu-story-shell">
            <div className="tieniu-story-context__copy">
              <div>
                <p>{t('为什么是铁牛村？', 'Why Tieniu Village?')}</p>
                <h2 id="tieniu-context-title">
                  {t(
                    '一颗柑橘背后，是一整个真实生活的系统。',
                    'Behind one citrus fruit is an entire system of real life.',
                  )}
                </h2>
              </div>
              <div>
                <p>
                  {t(
                    '铁牛村位于成都蒲江县，是麦昆塔社区长期生活与产业实践的大本营，也是阿柑少年最初长出来的地方。柑橘是这里的主要农业产业，但一颗果实从来不只属于果园。',
                    "Tieniu Village lies in Pujiang County, Chengdu. It is the home base of Maquinta's long-term community and livelihood practice, and the place where R-Gan Junior first took root. Citrus is the main agricultural livelihood, but one fruit never belongs only to the orchard.",
                  )}
                </p>
                <p>
                  {t(
                    '它连接土壤、水、劳动、农人的选择、家庭的消费，也连接一个社区如何面对生态农业与乡村生活的长期问题。青少年在这里做饭、劳作、观察和访谈，把抽象知识放回可以看见、触摸和回应的现场。',
                    'It connects soil, water, work, farmers’ choices, household consumption, and the long-term questions of ecological agriculture and village life. Here, young people cook, work, observe, and interview, returning abstract knowledge to a place they can see, touch, and respond to.',
                  )}
                </p>
              </div>
            </div>

            <dl className="tieniu-story-facts">
              {placeFacts.map((fact) => (
                <div key={fact.value.zh}>
                  <dt>{fact.value[lang]}</dt>
                  <dd>{fact.label[lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="tieniu-story-field" aria-label={t('铁牛村地图与土地修复故事', 'Tieniu Village map and land regeneration story')}>
          <div className="tieniu-story-shell">
            <TieniuStoryMap />
            <TieniuRegenerationStory />

            <div className="tieniu-story-return">
              <p>{t('从铁牛村，继续认识阿柑少年的真实场域', "From Tieniu Village, continue through R-Gan Junior's living labs")}</p>
              <h2>{t('一座社区大本营，三片生态试验田。', 'One community home base and three ecological field sites.')}</h2>
              <Link to="/about#places">
                <span>{t('返回查看四个真实场域', 'Return to all four living labs')}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
