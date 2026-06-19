import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized, type LocalizedText } from '@/lib/brand';
import { cn } from '@/lib/utils';

type SceneId = 'memory' | 'monoculture' | 'soil' | 'response' | 'departure';

interface Scene {
  id: SceneId;
  image: string;
  evidence?: {
    src: string;
    title: LocalizedText;
    caption: LocalizedText;
    variant: 'photo' | 'wide' | 'diagram';
  };
  eyebrow: LocalizedText;
  title: LocalizedText;
  lines: LocalizedText[];
  annotation?: LocalizedText;
}

const imageBase = '/archive/elements/photos/site-ecology';
const infographicBase = '/archive/elements/graphics/infographics';

const scenes: Scene[] = [
  {
    id: 'memory',
    image: `${imageBase}/s02-pine-forest-transition.jpg`,
    eyebrow: { zh: '土地的记忆', en: 'Land Memory' },
    title: {
      zh: '在阿柑少年现在生长的土地上，曾经有一片马尾松林。',
      en: 'Where R’gan Junior now grows, a pine forest once stood.',
    },
    lines: [
      {
        zh: '树、草、鸟、虫和土壤，共同维持着一个缓慢而稳定的系统。',
        en: 'Trees, ground cover, birds, insects, and soil held a slow and stable system together.',
      },
    ],
    annotation: { zh: '多层结构 / 生态记忆', en: 'Layered habitat / ecological memory' },
  },
  {
    id: 'monoculture',
    image: `${imageBase}/s02-orchard-spraying-scene.jpg`,
    evidence: {
      src: `${infographicBase}/s06-traditional-linpan-land-use-poster.jpg`,
      title: { zh: '传统林盘用地结构', en: 'Traditional Linpan land-use structure' },
      caption: {
        zh: '传统林盘不是单一果园，而是院落、林地、水体与果园共同组成的生活生态单元。',
        en: 'Traditional Linpan is not a single orchard, but a living ecology of courtyard, woods, water, and orchard.',
      },
      variant: 'diagram',
    },
    eyebrow: { zh: '一种作物之后', en: 'After One Crop' },
    title: {
      zh: '当土地只剩一种作物，生态系统也开始失去层次。',
      en: 'When the land kept only one crop, the ecosystem began to lose its layers.',
    },
    lines: [
      {
        zh: '单一种植的柑橘、化肥、除草剂和高强度管理，让大树、鸟类、昆虫和地被植物逐渐退场。',
        en: 'Monoculture citrus, fertilizer, herbicide, and intensive management pushed large trees, birds, insects, and ground cover away.',
      },
    ],
    annotation: { zh: '单一种植 / 高强度人工管理', en: 'Monoculture / intensive management' },
  },
  {
    id: 'soil',
    image: `${imageBase}/s04-soil-root-damage.jpg`,
    evidence: {
      src: `${imageBase}/s04-soil-root-damage.jpg`,
      title: { zh: '板结与根系损伤', en: 'Compaction and root damage' },
      caption: {
        zh: '土壤失去孔隙之后，根系、微生物和水分都很难重新形成健康关系。',
        en: 'When soil loses pore space, roots, microorganisms, and water struggle to form a healthy relationship again.',
      },
      variant: 'photo',
    },
    eyebrow: { zh: '土壤的数字', en: 'The Soil Number' },
    title: {
      zh: '1.7%，是土地发出的提醒。',
      en: '1.7% was the warning from the soil.',
    },
    lines: [
      {
        zh: '我们刚来到这里时，土壤有机质含量约为 1.7%。健康且有营养的土壤，通常需要达到 4% - 5%。',
        en: 'When we first came here, soil organic matter was about 1.7%. Fertile soil usually needs to reach 4% to 5%.',
      },
      {
        zh: '恢复，可能需要 5 - 8 年以上的持续修复。',
        en: 'Recovery may require five to eight years of continuous repair.',
      },
    ],
    annotation: { zh: '板结 / 酸化 / 肥力下降', en: 'Compaction / acidification / declining fertility' },
  },
  {
    id: 'response',
    image: `${imageBase}/s09-earthworm-soil-recovery.jpg`,
    evidence: {
      src: `${infographicBase}/s05-linpan-biodiversity-restoration-diagram.png`,
      title: { zh: '林盘生物多样性修复图', en: 'Linpan biodiversity restoration diagram' },
      caption: {
        zh: '修复不是增加装饰性的绿色，而是让乔木、地被、水体、作物和动物重新形成结构。',
        en: 'Repair is not decorative greening. It rebuilds relationships among trees, ground cover, water, crops, and animals.',
      },
      variant: 'wide',
    },
    eyebrow: { zh: '土地开始回应', en: 'The Land Responds' },
    title: {
      zh: '我们停止除草剂，让草重新长出来。',
      en: 'We stopped herbicide, and let ground cover return.',
    },
    lines: [
      {
        zh: '后来，蚯蚓洞出现了。根系、草和有益生物重新进入土壤，修复不再只是计划，而开始被看见。',
        en: 'Then earthworm tunnels appeared. Roots, grass, and beneficial life returned to the soil. Repair became visible.',
      },
    ],
    annotation: { zh: '1.7% → 2.5% / 土地正在回应', en: '1.7% → 2.5% / the land is responding' },
  },
  {
    id: 'departure',
    image: `${imageBase}/s06-linpan-aerial-overview.jpg`,
    evidence: {
      src: `${infographicBase}/s07-ecological-agri-product-solution-board.png`,
      title: { zh: '生态农产品解决方案', en: 'Ecological agri-product solution' },
      caption: {
        zh: '生态农业不只是生产方式，也成为少年理解食物、劳动、土地和社区的真实入口。',
        en: 'Ecological agriculture is not only production. It becomes an entry into food, labor, land, and community.',
      },
      variant: 'diagram',
    },
    eyebrow: { zh: '从林盘到少年', en: 'From Linpan to Youth' },
    title: {
      zh: '阿柑少年，是从这片土地的修复中长出来的。',
      en: 'R’gan Junior grew out of the repair of this land.',
    },
    lines: [
      {
        zh: '9 亩，是一个林盘样本。40 亩，是正在发生的生态实践。9900 亩，是一个村庄作为生态家园的想象。',
        en: 'Nine mu is one Linpan sample. Forty mu is an ecological practice in motion. 9900 mu is the imagination of a village as an ecological home.',
      },
      {
        zh: '少年在这里理解土壤、食物、劳动、生态和社区之间真实的关系，然后从这里出发。',
        en: 'Young people understand the real relationship between soil, food, labor, ecology, and community here, then depart from here.',
      },
    ],
    annotation: { zh: '真实世界课堂 / 在这里出发', en: 'Real-world classroom / departing from here' },
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getLocalProgress(globalProgress: number, index: number) {
  const sceneStart = index / scenes.length;
  const sceneEnd = (index + 1) / scenes.length;
  return clamp((globalProgress - sceneStart) / Math.max(0.001, sceneEnd - sceneStart));
}

export default function TieniuRegenerationStory() {
  const { lang } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const storyRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const story = storyRef.current;
      if (!story) return;

      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      setProgress(clamp((window.innerHeight * 0.5 - rect.top) / scrollable));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = undefined;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const activeIndex = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
  const activeScene = scenes[activeIndex];
  const sceneProgress = getLocalProgress(progress, activeIndex);
  const showEvidence = Boolean(activeScene.evidence && sceneProgress > 0.64);
  const copyVisible = !showEvidence;
  const storyStyle = useMemo(
    () => ({
      '--story-progress': progress,
      '--scene-progress': sceneProgress,
    }) as CSSProperties,
    [progress, sceneProgress],
  );

  return (
    <section
      ref={storyRef}
      className="land-memory relative my-28 h-[560vh] w-screen bg-[#10120d]"
      style={storyStyle}
      data-active-scene={activeScene.id}
    >
      <div className="sticky top-0 min-h-screen overflow-hidden">
        <div className="land-memory-visual" aria-hidden="true">
          {scenes.map((scene, index) => {
            const distance = Math.abs(index - activeIndex);
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.16 : 0;
            return (
              <img
                key={scene.id}
                src={scene.image}
                alt=""
                className="land-memory-image"
                style={{
                  opacity,
                  transform: `scale(${1.04 + progress * 0.045 + index * 0.002})`,
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            );
          })}
          <div className="land-memory-grade" />
          <div className="land-memory-grain" />
          <div className="land-memory-boundary boundary-one" />
          <div className="land-memory-boundary boundary-two" />
          <div className="land-memory-boundary boundary-three" />
          <div className="land-memory-soil-line" />
          <div className="land-memory-roots roots-one" />
          <div className="land-memory-roots roots-two" />
          <div className="land-memory-groundcover" />
          <div className="land-memory-worm" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,0.72fr)] lg:items-center">
            <div className="land-memory-index hidden lg:block">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-[#f4ead8]/72">
                {lang === 'zh' ? '铁牛村发展故事' : 'Tieniu regeneration story'}
              </p>
              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={cn('land-memory-index-row', index === activeIndex && 'is-active')}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{pickLocalized(scene.eyebrow, lang)}</span>
                  </div>
                ))}
              </div>
            </div>

            <article className="land-memory-copy-shell">
              <div className={cn('land-memory-copy', copyVisible && 'is-visible')}>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-[#f2c37a]">
                  {pickLocalized(activeScene.eyebrow, lang)}
                </p>
                <h2 className="font-serif text-3xl leading-tight text-[#fff8ea] sm:text-4xl lg:text-5xl">
                  {pickLocalized(activeScene.title, lang)}
                </h2>
                <div className="land-memory-body mt-7 text-base leading-8 text-[#fff3dc]">
                  {activeScene.lines.map((line) => (
                    <div key={line.zh} className="land-memory-line-group">
                      <p>{pickLocalized(line, lang)}</p>
                    </div>
                  ))}
                </div>
                {activeScene.annotation && (
                  <p className="mt-8 border-t border-[#f4ead8]/24 pt-5 text-xs uppercase tracking-[0.24em] text-[#e8c790]">
                    {pickLocalized(activeScene.annotation, lang)}
                  </p>
                )}
              </div>

              {activeScene.evidence && (
                <figure
                  className={cn(
                    'land-memory-inline-evidence',
                    `is-${activeScene.evidence.variant}`,
                    showEvidence && 'is-visible',
                  )}
                  style={{ '--inline-evidence-progress': showEvidence ? clamp((sceneProgress - 0.64) / 0.28) : 0 } as CSSProperties}
                >
                  <div className="land-memory-inline-evidence-image">
                    <img
                      src={activeScene.evidence.src}
                      alt={pickLocalized(activeScene.evidence.title, lang)}
                      loading="lazy"
                    />
                  </div>
                  <figcaption>
                    <span>{pickLocalized(activeScene.evidence.title, lang)}</span>
                    <small>{pickLocalized(activeScene.evidence.caption, lang)}</small>
                  </figcaption>
                </figure>
              )}
            </article>
          </div>

          <div className="land-memory-data">
            <div className="land-memory-metric metric-soil">
              <span>1.7%</span>
              <small>{lang === 'zh' ? '初始土壤有机质' : 'Initial organic matter'}</small>
            </div>
            <div className="land-memory-metric metric-repair">
              <span>2.5%</span>
              <small>{lang === 'zh' ? '土地开始回应' : 'The land responds'}</small>
            </div>
            <div className="land-memory-scale">
              <span>9亩</span>
              <span>40亩</span>
              <span>9900亩</span>
            </div>
          </div>

          <div className="land-memory-footer">
            <div className="h-px flex-1 bg-[#f4ead8]/24" />
            <p>
              {lang === 'zh'
                ? `${brandName}不是来到铁牛村做活动，而是从这片土地的修复中长出来。`
                : `${brandName} did not simply come to Tieniu for activities. It grew out of this land’s repair.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
