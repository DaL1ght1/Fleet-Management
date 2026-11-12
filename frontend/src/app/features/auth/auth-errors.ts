import { problemOf } from '../../core/http/silent-errors';

export interface AuthError {
  key: string;
  detail?: string;
}

export function authError(failure: unknown, unauthorizedKey = 'auth.errors.invalidCredentials'): AuthError {
  const problem = problemOf(failure);
  switch (problem.status) {
    case 0:
      return { key: 'errors.network' };
    case 401:
      return { key: unauthorizedKey };
    case 409:
      return { key: 'auth.errors.emailTaken' };
    case 404:
    case 410:
      return { key: 'auth.errors.linkExpired' };
    case 400:
    case 422:
      return problem.detail ? { key: 'auth.errors.rejected', detail: problem.detail } : { key: 'errors.unexpected' };
    case 429:
      return { key: 'errors.rateLimited' };
    default:
      return { key: 'errors.unexpected' };
  }
}
