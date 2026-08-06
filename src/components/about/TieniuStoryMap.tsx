import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized, type LocalizedText } from '@/lib/brand';

type LngLat = [number, number];

interface MapStage {
  id: 'chengdu' | 'xilai' | 'tieniu';
  label: LocalizedText;
  place: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  center: LngLat;
  zoom: number;
}

interface AMapMap {
  setZoomAndCenter: (zoom: number, center: LngLat, immediately?: boolean, duration?: number) => void;
  destroy: () => void;
}

interface AMapMarker {
  setMap?: (map: AMapMap | null) => void;
}

interface AMapPolygon {
  setMap?: (map: AMapMap | null) => void;
}

interface AMapNamespace {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMap;
  Marker: new (options: Record<string, unknown>) => AMapMarker;
  Polygon?: new (options: Record<string, unknown>) => AMapPolygon;
}

declare global {
  interface Window {
    AMap?: AMapNamespace;
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

const AMAP_SCRIPT_ID = 'amap-js-api-v2';
const TIENIU_CENTER: LngLat = [103.468, 30.213];
const XILAI_STATION: LngLat = [103.4388, 30.1867];

const stages: MapStage[] = [
  {
    id: 'chengdu',
    label: { zh: '成都平原', en: 'Chengdu Plain' },
    place: { zh: '四川 · 成都', en: 'Sichuan · Chengdu' },
    title: { zh: '从成都平原向西南，进入蒲江的林盘乡村。', en: 'Southwest of Chengdu, the landscape opens into Pujiang\'s Linpan villages.' },
    body: {
      zh: '铁牛村位于成都蒲江县西来镇。这里的院落、林地、水体和果园，共同组成川西林盘的生活生态。',
      en: 'Tieniu Village sits in Xilai Town, Pujiang County. Courtyards, woods, water, and orchards form the living ecology of western Sichuan Linpan.',
    },
    center: [103.72, 30.42],
    zoom: 8.8,
  },
  {
    id: 'xilai',
    label: { zh: '蒲江西来', en: 'Xilai, Pujiang' },
    place: { zh: '西来镇 · 铁牛村', en: 'Xilai Town · Tieniu Village' },
    title: { zh: '离西来站约 5.8 公里，村庄与城市保持真实而日常的连接。', en: 'About 5.8 km from Xilai Station, the village stays connected to the city through everyday movement.' },
    body: {
      zh: '从西来站到铁牛村，车行约 12 分钟。这里不是遥远的活动背景，而是一处可以长期进入、观察和共同生活的真实社区。',
      en: 'The drive from Xilai Station takes about 12 minutes. This is not a distant activity backdrop, but a real community that young people can enter, observe, and live alongside over time.',
    },
    center: [103.454, 30.202],
    zoom: 13.3,
  },
  {
    id: 'tieniu',
    label: { zh: '铁牛村', en: 'Tieniu Village' },
    place: { zh: '故事发生地', en: 'The story site' },
    title: { zh: '阿柑少年从一片正在修复的土地中生长出来。', en: 'R\'gan Junior grew from a piece of land undergoing repair.' },
    body: {
      zh: '果园、鱼塘、林盘、新老村民和城市家庭在这里相遇。少年由此理解食物、劳动、生态与社区之间真实的关系。',
      en: 'Orchards, ponds, Linpan landscapes, villagers, and urban families meet here. Young people encounter the real relationships among food, labor, ecology, and community.',
    },
    center: TIENIU_CENTER,
    zoom: 17.1,
  },
];

const tieniuBoundary: LngLat[] = [
  [103.4619, 30.2174],
  [103.4642, 30.2191],
  [103.4674, 30.2196],
  [103.4712, 30.2184],
  [103.4741, 30.2162],
  [103.4751, 30.2134],
  [103.4737, 30.2106],
  [103.4706, 30.2087],
  [103.4668, 30.2082],
  [103.4634, 30.2096],
  [103.4612, 30.2123],
  [103.461, 30.2152],
  [103.4619, 30.2174],
];

function loadAMap(key: string, securityCode?: string): Promise<AMapNamespace> {
  if (window.AMap) return Promise.resolve(window.AMap);

  if (securityCode) {
    window._AMapSecurityConfig = { securityJsCode: securityCode };
  }

  const existingScript = document.getElementById(AMAP_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener(
        'load',
        () => (window.AMap ? resolve(window.AMap) : reject(new Error('AMap did not initialize'))),
        { once: true },
      );
      existingScript.addEventListener('error', () => reject(new Error('AMap failed to load')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = AMAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.onload = () => (window.AMap ? resolve(window.AMap) : reject(new Error('AMap did not initialize')));
    script.onerror = () => reject(new Error('AMap failed to load'));
    document.head.appendChild(script);
  });
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

export default function TieniuStoryMap() {
  const { lang, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapMap | null>(null);
  const overlaysRef = useRef<Array<AMapMarker | AMapPolygon>>([]);
  const [activeIndex, setActiveIndex] = useState(1);
  const [mapStatus, setMapStatus] = useState<'fallback' | 'loading' | 'ready' | 'error'>('fallback');
  const reducedMotion = useReducedMotion();
  const activeStage = stages[activeIndex];

  useEffect(() => {
    const container = mapContainerRef.current;
    const amapKey = import.meta.env.VITE_AMAP_KEY?.trim();
    const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE?.trim();
    if (!container || !amapKey) return;

    let cancelled = false;
    setMapStatus('loading');

    loadAMap(amapKey, securityCode)
      .then((AMap) => {
        if (cancelled || !mapContainerRef.current) return;

        const initialStage = stages[1];
        const map = new AMap.Map(mapContainerRef.current, {
          center: initialStage.center,
          zoom: initialStage.zoom,
          pitch: 24,
          viewMode: '3D',
          mapStyle: 'amap://styles/darkblue',
          showLabel: true,
          scrollWheel: false,
          dragEnable: false,
          zoomEnable: false,
          doubleClickZoom: false,
          keyboardEnable: false,
        });

        const markers = [
          new AMap.Marker({
            map,
            position: TIENIU_CENTER,
            anchor: 'bottom-center',
            offset: [0, -3],
            zIndex: 30,
            content: '<div class="tieniu-place-marker tieniu-place-marker--primary"><span></span><strong>铁牛村</strong></div>',
          }),
          new AMap.Marker({
            map,
            position: XILAI_STATION,
            anchor: 'bottom-center',
            zIndex: 20,
            content: '<div class="tieniu-place-marker"><span></span><strong>西来站</strong></div>',
          }),
        ];

        const overlays: Array<AMapMarker | AMapPolygon> = [...markers];
        if (AMap.Polygon) {
          overlays.push(
            new AMap.Polygon({
              map,
              path: tieniuBoundary,
              fillColor: '#7ed5a7',
              fillOpacity: 0.18,
              strokeColor: '#d9f3df',
              strokeOpacity: 0.72,
              strokeWeight: 2,
              zIndex: 10,
            }),
          );
        }

        mapRef.current = map;
        overlaysRef.current = overlays;
        setMapStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setMapStatus('error');
      });

    return () => {
      cancelled = true;
      overlaysRef.current.forEach((overlay) => overlay.setMap?.(null));
      overlaysRef.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  const selectStage = (index: number) => {
    setActiveIndex(index);
    const stage = stages[index];
    mapRef.current?.setZoomAndCenter(
      stage.zoom,
      stage.center,
      reducedMotion,
      reducedMotion ? 0 : 720,
    );
  };

  const showLiveMap = mapStatus === 'ready';

  return (
    <section className="tieniu-place-story" aria-labelledby="tieniu-map-title">
      <div className="tieniu-place-story__heading">
        <p>{t('铁牛村的故事', 'The Story of Tieniu Village')}</p>
        <h3 id="tieniu-map-title">{t('故事从哪里开始？', 'Where does this story begin?')}</h3>
        <p>
          {t(
            '沿着成都、蒲江西来到铁牛村，点击地点查看不同尺度。页面下滑不会再改变视野。',
            'Follow the route from Chengdu through Xilai, Pujiang, to Tieniu Village. Choose a place to change scale; page scrolling never changes the view.',
          )}
        </p>
      </div>

      <div className="tieniu-place-story__layout">
        <div className="tieniu-place-story__controls" aria-label={t('选择地图范围', 'Choose map area')}>
          {stages.map((stage, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={stage.id}
                type="button"
                className="tieniu-place-story__stage"
                data-active={isActive}
                aria-pressed={isActive}
                onClick={() => selectStage(index)}
              >
                <span>{pickLocalized(stage.label, lang)}</span>
                <strong>{pickLocalized(stage.place, lang)}</strong>
              </button>
            );
          })}

          <article className="tieniu-place-story__copy" aria-live="polite">
            <LocateFixed aria-hidden="true" />
            <h4>{pickLocalized(activeStage.title, lang)}</h4>
            <p>{pickLocalized(activeStage.body, lang)}</p>
          </article>
        </div>

        <div className="tieniu-place-story__map-shell" data-map-status={mapStatus}>
          <div ref={mapContainerRef} className="tieniu-place-story__live-map" aria-hidden={!showLiveMap} />
          {!showLiveMap && (
            <div className="tieniu-place-story__fallback">
              <img
                src="/archive/elements/graphics/infographics/s01-xilai-town-site-map.png"
                alt={t('西来镇、铁牛村与西来站的位置地图', 'Map showing Xilai Town, Tieniu Village, and Xilai Station')}
              />
              <div className="tieniu-place-story__fallback-marker">
                <MapPin aria-hidden="true" />
                <span>{t('铁牛村', 'Tieniu Village')}</span>
              </div>
            </div>
          )}
          <div className="tieniu-place-story__map-caption">
            <span>{pickLocalized(activeStage.label, lang)}</span>
            <span>
              {mapStatus === 'loading'
                ? t('地图加载中', 'Loading map')
                : mapStatus === 'ready'
                  ? t('点击左侧地点切换视野', 'Choose a place to change the view')
                  : t('位置示意图', 'Location reference')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
