import { Link } from 'react-router-dom';

type LivingLabCardProps = {
  number: string;
  role: string;
  name: string;
  subtitle: string;
  location: string;
  body: string;
  keywords: readonly string[];
  keywordsLabel: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  variant?: 'featured' | 'standard';
  storyLink?: {
    to: string;
    label: string;
  };
};

export default function LivingLabCard({
  number,
  role,
  name,
  subtitle,
  location,
  body,
  keywords,
  keywordsLabel,
  image,
  variant = 'standard',
  storyLink,
}: LivingLabCardProps) {
  return (
    <article
      className={`about-v2-lab-card ${variant === 'featured' ? 'about-v2-lab-feature' : 'about-v2-lab-card--standard'}`}
    >
      <figure className="about-v2-lab-card__media">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      </figure>

      <div className="about-v2-lab-card__copy">
        <p className="about-v2-lab__index">{number} / {role}</p>
        <h3>{name}</h3>
        <h4>{subtitle}</h4>
        <p className="about-v2-lab__location">{location}</p>
        <p className="about-v2-lab-card__body">{body}</p>
        <ul className="about-v2-keywords" aria-label={keywordsLabel}>
          {keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
        </ul>

        {storyLink ? (
          <Link className="about-v2-lab__story-link" to={storyLink.to}>
            <span>{storyLink.label}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
