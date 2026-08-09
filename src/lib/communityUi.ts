import { useLanguage } from '@/contexts/LanguageContext';
import type { LocalizedText, SiteLanguage } from '@/lib/brand';

export const COMMUNITY_UI = {
  community: { zh: '社群', en: 'Community' },
  communityHome: { zh: '社群首页', en: 'Community home' },
  officialSite: { zh: '返回官网', en: 'Main site' },
  back: { zh: '返回', en: 'Back' },
  account: { zh: '账号菜单', en: 'Account menu' },
  settings: { zh: '设置', en: 'Settings' },
  signOut: { zh: '退出登录', en: 'Sign out' },
  administration: { zh: '社群管理', en: 'Community admin' },
  applications: { zh: '申请审核', en: 'Applications' },
  identities: { zh: '身份与星球', en: 'Identities & planets' },
  reports: { zh: '举报处理', en: 'Reports' },
  retry: { zh: '重新加载', en: 'Try again' },
  loading: { zh: '正在加载…', en: 'Loading…' },
  noResults: { zh: '这里暂时还没有内容。', en: 'There is nothing here yet.' },
  navigation: { zh: '社群导航', en: 'Community navigation' },
  mobileNavigation: { zh: '社群主要导航', en: 'Primary community navigation' },
  navHome: { zh: '首页', en: 'Home' },
  navStories: { zh: '文章', en: 'Stories' },
  navStorySquare: { zh: '文章广场', en: 'Story square' },
  navMyStories: { zh: '我的文章', en: 'My stories' },
  navPeople: { zh: '伙伴', en: 'People' },
  navPractice: { zh: '共练', en: 'Practice' },
  navMessages: { zh: '消息', en: 'Messages' },
} as const satisfies Record<string, LocalizedText>;

export const COMMUNITY_STATUS_LABELS: Record<string, LocalizedText> = {
  draft: { zh: '草稿', en: 'Draft' },
  submitted: { zh: '已提交', en: 'Submitted' },
  in_review: { zh: '审核中', en: 'In review' },
  changes_requested: { zh: '需要修改', en: 'Changes requested' },
  approved: { zh: '已通过', en: 'Approved' },
  published: { zh: '已发布', en: 'Published' },
  archived: { zh: '已归档', en: 'Archived' },
  pending_guardian: { zh: '等待监护人确认', en: 'Guardian confirmation' },
  under_review: { zh: '审核中', en: 'Under review' },
  more_info_requested: { zh: '需要补充资料', en: 'More information needed' },
  rejected: { zh: '未通过', en: 'Not approved' },
  withdrawn: { zh: '已撤回', en: 'Withdrawn' },
  active: { zh: '有效', en: 'Active' },
  joined: { zh: '已加入', en: 'Joined' },
  waitlisted: { zh: '候补中', en: 'Waitlisted' },
  resolved: { zh: '已处理', en: 'Resolved' },
  dismissed: { zh: '已驳回', en: 'Dismissed' },
  open: { zh: '待处理', en: 'Open' },
  public: { zh: '公开', en: 'Public' },
  members: { zh: '正式成员', en: 'Members' },
  private: { zh: '仅自己', en: 'Only me' },
};

export function localize(text: LocalizedText, lang: SiteLanguage) {
  return text[lang];
}

export function useCommunityUi() {
  const { lang, setLang, t } = useLanguage();
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';

  return {
    lang,
    setLang,
    t,
    locale,
    copy: <K extends keyof typeof COMMUNITY_UI>(key: K) => COMMUNITY_UI[key][lang],
    status: (value: string | null | undefined) => {
      if (!value) return lang === 'zh' ? '未知' : 'Unknown';
      return COMMUNITY_STATUS_LABELS[value]?.[lang] ?? value.replace(/_/g, ' ');
    },
    formatDate: (value: string | number | Date) => new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value)),
    formatDateTime: (value: string | number | Date) => new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value)),
    formatTime: (value: string | number | Date) => new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value)),
  };
}
