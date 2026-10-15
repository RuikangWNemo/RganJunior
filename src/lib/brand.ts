import { confirmedTranslation } from './confirmedTranslations';

export type SiteLanguage = "zh" | "en";

export type LocalizedText = Record<SiteLanguage, string>;

export const BRAND = {
  name: {
    zh: "阿柑少年",
    en: "R-Gan Junior",
  },
  tagline: {
    zh: "在真实世界中，长成自己",
    en: "Grow into yourself in the real world",
  },
  description: {
    zh: "阿柑少年是在真实社区中的整全生命成长计划，带领青少年在山野恢复感知，在田野理解真实问题，在城乡行动中长成自己。",
    en: "R-Gan Junior is a Holistic Life Growth program rooted in real communities. It helps young people renew their sensory awareness in nature, understand real-world issues through field research, and grow into themselves through action across cities and villages.",
  },
  mascotAlt: {
    zh: "阿柑少年吉祥物",
    en: "R-Gan Junior mascot",
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
  "/community/auth": {
    title: { zh: "登录与注册", en: "Sign In and Register" },
    description: {
      zh: "登录阿柑少年社群，或注册账号、完善资料并提交入群申请。",
      en: "Sign in to the R-Gan Junior community, or register, complete your profile, and apply for membership.",
    },
  },
  "/": {
    title: {
      zh: "阿柑少年",
      en: "R-Gan Junior",
    },
    description: BRAND.description,
  },
  "/about": {
    title: {
      zh: "关于阿柑少年",
      en: "About R-Gan Junior",
    },
    description: {
      zh: "了解阿柑少年的团队背景、铁牛村起源和真实社区中的整全生命成长路径。",
      en: "Learn about the R-Gan Junior team, its origins in Tieniu Village, and its approach to Holistic Life Growth in real communities.",
    },
  },
  "/about/participants": {
    title: { zh: "营地伙伴名录", en: "Camp Companions" },
    description: { zh: "认识阿柑少年的营地伙伴，阅读他们的自我介绍、兴趣和社区故事。", en: "Meet R-Gan Junior camp companions through their introductions, interests, and community stories." },
  },
  "/about/guardians": {
    title: { zh: "守护团", en: "Guardian Circle" },
    description: {
      zh: "认识陪伴阿柑少年成长的守护团成员，查看成员照片与介绍。",
      en: "Meet the R-Gan Junior Guardian Circle through member portraits and profiles.",
    },
  },
  "/about/tieniu": {
    title: {
      zh: "铁牛村的故事",
      en: "The Story of Tieniu Village",
    },
    description: {
      zh: "从成都蒲江铁牛村的林盘、柑橘和土地修复实践，理解阿柑少年如何从真实社区中生长出来。",
      en: "Explore the Linpan landscape, citrus farming, and land restoration in Tieniu Village, Pujiang, Chengdu, and discover how R-Gan Junior grew out of this community.",
    },
  },
  "/journey": {
    title: {
      zh: "关于阿柑少年",
      en: "About R-Gan Junior",
    },
    description: {
      zh: "了解阿柑少年的团队背景、铁牛村起源和项目发展历程。",
      en: "Learn about the R-Gan Junior team, its origins in Tieniu Village, and how the program has developed.",
    },
  },
  "/field-research": {
    title: {
      zh: "行动",
      en: "Action",
    },
    description: {
      zh: "查看阿柑少年山野探索、田野调查、城乡行动与山野互动的三层行动逻辑。",
      en: "Explore three connected paths of action at R-Gan Junior: nature exploration, field research, and action across cities and villages.",
    },
  },
  "/programs": {
    title: {
      zh: "项目",
      en: "Programs",
    },
    description: {
      zh: "了解阿柑少年的生活体验营、生活共创营、三个月行动小组和青少年研究计划。",
      en: "Explore R-Gan Junior's Life Immersion Camp, Life Co-creation Camp, three-month Action Group, and R-Gan Junior Research Program.",
    },
  },
  "/programs/inquiry": {
    title: {
      zh: "留下参与意向",
      en: "Register Interest",
    },
    description: {
      zh: "留下对阿柑少年经营性项目的参与意向，了解营期、安全、费用与参与方式。",
      en: "Register interest in an R-Gan Junior program and ask about timing, safety, fees, and participation options.",
    },
  },
  "/programs/life-camp": {
    title: {
      zh: "阿柑少年生活共创营",
      en: "Life Co-creation Camp",
    },
    description: {
      zh: "了解阿柑少年生活共创营的项目理念、寒暑假与周末营、共同生活内容、安全照护、费用和常见问题。",
      en: "Learn about the R-Gan Junior Life Co-creation Camp, holiday and weekend formats, shared-life practices, safety, fees, and frequently asked questions.",
    },
  },
  "/programs/life-experience-camp": {
    title: {
      zh: "阿柑少年生活体验营",
      en: "Life Immersion Camp",
    },
    description: {
      zh: "了解阿柑少年两天一夜生活体验营的自然体验、真实劳动、家庭参与、安全照护、费用和常见问题。",
      en: "Learn about R-Gan Junior's two-day, one-night Life Immersion Camp, including nature experiences, hands-on work, family participation, safety and care, fees, and frequently asked questions.",
    },
  },
  "/programs/life-co-creation-camp": {
    title: {
      zh: "阿柑少年生活共创营",
      en: "Life Co-creation Camp",
    },
    description: {
      zh: "了解阿柑少年五天四夜生活共创营的共同生活、小队任务、议题共创、安全照护、费用和常见问题。",
      en: "Learn about R-Gan Junior's five-day, four-night Life Co-creation Camp, including living together, team tasks, collaborative exploration of real-world issues, safety and care, fees, and frequently asked questions.",
    },
  },
  "/programs/action-group": {
    title: {
      zh: "阿柑少年行动小组",
      en: "R-Gan Junior Action Group",
    },
    description: {
      zh: "了解阿柑少年行动小组三个月的持续行动路径、线上共学、家庭实践、线下共创和常见问题。",
      en: "Learn about the R-Gan Junior Action Group's three-month program, online learning, activities with family, in-person co-creation, and frequently asked questions.",
    },
  },
  "/programs/public-projects": {
    title: {
      zh: "青少年研究计划",
      en: "R-Gan Junior Research Program",
    },
    description: {
      zh: "了解阿柑少年青少年研究计划的议题方向、研究方法、田野实践、公共成果、合作方式和常见问题。",
      en: "Learn about the R-Gan Junior Research Program, including research topics, methods, fieldwork, publicly shared findings, collaboration, and frequently asked questions.",
    },
  },
  "/story": {
    title: {
      zh: "发起人故事",
      en: "Founder’s Story",
    },
    description: {
      zh: "认识阿柑少年发起人 Nate：从初到铁牛村的孤独，到邀请更多青少年走进真实世界。",
      en: "Meet Nate, founder of R-Gan Junior, and follow his journey from loneliness in Tieniu Village to inviting more young people into the real world.",
    },
  },
  "/community-stories": {
    title: {
      zh: "社区故事",
      en: "Community Stories",
    },
    description: {
      zh: "阅读阿柑少年发起人、少年伙伴、家长与合作者关于共同生活、生态实践和真实研究的文章。",
      en: "Read articles by the R-Gan Junior founder, young community members, parents, and collaborators about shared living, ecological practice, and real-world research.",
    },
  },
  "/community-stories/all": {
    title: {
      zh: "全部社区故事",
      en: "All Community Stories",
    },
    description: {
      zh: "按人物、题材或关键词浏览阿柑少年的全部公开社区故事。",
      en: "Browse all public R-Gan Junior Community Stories by person, topic, or keyword.",
    },
  },
  "/impact": {
    title: {
      zh: "影响与记录",
      en: "Impact & Records",
    },
    description: {
      zh: "查看阿柑少年的项目参与、成长故事、家庭观察、持续行动、网站累计访问与获奖成果。",
      en: "Explore R-Gan Junior participation, growth stories, family observations, continuing action, lifetime website visits, and awards and achievements.",
    },
  },
  "/impact/awards": {
    title: {
      zh: "获奖与成果",
      en: "Awards & Achievements",
    },
    description: {
      zh: "查看阿柑少年的竞赛结果、论文发表、论坛经历及对应的真实资料记录。",
      en: "Explore R-Gan Junior competition results, publications, forums, and their source material.",
    },
  },
  "/voices": {
    title: {
      zh: "伙伴故事",
      en: "Community Stories",
    },
    description: {
      zh: "阅读阿柑少年发起人与伙伴们关于土地、茶、厨房、科技和真实成长的故事。",
      en: "Read stories by the R-Gan Junior founder and community members about land, tea, cooking, technology, and growth through real-life experiences.",
    },
  },
  "/join": {
    title: {
      zh: "加入阿柑少年",
      en: "Join R-Gan Junior",
    },
    description: {
      zh: "了解青少年、家长和合作伙伴如何加入阿柑少年，并查看当前统一联系方式。",
      en: "Learn how youth, parents, and partners can join R-Gan Junior and view the current shared contact details.",
    },
  },
  "/join/apply": {
    title: {
      zh: "填写加入表单",
      en: "Apply to R-Gan Junior",
    },
    description: {
      zh: "填写阿柑少年加入表单，提交青少年、家长或合作伙伴的加入意向。",
      en: "Submit the R-Gan Junior application form for youth, parents, or partners.",
    },
  },
};

export const ROUTE_TITLES: Record<string, LocalizedText> = Object.fromEntries(
  Object.entries(ROUTE_META).map(([path, meta]) => [path, meta.title])
) as Record<string, LocalizedText>;

export function pickLocalized(text: LocalizedText, language: SiteLanguage): string {
  return confirmedTranslation(text.zh, text.en, language);
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

function resolveRouteMeta(pathname: string): RouteMeta | undefined {
  if (pathname.startsWith("/about/participants/")) return ROUTE_META["/about/participants"];
  if (pathname.startsWith("/about/guardians/")) return ROUTE_META["/about/guardians"];
  if (pathname.startsWith("/voices/")) {
    return ROUTE_META["/voices"];
  }

  if (pathname.startsWith("/community-stories/") && pathname !== "/community-stories/all") {
    return ROUTE_META["/community-stories"];
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
      : normalizedPath === "/field-research" || normalizedPath === "/actions"
        ? "/programs"
        : normalizedPath === "/actions/inquiry"
          ? "/programs/inquiry"
          : normalizedPath;

  return `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
}
