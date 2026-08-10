import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

export interface EditorialSectionNavItem<Id extends string> {
  id: Id;
  href: string;
  label: string;
}

interface EditorialSectionNavProps<Id extends string> {
  activeId: Id;
  ariaLabel: string;
  indicatorLayoutId: string;
  items: readonly EditorialSectionNavItem<Id>[];
  onSelect: (id: Id) => void;
}

export default function EditorialSectionNav<Id extends string>({
  activeId,
  ariaLabel,
  indicatorLayoutId,
  items,
  onSelect,
}: EditorialSectionNavProps<Id>) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeLink = trackRef.current?.querySelector<HTMLElement>(
      `[data-editorial-section-id="${activeId}"]`,
    );
    if (activeLink && typeof activeLink.scrollIntoView === 'function') {
      activeLink.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeId, reducedMotion]);

  return (
    <nav
      className="editorial-section-nav sticky top-16 z-30 md:top-20"
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="editorial-section-nav__track">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Link
              key={item.id}
              to={item.href}
              data-editorial-section-id={item.id}
              data-active={isActive}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => onSelect(item.id)}
              className="editorial-section-nav__link"
            >
              <span>{item.label}</span>
              {isActive ? (
                <motion.span
                  layoutId={indicatorLayoutId}
                  className="editorial-section-nav__active"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 360, damping: 32, mass: 0.72 }
                  }
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
