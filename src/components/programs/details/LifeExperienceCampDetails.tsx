import { lifeExperienceMoments, lifeExperienceRhythm } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function LifeExperienceCampDetails() {
  const { lang, t } = useLanguage();

  return (
    <div>
      <section aria-labelledby="experience-intro-title" className="program-detail-section">
        <div className="program-detail-intro">
          <p>{t('第一次来，不需要准备好答案', 'For a first visit, you do not need all the answers')}</p>
          <h2 id="experience-intro-title" className="text-balance">
            {t('用两天，重新感觉生活', 'Two days to feel daily life again')}
          </h2>
          <p className="text-pretty">
            {t(
              '生活体验营不是压缩版课程，而是一个轻盈的真实入口。我们把日程留出呼吸，让青少年在自然、劳动和人与人的相遇中，发现自己正在关心什么。',
              'The Life Discovery Camp is not a compressed course. It is a gentle entry into real life, with enough room to notice what begins to matter through nature, work, and meeting others.',
            )}
          </p>
        </div>

        <div className="program-detail-practice-grid">
          {lifeExperienceMoments.map((moment, index) => (
            <article key={moment.title.zh}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3 className="text-balance">{pickLocalized(moment.title, lang)}</h3>
              <p className="text-pretty">{pickLocalized(moment.body, lang)}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="experience-rhythm-title" className="program-detail-section">
        <div className="program-detail-section-heading">
          <p>{t('2 天 1 夜', '2 days, 1 night')}</p>
          <h2 id="experience-rhythm-title" className="text-balance">
            {t('一次短而完整的相遇', 'A short and complete encounter')}
          </h2>
        </div>

        <ol className="program-detail-rhythm">
          {lifeExperienceRhythm.map((phase) => (
            <li key={phase.period.zh}>
              <p>{pickLocalized(phase.period, lang)}</p>
              <h3 className="text-balance">{pickLocalized(phase.title, lang)}</h3>
              <p className="text-pretty">{pickLocalized(phase.body, lang)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="experience-care-title" className="program-detail-section program-detail-care">
        <div>
          <p>{t('给家庭的说明', 'For families')}</p>
          <h2 id="experience-care-title" className="text-balance">
            {t('被照护，也保留探索的空间', 'Care with room to explore')}
          </h2>
        </div>
        <p className="text-pretty">
          {t(
            '每期会根据主题明确青少年独立参与或家庭共同参与的方式，并同步说明人员配置、住宿餐食、医疗支持、保险、费用和行前准备。第一次加入，也可以从一次充分沟通开始。',
            'Each session explains whether young people join independently or with family, along with staffing, accommodation, meals, medical support, insurance, fees, and preparation. A first visit can begin with a careful conversation.',
          )}
        </p>
      </section>
    </div>
  );
}
