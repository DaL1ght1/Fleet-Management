import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordFieldComponent } from '../../shared/forms/password-field.component';
import { matchesControl, passwordPolicy } from '../../shared/forms/password-policy';
import { AuthError, authError } from './auth-errors';

@Component({
  selector: 'app-set-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PasswordFieldComponent,
  ],
  template: `
    <header class="intro">
      <h1>{{ 'auth.' + mode() + '.title' | translate }}</h1>
      <p>{{ 'auth.' + mode() + '.subtitle' | translate }}</p>
    </header>
    @if (!token()) {
      <p class="notice error" role="alert">
        <mat-icon>link_off</mat-icon>
        <span>{{ 'auth.errors.linkExpired' | translate }}</span>
      </p>
      <a mat-stroked-button routerLink="/forgot-password">{{ 'auth.forgot.title' | translate }}</a>
    } @else {
      @if (error(); as failure) {
        <p class="notice error" role="alert">
          <mat-icon>error</mat-icon>
          <span>{{ failure.key | translate: { detail: failure.detail } }}</span>
        </p>
      }
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-password-field
          [control]="form.controls.password"
          [label]="'auth.fields.newPassword' | translate"
          autocomplete="new-password"
          [showStrength]="true"
        />
        <app-password-field
          [control]="form.controls.confirmation"
          [label]="'auth.fields.confirmPassword' | translate"
          autocomplete="new-password"
        />
        <button mat-flat-button class="submit" type="submit" [disabled]="busy()">
          @if (busy()) {
            <mat-spinner diameter="20" />
          } @else {
            {{ 'auth.' + mode() + '.submit' | translate }}
          }
        </button>
      </form>
    }
    <p class="switch">
      <a routerLink="/sign-in">{{ 'auth.backToSignIn' | translate }}</a>
    </p>
  `,
  styleUrl: './auth-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPasswordPage {
  readonly token = input<string>();
  readonly mode = input<'reset' | 'activate'>('reset');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, passwordPolicy]],
    confirmation: ['', [Validators.required, matchesControl('password')]],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<AuthError | null>(null);

  protected async submit(): Promise<void> {
    const token = this.token();
    if (!token || this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.auth.completePasswordToken(token, this.form.getRawValue().password);
      await this.router.navigate(['/sign-in'], { queryParams: { passwordSet: 1 } });
    } catch (failure) {
      this.error.set(authError(failure, 'auth.errors.linkExpired'));
    } finally {
      this.busy.set(false);
    }
  }
}
