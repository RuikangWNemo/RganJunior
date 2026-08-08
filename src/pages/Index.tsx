import { useRef } from 'react';
import HomeBeliefs from '@/components/home/HomeBeliefs';
import HomeFieldScene from '@/components/home/HomeFieldScene';
import HomeFounderStory from '@/components/home/HomeFounderStory';
import HeroCopy from '@/components/home/HeroCopy';
import HomeHeroFlow from '@/components/home/HomeHeroFlow';
import HeroMascotStage from '@/components/home/HeroMascotStage';
import HomePrograms from '@/components/home/HomePrograms';
import SeedCommunity from '@/components/home/SeedCommunity';
import BlobCursor from '@/components/ui/BlobCursor';

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <div className="home-editorial">
      <section ref={heroRef} className="home-hero-section relative isolate min-h-svh overflow-hidden bg-background">
        <HomeHeroFlow />
        <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block" aria-hidden="true">
          <BlobCursor />
        </div>
        <div className="home-hero-grid container relative z-10 mx-auto grid min-h-svh items-center gap-7 px-4 pb-10 pt-20 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-24 lg:grid-cols-[minmax(22.2rem,0.5fr)_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-24">
          <HeroMascotStage sectionRef={heroRef} />
          <HeroCopy onJoin={() => { window.location.href = '/programs/inquiry?program=life-experience-camp'; }} />
        </div>
      </section>

      <HomeFieldScene />
      <HomeBeliefs />
      <HomePrograms />
      <HomeFounderStory />
      <SeedCommunity />
    </div>
  );
}
