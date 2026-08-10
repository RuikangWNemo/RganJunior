import { type FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
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
import { actionPrograms, type ActionProgramId } from '@/content/actionPrograms';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { PUBLIC_CONTACT } from '@/lib/contact';
import { cn } from '@/lib/utils';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

type ActionInquiryFormData = {
  program: ActionProgramId;
  name: string;
  participantProfile: string;
  city: string;
  preferredTime: string;
  partySize: string;
  contact: string;
  question: string;
  consent: boolean;
  website: string;
};

type ActionInquiryFormProps = {
  initialProgram?: ActionProgramId;
  className?: string;
};

function createInitialFormData(program: ActionProgramId): ActionInquiryFormData {
  return {
    program,
    name: '',
    participantProfile: '',
    city: '',
    preferredTime: '',
    partySize: '1',
    contact: '',
    question: '',
    consent: false,
    website: '',
  };
}

export default function ActionInquiryForm({
  initialProgram = 'life-experience-camp',
  className,
}: ActionInquiryFormProps) {
  const { lang, t } = useLanguage();
  const [formData, setFormData] = useState<ActionInquiryFormData>(() => createInitialFormData(initialProgram));
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    setFormData((current) => ({ ...current, program: initialProgram }));
  }, [initialProgram]);

  const resetSubmitState = () => {
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const updateFormField = <Key extends keyof ActionInquiryFormData>(
    field: Key,
    value: ActionInquiryFormData[Key],
  ) => {
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
          'Please confirm that we may keep this information for follow-up.',
        ),
      );
      return;
    }

    setSubmitStatus('submitting');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/action-inquiry', {
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

      const currentProgram = formData.program;
      setSubmitStatus('success');
      setSubmitMessage(
        t(
          '参与意向已收到。我们会通过你留下的联系方式继续沟通。',
          'We have received your interest and will follow up using the contact details you shared.',
        ),
      );
      setFormData(createInitialFormData(currentProgram));
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        t(
          `暂时没有提交成功。你填写的内容仍在页面中，可以稍后重试，或直接发送邮件至 ${PUBLIC_CONTACT.email}。`,
          `Your form has not been sent yet. Your answers remain on this page, so you can retry or email ${PUBLIC_CONTACT.email}.`,
        ),
      );
    }
  };

  return (
    <form className={cn('grid gap-6', className)} onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="action-inquiry-program" className="text-foreground">
            {t('感兴趣的项目', 'Program of interest')}
          </Label>
          <Select
            value={formData.program}
            onValueChange={(value) => updateFormField('program', value as ActionProgramId)}
          >
            <SelectTrigger id="action-inquiry-program" className="mt-2 min-h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionPrograms.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {pickLocalized(program.title, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="action-inquiry-name" className="text-foreground">
            {t('姓名', 'Name')}
          </Label>
          <Input
            id="action-inquiry-name"
            value={formData.name}
            onChange={(event) => updateFormField('name', event.target.value)}
            autoComplete="name"
            required
            maxLength={120}
            placeholder={t('怎么称呼你', 'How should we address you?')}
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div>
          <Label htmlFor="action-inquiry-profile" className="text-foreground">
            {t('年龄、年级或参与身份', 'Age, grade, or role')}
          </Label>
          <Input
            id="action-inquiry-profile"
            value={formData.participantProfile}
            onChange={(event) => updateFormField('participantProfile', event.target.value)}
            required
            maxLength={160}
            placeholder={t('例如：15 岁，高一 / 家长', 'For example: age 15, Grade 10 / parent')}
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div>
          <Label htmlFor="action-inquiry-city" className="text-foreground">
            {t('所在城市', 'City')}
          </Label>
          <Input
            id="action-inquiry-city"
            value={formData.city}
            onChange={(event) => updateFormField('city', event.target.value)}
            autoComplete="address-level2"
            required
            maxLength={120}
            placeholder={t('你目前所在的城市', 'Where you are based')}
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div>
          <Label htmlFor="action-inquiry-time" className="text-foreground">
            {t('预计参与时间', 'Preferred timing')}
          </Label>
          <Input
            id="action-inquiry-time"
            value={formData.preferredTime}
            onChange={(event) => updateFormField('preferredTime', event.target.value)}
            required
            maxLength={160}
            placeholder={t('例如：寒假 / 2027 年春季', 'For example: winter break / spring 2027')}
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div>
          <Label htmlFor="action-inquiry-party-size" className="text-foreground">
            {t('预计参与人数', 'Number of participants')}
          </Label>
          <Input
            id="action-inquiry-party-size"
            type="number"
            min="1"
            max="20"
            value={formData.partySize}
            onChange={(event) => updateFormField('partySize', event.target.value)}
            required
            inputMode="numeric"
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div>
          <Label htmlFor="action-inquiry-contact" className="text-foreground">
            {t('联系方式', 'Contact')}
          </Label>
          <Input
            id="action-inquiry-contact"
            value={formData.contact}
            onChange={(event) => updateFormField('contact', event.target.value)}
            autoComplete="email"
            required
            maxLength={180}
            placeholder={t('邮箱 / 微信 / 电话', 'Email / WeChat / phone')}
            className="mt-2 min-h-11 bg-background"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="action-inquiry-question" className="text-foreground">
            {t('最想了解的问题', 'What would you most like to know?')}
          </Label>
          <Textarea
            id="action-inquiry-question"
            value={formData.question}
            onChange={(event) => updateFormField('question', event.target.value)}
            required
            maxLength={1800}
            placeholder={t(
              '可以告诉我们你的参与期待，以及最关心的安全、时间、费用或项目内容。',
              'Share what you hope for and any questions about safety, timing, fees, or program content.',
            )}
            className="mt-2 min-h-36 bg-background"
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
              id="action-inquiry-consent"
              checked={formData.consent}
              onCheckedChange={(checked) => updateFormField('consent', checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="action-inquiry-consent"
              className="min-w-0 flex-1 cursor-pointer text-sm font-normal leading-6 text-muted-foreground"
            >
              {t(
                '同意阿柑少年为项目咨询与后续联系保存这些信息。',
                "I agree that R-Gan Junior may keep this information for program enquiries and follow-up.",
              )}
            </Label>
          </div>
        </div>
      </div>

      {submitMessage && (
        <p
          role={submitStatus === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 text-sm leading-6 ${
            submitStatus === 'success' ? 'text-primary' : 'text-destructive'
          }`}
        >
          {submitStatus === 'success' && <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          <span>{submitMessage}</span>
        </p>
      )}

      <Button
        type="submit"
        disabled={submitStatus === 'submitting'}
        aria-busy={submitStatus === 'submitting'}
        className="cursor-target min-h-12 w-full whitespace-nowrap sm:w-auto sm:justify-self-start"
      >
        <Send className="size-4" aria-hidden="true" />
        <span>{submitStatus === 'submitting' ? t('正在发送', 'Sending') : t('提交参与意向', 'Send interest')}</span>
      </Button>
    </form>
  );
}
