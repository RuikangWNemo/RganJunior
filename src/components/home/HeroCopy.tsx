import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

interface HeroCopyProps {
  onJoin: () => void;
}

export default function HeroCopy({ onJoin }: HeroCopyProps) {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);

  return (
    <div className="relative z-20 order-2 w-full min-w-0 max-w-full lg:order-2 lg:max-w-4xl">
      <h1 className="animate-fade-in-up-apple font-serif text-[3rem] font-semibold leading-[1.02] text-foreground sm:text-6xl md:text-7xl xl:text-[5.05rem]">
        {brandName}
      </h1>

      <p
        className="animate-fade-in-up-apple mt-4 max-w-3xl text-balance font-serif text-[1.45rem] leading-tight text-foreground/78 sm:mt-5 sm:text-3xl lg:text-[2.25rem]"
        style={{ animationDelay: '0.08s' }}
      >
        {t('在真实社区中探索、研究、行动', 'Exploring, researching, and acting in real communities')}
      </p>

      <p
        className="animate-fade-in-up-apple mt-5 max-w-full whitespace-normal break-words text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-primary sm:mt-6 sm:text-base sm:tracking-[0.22em]"
        style={{ animationDelay: '0.16s' }}
      >
        <span className="block sm:inline">{t('山野', 'Mountain')}</span>
        <span className="mx-2 hidden sm:inline">·</span>
        <span className="block sm:inline">{t('田野', 'Field')}</span>
        <span className="mx-2 hidden sm:inline">·</span>
        <span className="block sm:inline">{t('城乡', 'Urban-Rural')}</span>
      </p>

      <p
        className="animate-fade-in-up-apple mt-5 max-w-[21.5rem] border-l border-primary/30 pl-4 text-sm font-medium leading-7 text-foreground/88 sm:mt-7 sm:max-w-xl sm:pl-5 sm:text-base"
        style={{ animationDelay: '0.2s' }}
      >
        {t(
          '从铁牛村出发，让青少年回到自然、走进社区，在真实关系中重新认识自己、土地与社会。',
          'Starting from Tieniu Village, young people return to nature and enter communities, rediscovering themselves, land, and society through real relationships.'
        )}
      </p>

      <div
        className="animate-fade-in-up-apple mt-7 flex flex-col items-start gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4"
        style={{ animationDelay: '0.28s' }}
      >
        <Button
          onClick={onJoin}
          className="btn-apple cursor-target w-full max-w-[17rem] sm:w-auto"
        >
          {t('加入我们', 'Join Us')}
          <ArrowRight className="ml-2" size={18} />
        </Button>

        <Link to="/actions" className="w-full max-w-[17rem] sm:w-auto">
          <Button
            variant="outline"
            className="btn-apple cursor-target w-full border-primary/15 bg-background/70 hover:border-primary/30 sm:w-auto"
          >
            {t('了解我们的行动', 'Explore Our Action')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
