import { useState, useEffect, useRef } from 'react';
import mascotImg from '@/assets/mascot-full.png';

export default function MascotCompanion() {
  const [visible, setVisible] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [tilt, setTilt] = useState(0);
  const lastScrollY = useRef(0);
  const tiltTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y > 300);

      // Tilt based on scroll direction
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) > 5) {
        setTilt(delta > 0 ? 8 : -8);
        clearTimeout(tiltTimeout.current);
        tiltTimeout.current = setTimeout(() => setTilt(0), 400);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(tiltTimeout.current);
    };
  }, []);

  const handleClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 600);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 cursor-pointer select-none transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      onClick={handleClick}
      title="🍊"
    >
      <img
        src={mascotImg}
        alt="阿柑 mascot"
        className={`w-16 h-16 md:w-20 md:h-20 drop-shadow-lg transition-transform duration-400 ${
          bounce ? 'animate-mascot-bounce' : ''
        }`}
        style={{
          transform: `rotate(${tilt}deg)`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        draggable={false}
      />
    </div>
  );
}
