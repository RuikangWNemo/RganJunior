export type AuthEmailEnvironment = Record<string, string | undefined>;

export type AuthEmailConfig = {
  canonicalSiteUrl: string;
  from: string;
  hookSecret: string;
  previewOrigins: string[];
  production: boolean;
  resendApiKey: string;
  supabaseUrl: string;
};

export class AuthEmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthEmailConfigurationError';
  }
}

function required(environment: AuthEmailEnvironment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new AuthEmailConfigurationError(`Missing server environment variable: ${name}`);
  return value;
}

function origin(value: string, name: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      throw new Error('unsupported protocol');
    }
    return parsed.origin;
  } catch {
    throw new AuthEmailConfigurationError(`Invalid URL in server environment variable: ${name}`);
  }
}

export function readAuthEmailConfig(
  environment: AuthEmailEnvironment = process.env,
): AuthEmailConfig {
  const production = environment.VERCEL_ENV === 'production'
    || environment.NODE_ENV === 'production';
  const canonicalSiteUrl = origin(
    required(environment, 'COMMUNITY_PUBLIC_URL'),
    'COMMUNITY_PUBLIC_URL',
  );
  const previewOrigins: string[] = [];
  if (!production && environment.VERCEL_URL?.trim()) {
    previewOrigins.push(origin(`https://${environment.VERCEL_URL.trim()}`, 'VERCEL_URL'));
  }

  return {
    canonicalSiteUrl,
    from: required(environment, 'AUTH_EMAIL_FROM'),
    hookSecret: required(environment, 'SUPABASE_SEND_EMAIL_HOOK_SECRET'),
    previewOrigins,
    production,
    resendApiKey: required(environment, 'RESEND_API_KEY'),
    supabaseUrl: origin(required(environment, 'SUPABASE_URL'), 'SUPABASE_URL'),
  };
}
