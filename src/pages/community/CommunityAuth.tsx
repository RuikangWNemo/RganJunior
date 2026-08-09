import { useEffect, useState, type FormEvent } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowLeft, ArrowRight, Check, KeyRound, Link2, Mail, Orbit, RefreshCw, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

import mascotFull from '@/assets/mascot-full.png';
import CommunityPasswordFields from '@/components/community/CommunityPasswordFields';
import CommunityProcessSteps from '@/components/community/CommunityProcessSteps';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';
import { isManualGuardianFlow } from '@/lib/guardianFlow';
import { isValidNewPassword } from '@/lib/passwordValidation';
import {
  EMAIL_OTP_LENGTH,
  requestPasswordReset,
  sendEmailOtp,
  sendMagicLink,
  signInWithIdentifier,
  signUp,
  verifyEmailOtp,
  type AgeBand,
} from '@/services/auth';
import { listSignupIdentityOptions, type SignupIdentityOption } from '@/services/community-identities';

type AuthMode = 'signin' | 'signup' | 'signupVerify' | 'magic' | 'otp' | 'reset';
type SignupStage = 'identity' | 'age' | 'account';

const authInputClass =
  'community-field h-12 w-full px-4 text-base';

const primaryButtonClass =
  'community-button community-button--primary w-full gap-2';

const OTP_RESEND_COOLDOWN_SECONDS = 60;

const ageOptions = [
  { value: 'under_14', zh: '未满 14 岁', en: 'Under 14' },
  { value: 'age_14_17', zh: '14-17 岁', en: 'Age 14-17' },
  { value: 'adult_18_plus', zh: '已满 18 岁', en: '18 or older' },
] as const satisfies ReadonlyArray<{ value: AgeBand; zh: string; en: string }>;

function submitErrorMessage(error: unknown, lang: 'zh' | 'en') {
  const code = error && typeof error === 'object' && 'code' in error
    ? String(error.code)
    : '';

  if (code === 'COMMUNITY_AUTH_UNAVAILABLE') {
    return lang === 'zh'
      ? '用户名登录暂时不可用，请改用注册邮箱、Magic Link 或邮箱验证码。'
      : 'Username sign-in is temporarily unavailable. Use your email, Magic Link, or email code.';
  }
  if (code === 'otp_expired' || code === 'otp_disabled') {
    return lang === 'zh'
      ? '验证码无效或已过期，请重新发送。'
      : 'The code is invalid or expired. Send a new one.';
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return lang === 'zh'
      ? '发送得有些频繁，请稍后再试。'
      : 'Too many requests. Please try again shortly.';
  }
  return error instanceof Error
    ? error.message
    : lang === 'zh' ? '请求失败，请重试。' : 'Request failed. Please try again.';
}

