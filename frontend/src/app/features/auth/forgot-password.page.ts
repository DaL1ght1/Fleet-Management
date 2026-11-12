import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { AuthError, authError } from './auth-errors';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    @if (sentTo(); as email) {
      <section class="done" role="status">
        <mat-icon class="done-icon">mark_email_read</mat-icon>
        <h1>{{ 'auth.forgot.sentTitle' | translate }}</h1>
        <p class="muted">{{ 'auth.forgot.sentBody' | translate: { email } }}</p>
        <a mat-stroked-button routerLink="/sign-in">{{ 'auth.backToSignIn' | translate }}</a>
      </section>
    } @else {
      <header class="intro">
        <h1>{{ 'auth.forgot.title' | translate }}</h1>
        <p>{{ 'auth.forgot.subtitle' | translate }}</p>
      </header>
      @if (error(); as failure) {
        <p class="notice error" role="alert">
          <mat-icon>error</mat-icon>
          <span>{{ failure.key | translate: { detail: failure.detail } }}</span>
        </p>
      }
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'auth.fields.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="username" inputmode="email" />
          <mat-icon matPrefix>mail</mat-icon>
          <mat-error>{{ 'validation.email' | translate }}</mat-error>
        </mat-form-field>
        <button mat-flat-button class="submit" type="submit" [disabled]="busy()">
          @if (busy()) {
            <mat-spinner diameter="20" />
          } @else {
            {{ 'auth.forgot.submit' | translate }}
          }
        </button>
      </form>
      <p class="switch">
        <a routerLink="/sign-in">{{ 'auth.backToSignIn' | translate }}</a>
      </p>
    }
  `,
  styleUrl: './auth-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<AuthError | null>(null);
  protected readonly sentTo = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const email = this.form.getRawValue().email.trim();
    try {
      await this.auth.requestPasswordReset(email);
      this.sentTo.set(email);
    } catch (failure) {
      this.error.set(authError(failure));
    } finally {
      this.busy.set(false);
    }
  }
}
