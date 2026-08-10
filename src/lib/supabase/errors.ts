type SupabaseErrorLike = {
  code?: string;
  message: string;
  status?: number;
};

export class BackendServiceError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'BackendServiceError';
    this.code = code;
    this.status = status;
  }
}

export function throwIfSupabaseError(
  error: SupabaseErrorLike | null,
  fallbackCode: string,
): asserts error is null {
  if (!error) return;
  throw new BackendServiceError(error.code || fallbackCode, error.message, error.status);
}
