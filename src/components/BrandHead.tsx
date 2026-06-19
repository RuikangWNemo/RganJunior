import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BRAND,
  DEFAULT_OG_IMAGE,
  SITE_URL,
  getCanonicalUrl,
  getDocumentTitle,
  getRouteDescription,
  pickLocalized,
} from "@/lib/brand";

function upsertMeta(
  selector: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${selector}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(selector, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`,
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let element = document.head.querySelector<HTMLScriptElement>(
    `script[type="application/ld+json"][data-schema-id="${id}"]`,
  );

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.schemaId = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

export default function BrandHead() {
  const { lang } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const brandName = pickLocalized(BRAND.name, lang);
    const description = getRouteDescription(location.pathname, lang);
    const title = getDocumentTitle(location.pathname, lang);
    const canonicalUrl = getCanonicalUrl(location.pathname);

    document.title = title;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", description);
    upsertMeta("name", "author", brandName);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", brandName);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
    upsertMeta("property", "og:image:alt", pickLocalized(BRAND.description, lang));
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
    upsertLink("canonical", canonicalUrl);

    upsertJsonLd("organization", {
      "@context": "https://schema.org",
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: brandName,
      url: SITE_URL,
      email: "contact@rganjunior.org",
      description,
      image: DEFAULT_OG_IMAGE,
      logo: `${SITE_URL}/favicon.png`,
      sameAs: [],
    });
  }, [lang, location.pathname]);

  return null;
}
