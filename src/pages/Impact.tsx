import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";
import EditorialHero from "@/components/ui/EditorialHero";
import EditorialChapterHeader from "@/components/ui/EditorialChapterHeader";
import { ImpactSectionNav } from "@/components/impact/ImpactSectionNav";
import WebsiteVisitTotals from "@/components/impact/WebsiteVisitTotals";
import { ParticipantEntry } from "@/components/participants/ParticipantRoster";
import {
  campParticipation,
  featuredGrowthStory,
  moreGrowthStories,
  familyVoices,
  familyVoicesSource,
  actionPossibilities,
} from "@/content/impactRecords";
import { useLanguage } from "@/contexts/LanguageContext";
import { useImpactChapter } from "@/hooks/useImpactChapter";
import { pickLocalized } from "@/lib/brand";
import { localImpactRepository } from "@/services/impact/publicRepository";
import "@/styles/impact-editorial.css";

export default function Impact() {
  const { lang, t } = useLanguage();
  const { activeId, onSelect } = useImpactChapter();
  const records = useQuery({
    queryKey: ["impact", "public"],
    queryFn: () => localImpactRepository.getPublicSnapshot(),
  });
  const stories = [
    {
      slug: "technology-ecology-stars",
      author: featuredGrowthStory.author,
      title: featuredGrowthStory.title,
      photo: featuredGrowthStory.photos[1],
      publishedAt: featuredGrowthStory.publishedAt,
      summary: {
        zh: "从电脑和代码出发，在早餐、采摘与共同生活中，重新理解人与土地、食物和伙伴的关系。",
        en: "Through making breakfast, harvesting, and sharing daily life, Tianshi connects his interest in technology with land, food, and others.",
      },
    },
    ...moreGrowthStories,
  ];
  const sourceError = records.isError ? (
    <div className="impact-data-status" role="alert">
      <p>
        {t(
          "这部分记录暂时无法读取，请稍后重试。",
          "These records could not be loaded. Please try again.",
        )}
      </p>
      <button
        type="button"
        className="impact-text-link"
        onClick={() => void records.refetch()}
      >
        {t("重新读取", "Try again")}
      </button>
    </div>
  ) : null;

  return (
    <div
      className="about-v2-page programs-editorial impact-editorial pt-20"
      lang={lang}
    >
      <EditorialHero
        kicker={t("看见真实成长如何发生", "See how real growth happens")}
        title={t("影响与记录", "Impact & Records")}
        lead={
          <>
            <strong>
              {t(
                "一个孩子的成长，需要一个村庄的托举。",
                "A child needs a village to help them grow.",
              )}
            </strong>
            <p>
              {t(
                "我们把影响理解为关系的变化：少年与家庭、伙伴、土地和公共生活开始形成新的连接。",
                "We understand impact as a change in relationships: young people begin forming new connections with family, peers, land, and public life.",
              )}
            </p>
          </>
        }
        image={{
          src: "/images/about/belief-nature-forest.webp",
          alt: t(
            "青少年与伙伴在森林中观察树木",
            "Young people and their companions observing trees in a forest",
          ),
          width: 1920,
          height: 1280,
          caption: t(
            "在森林中，重新打开观察与感受",
            "Rediscovering observation and wonder in the forest",
          ),
        }}
      />
      <ImpactSectionNav activeId={activeId} onSelect={onSelect} />

      <section
        id="project-data"
        data-impact-chapter
        className="about-v2-section impact-section"
        aria-labelledby="project-data-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.1"
            eyebrow={t("真实发生的参与", "Participation in real life")}
            title={t("项目数据", "Program Data")}
            id="project-data-title"
            intro={t(
              "阿柑少年的影响，不只在活动照片里，也在孩子和家庭之后愿意继续做什么里。我们从具体项目的真实参与开始记录。",
              "R-Gan Junior’s impact lives not only in activity photos, but in what young people and families choose to keep doing afterward. We begin with participation in specific projects.",
            )}
          />
          <div className="impact-section-content">
            <div className="impact-record-heading">
              <h3>{pickLocalized(campParticipation.title, lang)}</h3>
              <p>{pickLocalized(campParticipation.context, lang)}</p>
            </div>
            <dl className="impact-number-row">
              {campParticipation.metrics.map((metric) => (
                <div key={metric.label.zh}>
                  <dt>{pickLocalized(metric.label, lang)}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
            <div className="impact-source">
              <p>{pickLocalized(campParticipation.scope, lang)}</p>
              <Link
                to={campParticipation.sourceHref}
                className="impact-text-link"
              >
                {pickLocalized(campParticipation.sourceTitle, lang)}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {records.isPending && (
              <p role="status" className="impact-meta">
                {t("正在读取历史记录…", "Loading earlier records…")}
              </p>
            )}
            {sourceError}
            {records.data?.metrics.map((metric) => (
              <article key={metric.id} className="impact-history-row">
                <p className="impact-meta">
                  {t("历史活动记录", "Earlier activity record")} ·{" "}
                  {metric.observedAt}
                </p>
                <p>
                  <strong>{metric.value}</strong>{" "}
                  {pickLocalized(metric.label, lang)}
                </p>
                <div>
                  <p>{pickLocalized(metric.detail, lang)}</p>
                  <p className="impact-meta">
                    {pickLocalized(metric.sourceLabel, lang)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="about-v2-shell">
        <ParticipantEntry source="impact" />
      </div>

      <section
        id="growth-stories"
        data-impact-chapter
        className="about-v2-section impact-section impact-section--warm"
        aria-labelledby="growth-stories-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.2"
            eyebrow={t("少年自己的讲述", "In their own words")}
            title={t("成长故事", "Growth Stories")}
            id="growth-stories-title"
            intro={t(
              "从第一次走近，到愿意继续参与，看见一个具体的人。以下精选自少年已有的文章，保留每一段经历的情境与来路。",
              "From a first encounter to choosing to stay involved, see the person behind the experience. These selections from young people’s writing preserve the context of each story.",
            )}
          />
          <div className="impact-section-content impact-story-grid">
            {stories.map((story) => (
              <article key={story.slug} className="impact-story-card">
                <figure>
                  <OptimizedImage
                    src={story.photo.src}
                    alt={pickLocalized(story.photo.alt, lang)}
                    width={story.photo.width}
                    height={story.photo.height}
                    loading="lazy"
                    sizes="(max-width: 767px) calc(100vw - 3rem), 33vw"
                  />
                  <figcaption>
                    {pickLocalized(story.photo.caption, lang)}
                  </figcaption>
                </figure>
                <div className="impact-story-copy">
                  <p className="impact-meta">
                    {pickLocalized(story.author, lang)} ·{" "}
                    <time dateTime={story.publishedAt}>
                      {story.publishedAt}
                    </time>
                  </p>
                  <h3>
                    <Link to={`/community-stories/${story.slug}`}>
                      {pickLocalized(story.title, lang)}
                    </Link>
                  </h3>
                  <p>{pickLocalized(story.summary, lang)}</p>
                  <Link
                    className="impact-text-link"
                    to={`/community-stories/${story.slug}`}
                  >
                    {t("阅读完整故事", "Read the full story")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <figure className="impact-voice">
            <blockquote>
              “{pickLocalized(featuredGrowthStory.quote, lang)}”
            </blockquote>
            <figcaption>
              {pickLocalized(featuredGrowthStory.author, lang)} ·{" "}
              {t("摘自本人文章", "From his own writing")}
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="family-observation"
        data-impact-chapter
        className="about-v2-section impact-section"
        aria-labelledby="family-observation-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.3"
            eyebrow={t("家庭的陪伴与支持", "Care and support from families")}
            title={t("家庭观察", "Family Observations")}
            id="family-observation-title"
            intro={t(
              "孩子的变化，也在家人的日常观察里。以下摘自营地发起时的家长寄语，记录家庭长期陪伴的视角。",
              "Families also notice growth in everyday life. These excerpts from the camp invitation share parents’ perspectives on supporting their children over time.",
            )}
          />
          <div className="impact-section-content impact-family-grid">
            {familyVoices.map((voice) => (
              <figure key={voice.id} className="impact-family-voice">
                <figcaption>
                  {pickLocalized(voice.attribution, lang)}
                </figcaption>
                <blockquote>“{pickLocalized(voice.quote, lang)}”</blockquote>
              </figure>
            ))}
          </div>
          <div className="impact-source">
            <p>
              {pickLocalized(familyVoicesSource.title, lang)} ·{" "}
              <time dateTime={familyVoicesSource.publishedAt}>
                {familyVoicesSource.publishedAt}
              </time>
            </p>
            <Link className="impact-text-link" to={familyVoicesSource.href}>
              {t("阅读家长寄语", "Read the parents’ words")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="continuing-actions"
        data-impact-chapter
        className="about-v2-section impact-section impact-section--sage"
        aria-labelledby="continuing-actions-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.4"
            eyebrow={t("让一次相遇继续发生", "Let one encounter continue")}
            title={t("持续行动", "Continued Action")}
            id="continuing-actions-title"
            intro={t(
              "营地结束之后，一顿为家人准备的早餐，一次自然观察，或与伙伴分享的生活实验，都可以成为下一次行动的起点。",
              "After camp, a breakfast made for family, time spent observing nature, or a daily-life experiment shared with peers can become a starting point for another action.",
            )}
          />
          <div className="impact-section-content">
            <h3 className="impact-subtitle">
              {t("三个月行动计划", "A three-month action plan")}
            </h3>
            <ol className="impact-step-grid">
              {records.data?.rhythm.map((step, index) => (
                <li key={step.id}>
                  <span className="impact-meta">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{pickLocalized(step.title, lang)}</h3>
                  <p>{pickLocalized(step.description, lang)}</p>
                </li>
              ))}
            </ol>
            {sourceError}
            <p className="impact-action-ideas">
              {t("可以尝试：", "Ideas to try: ")}
              {actionPossibilities
                .map((idea) => pickLocalized(idea, lang))
                .join(" / ")}
            </p>
            <p className="impact-meta">
              {t(
                "这里呈现行动的方式与邀请；后续记录会保留发生时间、具体过程和参与者自己的回顾。",
                "This is an invitation and a way to begin. Future records will include dates, what took place, and participants’ own reflections.",
              )}
            </p>
          </div>
        </div>
      </section>

      <section
        id="website-visits"
        data-impact-chapter
        className="about-v2-section impact-section"
        aria-labelledby="website-visits-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.5"
            eyebrow={t("网站的连接与传播", "Connections through the website")}
            title={t("网站访问", "Website Visits")}
            id="website-visits-title"
          />
          <div className="impact-section-content">
            <WebsiteVisitTotals />
          </div>
        </div>
      </section>

      <section
        id="public-records"
        data-impact-chapter
        className="about-v2-section impact-section impact-section--warm"
        aria-labelledby="public-records-title"
      >
        <div className="about-v2-shell">
          <EditorialChapterHeader
            index="6.6"
            eyebrow={t(
              "研究、获奖与公共表达",
              "Research, awards, and public expression",
            )}
            title={t("获奖与成果", "Awards & Achievements")}
            id="public-records-title"
            intro={t(
              "把现场的观察，带向更广阔的公共讨论。奖项、研究发表与论坛交流各自保留背景和来源。",
              "Bring observations from the field into a wider public conversation. Awards, publications, and forum participation each retain their context and sources.",
            )}
          />
          <div className="impact-section-content impact-achievement-list">
            {records.data?.evidence.map((item) => (
              <article key={item.id}>
                <p className="impact-meta">
                  {item.date} · {pickLocalized(item.categoryLabel, lang)}
                </p>
                <div>
                  <h3>
                    <Link to={`/impact/awards#${item.id}`}>
                      {pickLocalized(item.title, lang)}
                    </Link>
                  </h3>
                  <p>{pickLocalized(item.summary, lang)}</p>
                  <p className="impact-meta">
                    {pickLocalized(item.sourceLabel, lang)}
                  </p>
                </div>
              </article>
            ))}
            {sourceError}
            {records.data && records.data.evidence.length === 0 && (
              <p>
                {t(
                  "成果会在资料整理完成后加入。",
                  "Achievements will be added as source material is prepared.",
                )}
              </p>
            )}
          </div>
          <Link
            to="/impact/awards"
            className="impact-text-link impact-section-link"
          >
            {t("查看完整获奖与成果", "View all awards and achievements")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className="impact-recording-principles"
        aria-labelledby="recording-principles-title"
      >
        <div className="about-v2-shell">
          <h2 id="recording-principles-title">
            {t("我们如何记录", "How we record")}
          </h2>
          <p>
            {t(
              "真实的影响，在一次次生活、连接、行动和记录中慢慢长出来。",
              "Real impact grows slowly through repeated moments of life, connection, action, and documentation.",
            )}
          </p>
          <p className="impact-meta">
            {t(
              "所有照片、原话和成长故事，都会在获得本人和家庭许可后使用。",
              "All photos, quotations, and growth stories are used only with permission from the people involved and their families.",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
