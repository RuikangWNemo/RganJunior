export type EmailLocale = 'zh-CN' | 'en';

export type EmailWithTokenProps = {
  confirmationUrl?: string;
  locale: EmailLocale;
  token: string;
};

export type EmailWithLinkProps = {
  confirmationUrl: string;
  locale: EmailLocale;
};
