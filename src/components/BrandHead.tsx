import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRAND, getDocumentTitle, pickLocalized } from "@/lib/brand";

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

export default function BrandHead() {
  const { lang } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const brandName = pickLocalized(BRAND.name, lang);
    const description = pickLocalized(BRAND.description, lang);
    const title = getDocumentTitle(location.pathname, lang);

    document.title = title;
    document.documentElement.lang = lang;

    upsertMeta("name", "description", description);
    upsertMeta("name", "author", brandName);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", brandName);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
  }, [lang, location.pathname]);

  return null;
}
