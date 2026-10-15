import EditorialSectionNav from "@/components/ui/EditorialSectionNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { impactChapters, type ImpactChapterId } from "@/lib/impactNavigation";

export function ImpactSectionNav({
  activeId,
  onSelect,
  archive = false,
}: {
  activeId: ImpactChapterId;
  onSelect: (id: ImpactChapterId) => void;
  archive?: boolean;
}) {
  const { lang, t } = useLanguage();
  return (
    <EditorialSectionNav
      activeId={activeId}
      ariaLabel={t("影响页面章节", "Impact page sections")}
      indicatorLayoutId={
        archive ? "impact-archive-section-active" : "impact-section-active"
      }
      items={impactChapters.map((chapter) => ({
        id: chapter.id,
        href:
          archive && chapter.id === "public-records"
            ? "/impact/awards"
            : `/impact#${chapter.id}`,
        label: lang === "zh" ? chapter.zh : chapter.en,
      }))}
      onSelect={onSelect}
    />
  );
}
