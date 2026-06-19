import { useEffect, useState } from 'react';

export function useCursorEffectsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches && window.innerWidth > 768);
    };

    sync();
    window.addEventListener('resize', sync);
    finePointer.addEventListener('change', sync);
    reducedMotion.addEventListener('change', sync);

    return () => {
      window.removeEventListener('resize', sync);
      finePointer.removeEventListener('change', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  return enabled;
}
