import { lifeCoCreationPractices, lifeCoCreationRhythm } from '@/content/programDetails';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function LifeCoCreationCampDetails() {
  const { lang, t } = useLanguage();

  return (
    <div>
      <section aria-labelledby="co-creation-practices-title" className="program-detail-section">
        <div className="program-detail-intro">
          <p>{t('共同生活，是共创真正开始的地方', 'Shared life is where co-creation begins')}</p>
          <h2 id="co-creation-practices-title" className="text-balance">
            {t('五天里，我们一起承担', 'Five days of shared responsibility')}
          </h2>
          <p className="text-pretty">
            {t(
              '连续相处让关系不只停留在一次活动。伙伴要一起面对节奏、分工、意见和冲突，也在真实生活里练习信任、表达与回应。',
              'Sustained time together takes relationships beyond an activity. Participants face rhythm, roles, differences, and conflict while practising trust, expression, and response.',
            )}
          </p>
        </div>

        <div className="program-detail-practice-grid program-detail-practice-grid--four">
          {lifeCoCreationPractices.map((practice, index) => (
            <article key={practice.title.zh}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3 className="text-balance">{pickLocalized(practice.title, lang)}</h3>
              <p className="text-pretty">{pickLocalized(practice.body, lang)}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="co-creation-rhythm-title" className="program-detail-section">
        <div className="program-detail-section-heading">
          <p>{t('5 天 4 夜', '5 days, 4 nights')}</p>
          <h2 id="co-creation-rhythm-title" className="text-balance">
            {t('从相遇，到真正的共同', 'From meeting to genuine community')}
          </h2>
        </div>

        <ol className="program-detail-rhythm">
          {lifeCoCreationRhythm.map((phase) => (
            <li key={phase.period.zh}>
              <p>{pickLocalized(phase.period, lang)}</p>
              <h3 className="text-balance">{pickLocalized(phase.title, lang)}</h3>
              <p className="text-pretty">{pickLocalized(phase.body, lang)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="co-creation-care-title" className="program-detail-section program-detail-care">
        <div>
          <p>{t('安全、照护与继续', 'Safety, care, and what follows')}</p>
          <h2 id="co-creation-care-title" className="text-balance">
            {t('让每个人放心地进入共同生活', 'Making shared life safe to enter')}
          </h2>
        </div>
        <p className="text-pretty">
          {t(
            '每期会根据场域与路线制定人员照护、住宿管理、医疗支持、保险和紧急联系方案，并完整公布费用与家庭参与方式。营地结束后，伙伴可以选择进入行动小组或下一次共创，不需要完成固定路径。',
            'Each session sets out staffing, accommodation care, medical support, insurance, emergency contacts, fees, and family participation. After camp, participants may choose an Action Group or another co-creation without following a fixed pathway.',
          )}
        </p>
      </section>
    </div>
  );
}
