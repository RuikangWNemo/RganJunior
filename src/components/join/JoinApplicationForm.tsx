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
import { CONTACT_EMAIL, type LocalizedText, pickLocalized } from '@/lib/brand';
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

const joinFormInterests: Array<{ id: string; label: LocalizedText }> = [
  { id: 'mountain', label: { zh: '山野探索', en: 'Mountain exploration' } },
  { id: 'field', label: { zh: '田野调查', en: 'Field research' } },
  { id: 'urban-rural', label: { zh: '城乡行动', en: 'Urban-rural action' } },
  { id: 'collaboration', label: { zh: '课程 / 合作', en: 'Course / partnership' } },
];

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

  const toggleInterest = (interestId: string, checked: boolean) => {
    setFormData((current) => {
      const interests = checked
        ? Array.from(new Set([...current.interests, interestId]))
        : current.interests.filter((item) => item !== interestId);

      return { ...current, interests };
    });
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
    <form className={cn('join-application-form border-y border-border/80 py-8', className)} onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="join-audience" className="text-foreground">
            {t('加入身份', 'Joining as')}
          </Label>
          <Select
            value={formData.audience}
            onValueChange={(value) => updateFormField('audience', value as JoinAudienceId)}
          >
            <SelectTrigger id="join-audience" className="mt-2 bg-background/80">
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

        <div>
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
            className="mt-2 bg-background/80"
          />
        </div>

        <div>
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
            className="mt-2 bg-background/80"
          />
        </div>

        <div>
          <Label htmlFor="join-age-grade" className="text-foreground">
            {t('年龄 / 年级 / 身份', 'Age / grade / role')}
          </Label>
          <Input
            id="join-age-grade"
            value={formData.ageGrade}
            onChange={(event) => updateFormField('ageGrade', event.target.value)}
            maxLength={120}
            className="mt-2 bg-background/80"
          />
        </div>

        <div>
          <Label htmlFor="join-organization" className="text-foreground">
            {t('学校 / 机构', 'School / organization')}
          </Label>
          <Input
            id="join-organization"
            value={formData.organization}
            onChange={(event) => updateFormField('organization', event.target.value)}
            maxLength={160}
            className="mt-2 bg-background/80"
          />
        </div>

        <div>
          <Label htmlFor="join-city" className="text-foreground">
            {t('所在城市', 'City')}
          </Label>
          <Input
            id="join-city"
            value={formData.city}
            onChange={(event) => updateFormField('city', event.target.value)}
            maxLength={120}
            className="mt-2 bg-background/80"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium leading-none text-foreground">
            {t('感兴趣方向', 'Interests')}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {joinFormInterests.map((interest) => {
              const isChecked = formData.interests.includes(interest.id);

              return (
                <div
                  key={interest.id}
                  className="flex min-h-11 items-center gap-3 border border-border/70 px-3 py-2 text-sm text-foreground/85 transition-colors hover:border-primary/50"
                >
                  <Checkbox
                    id={`join-interest-${interest.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => toggleInterest(interest.id, checked === true)}
                  />
                  <Label
                    htmlFor={`join-interest-${interest.id}`}
                    className="min-w-0 flex-1 cursor-pointer text-sm font-normal leading-6 text-foreground/85"
                  >
                    {pickLocalized(interest.label, lang)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="join-message" className="text-foreground">
            {t('想加入或合作的原因', 'Why you want to join or collaborate')}
          </Label>
          <Textarea
            id="join-message"
            value={formData.message}
            onChange={(event) => updateFormField('message', event.target.value)}
            required
            maxLength={1800}
            className="mt-2 min-h-32 bg-background/80"
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

        <div className="sm:col-span-2">
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
                '我同意阿柑少年为后续联系与项目沟通保存这些信息。',
                "I agree that R'gan Junior may keep this information for follow-up and program communication."
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
        className="cursor-target mt-7 min-h-11 w-full sm:w-auto"
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
