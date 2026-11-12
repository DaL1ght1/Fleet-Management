import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import { ProblemDetail } from '../auth/account';

export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

export function problemOf(failure: unknown): ProblemDetail {
  if (failure instanceof HttpErrorResponse) {
    const body = typeof failure.error === 'object' && failure.error !== null ? failure.error : {};
    return { status: failure.status, title: body.title, detail: body.detail };
  }
  return { status: -1 };
}
