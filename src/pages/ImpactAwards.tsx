import OptimizedImage from "@/components/OptimizedImage";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import EditorialHero from "@/components/ui/EditorialHero";
import { ImpactSectionNav } from "@/components/impact/ImpactSectionNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/brand";
import { localImpactRepository } from "@/services/impact/publicRepository";
import "@/styles/impact-editorial.css";

const keepArchiveSelection = () => {};

export default function ImpactAwards() {
  const { lang, t } = useLanguage();
  const records = useQuery({
    queryKey: ["impact", "public"],
    queryFn: () => localImpactRepository.getPublicSnapshot(),
  });
  return (
    <div
      className="about-v2-page programs-editorial impact-editorial impact-awards-page pt-20"
      lang={lang}
    >
      <EditorialHero
        variant="split"
        kicker={t(
          "研究、获奖与公共表达",
          "Research, awards, and public expression",
        )}
        title={t("获奖与成果", "Awards & Achievements")}
        lead={t(
          "这里记录竞赛获奖、研究发表与论坛交流，也保留每一项成果的照片、海报和原始资料。",
          "This archive brings together competition awards, research publications, and forum participation, with photographs, posters, and source material for each outcome.",
        )}
        image={{
          src: "/archive/elements/photos/academic-forum/s16-ctb-forum-team-booth.jpg",
          alt: t(
            "CTB 展位前的项目团队",
            "The project team at their CTB exhibition booth",
          ),
          width: 835,
          height: 557,
          caption: t(
            "CTB · 项目团队与展位",
            "CTB · Project team and exhibition booth",
          ),
        }}
      />
      <ImpactSectionNav
        activeId="public-records"
        onSelect={keepArchiveSelection}
        archive
      />
      {records.isPending && (
        <div className="about-v2-shell impact-data-status" role="status">
          {t("正在读取成果记录…", "Loading achievements…")}
        </div>
      )}
      {records.isError && (
        <div className="about-v2-shell impact-data-status" role="alert">
          <h2>
            {t(
              "暂时无法读取成果记录",
              "Achievements are temporarily unavailable",
            )}
          </h2>
          <button
            className="impact-text-link"
            type="button"
            onClick={() => void records.refetch()}
          >
            {t("重新读取", "Try again")}
          </button>
        </div>
      )}
      {records.data?.evidence.map((item) => (
        <section
          key={item.id}
          id={item.id}
          className="about-v2-section impact-section impact-archive-section"
          aria-labelledby={`${item.id}-title`}
        >
          <div className="about-v2-shell impact-archive-row">
            <div className="impact-archive-photos">
              <OptimizedImage
                src={item.image}
                alt={pickLocalized(item.imageAlt, lang)}
                width={1280}
                height={853}
                loading="lazy"
              />
              {item.secondaryImage && item.secondaryImageAlt && (
                <OptimizedImage
                  src={item.secondaryImage}
                  alt={pickLocalized(item.secondaryImageAlt, lang)}
                  width={529}
                  height={707}
                  loading="lazy"
                />
              )}
            </div>
            <div className="impact-archive-copy">
              <p className="impact-meta">
                {item.date} · {pickLocalized(item.categoryLabel, lang)}
              </p>
              <h2 id={`${item.id}-title`}>{pickLocalized(item.title, lang)}</h2>
              <p>{pickLocalized(item.summary, lang)}</p>
              <ul aria-label={t("成果事实", "Documented facts")}>
                {item.facts.map((fact) => (
                  <li key={fact.zh}>{pickLocalized(fact, lang)}</li>
                ))}
              </ul>
              <p className="impact-meta">
                {t("资料来源：", "Source: ")}
                {item.sourceHref ? (
                  <a className="underline underline-offset-4" href={item.sourceHref} target="_blank" rel="noreferrer">
                    {pickLocalized(item.sourceLabel, lang)}
                  </a>
                ) : pickLocalized(item.sourceLabel, lang)}
              </p>
            </div>
          </div>
        </section>
      ))}
      {records.data && records.data.evidence.length === 0 && (
        <p className="about-v2-shell impact-data-status">
          {t("尚无可公开的成果记录", "No public achievements yet")}
        </p>
      )}
      <div className="about-v2-shell impact-recording-principles">
        <Link to="/impact#public-records" className="impact-text-link">
          {t("返回影响与记录", "Back to Impact & Records")}
        </Link>
      </div>
    </div>
  );
}
