import type { LocalizedText } from '@/lib/brand';

export type CommunityRouteMeta = {
  section: LocalizedText;
  back?: {
    to: string;
    label: LocalizedText;
  };
  crumbs: Array<{
    to?: string;
    label: LocalizedText;
  }>;
};

const labels = {
  community: { zh: '社群', en: 'Community' },
  website: { zh: '官网首页', en: 'Main site' },
  account: { zh: '账号', en: 'Account' },
  signIn: { zh: '登录与注册', en: 'Sign in & register' },
  recovery: { zh: '重设密码', en: 'Reset password' },
  onboarding: { zh: '完善资料', en: 'Set up profile' },
  apply: { zh: '入群申请', en: 'Membership application' },
  application: { zh: '申请状态', en: 'Application status' },
  guardian: { zh: '安全确认', en: 'Safety confirmation' },
  stories: { zh: '文章', en: 'Stories' },
  storySquare: { zh: '文章广场', en: 'Story square' },
  newStory: { zh: '写文章', en: 'New story' },
  editStory: { zh: '编辑文章', en: 'Edit story' },
  people: { zh: '伙伴', en: 'People' },
  practice: { zh: '共练', en: 'Practice' },
  messages: { zh: '消息', en: 'Messages' },
  settings: { zh: '设置', en: 'Settings' },
  admin: { zh: '管理', en: 'Admin' },
  applications: { zh: '申请审核', en: 'Applications' },
  identities: { zh: '身份与星球', en: 'Identities & planets' },
  reports: { zh: '举报处理', en: 'Reports' },
} as const satisfies Record<string, LocalizedText>;

const rootCrumb = { to: '/community', label: labels.community };

export function getCommunityRouteMeta(pathname: string): CommunityRouteMeta {
  if (pathname === '/community/auth') {
    return { section: labels.signIn, back: { to: '/', label: labels.website }, crumbs: [{ label: labels.signIn }] };
  }
  if (pathname === '/community/reset-password' || pathname === '/community/auth/callback') {
    return { section: labels.recovery, back: { to: '/community/auth', label: labels.signIn }, crumbs: [{ to: '/community/auth', label: labels.account }, { label: labels.recovery }] };
  }
  if (pathname === '/community/onboarding') {
    return { section: labels.onboarding, back: { to: '/', label: labels.website }, crumbs: [{ label: labels.onboarding }] };
  }
  if (pathname === '/community/apply') {
    return { section: labels.apply, back: { to: '/community/onboarding', label: labels.onboarding }, crumbs: [{ to: '/community/onboarding', label: labels.onboarding }, { label: labels.apply }] };
  }
  if (pathname === '/community/guardian-consent') {
    return { section: labels.guardian, back: { to: '/community/application', label: labels.application }, crumbs: [{ to: '/community/application', label: labels.application }, { label: labels.guardian }] };
  }
  if (pathname === '/community/application') {
    return { section: labels.application, back: { to: '/', label: labels.website }, crumbs: [{ label: labels.application }] };
  }
  if (pathname === '/community/stories/new') {
    return { section: labels.newStory, back: { to: '/community/stories', label: labels.stories }, crumbs: [rootCrumb, { to: '/community/stories', label: labels.stories }, { label: labels.newStory }] };
  }
  if (/^\/community\/stories\/[^/]+\/edit$/.test(pathname)) {
    return { section: labels.editStory, back: { to: '/community/stories', label: labels.stories }, crumbs: [rootCrumb, { to: '/community/stories', label: labels.stories }, { label: labels.editStory }] };
  }
  if (pathname === '/community/stories') {
    return { section: labels.stories, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.stories }] };
  }
  if (pathname === '/community/stories/square') {
    return { section: labels.storySquare, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.storySquare }] };
  }
  if (pathname === '/community/people') {
    return { section: labels.people, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.people }] };
  }
  if (pathname === '/community/practice') {
    return { section: labels.practice, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.practice }] };
  }
  if (pathname === '/community/messages') {
    return { section: labels.messages, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.messages }] };
  }
  if (pathname === '/community/settings') {
    return { section: labels.settings, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.settings }] };
  }
  if (pathname === '/community/admin/applications') {
    return { section: labels.applications, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.admin }, { label: labels.applications }] };
  }
  if (pathname === '/community/admin/identities') {
    return { section: labels.identities, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.admin }, { label: labels.identities }] };
  }
  if (pathname === '/community/admin/reports') {
    return { section: labels.reports, back: { to: '/community', label: labels.community }, crumbs: [rootCrumb, { label: labels.admin }, { label: labels.reports }] };
  }

  return { section: labels.community, crumbs: [{ label: labels.community }] };
}
