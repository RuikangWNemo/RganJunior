const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const navTrack = document.querySelector('.section-nav__track');
const navLinks = [...document.querySelectorAll('[data-section-link]')];
const sections = navLinks
  .map((link) => document.getElementById(link.dataset.sectionLink))
  .filter(Boolean);

function selectSection(id) {
  navLinks.forEach((link) => {
    const isActive = link.dataset.sectionLink === id;
    link.dataset.active = String(isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'location');
      link.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.getElementById(link.dataset.sectionLink);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    window.history.replaceState(null, '', `#${target.id}`);
    selectSection(target.id);
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (visible) selectSection(visible.target.id);
    },
    { rootMargin: '-24% 0px -64% 0px' },
  );

  sections.forEach((section) => observer.observe(section));
}

if (navTrack) {
  navTrack.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    if (navTrack.scrollWidth <= navTrack.clientWidth) return;

    navTrack.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });
}

selectSection(window.location.hash.slice(1) || 'typography');
