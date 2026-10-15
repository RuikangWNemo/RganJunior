import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandWordmark from '@/components/BrandWordmark';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

interface HeroCopyProps {
  onJoin: () => void;
}

export default function HeroCopy({ onJoin }: HeroCopyProps) {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const subtitle = t(
    '回归自然、生活与真实世界，长出内在的力量',
    'Return to nature, everyday life, and the real world. Build inner strength.',
  );

  return (
    <div className="home-hero-copy relative z-20 order-2 w-full min-w-0 max-w-full lg:order-2 lg:max-w-4xl">
      <h1
        aria-label={brandName}
        className="home-hero-title animate-fade-in-up-apple"
      >
        <BrandWordmark language={lang} aria-hidden="true" className="home-hero-wordmark" />
      </h1>

      <p
        aria-label={subtitle}
        className={`home-hero-subtitle home-hero-subtitle--${lang} animate-fade-in-up-apple mt-4 max-w-3xl text-balance font-serif text-[1.45rem] leading-tight sm:mt-5 sm:text-3xl lg:text-[2.25rem]`}
        style={{ animationDelay: '0.08s' }}
      >
        {lang === 'zh' ? (
          <>
            <span className="home-hero-subtitle__line">回归自然、生活与真实世界，</span>
            <span className="home-hero-subtitle__line">长出内在的力量</span>
          </>
        ) : (
          subtitle
        )}
      </p>

      <p
        className="home-hero-body animate-fade-in-up-apple mt-5 max-w-[21.5rem] border-l pl-4 text-sm leading-7 sm:mt-7 sm:max-w-2xl sm:pl-5 sm:text-base"
        style={{ animationDelay: '0.16s' }}
      >
        {t(
          '一个从铁牛村长出来的青少年真实生活与公共行动计划。我们通过自然、食物、茶、运动、社群共创和可持续生活实践，陪伴青少年连接自己、他人、土地和未来。',
          "A program rooted in Tieniu Village for young people to learn through everyday experiences and take action in their communities. Through nature, food, tea, physical activity, community co-creation, and sustainable living practices, we support young people in connecting with themselves, others, the land, and the future.",
        )}
      </p>

      <div
        className="home-hero-actions animate-fade-in-up-apple mt-7 flex flex-col items-start gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4"
        style={{ animationDelay: '0.24s' }}
      >
        <Button
          asChild
          variant="outline"
          className="home-hero-button home-hero-button--outline btn-apple cursor-target w-full sm:w-auto"
        >
          <Link to="/programs">
            {t('了解项目', 'Explore programs')}
          </Link>
        </Button>

        <Button
          onClick={onJoin}
          className="home-hero-button home-hero-button--primary btn-apple cursor-target h-auto w-full whitespace-normal sm:w-auto"
        >
          <span className="min-w-0 text-balance">{t('登记下一期意向', 'Register Interest in the Next Camp')}</span>
          <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
}
