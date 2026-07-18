/**
 * A per-field problem accompanying a 422 VALIDATION_ERROR. Mirrors the
 * backend's `ErrorDetails`: every property is optional and extra ones are
 * allowed, so don't assume `field` is present before branching on it.
 */
export interface ApiErrorDetail {
  /** Dotted path to the offending field, e.g. "body.accountId". */
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(res: ApiResponse<unknown>): res is ApiError {
  return res.success === false;
}
