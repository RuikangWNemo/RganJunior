import { useEffect, useRef } from 'react';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HomeHeroFlow() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined' || !window.matchMedia) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let frameId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = targetX;
    let currentY = targetY;

    const writeVars = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      root.style.setProperty('--hero-flow-drift-x', `${currentX.toFixed(2)}px`);
      root.style.setProperty('--hero-flow-drift-y', `${currentY.toFixed(2)}px`);

      frameId = window.requestAnimationFrame(writeVars);
    };

    const updateScroll = () => {
      const rect = root.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = clamp(-rect.top / Math.max(rect.height - viewportHeight * 0.2, viewportHeight), 0, 1);
      root.style.setProperty('--hero-flow-scroll', progress.toFixed(3));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;

      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const normalizedX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      const normalizedY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);

      targetX = normalizedX * 10;
      targetY = normalizedY * 7;
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    updateScroll();
    frameId = window.requestAnimationFrame(writeVars);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="home-hero-flow" aria-hidden="true">
      <svg
        className="home-hero-flow__svg"
        viewBox="0 0 1440 760"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="home-hero-thread-green" x1="90" y1="500" x2="1320" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="hsl(36 78% 58%)" stopOpacity="0.16" />
            <stop offset="0.42" stopColor="hsl(160 100% 20%)" stopOpacity="0.32" />
            <stop offset="1" stopColor="hsl(188 46% 62%)" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="home-hero-thread-warm" x1="40" y1="610" x2="1180" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="hsl(160 100% 20%)" stopOpacity="0.08" />
            <stop offset="0.48" stopColor="hsl(37 76% 60%)" stopOpacity="0.28" />
            <stop offset="1" stopColor="hsl(160 100% 20%)" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="home-hero-thread-cool" x1="190" y1="270" x2="1430" y2="430" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="hsl(188 42% 64%)" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="hsl(160 100% 20%)" stopOpacity="0.2" />
            <stop offset="1" stopColor="hsl(36 72% 60%)" stopOpacity="0.12" />
          </linearGradient>
          <filter id="home-hero-thread-glow" x="-8%" y="-28%" width="116%" height="156%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="home-hero-flow__field home-hero-flow__field--quiet">
          <path
            className="home-hero-flow__line home-hero-flow__line--echo"
            d="M 20 555 C 170 468 260 258 410 278 C 555 298 648 470 805 400 C 986 320 1046 164 1248 206 C 1322 222 1384 260 1450 288"
          />
          <path
            className="home-hero-flow__line home-hero-flow__line--echo home-hero-flow__line--echo-warm"
            d="M -20 642 C 190 578 298 430 452 456 C 616 484 652 602 834 542 C 1004 486 1082 350 1246 354 C 1326 356 1394 386 1460 420"
          />
        </g>

        <g className="home-hero-flow__field home-hero-flow__field--main" filter="url(#home-hero-thread-glow)">
          <path
            className="home-hero-flow__line home-hero-flow__line--base"
            stroke="url(#home-hero-thread-green)"
            d="M 20 555 C 170 468 260 258 410 278 C 555 298 648 470 805 400 C 986 320 1046 164 1248 206 C 1322 222 1384 260 1450 288"
          />
          <path
            className="home-hero-flow__line home-hero-flow__line--base home-hero-flow__line--thin"
            stroke="url(#home-hero-thread-warm)"
            d="M -20 642 C 190 578 298 430 452 456 C 616 484 652 602 834 542 C 1004 486 1082 350 1246 354 C 1326 356 1394 386 1460 420"
          />
          <path
            className="home-hero-flow__line home-hero-flow__line--base home-hero-flow__line--cool"
            stroke="url(#home-hero-thread-cool)"
            d="M 116 352 C 250 282 368 188 526 202 C 708 218 772 342 946 326 C 1116 310 1190 232 1340 250 C 1390 256 1420 274 1466 304"
          />

          <path
            className="home-hero-flow__line home-hero-flow__line--pulse home-hero-flow__line--pulse-one"
            stroke="url(#home-hero-thread-green)"
            d="M 20 555 C 170 468 260 258 410 278 C 555 298 648 470 805 400 C 986 320 1046 164 1248 206 C 1322 222 1384 260 1450 288"
          />
          <path
            className="home-hero-flow__line home-hero-flow__line--pulse home-hero-flow__line--pulse-two"
            stroke="url(#home-hero-thread-warm)"
            d="M -20 642 C 190 578 298 430 452 456 C 616 484 652 602 834 542 C 1004 486 1082 350 1246 354 C 1326 356 1394 386 1460 420"
          />
          <path
            className="home-hero-flow__line home-hero-flow__line--pulse home-hero-flow__line--pulse-three"
            stroke="url(#home-hero-thread-cool)"
            d="M 116 352 C 250 282 368 188 526 202 C 708 218 772 342 946 326 C 1116 310 1190 232 1340 250 C 1390 256 1420 274 1466 304"
          />
        </g>
      </svg>

      <div className="home-hero-flow__node home-hero-flow__node--origin" />
      <div className="home-hero-flow__node home-hero-flow__node--field" />
      <div className="home-hero-flow__node home-hero-flow__node--community" />
      <div className="home-hero-flow__paper" />
    </div>
  );
}
