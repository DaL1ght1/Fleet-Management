import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../http/silent-errors';
import { AppRole, Roles } from './roles';
import { Account, Session } from './account';

const REFRESH_MARGIN_SECONDS = 45;
const APPLICATION_ROLES: ReadonlySet<string> = new Set<AppRole>(['ADMIN', 'MANAGER', 'DRIVER', 'USER']);

interface TokenClaims {
  exp?: number;
  realm_access?: { roles?: string[] };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly endpoint = environment.identityEndpoint;
  private readonly silent = { context: new HttpContext().set(SILENT_ERRORS, true), withCredentials: true };

  private readonly accountState = signal<Account | null>(null);
  private readonly rolesState = signal<readonly AppRole[]>([]);
  private token: string | null = null;
  private expiresAt = 0;
  private pendingRefresh: Promise<string | null> | null = null;

  readonly account = this.accountState.asReadonly();
  readonly roles = this.rolesState.asReadonly();
  readonly isAuthenticated = computed(() => this.accountState() !== null);
  readonly displayName = computed(() => {
    const account = this.accountState();
    return [account?.firstName, account?.lastName].filter(Boolean).join(' ') || account?.email || '';
  });
  readonly initials = computed(() => {
    const account = this.accountState();
    const letters = [account?.firstName, account?.lastName]
      .filter((part): part is string => !!part)
      .map(part => part[0]);
    return (letters.join('') || account?.email?.[0] || '?').toUpperCase();
  });

  async init(): Promise<void> {
    if (await this.refresh()) {
      await this.loadAccount();
    }
  }

  hasAnyRole(roles: readonly AppRole[]): boolean {
    return roles.some(role => this.rolesState().includes(role));
  }

  homeRoute(): string {
    if (!this.isAuthenticated()) {
      return '/sign-in';
    }
    return this.hasAnyRole(Roles.STAFF) ? '/dashboard' : '/my/trips';
  }

  async accessToken(): Promise<string | null> {
    if (this.token && Date.now() < this.expiresAt - REFRESH_MARGIN_SECONDS * 1000) {
      return this.token;
    }
    return this.refresh();
  }

  async signIn(email: string, password: string): Promise<void> {
    this.useSession(
      await firstValueFrom(this.http.post<Session>(`${this.endpoint}/sign-in`, { email, password }, this.silent)),
    );
    await this.loadAccount();
  }

  async signUp(request: { email: string; firstName: string; lastName: string; password: string }): Promise<void> {
    this.useSession(await firstValueFrom(this.http.post<Session>(`${this.endpoint}/sign-up`, request, this.silent)));
    await this.loadAccount();
  }

  async requestPasswordReset(email: string): Promise<void> {
    await firstValueFrom(this.http.post<null>(`${this.endpoint}/password/forgot`, { email }, this.silent));
  }

  async completePasswordToken(token: string, password: string): Promise<void> {
    await firstValueFrom(this.http.post<null>(`${this.endpoint}/password/reset`, { token, password }, this.silent));
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<null>(`${this.endpoint}/sign-out`, {}, this.silent));
    } finally {
      this.clear();
      await this.router.navigateByUrl('/sign-in');
    }
  }

  async sessionExpired(): Promise<void> {
    this.clear();
    await this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url, expired: true } });
  }

  updateAccount(account: Account): void {
    this.accountState.set(account);
  }

  private async loadAccount(): Promise<void> {
    this.accountState.set(await firstValueFrom(this.http.get<Account>(`${this.endpoint}/me`, this.silent)));
  }

  private refresh(): Promise<string | null> {
    this.pendingRefresh ??= firstValueFrom(this.http.post<Session>(`${this.endpoint}/refresh`, {}, this.silent))
      .then(session => {
        this.useSession(session);
        return session.accessToken;
      })
      .catch(() => {
        this.clear();
        return null;
      })
      .finally(() => (this.pendingRefresh = null));
    return this.pendingRefresh;
  }

  private useSession(session: Session): void {
    this.token = session.accessToken;
    const claims = decodeClaims(session.accessToken);
    this.expiresAt = (claims.exp ?? Date.now() / 1000 + session.expiresIn) * 1000;
    this.rolesState.set(
      (claims.realm_access?.roles ?? [])
        .map(role => role.toUpperCase())
        .filter((role): role is AppRole => APPLICATION_ROLES.has(role)),
    );
  }

  private clear(): void {
    this.token = null;
    this.expiresAt = 0;
    this.accountState.set(null);
    this.rolesState.set([]);
  }
}

function decodeClaims(token: string): TokenClaims {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      [...atob(payload)].map(character => '%' + character.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    return JSON.parse(json) as TokenClaims;
  } catch {
    return {};
  }
}
