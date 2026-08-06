export type SiteLanguage = "zh" | "en";

export type LocalizedText = Record<SiteLanguage, string>;

export const BRAND = {
  name: {
    zh: "阿柑少年",
    en: "R'gan Junior",
  },
  tagline: {
    zh: "在真实世界中，长成自己",
    en: "Grow into yourself in the real world",
  },
  description: {
    zh: "阿柑少年是在真实社区中的整全生命成长计划，带领青少年在山野恢复感知，在田野理解真实问题，在城乡行动中长成自己。",
    en: "R'gan Junior is a whole-person growth journey in real communities, helping young people restore their senses in the wild, understand real problems in the field, and grow through urban-rural action.",
  },
  mascotAlt: {
    zh: "阿柑少年吉祥物",
    en: "R'gan Junior mascot",
  },
  logoAlt: {
    zh: "阿柑少年官方标志",
    en: "Official R-Gan Junior logo",
  },
} as const satisfies Record<string, LocalizedText>;

export const SITE_URL = "https://www.rganjunior.org";
export const OFFICIAL_LOGO_PATH = "/brand/rgan-junior-official-logo.webp";
export const OFFICIAL_LOGO_URL = `${SITE_URL}${OFFICIAL_LOGO_PATH}`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/rgan-junior-official-social-card.jpg`;
export const CONTACT_EMAIL = "contact@rganjunior.org";

export type RouteMeta = {
  title: LocalizedText;
  description: LocalizedText;
};

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: {
      zh: "阿柑少年",
      en: "R'gan Junior",
    },
    description: BRAND.description,
  },
  "/about": {
    title: {
      zh: "关于阿柑少年",
      en: "About R'gan Junior",
    },
    description: {
      zh: "了解阿柑少年的团队背景、铁牛村起源和真实社区中的整全生命成长路径。",
      en: "Learn about the R'gan Junior team, the Tieniu Village origin, and the whole-person growth path in real communities.",
    },
  },
  "/journey": {
    title: {
      zh: "关于阿柑少年",
      en: "About R'gan Junior",
    },
    description: {
      zh: "了解阿柑少年的团队背景、铁牛村起源和项目发展历程。",
      en: "Learn about the R'gan Junior team, Tieniu Village origin, and project development journey.",
    },
  },
  "/field-research": {
    title: {
      zh: "行动",
      en: "Action",
    },
    description: {
      zh: "查看阿柑少年山野探索、田野调查、城乡行动与山野互动的三层行动逻辑。",
      en: "Explore R'gan Junior's three-layer action logic: mountain exploration, field investigation, and urban-rural action.",
    },
  },
  "/actions": {
    title: {
      zh: "行动",
      en: "Action",
    },
    description: {
      zh: "查看阿柑少年自 2023 年以来的营地、田野实践、论坛、来访交流与校园 CSA 活动记录。",
      en: "Browse R'gan Junior activity records since 2023, including camps, field practice, forums, visits, and campus CSA.",
    },
  },
  "/voices": {
    title: {
      zh: "伙伴之声",
      en: "Partner Voices",
    },
    description: {
      zh: "阅读阿柑少年发起人与伙伴们关于土地、茶、厨房、科技和真实成长的故事。",
      en: "Read stories from R'gan Junior initiators and partners about land, tea, cooking, technology, and real-world growth.",
    },
  },
  "/join": {
    title: {
      zh: "加入阿柑少年",
      en: "Join R'gan Junior",
    },
    description: {
      zh: "了解青少年、家长和合作伙伴如何加入阿柑少年，并查看当前统一联系方式。",
      en: "Learn how youth, parents, and partners can join R'gan Junior and view the current shared contact details.",
    },
  },
  "/join/apply": {
    title: {
      zh: "填写加入表单",
      en: "Apply to R'gan Junior",
    },
    description: {
      zh: "填写阿柑少年加入表单，提交青少年、家长或合作伙伴的加入意向。",
      en: "Submit the R'gan Junior application form for youth, parents, or partners.",
    },
  },
};

export const ROUTE_TITLES: Record<string, LocalizedText> = Object.fromEntries(
  Object.entries(ROUTE_META).map(([path, meta]) => [path, meta.title])
) as Record<string, LocalizedText>;

export function pickLocalized(text: LocalizedText, language: SiteLanguage): string {
  return text[language];
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

function resolveRouteMeta(pathname: string): RouteMeta | undefined {
  if (pathname.startsWith("/voices/")) {
    return ROUTE_META["/voices"];
  }

  return ROUTE_META[pathname];
}

export function getRouteTitle(pathname: string, language: SiteLanguage): string {
  const normalizedPath = normalizePathname(pathname);
  const title = resolveRouteMeta(normalizedPath)?.title ?? BRAND.name;

  return pickLocalized(title, language);
}

export function getRouteDescription(pathname: string, language: SiteLanguage): string {
  const normalizedPath = normalizePathname(pathname);
  const description = resolveRouteMeta(normalizedPath)?.description ?? BRAND.description;

  return pickLocalized(description, language);
}

export function getDocumentTitle(pathname: string, language: SiteLanguage): string {
  const normalizedPath = normalizePathname(pathname);
  const brandName = pickLocalized(BRAND.name, language);

  if (normalizedPath === "/") {
    return brandName;
  }

  return `${getRouteTitle(normalizedPath, language)} | ${brandName}`;
}

export function getCanonicalUrl(pathname: string): string {
  const normalizedPath = normalizePathname(pathname);
  const canonicalPath =
    normalizedPath === "/journey"
      ? "/about"
      : normalizedPath === "/field-research"
        ? "/actions"
        : normalizedPath;

  return `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
}
