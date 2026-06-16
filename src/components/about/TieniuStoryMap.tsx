import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized, type LocalizedText } from '@/lib/brand';
import { cn } from '@/lib/utils';

type LngLat = [number, number];
type AMapOverlay = AMapPolygon | AMapCircle;
type StageOverlays = AMapOverlay[];

interface StoryStage {
  id: string;
  place: LocalizedText;
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  center: LngLat;
  zoom: number;
  pitch: number;
  geocode?: {
    city: string;
    keyword: string;
  };
  fallbackPosition: {
    x: number;
    y: number;
  };
  boundaryQuery?: {
    keyword: string;
    level: 'country' | 'province' | 'city' | 'district';
  };
  highlightArea?: {
    type: 'circle' | 'polygon';
    center?: LngLat;
    radius?: number;
    path?: LngLat[] | LngLat[][];
    style?: {
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    };
  };
}

interface AMapMap {
  setZoomAndCenter: (zoom: number, center: LngLat, immediately?: boolean, duration?: number) => void;
  setCenter?: (center: LngLat, immediately?: boolean, duration?: number) => void;
  setZoom?: (zoom: number, immediately?: boolean, duration?: number) => void;
  setPitch?: (pitch: number, immediately?: boolean, duration?: number) => void;
  getZoom?: () => number;
  getCenter?: () => {
    lng?: number;
    lat?: number;
    getLng?: () => number;
    getLat?: () => number;
  };
  plugin?: (plugins: string[], callback: () => void) => void;
  destroy: () => void;
}

interface AMapMarker {
  show?: () => void;
  hide?: () => void;
  setMap?: (map: AMapMap | null) => void;
  setPosition?: (position: LngLat) => void;
}

interface AMapLngLatLike {
  lng?: number;
  lat?: number;
  getLng?: () => number;
  getLat?: () => number;
  toArray?: () => LngLat;
}

interface AMapGeocodeResult {
  geocodes?: Array<{
    location?: AMapLngLatLike;
  }>;
  info?: string;
}

interface AMapGeocoder {
  getLocation: (
    keyword: string,
    callback: (status: 'complete' | 'error' | 'no_data' | string, result: AMapGeocodeResult | string) => void,
  ) => void;
}

interface AMapPolygon {
  setMap?: (map: AMapMap | null) => void;
  setOptions?: (options: Record<string, unknown>) => void;
  show?: () => void;
  hide?: () => void;
}

interface AMapCircle {
  setMap?: (map: AMapMap | null) => void;
  setOptions?: (options: Record<string, unknown>) => void;
  show?: () => void;
  hide?: () => void;
}

interface AMapDistrictResult {
  districtList?: Array<{
    boundaries?: Array<Array<AMapLngLatLike | LngLat>>;
  }>;
  info?: string;
}

interface AMapDistrictSearch {
  search: (
    keyword: string,
    callback: (status: 'complete' | 'error' | 'no_data' | string, result: AMapDistrictResult | string) => void,
  ) => void;
}

