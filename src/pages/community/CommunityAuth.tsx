import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

import mascotFull from '@/assets/mascot-full.png';
import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import {
  requestPasswordReset,
  sendMagicLink,
  signInWithIdentifier,
  signUp,
  type AgeBand,
} from '@/services/auth';

type AuthMode = 'signin' | 'signup' | 'magic' | 'reset';
type SignupStage = 'age' | 'account';

const authInputClass =
  'community-field h-12 w-full px-4 text-base';

const primaryButtonClass =
  'community-button community-button--primary w-full gap-2';

const ageOptions = [
  { value: 'under_14', zh: '未满 14 岁', en: 'Under 14' },
  { value: 'age_14_17', zh: '14-17 岁', en: 'Age 14-17' },
  { value: 'adult_18_plus', zh: '已满 18 岁', en: '18 or older' },
] as const satisfies ReadonlyArray<{ value: AgeBand; zh: string; en: string }>;

function CommunityPrinciples({ lang, className = '' }: { lang: 'zh' | 'en'; className?: string }) {
  const principles = [
    [lang === 'zh' ? '注册用户' : 'Registered users', lang === 'zh' ? '完善资料、阅读公开内容、提交入群申请。' : 'Build a profile, read public work, and apply to join.'],
    [lang === 'zh' ? '社群成员' : 'Community members', lang === 'zh' ? '创作、认识伙伴、参加共练并使用成员消息。' : 'Create, meet peers, practice together, and use member messages.'],
    [lang === 'zh' ? '青少年保护' : 'Youth protection', lang === 'zh' ? '未成年人按年龄范围进入相应的监护人知情流程。' : 'Minors follow the guardian flow appropriate to their age range.'],
  ];

  return (
    <div className={`${className} border-t border-primary/25`}>
      {principles.map(([label, body]) => (
        <div key={label} className="grid gap-2 border-b border-primary/15 py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
          <p className="font-medium text-primary">{label}</p>
          <p className="text-sm leading-6 text-foreground/70">{body}</p>
        </div>
      ))}
    </div>
  );
}

