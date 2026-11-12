import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ROLES_ROUTE_DATA, guestGuard, roleGuard } from './role.guard';
import { AppRole } from './roles';

describe('route guards', () => {
  const authenticated = signal(true);
  const roles = signal<readonly AppRole[]>([]);
  const auth = {
    isAuthenticated: authenticated,
    hasAnyRole: (required: readonly AppRole[]) => required.some(role => roles().includes(role)),
    homeRoute: () => (roles().includes('USER') ? '/my/trips' : '/dashboard'),
  };

  const run = (required?: readonly AppRole[]) => {
    const route = { data: required ? { [ROLES_ROUTE_DATA]: required } : {} } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, { url: '/trips' } as RouterStateSnapshot));
  };

  const serialize = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  beforeEach(() => {
    authenticated.set(true);
    roles.set([]);
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  it('allows routes without role requirements', () => {
    expect(run()).toBeTrue();
  });

  it('allows users holding one of the required roles', () => {
    roles.set(['MANAGER']);

    expect(run(['ADMIN', 'MANAGER'])).toBeTrue();
  });

  it('sends users without the required role to their home page', () => {
    roles.set(['USER']);

    expect(serialize(run(['ADMIN']))).toBe('/my/trips');
  });

  it('sends anonymous users to the sign-in page and remembers where they were going', () => {
    authenticated.set(false);

    expect(serialize(run(['ADMIN']))).toBe('/sign-in?returnUrl=%2Ftrips');
  });

  it('keeps signed-in users away from the guest pages', () => {
    roles.set(['MANAGER']);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(serialize(result)).toBe('/dashboard');
  });
});