function CommunityPrinciples({ lang, className = '' }: { lang: 'zh' | 'en'; className?: string }) {
  const principles = [
    [lang === 'zh' ? '注册用户' : 'Registered users', lang === 'zh' ? '完善资料、阅读公开内容、提交入群申请。' : 'Build a profile, read public work, and apply to join.'],
    [lang === 'zh' ? '社群成员' : 'Community members', lang === 'zh' ? '创作、认识伙伴、参加共练并使用成员消息。' : 'Create, meet peers, practice together, and use member messages.'],
    [lang === 'zh' ? '青少年保护' : 'Youth protection', isManualGuardianFlow
      ? lang === 'zh' ? '未满 14 岁申请由工作人员联系监护人；14–17 岁走普通审核。' : 'For under-14 applicants, staff contact a guardian; ages 14–17 follow ordinary review.'
      : lang === 'zh' ? '未成年人按年龄范围进入相应的监护人知情流程。' : 'Minors follow the guardian flow appropriate to their age range.'],
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
  const [signupStage, setSignupStage] = useState<SignupStage>('identity');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [identityOptions, setIdentityOptions] = useState<SignupIdentityOption[]>([]);
  const [primaryIdentitySlug, setPrimaryIdentitySlug] = useState('');
  const [secondaryIdentitySlugs, setSecondaryIdentitySlugs] = useState<string[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [mode, signupStage]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (mode !== 'signup' || identityOptions.length) return;
    setIdentitiesLoading(true);
    listSignupIdentityOptions()
      .then((options) => {
        setIdentityOptions(options.filter((option) => option.slug !== 'rgan-founder'));
      })
      .catch((readError) => {
        setError(readError instanceof Error ? readError.message : (lang === 'zh' ? '身份选项读取失败。' : 'Could not load identity options.'));
      })
      .finally(() => {
        setIdentitiesLoading(false);
      });
  }, [identityOptions.length, lang, mode]);

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
    if (nextMode === 'signup') setSignupStage('identity');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setResendSeconds(0);
  };

  const returnToSignupAccount = () => {
    setMode('signup');
    setSignupStage('account');
    setOtp('');
    setOtpSent(false);
    setResendSeconds(0);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (mode === 'signup' && signupStage === 'identity') {
      if (!primaryIdentitySlug) {
        setError(lang === 'zh' ? '请先选择一个主身份。' : 'Choose one primary identity first.');
        return;
      }
      setSignupStage('age');
      return;
    }

    if (mode === 'signup' && signupStage === 'age') {
      if (!ageBand) {
        setError(lang === 'zh' ? '请先选择你的年龄范围。' : 'Choose your age range first.');
        return;
      }
      setSignupStage('account');
      return;
    }

    if (mode === 'signup' && signupStage === 'account') {
      if (password.length < 8) {
        setError(lang === 'zh' ? '密码至少需要 8 个字符。' : 'Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'zh' ? '两次输入的密码不一致。' : 'Passwords do not match.');
        return;
      }
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
        if (!primaryIdentitySlug) throw new Error(lang === 'zh' ? '请先选择主身份。' : 'Choose a primary identity first.');
        const result = await signUp({
          email,
          password,
          ageBand,
          primaryIdentitySlug,
          secondaryIdentitySlugs,
        });
        if (result.session) navigate('/community/enter', { replace: true });
        else {
          setMode('signupVerify');
          setOtp('');
          setOtpSent(true);
          setResendSeconds(OTP_RESEND_COOLDOWN_SECONDS);
          setNotice(lang === 'zh'
            ? `确认邮件已发送：可以点击邮件链接，也可以在这里输入 ${EMAIL_OTP_LENGTH} 位验证码。`
            : `Confirmation sent. Use the email link or enter the ${EMAIL_OTP_LENGTH}-digit code here.`);
        }
      } else if (mode === 'magic') {
        await sendMagicLink(email);
        setNotice(lang === 'zh' ? '登录链接已发送，请查看邮箱。' : 'A sign-in link has been sent.');
      } else if (mode === 'otp' && !otpSent) {
        await sendEmailOtp(email);
        setOtpSent(true);
        setResendSeconds(OTP_RESEND_COOLDOWN_SECONDS);
        setNotice(lang === 'zh' ? '验证码已发送，请查看邮箱。' : 'A verification code has been sent.');
      } else if (mode === 'otp' || mode === 'signupVerify') {
        const result = await verifyEmailOtp(email, otp);
        if (!result.session) {
          throw new Error(lang === 'zh'
            ? '验证成功，但未能建立登录会话。'
            : 'Verified, but no sign-in session was created.');
        }
        navigate('/community/enter', { replace: true });
      } else {
        await requestPasswordReset(email);
        setNotice(lang === 'zh' ? '密码重设邮件已发送。' : 'A password reset email has been sent.');
      }
    } catch (submitError) {
      setError(submitErrorMessage(submitError, lang));
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (resendSeconds > 0 || busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await sendEmailOtp(email);
      setOtp('');
      setResendSeconds(OTP_RESEND_COOLDOWN_SECONDS);
      setNotice(lang === 'zh' ? '新的验证码已发送。' : 'A new verification code has been sent.');
    } catch (resendError) {
      setError(submitErrorMessage(resendError, lang));
    } finally {
      setBusy(false);
    }
  };

  const isSignupIdentity = mode === 'signup' && signupStage === 'identity';
  const isSignupAge = mode === 'signup' && signupStage === 'age';
  const isSignupAccount = mode === 'signup' && signupStage === 'account';
  const isSignupFlow = mode === 'signup' || mode === 'signupVerify';
  const isOtpEntry = mode === 'signupVerify' || (mode === 'otp' && otpSent);
  const ageLabel = ageOptions.find((option) => option.value === ageBand);
  const primaryIdentity = identityOptions.find((option) => option.slug === primaryIdentitySlug);

  const title = mode === 'signupVerify'
    ? lang === 'zh' ? '确认你的邮箱' : 'Confirm your email'
    : mode === 'signup'
    ? isSignupIdentity
      ? lang === 'zh' ? '你从哪里加入？' : 'Where do you join from?'
      : isSignupAge
        ? lang === 'zh' ? '再确认年龄范围' : 'Next, your age range'
        : lang === 'zh' ? '建立你的账号' : 'Create your account'
    : mode === 'magic'
      ? lang === 'zh' ? '获取邮箱登录链接' : 'Get an email sign-in link'
      : mode === 'otp'
        ? otpSent
          ? lang === 'zh' ? '输入邮箱验证码' : 'Enter your email code'
          : lang === 'zh' ? '使用邮箱验证码' : 'Use an email code'
      : mode === 'reset'
        ? lang === 'zh' ? '找回你的账号' : 'Recover your account'
        : lang === 'zh' ? '欢迎回来' : 'Welcome back';

  const description = mode === 'signupVerify'
    ? lang === 'zh'
      ? `输入邮件中的 ${EMAIL_OTP_LENGTH} 位验证码，或直接点击邮件里的确认链接。`
      : `Enter the ${EMAIL_OTP_LENGTH}-digit code or use the confirmation link in your email.`
    : mode === 'signup'
    ? isSignupIdentity
      ? lang === 'zh' ? '选择一个主身份，也可以补充其他身份。所有选择都需要管理员确认。' : 'Choose one primary identity and add any secondary identities. All selections require admin confirmation.'
      : isSignupAge
        ? lang === 'zh' ? '年龄范围用于安排合适的申请审核与青少年保护流程。' : 'Your age range determines the appropriate review and youth-safety flow.'
        : lang === 'zh' ? '先创建基础账号，个人主页资料将在下一步完善。' : 'Create a basic account first. Your profile comes next.'
    : mode === 'magic'
      ? lang === 'zh' ? '我们会发送一封一次性登录邮件。' : 'We will send a one-time sign-in email.'
      : mode === 'otp'
        ? otpSent
          ? lang === 'zh' ? '验证码发送到了下面的邮箱。' : 'The code was sent to the email below.'
          : lang === 'zh' ? `我们会发送一封包含 ${EMAIL_OTP_LENGTH} 位验证码的邮件。` : `We will email you a ${EMAIL_OTP_LENGTH}-digit verification code.`
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
                const selected = value === 'signup' ? isSignupFlow : !isSignupFlow;
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
              {isSignupFlow ? <CommunityProcessSteps current="account" safetyRequired={ageBand !== 'adult_18_plus'} /> : null}
              {mode === 'signup' ? (
                <div className="mb-5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 text-xs font-medium text-primary/55" aria-label={lang === 'zh' ? '注册进度' : 'Registration progress'}>
                  <span className={signupStage === 'identity' ? 'text-primary' : ''}>{lang === 'zh' ? '身份' : 'Identity'}</span>
                  <span className="h-px bg-primary/15" aria-hidden="true" />
                  <span className={signupStage === 'age' ? 'text-primary' : ''}>{lang === 'zh' ? '年龄范围' : 'Age range'}</span>
                  <span className="h-px bg-primary/15" aria-hidden="true" />
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

              {(mode === 'magic' || mode === 'reset' || (mode === 'otp' && !otpSent)) ? (
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

              {isOtpEntry ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-primary/[0.06] px-4 py-3 text-sm text-primary">
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{email}</span>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-semibold underline underline-offset-4"
                      onClick={mode === 'signupVerify' ? returnToSignupAccount : () => selectMode('otp')}
                    >
                      {lang === 'zh' ? '修改' : 'Change'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p id="community-email-otp-label" className="text-sm font-medium text-foreground">
                      {lang === 'zh' ? `${EMAIL_OTP_LENGTH} 位邮箱验证码` : `${EMAIL_OTP_LENGTH}-digit email code`}
                    </p>
                    <InputOTP
                      aria-labelledby="community-email-otp-label"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={EMAIL_OTP_LENGTH}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={otp}
                      onChange={setOtp}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: EMAIL_OTP_LENGTH }, (_, index) => (
                          <InputOTPSlot key={index} index={index} className="h-12 w-11 text-base sm:w-12" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary underline-offset-4 enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busy || resendSeconds > 0}
                    onClick={resendOtp}
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    {resendSeconds > 0
                      ? lang === 'zh' ? `${resendSeconds} 秒后可重新发送` : `Resend in ${resendSeconds}s`
                      : lang === 'zh' ? '重新发送验证码' : 'Resend code'}
                  </button>
                </div>
              ) : null}

              {isSignupIdentity ? (
                <div className="space-y-5">
                  {identitiesLoading ? (
                    <div className="flex min-h-28 items-center justify-center rounded-2xl bg-primary/[0.05] text-sm text-primary" role="status">
                      <span className="mr-3 size-2 animate-pulse rounded-full bg-[hsl(var(--community-orange))] motion-reduce:animate-none" />
                      {lang === 'zh' ? '正在读取身份选项…' : 'Loading identity options…'}
                    </div>
                  ) : null}
                  {!identitiesLoading && identityOptions.length ? (
                    <>
                      <fieldset className="space-y-3">
                        <legend className="mb-3 text-sm font-semibold text-foreground">{lang === 'zh' ? '主身份（必选）' : 'Primary identity (required)'}</legend>
                        <div className="grid gap-3">
                          {identityOptions.map((option) => {
                            const selected = primaryIdentitySlug === option.slug;
                            return (
                              <label
                                key={option.slug}
                                className={`group flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${selected ? 'border-primary bg-primary/[0.07]' : 'border-primary/15 bg-background hover:border-primary/35'}`}
                              >
                                <span
                                  className="mt-1 size-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: option.color || 'hsl(var(--community-orange))' }}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold text-primary">{lang === 'zh' ? option.name_zh : option.name_en || option.name_zh}</span>
                                  <span className="mt-1 block text-xs leading-5 text-foreground/60">{lang === 'zh' ? option.description_zh : option.description_en || option.description_zh}</span>
                                </span>
                                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/25'}`} aria-hidden="true">
                                  {selected ? <Check className="size-3.5" /> : null}
                                </span>
                                <input
                                  className="sr-only"
                                  type="radio"
                                  name="primary-identity"
                                  value={option.slug}
                                  checked={selected}
                                  onChange={() => {
                                    setPrimaryIdentitySlug(option.slug);
                                    setSecondaryIdentitySlugs((current) => current.filter((slug) => slug !== option.slug));
                                  }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      {primaryIdentitySlug ? (
                        <fieldset className="rounded-2xl bg-primary/[0.055] p-4">
                          <legend className="px-1 text-xs font-semibold text-primary">{lang === 'zh' ? '其他身份（可选）' : 'Secondary identities (optional)'}</legend>
                          <div className="mt-2 grid gap-2">
                            {identityOptions.filter((option) => option.slug !== primaryIdentitySlug).map((option) => {
                              const checked = secondaryIdentitySlugs.includes(option.slug);
                              return (
                                <label key={option.slug} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground hover:bg-white/60">
                                  <input
                                    type="checkbox"
                                    className="size-4 rounded accent-[hsl(var(--community-orange))]"
                                    checked={checked}
                                    onChange={() => setSecondaryIdentitySlugs((current) => (
                                      checked ? current.filter((slug) => slug !== option.slug) : [...current, option.slug]
                                    ))}
                                  />
                                  <span>{lang === 'zh' ? option.name_zh : option.name_en || option.name_zh}</span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      ) : null}

                      <div className="flex gap-3 rounded-xl bg-[hsl(var(--community-orange)/0.08)] px-4 py-3 text-xs leading-5 text-[hsl(var(--community-forest)/0.72)]">
                        <Orbit className="mt-0.5 size-4 shrink-0 text-[hsl(var(--community-orange))]" aria-hidden="true" />
                        <p>{lang === 'zh' ? '身份用于星球归类与统计，不会授予管理权限；入群审核时管理员会再次确认。' : 'Identity supports planet grouping and statistics. It grants no admin access and is confirmed during membership review.'}</p>
                      </div>
                    </>
                  ) : null}
                </div>
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
                          ? isManualGuardianFlow
                            ? lang === 'zh' ? '可以正常注册、完善资料和提交申请；之后工作人员会联系监护人确认。' : 'You can register, complete your profile, and apply normally; staff will then contact a guardian.'
                            : lang === 'zh' ? '监护人确认后，才会继续收集完整个人主页资料。' : 'A guardian confirms before full profile details are collected.'
                          : ageBand === 'age_14_17'
                            ? isManualGuardianFlow
                              ? lang === 'zh' ? '可以正常注册并提交申请，之后进入工作人员普通审核。' : 'You can register and apply normally, then enter ordinary staff review.'
                              : lang === 'zh' ? '申请成为正式成员前，需要一位监护人知情确认。' : 'Guardian confirmation is required before formal membership.'
                            : lang === 'zh' ? '你可以在注册后完善资料并申请加入社群。' : 'After registration, complete your profile and apply to join.'}
                      </p>
                    </div>
                  ) : null}
                  <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setSignupStage('identity')}>
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    {lang === 'zh' ? '返回修改身份' : 'Back to identity'}
                  </button>
                </fieldset>
              ) : null}

              {isSignupAccount ? (
                <>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/[0.06] px-4 py-3 text-sm text-primary">
                    <span className="min-w-0 truncate">
                      {primaryIdentity ? (lang === 'zh' ? primaryIdentity.name_zh : primaryIdentity.name_en || primaryIdentity.name_zh) : ''}
                      {' · '}
                      {ageLabel ? (lang === 'zh' ? ageLabel.zh : ageLabel.en) : ''}
                    </span>
                    <button type="button" className="shrink-0 font-medium underline underline-offset-4" onClick={() => setSignupStage('age')}>
                      {lang === 'zh' ? '修改' : 'Change'}
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
                  <CommunityPasswordFields
                    idPrefix="community-signup"
                    password={password}
                    confirmPassword={confirmPassword}
                    onPasswordChange={setPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    passwordLabel={lang === 'zh' ? '密码' : 'Password'}
                    disabled={busy}
                  />
                </>
              ) : null}

              {error ? <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{error}</p> : null}
              {notice ? <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p> : null}

              <button
                className={primaryButtonClass}
                disabled={busy || identitiesLoading || (isSignupIdentity && !primaryIdentitySlug) || (isSignupAge && !ageBand) || (isSignupAccount && !isValidNewPassword(password, confirmPassword)) || (isOtpEntry && otp.length !== EMAIL_OTP_LENGTH)}
              >
                {mode === 'magic'
                  ? <Link2 className="size-4" aria-hidden="true" />
                  : mode === 'reset' || (mode === 'otp' && !otpSent)
                    ? <Mail className="size-4" aria-hidden="true" />
                    : mode === 'signin' || isSignupAccount || isOtpEntry
                      ? <KeyRound className="size-4" aria-hidden="true" />
                      : null}
                <span>
                  {busy
                    ? lang === 'zh' ? '请稍候' : 'Please wait'
                    : mode === 'signin'
                      ? lang === 'zh' ? '进入社群' : 'Enter community'
                      : mode === 'signup'
                        ? isSignupIdentity
                          ? lang === 'zh' ? '确认身份，继续' : 'Confirm identity'
                          : isSignupAge
                          ? lang === 'zh' ? '继续创建账号' : 'Continue'
                          : lang === 'zh' ? '注册账号' : 'Create account'
                        : mode === 'signupVerify'
                          ? lang === 'zh' ? '验证并进入社群' : 'Verify and enter community'
                        : mode === 'magic'
                          ? lang === 'zh' ? '发送登录链接' : 'Send sign-in link'
                          : mode === 'otp'
                            ? otpSent
                              ? lang === 'zh' ? '验证并登录' : 'Verify and sign in'
                              : lang === 'zh' ? '发送验证码' : 'Send verification code'
                          : lang === 'zh' ? '发送重设邮件' : 'Send reset email'}
                </span>
                {isSignupIdentity || isSignupAge ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-primary/12 pt-5 text-sm">
              {mode === 'signin' ? (
                <>
                  <button type="button" onClick={() => selectMode('magic')} className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {lang === 'zh' ? '使用 Magic Link' : 'Use Magic Link'}
                  </button>
                  <button type="button" onClick={() => selectMode('otp')} className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {lang === 'zh' ? '使用邮箱验证码' : 'Use email code'}
                  </button>
                  <button type="button" onClick={() => selectMode('reset')} className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {lang === 'zh' ? '找回密码' : 'Recover password'}
                  </button>
                </>
              ) : mode === 'magic' || mode === 'otp' || mode === 'reset' ? (
                <button type="button" onClick={() => selectMode('signin')} className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {lang === 'zh' ? '返回密码登录' : 'Back to password sign-in'}
                </button>
              ) : mode === 'signupVerify' ? (
                <p className="text-center text-xs leading-5 text-foreground/55">
                  {lang === 'zh' ? '链接与验证码均为一次性凭据，请勿转发邮件。' : 'Links and codes are single-use credentials. Do not forward the email.'}
                </p>
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
