import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

const ANONYMOUS_PATHS = ['/sign-in', '/sign-up', '/refresh', '/sign-out', '/password/forgot', '/password/reset'];

const needsToken = (url: string): boolean =>
  url.startsWith(environment.identityEndpoint) &&
  !ANONYMOUS_PATHS.some(path => url === environment.identityEndpoint + path);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!needsToken(request.url)) {
    return next(request);
  }
  const auth = inject(AuthService);
  return from(auth.accessToken()).pipe(
    switchMap(token => next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request)),
  );
};
