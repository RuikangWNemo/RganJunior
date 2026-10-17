import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPhoneHref, PUBLIC_CONTACT } from '@/lib/contact';

export default function ContactChannels() {
  const { t } = useLanguage();
  const [copyResult, setCopyResult] = useState<'copied' | 'manual' | null>(null);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(PUBLIC_CONTACT.email);
      setCopyResult('copied');
    } catch {
      setCopyResult('manual');
    }
  }

  return <div className="mt-6 space-y-3 text-sm leading-7">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <a href={`mailto:${PUBLIC_CONTACT.email}`} className="select-text break-all underline underline-offset-4">{PUBLIC_CONTACT.email}</a>
      <button type="button" onClick={() => void copyEmail()} className="min-h-11 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
        {t('复制邮箱', 'Copy email')}
      </button>
    </div>
    {copyResult && <p role="status">{copyResult === 'copied'
      ? t('邮箱已复制', 'Email copied')
      : t('无法自动复制，请长按或选中上方邮箱复制。', 'Select the email address above to copy it manually.')}</p>}
    {PUBLIC_CONTACT.phone && <p><a href={getPhoneHref(PUBLIC_CONTACT.phone)}>{PUBLIC_CONTACT.phone}</a></p>}
    {PUBLIC_CONTACT.wechatId && <p className="select-text">{t('微信客服：', 'WeChat: ')}{PUBLIC_CONTACT.wechatId}</p>}
    {PUBLIC_CONTACT.wechatQrImage && <img src={PUBLIC_CONTACT.wechatQrImage} alt={t('阿柑少年微信客服二维码', 'R-Gan Junior WeChat contact QR code')} width={240} height={240} loading="lazy" className="h-auto w-40 rounded-lg bg-white p-2" />}
  </div>;
}
