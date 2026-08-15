import { useLanguage } from '@/contexts/LanguageContext';

export default function ProgramInvitation() {
  const { lang, t } = useLanguage();

  const title = t('从真实生活出发，走向共创与行动', 'From real life toward co-creation and action');

  return (
    <header className="programs-editorial-intro">
      <div className="programs-editorial-shell programs-editorial-intro__layout">
        <div className="programs-editorial-intro__hero">
          <div className="programs-editorial-intro__copy">
            <h1 className="text-balance" aria-label={title}>
              {lang === 'zh' ? (
                <span aria-hidden="true">
                  <span className="programs-editorial-title-line">从真实生活出发，</span>
                  <span className="programs-editorial-title-line">走向共创与行动</span>
                </span>
              ) : title}
            </h1>

            <div className="programs-editorial-intro__story">
              <p className="programs-editorial-intro__lead text-pretty">
                {t(
                  '阿柑少年从 Nate 在铁牛村的成长经历中长出来。',
                  "R-Gan Junior grew out of Nate's experience of growing up in Tieniu Village.",
                )}
              </p>
              <p className="text-pretty">
                {t(
                  '从邀请朋友来村里玩，到调研生态农业、参与公共议题，再到发起生活共创营，它逐渐形成了一条青少年真实世界成长路径。',
                  'What began as an invitation for friends to visit the village expanded into research on ecological agriculture, engagement with public issues, and the creation of the Life Co-creation Camp. Along the way, it became a real-world learning pathway for young people.',
                )}
              </p>
              <p className="text-pretty">
                {t(
                  '我们希望孩子先走进自然和生活，建立感受、关系和信任，再把这份连接延续到日常行动、社群共创和公共议题研究中。',
                  'We hope young people can first step into nature and everyday life, building awareness, relationships, and trust—then carry those connections into daily action, community co-creation, and research on public issues.',
                )}
              </p>
            </div>
          </div>

          <figure className="programs-editorial-intro__photo">
            <img
              src="/images/s06-linpan-aerial-overview.jpg"
              alt={t(
                '铁牛村林盘、果园、鱼塘与院落的航拍图',
                'Aerial view of Tieniu Village, its orchards, ponds, and homes',
              )}
              width="2890"
              height="2218"
              loading="eager"
            />
            <figcaption>{t('铁牛村 · 真实生活发生的地方', 'Tieniu Village · Where real life unfolds')}</figcaption>
          </figure>
        </div>

        <aside className="programs-editorial-intro__invitation" aria-labelledby="programs-nate-invitation-title">
          <p id="programs-nate-invitation-title" className="programs-editorial-intro__note-title">
            {t('Nate 的邀请', "Nate's invitation")}
          </p>
          <blockquote>
            <div>
              <p className="text-pretty">
                {t(
                  '我最早只是想邀请朋友来铁牛村玩。后来我慢慢发现，乡村不只是一个可以放松的地方，它让我重新认识食物、土地和社区，也让我开始思考真实世界里的问题。',
                  'At first, I simply wanted to invite friends to spend time in Tieniu Village. Over time, I realized that the village was more than a place to relax. It helped me see food, land, and community differently, and led me to think about questions in the real world.',
                )}
              </p>
              <p className="text-pretty">
                {t(
                  '阿柑少年希望邀请更多同龄人来到这里：先生活，先感受，先和人、土地、食物建立连接。也许一开始我们还不知道能做什么，但只要愿意进入现场，问题和行动就会慢慢长出来。',
                  "R-Gan Junior hopes to invite more young people here: to live first, feel first, and begin by building connections with people, land, and food. We may not know what we can do at the beginning, but when we are willing to step into the field, questions and actions begin to grow.",
                )}
              </p>
            </div>
            <footer>
              <cite>{t('—— Nate，阿柑少年发起人', "— Nate, Founder of R-Gan Junior")}</cite>
            </footer>
          </blockquote>
        </aside>
      </div>
    </header>
  );
}
