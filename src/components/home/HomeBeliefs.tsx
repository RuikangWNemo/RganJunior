import { homeBeliefFeatureImage, homeBeliefs } from '@/content/homepage';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import HomeReveal from './HomeReveal';

export default function HomeBeliefs() {
  const { lang, t } = useLanguage();

  return (
    <section id="home-beliefs" className="home-editorial-section home-beliefs-editorial">
      <div className="home-editorial-shell home-beliefs-editorial__layout">
        <HomeReveal className="home-beliefs-editorial__image">
          <figure>
            <img
              src={homeBeliefFeatureImage.src}
              srcSet={homeBeliefFeatureImage.srcSet}
              sizes={homeBeliefFeatureImage.sizes}
              alt={pickLocalized(homeBeliefFeatureImage.alt, lang)}
              width={homeBeliefFeatureImage.width}
              height={homeBeliefFeatureImage.height}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: homeBeliefFeatureImage.position }}
            />
          </figure>
        </HomeReveal>

        <HomeReveal className="home-beliefs-editorial__content" delay={0.05}>
          <header className="home-beliefs-editorial__header">
            <h2>{t('我们相信什么', 'What we believe')}</h2>
          </header>

          <div className="home-beliefs-editorial__list">
            {homeBeliefs.map((belief) => (
              <article key={belief.number} className="home-belief-editorial__item">
                <span aria-hidden="true">{belief.number}</span>
                <div>
                  <h3>{pickLocalized(belief.title, lang)}</h3>
                  <p>{pickLocalized(belief.body, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        </HomeReveal>
      </div>
    </section>
  );
}
