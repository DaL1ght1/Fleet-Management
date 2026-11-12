import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordFieldComponent } from '../../shared/forms/password-field.component';
import { passwordPolicy } from '../../shared/forms/password-policy';
import { AuthError, authError } from './auth-errors';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    PasswordFieldComponent,
  ],
  templateUrl: './sign-up.page.html',
  styleUrl: './auth-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordPolicy]],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<AuthError | null>(null);

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const value = this.form.getRawValue();
    try {
      await this.auth.signUp({
        email: value.email.trim(),
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        password: value.password,
      });
      await this.router.navigateByUrl(this.auth.homeRoute());
    } catch (failure) {
      this.error.set(authError(failure));
    } finally {
      this.busy.set(false);
    }
  }
}