interface AMapNamespace {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMap;
  Marker: new (options: Record<string, unknown>) => AMapMarker;
  Geocoder?: new (options: Record<string, unknown>) => AMapGeocoder;
  DistrictSearch?: new (options: Record<string, unknown>) => AMapDistrictSearch;
  Polygon?: new (options: Record<string, unknown>) => AMapPolygon;
  Circle?: new (options: Record<string, unknown>) => AMapCircle;
  plugin?: (plugins: string[], callback: () => void) => void;
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
const storyHeight = 'min(620vh, 5000px)';
const cameraDuration = 1000; // 增加动画时长以获得更平滑的切换
const boundaryFadeDuration = 680;

// The first three stages prefer live AMap administrative boundaries.
// Tieniu Village is kept as an edited path because village-level boundaries are
// usually not returned by DistrictSearch.
const editedBoundaryData = {
  tieniu: {
    name: '铁牛村',
    path: [
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
      [103.4610, 30.2152],
      [103.4619, 30.2174],
    ] as LngLat[]
  }
};

const stages: StoryStage[] = [
  {
    id: 'world',
    place: { zh: '中国', en: 'China' },
    eyebrow: { zh: '全球', en: 'Global' },
    title: { zh: '世界东方', en: 'East of the World' },
    body: {
      zh: '',
      en: '',
    },
    center: [104.1954, 35.8617],
    zoom: 2.0,
    pitch: 0,
    fallbackPosition: { x: 50, y: 44 },
    boundaryQuery: {
      keyword: '中国',
      level: 'country',
    },
    highlightArea: {
      type: 'polygon',
      style: {
        fillColor: 'rgba(22, 163, 74, 0.16)',
        fillOpacity: 0.16,
        strokeColor: 'rgba(22, 101, 52, 0.48)',
        strokeOpacity: 0.48,
        strokeWeight: 1,
      },
    },
  },
  {
    id: 'sichuan',
    place: { zh: '四川', en: 'Sichuan' },
    eyebrow: { zh: '区域', en: 'Regional' },
    title: { zh: '成都平原', en: 'Chengdu Plain' },
    body: {
      zh: '',
      en: '',
    },
    center: [104.0665, 30.5728],
    zoom: 8.8,
    pitch: 30,
    geocode: {
      city: '成都市',
      keyword: '四川省成都市',
    },
    fallbackPosition: { x: 48, y: 48 },
    boundaryQuery: {
      keyword: '四川省',
      level: 'province',
    },
    highlightArea: {
      type: 'polygon',
      style: {
        fillColor: 'rgba(22, 163, 74, 0.18)',
        fillOpacity: 0.18,
        strokeColor: 'rgba(22, 101, 52, 0.54)',
        strokeOpacity: 0.54,
        strokeWeight: 1.5,
      },
    },
  },
  {
    id: 'pujiang',
    place: { zh: '蒲江', en: 'Pujiang' },
    eyebrow: { zh: '县镇', en: 'County' },
    title: { zh: '西来镇', en: 'Xilai Town' },
    body: {
      zh: '',
      en: '',
    },
    center: [103.495, 30.228],
    zoom: 13.2,
    pitch: 45,
    geocode: {
      city: '成都市',
      keyword: '四川省成都市蒲江县西来镇',
    },
    fallbackPosition: { x: 39, y: 63 },
    boundaryQuery: {
      keyword: '蒲江县',
      level: 'district',
    },
    highlightArea: {
      type: 'polygon',
      style: {
        fillColor: 'rgba(22, 163, 74, 0.20)',
        fillOpacity: 0.20,
        strokeColor: 'rgba(22, 101, 52, 0.58)',
        strokeOpacity: 0.58,
        strokeWeight: 1.5,
      },
    },
  },
  {
    id: 'tieniu',
    place: { zh: '铁牛村', en: 'Tieniu' },
    eyebrow: { zh: '终点', en: 'Destination' },
    title: { zh: '故事发生地', en: 'Story Site' },
    body: {
      zh: '',
      en: '',
    },
    center: [103.468, 30.213],
    zoom: 17.4,
    pitch: 55,
    geocode: {
      city: '成都市',
      keyword: '四川省成都市蒲江县西来镇铁牛村',
    },
    fallbackPosition: { x: 37, y: 66 },
    highlightArea: {
      type: 'polygon',
      path: editedBoundaryData.tieniu.path,
      style: {
        fillColor: 'rgba(22, 163, 74, 0.26)',
        fillOpacity: 0.26,
        strokeColor: 'rgba(21, 128, 61, 0.72)',
        strokeOpacity: 0.72,
        strokeWeight: 2,
      },
    },
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function loadAMap(key: string, securityCode?: string): Promise<AMapNamespace> {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (securityCode) {
    window._AMapSecurityConfig = {
      securityJsCode: securityCode,
    };
  }

  const existingScript = document.getElementById(AMAP_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => window.AMap ? resolve(window.AMap) : reject(new Error('AMap failed to initialize')), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('AMap script failed to load')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = AMAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.onload = () => window.AMap ? resolve(window.AMap) : reject(new Error('AMap failed to initialize'));
    script.onerror = () => reject(new Error('AMap script failed to load'));
    document.head.appendChild(script);
  });
}

function readLngLat(location?: AMapLngLatLike): LngLat | null {
  if (!location) return null;

  const arrayLocation = location.toArray?.();
  if (arrayLocation && Number.isFinite(arrayLocation[0]) && Number.isFinite(arrayLocation[1])) {
    return [arrayLocation[0], arrayLocation[1]];
  }

  const lng = location.lng ?? location.getLng?.();
  const lat = location.lat ?? location.getLat?.();
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return [lng as number, lat as number];
}

function isGeocodeResult(result: AMapGeocodeResult | string): result is AMapGeocodeResult {
  return typeof result === 'object' && result !== null;
}

function isDistrictResult(result: AMapDistrictResult | string): result is AMapDistrictResult {
  return typeof result === 'object' && result !== null;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function normalizeBoundary(boundary: Array<AMapLngLatLike | LngLat>): LngLat[] {
  return boundary.reduce<LngLat[]>((path, point) => {
    if (Array.isArray(point)) {
      if (Number.isFinite(point[0]) && Number.isFinite(point[1])) path.push([point[0], point[1]]);
      return path;
    }

    const lngLat = readLngLat(point);
    if (lngLat) path.push(lngLat);
    return path;
  }, []);
}

function applyOverlayOpacity(
  overlay: AMapOverlay,
  style: NonNullable<StoryStage['highlightArea']>['style'] = {},
  opacityScale: number,
) {
  overlay.setOptions?.({
    fillOpacity: (style.fillOpacity ?? 0.18) * opacityScale,
    strokeOpacity: (style.strokeOpacity ?? 0.5) * opacityScale,
  });
}

function loadAMapPlugin(
  AMap: AMapNamespace,
  map: AMapMap,
  pluginName: 'AMap.Geocoder' | 'AMap.DistrictSearch',
  isAvailable: () => boolean,
  label: string,
): Promise<boolean> {
  console.log(`[${label}] Checking availability: ${isAvailable()}`);
  if (isAvailable()) {
    console.log(`[${label}] Already available`);
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (!AMap.plugin && !map.plugin) {
      console.log(`[${label}] No plugin method available`);
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      console.log(`[${label}] Plugin load finished: ${loaded}`);
      resolve(loaded);
    };

    if (AMap.plugin) {
      console.log(`[${label}] Loading plugin via AMap.plugin`);
      AMap.plugin([pluginName], () => finish(isAvailable()));
    } else {
      console.log(`[${label}] Loading plugin via map.plugin`);
      map.plugin?.([pluginName], () => finish(isAvailable()));
    }
    window.setTimeout(() => {
      console.log(`[${label}] Plugin load timeout, available: ${isAvailable()}`);
      finish(isAvailable());
    }, 2400);
  });
}

function splitPolygonPaths(path: LngLat[] | LngLat[][]): LngLat[][] {
  const firstPoint = path[0];
  if (Array.isArray(firstPoint) && Array.isArray(firstPoint[0])) {
    return path as LngLat[][];
  }

  return [path as LngLat[]];
}

function loadGeocoderPlugin(AMap: AMapNamespace, map: AMapMap): Promise<boolean> {
  return loadAMapPlugin(AMap, map, 'AMap.Geocoder', () => Boolean(AMap.Geocoder), 'Geocoder');
}

function loadDistrictSearchPlugin(AMap: AMapNamespace, map: AMapMap): Promise<boolean> {
  return loadAMapPlugin(AMap, map, 'AMap.DistrictSearch', () => Boolean(AMap.DistrictSearch), 'DistrictSearch');
}

function geocodeStageCenter(AMap: AMapNamespace, stage: StoryStage): Promise<{ id: string; center: LngLat } | null> {
  console.log(`[Geocoder] Geocoding stage ${stage.id}: ${stage.geocode?.keyword}`);
  if (!stage.geocode || !AMap.Geocoder) {
    console.log(`[Geocoder] No geocode config or Geocoder not available for stage ${stage.id}`);
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const geocoder = new AMap.Geocoder({
      city: stage.geocode.city,
      extensions: 'base',
      lang: 'zh_cn',
    });

    geocoder.getLocation(stage.geocode.keyword, (status, result) => {
      console.log(`[Geocoder] Geocode result for ${stage.id}: status=${status}`);
      
      if (status !== 'complete' || !isGeocodeResult(result)) {
        console.log(`[Geocoder] Geocode failed for ${stage.id}: status=${status}, result=`, result);
        resolve(null);
        return;
      }

      const center = readLngLat(result.geocodes?.[0]?.location);
      console.log(`[Geocoder] Geocode success for ${stage.id}: center=${center?.join(',')}`);
      resolve(center ? { id: stage.id, center } : null);
    });
  });
}

async function resolveGeocodedCenters(AMap: AMapNamespace, map: AMapMap) {
  const pluginLoaded = await loadGeocoderPlugin(AMap, map);
  if (!pluginLoaded) return {};

  const results = await Promise.all(stages.map((stage) => geocodeStageCenter(AMap, stage)));
  return results.reduce<Record<string, LngLat>>((resolved, result) => {
    if (result) resolved[result.id] = result.center;
    return resolved;
  }, {});
}

function queryDistrictBoundary(
  AMap: AMapNamespace,
  stage: StoryStage,
): Promise<{ id: string; path: LngLat[][] } | null> {
  if (!stage.boundaryQuery || !AMap.DistrictSearch) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const district = new AMap.DistrictSearch({
      level: stage.boundaryQuery.level,
      subdistrict: 0,
      extensions: 'all',
    });

    district.search(stage.boundaryQuery.keyword, (status, result) => {
      console.log(`[DistrictSearch] Boundary result for ${stage.id}: status=${status}`);

      if (status !== 'complete' || !isDistrictResult(result)) {
        console.log(`[DistrictSearch] Boundary failed for ${stage.id}:`, result);
        resolve(null);
        return;
      }

      const boundaries = result.districtList?.[0]?.boundaries ?? [];
      const path = boundaries
        .map((boundary) => normalizeBoundary(boundary))
        .filter((boundaryPath) => boundaryPath.length >= 3);

      resolve(path.length ? { id: stage.id, path } : null);
    });
  });
}

