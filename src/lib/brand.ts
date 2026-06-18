export type SiteLanguage = "zh" | "en";

export type LocalizedText = Record<SiteLanguage, string>;

export const BRAND = {
  name: {
    zh: "阿柑少年",
    en: "R'gan Junior",
  },
  tagline: {
    zh: "在真实世界中，长成自己",
    en: "Growing into Ourselves in the Real World",
  },
  description: {
    zh: "面向青少年的真实世界学习与乡村生态实践平台。",
    en: "A real-world learning and rural ecology practice platform for young people.",
  },
  mascotAlt: {
    zh: "阿柑少年吉祥物",
    en: "R'gan Junior mascot",
  },
} as const satisfies Record<string, LocalizedText>;

export const CONTACT_EMAIL = "contact@rganjunior.org";

export const ROUTE_TITLES: Record<string, LocalizedText> = {
  "/": {
    zh: "阿柑少年",
    en: "R'gan Junior",
  },
  "/about": {
    zh: "关于阿柑少年",
    en: "About R'gan Junior",
  },
  "/journey": {
    zh: "关于阿柑少年",
    en: "About R'gan Junior",
  },
  "/field-research": {
    zh: "行动",
    en: "Action",
  },
  "/actions": {
    zh: "行动",
    en: "Action",
  },
  "/voices": {
    zh: "加入阿柑少年",
    en: "Join R'gan Junior",
  },
  "/join": {
    zh: "加入阿柑少年",
    en: "Join R'gan Junior",
  },
};

export function pickLocalized(text: LocalizedText, language: SiteLanguage): string {
  return text[language];
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function getRouteTitle(pathname: string, language: SiteLanguage): string {
  const normalizedPath = normalizePathname(pathname);
  const title = ROUTE_TITLES[normalizedPath] ?? BRAND.name;

  return pickLocalized(title, language);
}

export function getDocumentTitle(pathname: string, language: SiteLanguage): string {
  const normalizedPath = normalizePathname(pathname);
  const brandName = pickLocalized(BRAND.name, language);

  if (normalizedPath === "/") {
    return brandName;
  }

  return `${getRouteTitle(normalizedPath, language)} | ${brandName}`;
}
