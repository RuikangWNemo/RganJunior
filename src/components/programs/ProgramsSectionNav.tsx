import EditorialSectionNav from '@/components/ui/EditorialSectionNav';
import { actionPrograms, type ActionProgramId } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

interface ProgramsSectionNavProps {
  activeId: ActionProgramId;
  onSelect: (programId: ActionProgramId) => void;
}

export default function ProgramsSectionNav({ activeId, onSelect }: ProgramsSectionNavProps) {
  const { lang, t } = useLanguage();

  return (
    <EditorialSectionNav
      activeId={activeId}
      ariaLabel={t('项目页面章节', 'Program page sections')}
      indicatorLayoutId="programs-section-active"
      items={actionPrograms.map((program) => ({
        id: program.id,
        href: program.path,
        label: pickLocalized(program.navTitle, lang),
      }))}
      onSelect={onSelect}
    />
  );
}
