import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AppRole } from './roles';

export const ROLES_ROUTE_DATA = 'roles';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
  }
  const roles = route.data[ROLES_ROUTE_DATA] as readonly AppRole[] | undefined;
  if (!roles?.length || auth.hasAnyRole(roles)) {
    return true;
  }
  return router.parseUrl(auth.homeRoute());
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).parseUrl(auth.homeRoute()) : true;
};
