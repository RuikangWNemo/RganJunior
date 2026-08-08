import { ArrowLeft, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ActionInquiryForm from '@/components/actions/ActionInquiryForm';
import { getActionProgram } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { getPhoneHref, PUBLIC_CONTACT } from '@/lib/contact';

export default function ActionInquiry() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const activeProgram = getActionProgram(searchParams.get('program'));

  return (
    <div className="programs-editorial action-inquiry-page bg-background pt-20">
      <header className="border-b border-border/80 bg-secondary/25">
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <Link
            to={activeProgram.detailPath}
            className="cursor-target inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-colors hover:text-primary/70 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('返回项目介绍', 'Back to the program')}
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-medium text-primary">{pickLocalized(activeProgram.title, lang)}</p>
            <h1 className="mt-4 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
              {t('留下参与意向', 'Register your interest')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
              {t(
                '这不是正式申请。它帮助我们了解你的时间、需求和问题，也让第一次沟通更有准备。',
                'This is not a formal application. It helps us understand your timing, needs, and questions before we speak.',
              )}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:items-start lg:gap-10 lg:px-8">
        <section aria-labelledby="action-inquiry-form-title" className="rounded-xl border border-border bg-card p-6 sm:p-8 md:p-10">
          <h2 id="action-inquiry-form-title" className="font-serif text-2xl leading-tight text-foreground sm:text-3xl">
            {t('告诉我们你的参与计划', 'Tell us about your plans')}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {t('提交后，我们会通过你留下的方式联系。', 'We will follow up using the contact details you provide.')}
          </p>
          <ActionInquiryForm initialProgram={activeProgram.id} className="mt-8" />
        </section>

        <aside className="rounded-xl bg-primary p-7 text-primary-foreground lg:sticky lg:top-28">
          <MessageCircle className="size-6" aria-hidden="true" />
          <h2 className="mt-5 font-serif text-2xl leading-snug">{t('也可以直接联系我们', 'You can also contact us directly')}</h2>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/72">
            {t(
              '如果你想先确认档期、安全、费用或参与方式，可以直接写信。',
              'If you want to confirm timing, safety, fees, or participation options first, email us directly.',
            )}
          </p>
          <a
            href={`mailto:${PUBLIC_CONTACT.email}`}
            className="mt-5 inline-flex items-start gap-2 break-all text-sm text-primary-foreground underline decoration-primary-foreground/35 underline-offset-4 hover:decoration-primary-foreground"
          >
            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {PUBLIC_CONTACT.email}
          </a>
          {PUBLIC_CONTACT.phone && (
            <a
              href={getPhoneHref(PUBLIC_CONTACT.phone)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary-foreground underline decoration-primary-foreground/35 underline-offset-4 hover:decoration-primary-foreground"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {PUBLIC_CONTACT.phone}
            </a>
          )}
          {PUBLIC_CONTACT.wechatId && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary-foreground">
              <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
              {t('微信', 'WeChat')} {PUBLIC_CONTACT.wechatId}
            </p>
          )}
          {PUBLIC_CONTACT.wechatQrImage && (
            <img
              src={PUBLIC_CONTACT.wechatQrImage}
              alt={t('阿柑少年项目咨询微信二维码', "R'gan Junior program enquiry WeChat QR code")}
              width="240"
              height="240"
              loading="lazy"
              className="mt-5 w-40 rounded-lg bg-primary-foreground p-2"
            />
          )}

          <div className="mt-8 border-t border-primary-foreground/20 pt-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5" aria-hidden="true" />
              <p className="text-sm font-medium">{t('你的信息如何使用', 'How we use your information')}</p>
            </div>
            <p className="mt-3 text-xs leading-6 text-primary-foreground/68">
              {t(
                '仅用于项目咨询、匹配合适的参与方式和后续联系。',
                'Only for program enquiries, matching suitable participation options, and follow-up.',
              )}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
