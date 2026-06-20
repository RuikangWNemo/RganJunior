import { useLanguage } from '@/contexts/LanguageContext';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

export default function WholeLifeGrowth() {
  const { t } = useLanguage();

  return (
    <section id="whole-life-growth" className="whole-life-growth section-breathing">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollProgressReveal direction="up" distance={44} scale={false} blur={false}>
          <div className="whole-life-growth__text">
            <p>
              {t(
                '在一个高度焦虑、不确定的时代，青少年应该回到自然、走进社区，在真实世界中重新认识自己与社会。',
                'In an anxious and uncertain age, young people should return to nature, enter communities, and rediscover themselves and society in the real world.'
              )}
            </p>
            <p>
              {t(
                '青少年在乡村与城市之间探索、疗愈、学习并行动，把自我成长与土地、社区和更大的生态系统重新连接起来。',
                'Between village and city, young people explore, heal, learn, and act, reconnecting personal growth with land, community, and the larger ecosystem.'
              )}
            </p>
          </div>
        </ScrollProgressReveal>
      </div>
    </section>
  );
}
