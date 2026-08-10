import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import nateFounderPhoto from '@/assets/nate-founder.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import HomeReveal from './HomeReveal';

export default function HomeFounderStory() {
  const { lang, t } = useLanguage();

  return (
    <section id="home-founder-story" className="home-editorial-section home-founder-story">
      <div className="home-editorial-shell home-founder-story__layout">
        <HomeReveal className="home-founder-story__portrait">
          <figure>
            <img
              src={nateFounderPhoto}
              alt={t('阿柑少年发起人 Nate 的肖像', "Portrait of Nate, founder of R-Gan Junior")}
              width="1067"
              height="1600"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>Nate Shi</span>
              <span>{t('阿柑少年发起人', "Founder of R-Gan Junior")}</span>
            </figcaption>
          </figure>
        </HomeReveal>

        <HomeReveal className="home-founder-story__copy" delay={0.06}>
          <h2
            className={`home-founder-story__title home-founder-story__title--${lang}`}
            aria-label={t(
              '一个少年的成长，慢慢长成一群人的行动',
              "One young person's growth became a shared action.",
            )}
          >
            {lang === 'zh' ? (
              <>
                <span className="home-founder-story__title-line">一个少年的成长</span>
                <span className="home-founder-story__title-line">慢慢长成一群人的行动</span>
              </>
            ) : (
              <>
                <span className="home-founder-story__title-line">One young person's growth</span>
                <span className="home-founder-story__title-line">became a shared action.</span>
              </>
            )}
          </h2>
          <p>
            {t(
              '阿柑少年从 Nate 在铁牛村的成长经历中长出来。从一个在乡村感到孤独、想邀请朋友来玩的孩子，到组织同学调研生态农业、发起生活共创营，他逐渐把自己的成长，变成一个连接青少年、家庭、土地与真实世界的行动计划。',
              "R-Gan Junior grew from Nate's own life in Tieniu Village. A lonely child who wanted friends to visit the village began organising ecological agriculture research and a life co-creation camp. His experience gradually became an action plan connecting young people, families, land, and the real world.",
            )}
          </p>
          <Link to="/story" className="home-text-link cursor-target">
            {t('阅读 Nate 的发起人故事', "Read Nate's founder story")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </HomeReveal>
      </div>
    </section>
  );
}
