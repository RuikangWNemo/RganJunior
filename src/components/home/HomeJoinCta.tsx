import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import HomeReveal from './HomeReveal';

export default function HomeJoinCta() {
  const { t } = useLanguage();

  return (
    <section id="home-join" className="home-join-cta">
      <div className="home-editorial-shell">
        <HomeReveal className="home-join-cta__content">
          <h2>{t('下一次真实生活共创，期待和你一起发生。', "We look forward to sharing the next Life Co-creation Camp with you.")}</h2>
          <div className="home-join-cta__actions">
            <Link to="/programs/inquiry?program=life-co-creation-camp" className="home-join-cta__primary cursor-target">
              {t('了解最新营期与报名', "See upcoming camp dates and registration")}
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/join#join-partners" className="home-join-cta__secondary cursor-target">
              {t('联系我们，成为社群共建伙伴', 'Become a community partner')}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </HomeReveal>
      </div>
    </section>
  );
}
