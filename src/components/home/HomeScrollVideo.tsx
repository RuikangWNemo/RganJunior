import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const VIDEO_SRC = '/videos/home-scroll-video.mp4';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HomeScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const readyRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video || typeof window === 'undefined') {
      return;
    }

    const reducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };
    let scrollFrame = 0;
    let videoFrame = 0;

    const writeProgressVars = (progress: number) => {
      const introReveal = clamp(progress / 0.18, 0, 1);
      const outroCover = clamp((progress - 0.82) / 0.18, 0, 1);
      const veilOpacity = Math.max(1 - introReveal, outroCover, readyRef.current ? 0 : 1);

      section.style.setProperty('--home-video-progress', progress.toFixed(3));
      section.style.setProperty('--home-video-veil-opacity', veilOpacity.toFixed(3));
    };

    const updateFromScroll = () => {
      const viewportHeight = window.innerHeight || 1;
      const rect = section.getBoundingClientRect();
      const range = Math.max(section.offsetHeight - viewportHeight, viewportHeight);
      const progress = clamp(-rect.top / range, 0, 1);

      writeProgressVars(progress);

      if (durationRef.current > 0) {
        targetTimeRef.current = durationRef.current * progress;
      }
    };

    const scheduleScrollUpdate = () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(updateFromScroll);
    };

    const syncVideoToScroll = () => {
      if (readyRef.current && durationRef.current > 0) {
        const targetTime = reducedMotion.matches
          ? Math.min(durationRef.current * 0.08, Math.max(durationRef.current - 0.08, 0))
          : targetTimeRef.current;
        const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : targetTime;
        const delta = targetTime - currentTime;
        const nextTime = Math.abs(delta) > 0.45 ? targetTime : currentTime + delta * 0.22;

        if (Math.abs(delta) > 0.012) {
          try {
            video.currentTime = clamp(nextTime, 0, Math.max(durationRef.current - 0.04, 0));
          } catch {
            // Some browsers briefly reject seeks while buffering; the next frame will retry.
          }
        }
      }

      videoFrame = window.requestAnimationFrame(syncVideoToScroll);
    };

    const handleMetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;

      durationRef.current = duration;
      readyRef.current = duration > 0;
      setIsReady(duration > 0);
      video.pause();
      updateFromScroll();
    };

    if (video.readyState >= 1) {
      handleMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleMetadata);
    }

    updateFromScroll();
    videoFrame = window.requestAnimationFrame(syncVideoToScroll);
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate);

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(videoFrame);
      window.removeEventListener('scroll', scheduleScrollUpdate);
      window.removeEventListener('resize', scheduleScrollUpdate);
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="home-scroll-video"
      data-ready={isReady ? 'true' : 'false'}
      aria-label={t('阿甘少年滚动影像', "R'gan Junior scroll film")}
    >
      <div className="home-scroll-video__sticky">
        <video
          ref={videoRef}
          className="home-scroll-video__media"
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="home-scroll-video__texture" aria-hidden="true" />
        <div className="home-scroll-video__edge-mask" aria-hidden="true" />
        <div className="home-scroll-video__veil" aria-hidden="true" />
      </div>
    </section>
  );
}
