import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import { MyDriverProfileGQL } from '../../core/graphql/generated';
import { AccountService, Invitation } from '../../core/auth/account.service';
import { AuthService } from '../../core/auth/auth.service';
import { Roles } from '../../core/auth/roles';
import { HasRoleDirective } from '../../core/auth/has-role.directive';
import { Notifier } from '../../core/notifications/notifier.service';
import { problemOf } from '../../core/http/silent-errors';
import { PasswordFieldComponent } from '../../shared/forms/password-field.component';
import { matchesControl, passwordPolicy } from '../../shared/forms/password-policy';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';

type Section = 'details' | 'security' | 'team';

const INVITABLE_ROLES: readonly Invitation['role'][] = ['DRIVER', 'MANAGER', 'ADMIN'];

@Component({
  selector: 'app-profile-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
    HasRoleDirective,
    PasswordFieldComponent,
    StatusChipComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  private readonly accounts = inject(AccountService);
  private readonly notifier = inject(Notifier);
  private readonly myDriverProfileGql = inject(MyDriverProfileGQL);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly roles = Roles;
  protected readonly account = this.auth.account;
  protected readonly displayName = this.auth.displayName;
  protected readonly initials = this.auth.initials;
  protected readonly accountRoles = this.auth.roles;
  protected readonly section = signal<Section>('details');
  protected readonly saving = signal<Section | null>(null);
  protected readonly invitableRoles = computed(() =>
    this.auth.hasAnyRole(Roles.ADMIN) ? INVITABLE_ROLES : INVITABLE_ROLES.filter(role => role !== 'ADMIN'),
  );

  protected readonly details = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly security = this.formBuilder.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordPolicy]],
    confirmation: ['', [Validators.required, matchesControl('newPassword')]],
  });

  protected readonly invitation = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['DRIVER' as Invitation['role'], Validators.required],
  });

  private readonly isDriver = computed(() => this.auth.hasAnyRole(['DRIVER']));

  protected readonly driver = rxResource({
    params: () => this.isDriver(),
    stream: ({ params: driver }) =>
      driver ? this.myDriverProfileGql.fetch().pipe(map(result => result.data.myDriverProfile)) : of(null),
  });

  constructor() {
    effect(() => {
      const account = this.account();
      if (account) {
        this.details.reset({
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          email: account.email,
        });
      }
    });
  }

  protected async saveDetails(): Promise<void> {
    if (this.details.invalid || this.details.pristine) {
      this.details.markAllAsTouched();
      return;
    }
    const value = this.details.getRawValue();
    await this.submit('details', 'profile.saved', () =>
      this.accounts.updateProfile({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
      }),
    );
  }

  protected async changePassword(form: FormGroupDirective): Promise<void> {
    if (this.security.invalid) {
      this.security.markAllAsTouched();
      return;
    }
    const value = this.security.getRawValue();
    if (
      await this.submit('security', 'profile.passwordChanged', () =>
        this.accounts.changePassword(value.currentPassword, value.newPassword),
      )
    ) {
      form.resetForm();
    }
  }

  protected async invite(form: FormGroupDirective): Promise<void> {
    if (this.invitation.invalid) {
      this.invitation.markAllAsTouched();
      return;
    }
    const value = this.invitation.getRawValue();
    if (
      await this.submit('team', 'profile.invitationSent', () =>
        this.accounts.invite({ ...value, email: value.email.trim() }),
      )
    ) {
      form.resetForm({ role: 'DRIVER' });
    }
  }

  private async submit(section: Section, successKey: string, action: () => Promise<unknown>): Promise<boolean> {
    this.saving.set(section);
    try {
      await action();
      this.notifier.success(successKey);
      return true;
    } catch (failure) {
      const problem = problemOf(failure);
      const key =
        problem.status === 401
          ? 'profile.errors.wrongPassword'
          : problem.status === 409
            ? 'auth.errors.emailTaken'
            : problem.status === 403
              ? 'errors.forbidden'
              : null;
      if (key || !problem.detail) {
        this.notifier.errorKey(key ?? 'errors.unexpected');
      } else {
        this.notifier.error(problem.detail);
      }
      return false;
    } finally {
      this.saving.set(null);
    }
  }
}
