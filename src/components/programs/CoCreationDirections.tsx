import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { coCreationDirections } from '@/content/coCreationDirections';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import './coCreationDirections.css';

export default function CoCreationDirections() {
  const { lang, t } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  return <section className="co-creation-directions" aria-labelledby="co-creation-directions-title">
    <p className="mb-3 text-sm text-primary">{t('从兴趣进入真实项目', 'Start with your interests')}</p>
    <h2 id="co-creation-directions-title" className="font-serif text-3xl text-foreground sm:text-4xl">{t('青少年共创方向', 'Ways to Co-create')}</h2>
    <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">{t('五个方向，找到你愿意参与的一件事。悬停或点击卡片，了解具体可以做什么。', 'Five directions to explore. Hover over a card or select it to discover how you can take part.')}</p>
    <div className="co-creation-directions__grid" onMouseLeave={() => setHovered(null)}>
      {coCreationDirections.map((direction, index) => <Collapsible
        key={direction.title.zh}
        className="co-creation-direction"
        open={(hovered ?? selected) === index}
        onOpenChange={(open) => setSelected(open ? index : null)}
        onFocusCapture={(event) => { if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setSelected(index); }}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(index); }}
      >
        <CollapsibleTrigger className="co-creation-direction__trigger">
          <span className="co-creation-direction__number" aria-hidden="true">0{index + 1}</span>
          <span className="co-creation-direction__title">{pickLocalized(direction.title, lang)}</span>
          <span className="co-creation-direction__hint">{t('了解方向', 'Explore')} <span aria-hidden="true">↗</span></span>
        </CollapsibleTrigger>
        <CollapsibleContent className="co-creation-direction__body"><p>{pickLocalized(direction.body, lang)}</p></CollapsibleContent>
      </Collapsible>)}
    </div>
  </section>;
}