async function resolveDistrictBoundaries(AMap: AMapNamespace, map: AMapMap) {
  const pluginLoaded = await loadDistrictSearchPlugin(AMap, map);
  if (!pluginLoaded) return {};

  const results = await Promise.all(stages.map((stage) => queryDistrictBoundary(AMap, stage)));
  return results.reduce<Record<string, LngLat[][]>>((resolved, result) => {
    if (result) resolved[result.id] = result.path;
    return resolved;
  }, {});
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

export default function TieniuStoryMap() {
  const { lang, t } = useLanguage();
  const storyRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapMap | null>(null);
  const markersRef = useRef<Map<string, AMapMarker>>(new Map());
  const highlightOverlaysRef = useRef<Map<string, StageOverlays>>(new Map());
  const overlayAnimationRef = useRef<number>();
  const rafRef = useRef<number>();
  const activeIndexRef = useRef(0);
  const lastCameraKeyRef = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mapStatus, setMapStatus] = useState<'fallback' | 'loading' | 'ready' | 'error'>('fallback');
  const [cameraDebug, setCameraDebug] = useState('');
  const [geocodeDebug, setGeocodeDebug] = useState('geocode=static');
  const [stageCenters, setStageCenters] = useState<Record<string, LngLat>>({});
  const reducedMotion = useReducedMotion();

  const amapKey = import.meta.env.VITE_AMAP_KEY?.trim();
  const amapSecurityCode = import.meta.env.VITE_AMAP_SECURITY_CODE?.trim();
  const storyStages = useMemo(
    () => stages.map((stage) => ({
      ...stage,
      center: stageCenters[stage.id] ?? stage.center,
    })),
    [stageCenters],
  );
  const activeStage = storyStages[activeIndex];
  const hasLiveMap = mapStatus === 'ready';
  const showMapDebug = useMemo(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).has('mapDebug'),
    [],
  );

  const storyStyle = useMemo(
    () => ({ height: reducedMotion ? 'auto' : storyHeight }),
    [reducedMotion],
  );

  const setStage = useCallback((index: number, nextProgress?: number) => {
    const nextIndex = Math.min(stages.length - 1, Math.max(0, index));
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setProgress(nextProgress ?? nextIndex / Math.max(1, stages.length - 1));
  }, []);

  const createHighlightOverlay = useCallback((AMap: AMapNamespace, stage: StoryStage, boundaryPath?: LngLat[][]) => {
    if (!stage.highlightArea) return [];

    const { type, center, radius, path, style } = stage.highlightArea;
    
    if (type === 'circle' && center && radius) {
      return [new AMap.Circle({
        center,
        radius,
        ...style,
        zIndex: 5,
      })];
    }
    
    const polygonPath = boundaryPath ?? path;
    if (type === 'polygon' && polygonPath) {
      return splitPolygonPaths(polygonPath).map((singlePath) => new AMap.Polygon({
        path: singlePath,
        ...style,
        fillOpacity: 0,
        strokeOpacity: 0,
        bubble: true,
        zIndex: 5,
      }));
    }
    
    return [];
  }, []);

  const animateBoundaryTransition = useCallback((activeStageId: string) => {
    if (overlayAnimationRef.current) {
      window.cancelAnimationFrame(overlayAnimationRef.current);
    }

    const startedAt = performance.now();

    const tick = (now: number) => {
      const rawProgress = clamp((now - startedAt) / boundaryFadeDuration);
      const easedProgress = easeOutCubic(rawProgress);

      highlightOverlaysRef.current.forEach((overlays, stageId) => {
        const stage = stages.find((candidate) => candidate.id === stageId);
        const style = stage?.highlightArea?.style;
        const opacityScale = stageId === activeStageId ? easedProgress : 1 - easedProgress;

        overlays.forEach((overlay) => {
          overlay.show?.();
          applyOverlayOpacity(overlay, style, opacityScale);
        });

        if (rawProgress >= 1 && stageId !== activeStageId) {
          overlays.forEach((overlay) => overlay.hide?.());
        }
      });

      if (rawProgress < 1) {
        overlayAnimationRef.current = window.requestAnimationFrame(tick);
      } else {
        overlayAnimationRef.current = undefined;
      }
    };

    overlayAnimationRef.current = window.requestAnimationFrame(tick);
  }, []);

  const updateCamera = useCallback((nextActiveIndex: number) => {
    const map = mapRef.current;
    if (!map) return;

    const camera = storyStages[nextActiveIndex];
    const cameraKey = [
      camera.id,
      camera.center.join(','),
      camera.zoom,
      camera.pitch,
    ].join(':');
    
    console.log(`[updateCamera] stage=${camera.id}, target=${camera.center.join(',')}@${camera.zoom}, lastKey=${lastCameraKeyRef.current}, currentKey=${cameraKey}, mapStatus=${mapStatus}`);
    
    // Always update camera if map is ready, regardless of cameraKey
    // This ensures that even with static coordinates, the camera updates
    if (mapStatus !== 'ready') {
      console.log(`[updateCamera] Map not ready (status: ${mapStatus}), skipping update`);
      return;
    }

    console.log(`[updateCamera] Calling setZoomAndCenter with zoom=${camera.zoom}, center=${camera.center.join(',')}`);
    map.setZoomAndCenter(camera.zoom, camera.center, false, cameraDuration);
    map.setPitch?.(camera.pitch, false, cameraDuration);

    // 更新marker显示 - 每个阶段都有大头针，当前活跃阶段的大头针更突出
    markersRef.current.forEach((marker, stageId) => {
      if (stageId === camera.id) {
        marker.show?.();
      } else {
        marker.hide?.();
      }
    });

    animateBoundaryTransition(camera.id);

    lastCameraKeyRef.current = cameraKey;

    window.setTimeout(() => {
      if (lastCameraKeyRef.current !== cameraKey) {
        console.log(`[updateCamera] Camera key changed during timeout, skipping debug update`);
        return;
      }

      const center = map.getCenter?.();
      const actualLng = center?.lng ?? center?.getLng?.();
      const actualLat = center?.lat ?? center?.getLat?.();
      const actualZoom = map.getZoom?.();
      const hasActualCenter = Number.isFinite(actualLng) && Number.isFinite(actualLat);

      const debugInfo = [
        `stage=${storyStages[nextActiveIndex].id}`,
        `target=${camera.center.join(',')}@${camera.zoom}`,
        Number.isFinite(actualZoom) ? `actualZoom=${actualZoom?.toFixed(2)}` : 'actualZoom=unknown',
        hasActualCenter ? `actualCenter=${actualLng?.toFixed(5)},${actualLat?.toFixed(5)}` : 'actualCenter=unknown',
      ].join(' | ');
      
      console.log(`[updateCamera] Debug info: ${debugInfo}`);
      setCameraDebug(debugInfo);
    }, cameraDuration + 120);
  }, [animateBoundaryTransition, mapStatus, storyStages]);

  const updateFromScroll = useCallback(() => {
    const story = storyRef.current;
    if (!story) return;

    let nextActiveIndex = 0;
    let nextProgress = 0;
    if (reducedMotion) {
      nextActiveIndex = stages.length - 1;
      nextProgress = 1;
    } else {
      const storyRect = story.getBoundingClientRect();
      const anchorY = window.innerHeight * 0.5;
      const scrollableDistance = Math.max(1, storyRect.height - window.innerHeight);
      
      // 使用更平滑的进度计算
      const rawProgress = (anchorY - storyRect.top) / scrollableDistance;
      nextProgress = clamp(rawProgress);
      
      // 使用平滑的阶段切换，避免频繁跳动
      const exactStage = nextProgress * (stages.length - 1);
      const smoothStage = Math.round(exactStage * 10) / 10; // 保留一位小数进行平滑
      nextActiveIndex = Math.round(smoothStage);
      
      // 确保索引在有效范围内
      nextActiveIndex = Math.max(0, Math.min(stages.length - 1, nextActiveIndex));
    }

    setStage(nextActiveIndex, nextProgress);
  }, [reducedMotion, setStage]);

  useEffect(() => {
    if (mapStatus !== 'ready') return;
    updateCamera(activeIndex);
  }, [activeIndex, mapStatus, updateCamera]);

  useEffect(() => {
    console.log(`[MapInit] amapKey=${!!amapKey}, mapContainer=${!!mapContainerRef.current}`);
    if (!amapKey || !mapContainerRef.current) {
      console.log(`[MapInit] Missing amapKey or mapContainer, setting fallback`);
      setMapStatus('fallback');
      return;
    }

    let cancelled = false;
    console.log(`[MapInit] Starting map initialization`);
    setMapStatus('loading');

    loadAMap(amapKey, amapSecurityCode)
      .then((AMap) => {
        console.log(`[MapInit] AMap loaded successfully`);
        if (cancelled || !mapContainerRef.current) {
          console.log(`[MapInit] Cancelled or container missing`);
          return;
        }

        console.log(`[MapInit] Creating map instance`);
        const map = new AMap.Map(mapContainerRef.current, {
          center: stages[0].center,
          zoom: stages[0].zoom,
          zooms: [2, 20],
          pitch: stages[0].pitch,
          lang: lang === 'en' ? 'en' : 'zh_cn',
          viewMode: '3D',
          resizeEnable: true,
          rotateEnable: false,
          pitchEnable: false,
          dragEnable: false,
          zoomEnable: true, // Changed from false to true for testing
          doubleClickZoom: false,
          showIndoorMap: false,
          mapStyle: 'amap://styles/whitesmoke',
        });

        // 创建所有阶段的marker
        const markers = new Map<string, AMapMarker>();
        stages.forEach((stage) => {
          const marker = new AMap.Marker({
            position: stage.center,
            title: pickLocalized(stage.place, lang),
            anchor: 'bottom-center',
          });
          marker.setMap?.(map);
          marker.hide?.(); // 初始隐藏
          markers.set(stage.id, marker);
        });
        markersRef.current = markers;
        mapRef.current = map;
        lastCameraKeyRef.current = null;
        
        console.log(`[MapInit] Map created and ready`);
        setMapStatus('ready');
        setGeocodeDebug('geocode=loading');

        resolveDistrictBoundaries(AMap, map)
          .then((resolvedBoundaries) => {
            if (cancelled) return;

            highlightOverlaysRef.current.forEach((overlays) => {
              overlays.forEach((overlay) => overlay.setMap?.(null));
            });

            const overlays = new Map<string, StageOverlays>();
            stages.forEach((stage) => {
              const stageOverlays = createHighlightOverlay(AMap, stage, resolvedBoundaries[stage.id]);
              if (stageOverlays.length) {
                stageOverlays.forEach((overlay) => {
                  overlay.setMap?.(map);
                  applyOverlayOpacity(overlay, stage.highlightArea?.style, 0);
                  overlay.hide?.();
                });
                overlays.set(stage.id, stageOverlays);
              }
            });

            highlightOverlaysRef.current = overlays;
            lastCameraKeyRef.current = null;
            animateBoundaryTransition(stages[activeIndexRef.current]?.id ?? stages[0].id);
            console.log(`[DistrictSearch] Resolved boundaries: ${Object.keys(resolvedBoundaries).join(',') || 'edited fallback only'}`);
          })
          .catch((error) => {
            console.error(`[DistrictSearch] Error resolving boundaries:`, error);
          });

        resolveGeocodedCenters(AMap, map)
          .then((resolvedCenters) => {
            if (cancelled) return;

            const resolvedStageIds = Object.keys(resolvedCenters);
            console.log(`[Geocode] Resolved centers for stages: ${resolvedStageIds.join(',')}`);
            console.log(`[Geocode] Resolved centers data:`, resolvedCenters);
            
            if (resolvedStageIds.length > 0) {
              setStageCenters((currentCenters) => ({
                ...currentCenters,
                ...resolvedCenters,
              }));
              // 更新所有marker的位置
              markersRef.current.forEach((marker, stageId) => {
                const center = resolvedCenters[stageId];
                if (center) {
                  marker.setPosition?.(center);
                }
              });
              lastCameraKeyRef.current = null; // Force camera update
              setGeocodeDebug(`geocode=${resolvedStageIds.join(',')}`);
              return;
            }

            console.log(`[Geocode] No centers resolved, using static fallback`);
            setGeocodeDebug('geocode=static fallback');
            // Force camera update even with static fallback
            lastCameraKeyRef.current = null;
          })
          .catch((error) => {
            console.error(`[Geocode] Error resolving centers:`, error);
            if (!cancelled) setGeocodeDebug('geocode=static fallback');
          });
      })
      .catch(() => {
        if (!cancelled) setMapStatus('error');
      });

    return () => {
      cancelled = true;
      // 清理所有marker
      markersRef.current.forEach((marker) => {
        marker.setMap?.(null);
      });
      markersRef.current = new Map();
      // 清理高亮区域
      highlightOverlaysRef.current.forEach((overlays) => {
        overlays.forEach((overlay) => overlay.setMap?.(null));
      });
      highlightOverlaysRef.current = new Map();
      if (overlayAnimationRef.current) {
        window.cancelAnimationFrame(overlayAnimationRef.current);
        overlayAnimationRef.current = undefined;
      }
      mapRef.current?.destroy();
      mapRef.current = null;
      lastCameraKeyRef.current = null;
    };
  }, [amapKey, amapSecurityCode, lang, createHighlightOverlay, animateBoundaryTransition]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = undefined;
        updateFromScroll();
      });
    };

    updateFromScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [updateFromScroll]);

  const jumpToStage = (index: number) => {
    const story = storyRef.current;
    if (!story) return;

    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const scrollRange = Math.max(1, story.offsetHeight - window.innerHeight);
    const anchorY = window.innerHeight * 0.52;
    const stepProgress = index / Math.max(1, stages.length - 1);

    console.log(`[jumpToStage] Jumping to stage ${index} (${stages[index].id})`);
    
    setStage(index, stepProgress);
    lastCameraKeyRef.current = null;
    updateCamera(index);

    window.scrollTo({
      top: Math.max(0, storyTop + scrollRange * stepProgress - anchorY),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="tieniu-story-section">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
          {t('故事发生地', 'Story Site')}
        </p>
        <h2 className="font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
          {t('铁牛村的故事', 'The Story of Tieniu Village')}
        </h2>
      </div>

      <div
        ref={storyRef}
        className="tieniu-scroll-story"
        style={storyStyle}
        data-active-stage={activeStage.id}
        data-active-index={activeIndex}
      >
        <div className="tieniu-story-sticky">
          <div className="tieniu-map-container">
            <div className="tieniu-map-stage" data-active-stage={activeStage.id}>
              <div
                ref={mapContainerRef}
                className={cn('tieniu-amap-canvas', !hasLiveMap && 'opacity-0')}
                aria-hidden={!hasLiveMap}
              />

              {!hasLiveMap && (
                <div className="tieniu-fallback-map" aria-hidden="true">
                  <div className="tieniu-earth-ring tieniu-earth-ring-one" />
                  <div className="tieniu-earth-ring tieniu-earth-ring-two" />
                  <div className="tieniu-fallback-path">
                    {stages.map((stage, index) => (
                      <span
                        key={stage.id}
                        className={cn('tieniu-fallback-dot', index <= activeIndex && 'is-active')}
                        style={{
                          left: `${stage.fallbackPosition.x}%`,
                          top: `${stage.fallbackPosition.y}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="tieniu-fallback-focus"
                    style={{
                      left: `${activeStage.fallbackPosition.x}%`,
                      top: `${activeStage.fallbackPosition.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 + progress * 0.35})`,
                    }}
                  />
                </div>
              )}

              <div className="tieniu-map-vignette" />

              {/* 底部信息覆盖层 */}
              <div className="tieniu-info-overlay">
                <div className="tieniu-info-content">
                  <div className="tieniu-info-header">
                    <span className="tieniu-info-scale">
                      {pickLocalized(activeStage.eyebrow, lang)}
                    </span>
                    <span className="tieniu-info-divider">—</span>
                    <span className="tieniu-info-place">
                      {pickLocalized(activeStage.place, lang)}
                    </span>
                  </div>
                  <p className="tieniu-info-title">
                    {pickLocalized(activeStage.title, lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧垂直时间线导航 */}
            <div className="tieniu-timeline-nav" aria-label={t('地图叙事阶段', 'Map story stages')}>
              <div className="tieniu-timeline-track">
                <div 
                  className="tieniu-timeline-progress" 
                  style={{ 
                    height: `${(activeIndex / (stages.length - 1)) * 100}%`,
                    '--progress-width': `${(activeIndex / (stages.length - 1)) * 100}%`
                  } as React.CSSProperties}
                />
              </div>
              <div className="tieniu-timeline-items">
                {stages.map((stage, index) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => jumpToStage(index)}
                    className={cn('tieniu-timeline-item', index === activeIndex && 'is-active')}
                    aria-current={index === activeIndex ? 'step' : undefined}
                  >
                    <div className="tieniu-timeline-dot" />
                    <div className="tieniu-timeline-label">
                      <span className="tieniu-timeline-index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="tieniu-timeline-name">
                        {pickLocalized(stage.place, lang)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showMapDebug && (
          <div className="tieniu-map-debug" aria-hidden="true">
            <div>{mapStatus} | active={activeStage.id} | {geocodeDebug} | {cameraDebug || 'camera=pending'}</div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  console.log('[Test] Testing zoom to tieniu village');
                  const map = mapRef.current;
                  if (map) {
                    const tieniuStage = storyStages[3]; // tieniu is index 3
                    console.log(`[Test] Setting zoom to ${tieniuStage.zoom} at center ${tieniuStage.center.join(',')}`);
                    map.setZoomAndCenter(tieniuStage.zoom, tieniuStage.center, true, 1000);
                    map.setPitch?.(tieniuStage.pitch, true, 1000);
                  }
                }}
                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
              >
                Test Zoom to Tieniu
              </button>
              <button
                onClick={() => {
                  console.log('[Test] Current map state:');
                  const map = mapRef.current;
                  if (map) {
                    const center = map.getCenter?.();
                    const zoom = map.getZoom?.();
                    console.log(`[Test] Center: ${center?.lng},${center?.lat}, Zoom: ${zoom}`);
                  }
                }}
                className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
              >
                Log Map State
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
