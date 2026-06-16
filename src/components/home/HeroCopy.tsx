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
      <h1 className="animate-fade-in-up-apple font-serif text-[3.35rem] font-semibold leading-[1.02] text-foreground sm:text-6xl md:text-7xl xl:text-[5.05rem]">
        {brandName}
      </h1>

      <p
        className="animate-fade-in-up-apple mt-5 max-w-3xl text-balance font-serif text-2xl leading-tight text-foreground/78 sm:text-3xl lg:text-[2.25rem]"
        style={{ animationDelay: '0.08s' }}
      >
        {t('当代青少年的生命觉醒之路', 'A Path of Awakening for a New Generation')}
      </p>

      <p
        className="animate-fade-in-up-apple mt-6 max-w-full whitespace-normal break-words text-xs font-semibold uppercase leading-6 tracking-[0.14em] text-primary sm:text-base sm:tracking-[0.22em]"
        style={{ animationDelay: '0.16s' }}
      >
        <span className="block sm:inline">{t('对内疗愈人心', 'Healing People Within')}</span>
        <span className="mx-2 hidden sm:inline">·</span>
        <span className="block sm:inline">{t('对外修复土壤', 'Regenerating Land Without')}</span>
      </p>

      <p
        className="animate-fade-in-up-apple mt-7 max-w-xl break-words border-l border-primary/30 pl-5 text-sm font-medium leading-7 text-foreground/88 sm:text-base"
        style={{ animationDelay: '0.2s' }}
      >
        {t(
          '阿柑少年是一个扎根铁牛村的青年田野实验室与行动网络，致力于行为经济学研究与生态社区共建。',
          "R'gan Youth is a youth-led field lab and action network based in Tieniu Village, dedicated to behavioral economics research and ecological community building."
        )}
      </p>

      <p
        className="animate-fade-in-up-apple mt-6 max-w-2xl break-words text-base leading-8 text-muted-foreground sm:text-lg"
        style={{ animationDelay: '0.28s' }}
      >
        {t(
          '在一个高度焦虑、不确定的时代，我们选择让青少年回到自然、走进社区，在真实世界中重新认识自己与社会。',
          'In an age of anxiety and uncertainty, we invite young people to return to nature, enter real communities, and rediscover themselves through real-world action.'
        )}
      </p>

      <div
        className="animate-fade-in-up-apple mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        style={{ animationDelay: '0.36s' }}
      >
        <Button
          onClick={onJoin}
          className="btn-apple w-full max-w-[17rem] sm:w-auto"
        >
          {t('加入我们', 'Join Us')}
          <ArrowRight className="ml-2" size={18} />
        </Button>

        <Link to="/actions" className="w-full max-w-[17rem] sm:w-auto">
          <Button
            variant="outline"
            className="btn-apple w-full border-primary/15 bg-background/70 hover:border-primary/30 sm:w-auto"
          >
            {t('了解我们的行动', 'Explore Our Action')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
