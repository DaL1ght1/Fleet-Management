import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Notifier } from '../notifications/notifier.service';
import { SILENT_ERRORS } from './silent-errors';

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const isTransient = (error: HttpErrorResponse): boolean => error.status === 0 || error.status >= 500;

const messageKeyFor = (status: number): string => {
  switch (status) {
    case 0:
      return 'errors.network';
    case 401:
      return 'errors.sessionExpired';
    case 403:
      return 'errors.forbidden';
    case 429:
      return 'errors.rateLimited';
    case 502:
    case 503:
    case 504:
      return 'errors.unavailable';
    default:
      return 'errors.unexpected';
  }
};

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const notifier = inject(Notifier);
  const silent = request.context.get(SILENT_ERRORS);

  return next(request).pipe(
    retry({
      count: IDEMPOTENT_METHODS.has(request.method) ? MAX_RETRIES : 0,
      delay: (error: HttpErrorResponse, attempt) =>
        isTransient(error) ? timer(RETRY_BASE_DELAY_MS * attempt) : throwError(() => error),
    }),
    catchError((error: HttpErrorResponse) => {
      if (!silent) {
        if (error.status === 401) {
          void auth.sessionExpired();
        }
        if (error.status !== 400) {
          notifier.errorKey(messageKeyFor(error.status));
        }
      }
      return throwError(() => error);
    }),
  );
};
