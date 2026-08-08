import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProgramInvitation from '@/components/programs/ProgramInvitation';
import ProgramOverviewEntry from '@/components/programs/ProgramOverviewEntry';
import ProgramsSectionNav from '@/components/programs/ProgramsSectionNav';
import { actionPrograms, type ActionProgramId } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  announceProgramSection,
  isProgramSectionId,
  PROGRAM_SECTION_SELECT_EVENT,
  readProgramSectionHash,
} from '@/lib/programNavigation';

const PROGRAM_SELECTION_LOCK_MS = 760;

export default function Actions() {
  const { t } = useLanguage();
  const location = useLocation();
  const selectionLockRef = useRef(0);
  const [activeProgram, setActiveProgram] = useState<ActionProgramId>(
    () => readProgramSectionHash(location.hash) ?? 'life-experience-camp',
  );

  const scrollToProgram = useCallback((programId: ActionProgramId) => {
    selectionLockRef.current = Date.now() + PROGRAM_SELECTION_LOCK_MS;
    setActiveProgram(programId);
    const target = window.document.getElementById(programId);
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, []);

  useEffect(() => {
    const requestedId = readProgramSectionHash(location.hash);
    if (requestedId) scrollToProgram(requestedId);
  }, [location.hash, scrollToProgram]);

  useEffect(() => {
    const handleProgramRequest = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isProgramSectionId(event.detail)) return;
      scrollToProgram(event.detail);
    };

    window.addEventListener(PROGRAM_SECTION_SELECT_EVENT, handleProgramRequest);
    return () => window.removeEventListener(PROGRAM_SECTION_SELECT_EVENT, handleProgramRequest);
  }, [scrollToProgram]);

  useEffect(() => {
    announceProgramSection(activeProgram);
  }, [activeProgram]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-program-section]'),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < selectionLockRef.current) return;
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const programId = visibleEntry?.target.getAttribute('data-program-section');
        if (isProgramSectionId(programId)) setActiveProgram(programId);
      },
      { rootMargin: '-24% 0px -64% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="programs-editorial programs-overview-page overflow-x-clip pt-20">
      <ProgramInvitation />
      <ProgramsSectionNav activeId={activeProgram} onSelect={scrollToProgram} />

      <main>
        {actionPrograms.map((program, index) => (
          <ProgramOverviewEntry key={program.id} program={program} index={index} />
        ))}

        <section aria-labelledby="programs-contact-title" className="programs-contact">
          <div className="programs-editorial-shell programs-contact__layout">
            <div>
              <p>{t('还不确定从哪里开始？', 'Not sure where to begin?')}</p>
              <h2 id="programs-contact-title" className="text-balance">
                {t('从一个具体项目开始了解', 'Begin with a specific program')}
              </h2>
              <p className="text-pretty">
                {t(
                  '第一次接触可以先看看生活体验营；如果你已经准备好进入更长的共同生活，也可以直接了解生活共创营。',
                  'For a first encounter, begin with the Life Discovery Camp. If you are ready for a longer period of shared life, explore the Life Co-creation Camp.',
                )}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
