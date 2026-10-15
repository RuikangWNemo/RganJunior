/** Shared with About: preserve the existing chapter markup and editorial styles. */
export default function EditorialChapterHeader({
  index,
  eyebrow,
  title,
  intro,
  id,
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <header className="about-v2-section__header">
      <div className="about-v2-section__meta">
        <span>{index}</span>
        <p>{eyebrow}</p>
      </div>
      <h2 id={id}>{title}</h2>
      {intro && <p>{intro}</p>}
    </header>
  );
}
