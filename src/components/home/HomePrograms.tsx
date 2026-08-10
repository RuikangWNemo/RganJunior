import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { homePrograms } from '@/content/homepage';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import HomeFadeCarousel from './HomeFadeCarousel';
import HomeReveal from './HomeReveal';

export default function HomePrograms() {
  const { lang, t } = useLanguage();

  return (
    <section
      id="home-programs"
      className="home-editorial-section home-programs-editorial home-programs-carousel"
    >
      <div className="home-editorial-shell home-programs-carousel__shell">
        <HomeReveal className="home-programs-carousel__heading">
          <div>
            <h2>{t('我们的项目', 'Our programmes')}</h2>
          </div>
          <Link to="/programs" className="home-programs-carousel__all cursor-target">
            {t('查看我们的项目', 'View all programmes')}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </HomeReveal>

        <HomeFadeCarousel
          items={homePrograms}
          intervalMs={6200}
          className="home-programs-carousel__viewport"
          viewportClassName="home-programs-carousel__stage"
          slideClassName="home-programs-carousel__slide"
          ariaLabel={t('阿柑少年项目轮播', "R-Gan Junior programme carousel")}
          previousLabel={t('上一个项目', 'Previous programme')}
          nextLabel={t('下一个项目', 'Next programme')}
          showArrows={false}
          navigationPlacement="after"
          renderNavigation={({ activeIndex, goTo }) => (
            <div className="home-programs-carousel__progress" role="group" aria-label={t('选择项目', 'Choose a programme')}>
              {homePrograms.map((program, index) => (
                <button
                  key={program.title.en}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-pressed={activeIndex === index}
                  aria-label={t(`查看${program.title.zh}`, `View ${program.title.en}`)}
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
          renderSlide={(program, index, active) => (
            <article className="home-programs-carousel__panel">
              <div className="home-programs-carousel__copy">
                <p>{pickLocalized(program.duration, lang)}</p>
                <h3>{pickLocalized(program.title, lang)}</h3>
                <p>{pickLocalized(program.body, lang)}</p>
                <Link
                  to={program.href}
                  tabIndex={active ? 0 : -1}
                  aria-label={`${pickLocalized(program.title, lang)}：${t('查看项目详情', 'View programme details')}`}
                >
                  {t('查看项目详情', 'View programme details')}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              {program.image && (
                <figure>
                  <img
                    src={program.image.src}
                    alt={pickLocalized(program.image.alt, lang)}
                    width={program.image.width}
                    height={program.image.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{ objectPosition: program.image.position }}
                  />
                </figure>
              )}
            </article>
          )}
        />
      </div>
    </section>
  );
}
