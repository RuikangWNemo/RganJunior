import { type FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { CONTACT_EMAIL, pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

type JoinFormData = {
  audience: JoinAudienceId;
  name: string;
  ageGrade: string;
  organization: string;
  city: string;
  contact: string;
  interests: string[];
  message: string;
  consent: boolean;
  website: string;
};

type JoinApplicationFormProps = {
  initialAudience?: JoinAudienceId;
  className?: string;
};

function createInitialFormData(audience: JoinAudienceId): JoinFormData {
  return {
    audience,
    name: '',
    ageGrade: '',
    organization: '',
    city: '',
    contact: '',
    interests: [],
    message: '',
    consent: false,
    website: '',
  };
}

export default function JoinApplicationForm({
  initialAudience = 'join-youth',
  className,
}: JoinApplicationFormProps) {
  const { lang, t } = useLanguage();
  const [formData, setFormData] = useState<JoinFormData>(() => createInitialFormData(initialAudience));
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    setFormData((current) => ({ ...current, audience: initialAudience }));
  }, [initialAudience]);

  const resetSubmitState = () => {
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const updateFormField = <Key extends keyof JoinFormData>(field: Key, value: JoinFormData[Key]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    resetSubmitState();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.consent) {
      setSubmitStatus('error');
      setSubmitMessage(
        t(
          '请先确认你同意我们为后续联系保存这些信息。',
          'Please confirm that we may keep this information for follow-up.'
        )
      );
      return;
    }

    setSubmitStatus('submitting');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: lang,
          page: window.location.pathname,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || result.code || 'SUBMISSION_FAILED');
      }

      const currentAudience = formData.audience;

      setSubmitStatus('success');
      setSubmitMessage(
        t(
          '申请已收到。我们会通过你留下的联系方式继续沟通。',
          'Your application has been received. We will follow up through the contact details you shared.'
        )
      );
      setFormData(createInitialFormData(currentAudience));
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        t(
          `提交暂时没有成功，请稍后重试，或直接发送邮件至 ${CONTACT_EMAIL}。`,
          `Submission did not go through. Please try again later or email ${CONTACT_EMAIL} directly.`
        )
      );
    }
  };

  return (
    <form className={cn('join-application-form join-application-form-minimal', className)} onSubmit={handleSubmit}>
      <div className="join-form-grid grid gap-5 sm:grid-cols-2">
        <div className="join-form-field sm:col-span-2">
          <Label htmlFor="join-audience" className="text-foreground">
            {t('加入身份', 'Joining as')}
          </Label>
          <Select
            value={formData.audience}
            onValueChange={(value) => updateFormField('audience', value as JoinAudienceId)}
          >
            <SelectTrigger id="join-audience" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {joinAudiences.map((identity) => (
                <SelectItem key={identity.id} value={identity.id}>
                  {pickLocalized(identity.trigger, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="join-form-field">
          <Label htmlFor="join-name" className="text-foreground">
            {t('姓名', 'Name')}
          </Label>
          <Input
            id="join-name"
            value={formData.name}
            onChange={(event) => updateFormField('name', event.target.value)}
            autoComplete="name"
            required
            maxLength={120}
            placeholder={t('怎么称呼你', 'How should we address you?')}
            className="mt-2"
          />
        </div>

        <div className="join-form-field">
          <Label htmlFor="join-contact" className="text-foreground">
            {t('联系方式', 'Contact')}
          </Label>
          <Input
            id="join-contact"
            value={formData.contact}
            onChange={(event) => updateFormField('contact', event.target.value)}
            autoComplete="email"
            required
            maxLength={180}
            placeholder={t('邮箱 / 微信 / 电话', 'Email / WeChat / phone')}
            className="mt-2"
          />
        </div>

        <div className="join-form-field sm:col-span-2">
          <Label htmlFor="join-message" className="text-foreground">
            {t('想加入或合作的原因', 'Why you want to join or collaborate')}
          </Label>
          <Textarea
            id="join-message"
            value={formData.message}
            onChange={(event) => updateFormField('message', event.target.value)}
            required
            maxLength={1800}
            placeholder={t(
              '可以说说你是谁、为什么来到这里，以及你期待一起做些什么……',
              'Tell us who you are, what brought you here, and what you hope we might do together…'
            )}
            className="mt-2 min-h-36"
          />
        </div>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) => updateFormField('website', event.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        <div className="join-form-consent sm:col-span-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="join-consent"
              checked={formData.consent}
              onCheckedChange={(checked) => updateFormField('consent', checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="join-consent"
              className="min-w-0 flex-1 cursor-pointer text-sm font-normal leading-6 text-muted-foreground"
            >
              {t(
                '同意阿柑少年为后续联系保存这些信息。',
                "I agree that R-Gan Junior may keep this information for follow-up."
              )}
            </Label>
          </div>
        </div>
      </div>

      {submitMessage && (
        <p
          role={submitStatus === 'error' ? 'alert' : 'status'}
          className={`mt-6 flex items-start gap-2 text-sm leading-6 ${
            submitStatus === 'success' ? 'text-primary' : 'text-destructive'
          }`}
        >
          {submitStatus === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{submitMessage}</span>
        </p>
      )}

      <Button
        type="submit"
        disabled={submitStatus === 'submitting'}
        className="cursor-target join-form-submit mt-7 min-h-11 w-full sm:w-auto"
      >
        {submitStatus === 'submitting' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span>{submitStatus === 'submitting' ? t('提交中', 'Submitting') : t('提交申请', 'Submit')}</span>
      </Button>
    </form>
  );
}
