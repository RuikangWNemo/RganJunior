import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActionProgramOption } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPhoneHref, PUBLIC_CONTACT } from '@/lib/contact';
import { getActionInquiryPath } from '@/content/actionPrograms';

export default function ProgramActions({ program }: { program: ActionProgramOption }) {
  const { lang, t } = useLanguage();
  const subject = encodeURIComponent(
    lang === 'zh' ? `咨询：${program.title.zh}` : `Enquiry: ${program.title.en}`,
  );
  const directContactHref = PUBLIC_CONTACT.phone
    ? getPhoneHref(PUBLIC_CONTACT.phone)
    : `mailto:${PUBLIC_CONTACT.email}?subject=${subject}`;
  const DirectContactIcon = PUBLIC_CONTACT.phone ? Phone : Mail;

  return (
    <div className="program-actions">
      <a
        href={directContactHref}
        className="program-actions__primary cursor-target"
      >
        <DirectContactIcon className="size-4" aria-hidden="true" />
        {t('直接咨询', 'Contact us')}
      </a>
      <Link
        to={getActionInquiryPath(program.id)}
        className="program-actions__secondary cursor-target"
      >
        {t('留下参与意向', 'Register interest')}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
