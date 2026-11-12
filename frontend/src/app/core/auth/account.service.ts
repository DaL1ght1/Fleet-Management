import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../http/silent-errors';
import { Account } from './account';
import { AuthService } from './auth.service';
import { AppRole } from './roles';

export interface ProfileChanges {
  email: string;
  firstName: string;
  lastName: string;
}

export interface Invitation extends Omit<ProfileChanges, 'email'> {
  email: string;
  role: Exclude<AppRole, 'USER'>;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly endpoint = environment.identityEndpoint;
  private readonly options = { context: new HttpContext().set(SILENT_ERRORS, true), withCredentials: true };

  async updateProfile(changes: ProfileChanges): Promise<Account> {
    const account = await firstValueFrom(this.http.put<Account>(`${this.endpoint}/me`, changes, this.options));
    this.auth.updateAccount(account);
    return account;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.put<null>(`${this.endpoint}/me/password`, { currentPassword, newPassword }, this.options),
    );
  }

  async invite(invitation: Invitation): Promise<Account> {
    return firstValueFrom(this.http.post<Account>(`${this.endpoint}/invitations`, invitation, this.options));
  }
}
