import type { ReactNode } from "react";
import OptimizedImage from "@/components/OptimizedImage";

export default function EditorialHero({
  kicker,
  title,
  titleLabel,
  lead,
  image,
  variant = "full-bleed",
}: {
  kicker: string;
  title: ReactNode;
  titleLabel?: string;
  lead: ReactNode;
  variant?: "full-bleed" | "split";
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  };
}) {
  return (
    <header
      className={`about-v2-hero${variant === "full-bleed" ? " about-v2-hero--full-bleed" : ""}`}
    >
      <div className="about-v2-shell about-v2-hero__grid">
        <div className="about-v2-hero__copy">
          <p>{kicker}</p>
          <h1 aria-label={titleLabel}>{title}</h1>
          <div className="about-v2-hero__lead">{lead}</div>
        </div>
        <figure className="about-v2-hero__figure">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="eager"
          />
          <figcaption>{image.caption}</figcaption>
        </figure>
      </div>
    </header>
  );
}