export default function CommunityAuth() {
  const { user, communityState, loading } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [signupStage, setSignupStage] = useState<SignupStage>('age');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [mode, signupStage]);

  if (loading) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center px-6">
        <div className="flex items-center gap-3 text-sm text-[hsl(var(--community-forest))]" role="status">
          <span className="size-2 animate-pulse rounded-full bg-[hsl(var(--community-orange))] motion-reduce:animate-none" />
          {lang === 'zh' ? '正在确认账号状态' : 'Checking your account'}
        </div>
      </div>
    );
  }

  if (user && communityState) {
    return <Navigate to={communityState.destination} replace />;
  }

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    if (nextMode === 'signup') setSignupStage('age');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (mode === 'signup' && signupStage === 'age') {
      if (!ageBand) {
        setError(lang === 'zh' ? '请先选择你的年龄范围。' : 'Choose your age range first.');
        return;
      }
      setSignupStage('account');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        await signInWithIdentifier(identifier, password);
        navigate('/community/enter', { replace: true });
      } else if (mode === 'signup') {
        if (!ageBand) throw new Error(lang === 'zh' ? '请先选择年龄范围。' : 'Choose your age range first.');
        const result = await signUp({ email, password, ageBand });
        if (result.session) navigate('/community/enter', { replace: true });
        else setNotice(lang === 'zh' ? '验证邮件已发送，请在邮箱中完成确认。' : 'Check your email to confirm your account.');
      } else if (mode === 'magic') {
        await sendMagicLink(email);
        setNotice(lang === 'zh' ? '登录链接已发送，请查看邮箱。' : 'A sign-in link has been sent.');
      } else {
        await requestPasswordReset(email);
        setNotice(lang === 'zh' ? '密码重设邮件已发送。' : 'A password reset email has been sent.');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  const isSignupAge = mode === 'signup' && signupStage === 'age';
  const isSignupAccount = mode === 'signup' && signupStage === 'account';
  const ageLabel = ageOptions.find((option) => option.value === ageBand);

  const title = mode === 'signup'
    ? isSignupAge
      ? lang === 'zh' ? '先确认年龄范围' : 'Start with your age range'
      : lang === 'zh' ? '建立你的账号' : 'Create your account'
    : mode === 'magic'
      ? lang === 'zh' ? '获取邮箱登录链接' : 'Get an email sign-in link'
      : mode === 'reset'
        ? lang === 'zh' ? '找回你的账号' : 'Recover your account'
        : lang === 'zh' ? '欢迎回来' : 'Welcome back';

  const description = mode === 'signup'
    ? isSignupAge
      ? lang === 'zh' ? '年龄范围只用于安排合适的资料收集与监护人知情流程。' : 'Your age range determines the right profile and guardian flow.'
      : lang === 'zh' ? '先创建基础账号，个人主页资料将在下一步完善。' : 'Create a basic account first. Your profile comes next.'
    : mode === 'magic'
      ? lang === 'zh' ? '我们会发送一封一次性登录邮件。' : 'We will send a one-time sign-in email.'
      : mode === 'reset'
        ? lang === 'zh' ? '输入注册邮箱，接收密码重设邮件。' : 'Enter your registered email to reset your password.'
        : lang === 'zh' ? '使用用户名或邮箱，回到你的社群空间。' : 'Use your username or email to return to the community.';

  return (
    <div className="min-h-[calc(100dvh-4.5rem)] text-[hsl(var(--community-forest))]">
      <main className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1380px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.78fr)]">
        <section className="relative min-w-0 overflow-hidden border-b border-[hsl(var(--community-forest)/0.12)] px-5 py-10 sm:px-8 sm:py-14 lg:border-b-0 lg:border-r lg:px-12 lg:py-16 xl:px-16">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold text-[hsl(var(--community-orange))]">{lang === 'zh' ? '阿柑少年线上社群' : "R-Gan Junior Community"}</p>
            <h1 className="mt-5 max-w-2xl font-serif text-[2.75rem] leading-[1.08] tracking-[-0.03em] text-[hsl(var(--community-orange))] sm:text-6xl lg:text-[4rem]">
              {lang === 'zh' ? (
                <>
                  <span className="block">认识彼此，</span>
                  <span className="block">一起生活与行动。</span>
                </>
              ) : 'Know each other. Grow through action.'}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--community-forest)/0.7)] sm:text-lg sm:leading-8">
              {lang === 'zh' ? '先建立账号、了解社区，再申请成为正式成员。' : 'Create an account, understand the community, then apply for membership.'}
            </p>
          </div>

          <CommunityPrinciples lang={lang} className="relative z-10 mt-12 hidden max-w-xl lg:mt-16 lg:block" />

          <img
            src={mascotFull}
            alt={mascotAlt}
            className="pointer-events-none absolute -bottom-28 -right-16 hidden w-64 select-none opacity-95 lg:block xl:w-72"
          />
        </section>

        <section className="flex min-w-0 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-12 xl:px-14">
          <div className="mx-auto w-full max-w-[28rem] rounded-[1.6rem] rounded-bl-[0.6rem] border border-[hsl(var(--community-forest)/0.12)] bg-white/75 p-5 shadow-[0_28px_80px_hsl(var(--community-forest)/0.09)] backdrop-blur sm:p-8">
            <div className="grid grid-cols-2 border-b border-primary/15" role="tablist" aria-label={lang === 'zh' ? '账号入口' : 'Account entry'}>
              {([
                ['signin', '登录', 'Sign in'],
                ['signup', '注册', 'Register'],
              ] as const).map(([value, zh, en]) => {
                const selected = value === 'signup' ? mode === 'signup' : mode !== 'signup';
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => selectMode(value)}
                    className={`relative min-h-12 px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {lang === 'zh' ? zh : en}
                    {selected ? <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="pb-7 pt-8">
              {mode === 'signup' ? <CommunityProcessSteps current="account" safetyRequired={ageBand !== 'adult_18_plus'} /> : null}
              {mode === 'signup' ? (
                <div className="mb-5 flex items-center gap-3 text-xs font-medium text-primary/65" aria-label={lang === 'zh' ? '注册进度' : 'Registration progress'}>
                  <span className={signupStage === 'age' ? 'text-primary' : ''}>{lang === 'zh' ? '年龄范围' : 'Age range'}</span>
                  <span className="h-px flex-1 bg-primary/15" aria-hidden="true" />
                  <span className={signupStage === 'account' ? 'text-primary' : ''}>{lang === 'zh' ? '账号信息' : 'Account details'}</span>
                </div>
              ) : null}
              <h2 className="font-serif text-3xl leading-tight text-primary sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-foreground/65">{description}</p>
            </div>

            <form className="space-y-5" onSubmit={submit}>
              {mode === 'signin' ? (
                <>
                  <label className="block space-y-2 text-sm font-medium text-foreground" htmlFor="community-identifier">
                    <span>{lang === 'zh' ? '用户名或邮箱' : 'Username or email'}</span>
                    <input
                      id="community-identifier"
                      className={authInputClass}
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-foreground" htmlFor="community-password">
                    <span>{lang === 'zh' ? '密码' : 'Password'}</span>
                    <input
                      id="community-password"
                      className={authInputClass}
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                </>
              ) : null}

              {(mode === 'magic' || mode === 'reset') ? (
                <label className="block space-y-2 text-sm font-medium text-foreground" htmlFor="community-email">
                  <span>{lang === 'zh' ? '邮箱' : 'Email'}</span>
                  <input
                    id="community-email"
                    className={authInputClass}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
              ) : null}

              {isSignupAge ? (
                <fieldset className="space-y-3">
                  <legend className="sr-only">{lang === 'zh' ? '你的年龄范围' : 'Your age range'}</legend>
                  <div className="grid gap-3">
                    {ageOptions.map((option) => {
                      const selected = ageBand === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm transition ${selected ? 'border-primary bg-primary/[0.07] text-primary' : 'border-primary/15 bg-background text-foreground hover:border-primary/35'}`}
                        >
                          <span>{lang === 'zh' ? option.zh : option.en}</span>
                          <span className={`flex size-5 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/25'}`} aria-hidden="true">
                            {selected ? <Check className="size-3.5" /> : null}
                          </span>
                          <input
                            className="sr-only"
                            type="radio"
                            name="age"
                            value={option.value}
                            checked={selected}
                            onChange={() => setAgeBand(option.value)}
                          />
                        </label>
                      );
                    })}
                  </div>

                  {ageBand ? (
                    <div className="flex gap-3 rounded-xl bg-primary/[0.06] px-4 py-3 text-xs leading-5 text-primary">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <p>
                        {ageBand === 'under_14'
                          ? lang === 'zh' ? '监护人确认后，才会继续收集完整个人主页资料。' : 'A guardian confirms before full profile details are collected.'
                          : ageBand === 'age_14_17'
                            ? lang === 'zh' ? '申请成为正式成员前，需要一位监护人知情确认。' : 'Guardian confirmation is required before formal membership.'
                            : lang === 'zh' ? '你可以在注册后完善资料并申请加入社群。' : 'After registration, complete your profile and apply to join.'}
                      </p>
                    </div>
                  ) : null}
                </fieldset>
              ) : null}

              {isSignupAccount ? (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/[0.06] px-4 py-3 text-sm text-primary">
                    <span>{ageLabel ? (lang === 'zh' ? ageLabel.zh : ageLabel.en) : ''}</span>
                    <button type="button" className="shrink-0 font-medium underline underline-offset-4" onClick={() => setSignupStage('age')}>
                      {lang === 'zh' ? '修改年龄范围' : 'Change age range'}
                    </button>
                  </div>
                  <label className="block space-y-2 text-sm font-medium text-foreground" htmlFor="community-signup-email">
                    <span>{lang === 'zh' ? '邮箱' : 'Email'}</span>
                    <input
                      id="community-signup-email"
                      className={authInputClass}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <div className="space-y-2 text-sm font-medium text-foreground">
                    <label className="block" htmlFor="community-signup-password">{lang === 'zh' ? '密码' : 'Password'}</label>
                    <input
                      id="community-signup-password"
                      className={authInputClass}
                      type="password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      aria-describedby="community-signup-password-help"
                      required
                    />
                    <p id="community-signup-password-help" className="text-xs font-normal text-foreground/55">{lang === 'zh' ? '至少 8 个字符' : 'At least 8 characters'}</p>
                  </div>
                </>
              ) : null}

              {error ? <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{error}</p> : null}
              {notice ? <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p> : null}

              <button className={primaryButtonClass} disabled={busy || (isSignupAge && !ageBand)}>
                {mode === 'magic' || mode === 'reset' ? <Mail className="size-4" aria-hidden="true" /> : mode === 'signin' || isSignupAccount ? <KeyRound className="size-4" aria-hidden="true" /> : null}
                <span>
                  {busy
                    ? lang === 'zh' ? '请稍候' : 'Please wait'
                    : mode === 'signin'
                      ? lang === 'zh' ? '进入社群' : 'Enter community'
                      : mode === 'signup'
                        ? isSignupAge
                          ? lang === 'zh' ? '继续创建账号' : 'Continue'
                          : lang === 'zh' ? '注册账号' : 'Create account'
                        : mode === 'magic'
                          ? lang === 'zh' ? '发送登录链接' : 'Send sign-in link'
                          : lang === 'zh' ? '发送重设邮件' : 'Send reset email'}
                </span>
                {isSignupAge ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-primary/12 pt-5 text-sm">
              {mode === 'signin' ? (
                <>
                  <button type="button" onClick={() => selectMode('magic')} className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {lang === 'zh' ? '使用 Magic Link' : 'Use Magic Link'}
                  </button>
                  <button type="button" onClick={() => selectMode('reset')} className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {lang === 'zh' ? '找回密码' : 'Recover password'}
                  </button>
                </>
              ) : mode === 'magic' || mode === 'reset' ? (
                <button type="button" onClick={() => selectMode('signin')} className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {lang === 'zh' ? '返回密码登录' : 'Back to password sign-in'}
                </button>
              ) : (
                <p className="text-center text-xs leading-5 text-foreground/55">
                  {lang === 'zh' ? '注册即表示你愿意遵守社群规则与隐私说明。' : 'By registering, you agree to the community rules and privacy notice.'}
                </p>
              )}
            </div>
          </div>

          <CommunityPrinciples lang={lang} className="mt-10 w-full lg:hidden" />
        </section>
      </main>
    </div>
  );
}
