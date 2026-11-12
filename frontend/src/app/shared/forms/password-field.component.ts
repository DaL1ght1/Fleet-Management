import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { passwordStrength } from './password-policy';

@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, TranslatePipe],
  template: `
    <mat-form-field appearance="outline" class="field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control()"
        [attr.autocomplete]="autocomplete()"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        (click)="visible.set(!visible())"
        [attr.aria-label]="(visible() ? 'auth.hidePassword' : 'auth.showPassword') | translate"
        [attr.aria-pressed]="visible()"
      >
        <mat-icon>{{ visible() ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>
      @if (control().hasError('required')) {
        <mat-error>{{ 'validation.required' | translate }}</mat-error>
      } @else if (control().hasError('passwordLength')) {
        <mat-error>{{ 'validation.passwordLength' | translate }}</mat-error>
      } @else if (control().hasError('passwordMix')) {
        <mat-error>{{ 'validation.passwordMix' | translate }}</mat-error>
      } @else if (control().hasError('mismatch')) {
        <mat-error>{{ 'validation.passwordMismatch' | translate }}</mat-error>
      } @else if (showStrength()) {
        <mat-hint>{{ 'auth.passwordHint' | translate }}</mat-hint>
      }
    </mat-form-field>
    @if (showStrength()) {
      <div class="strength" [attr.data-level]="strength()" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
    }

    .field {
      inline-size: 100%;
    }

    .strength {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      margin-block: 2px var(--space-2);

      span {
        block-size: 4px;
        border-radius: var(--radius-pill);
        background: var(--line);
        transition: background var(--duration) var(--ease-out);
      }

      &[data-level='1'] span:nth-child(1) {
        background: var(--danger);
      }

      &[data-level='2'] span:nth-child(-n + 2) {
        background: var(--signal-500);
      }

      &[data-level='3'] span {
        background: var(--route-500);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFieldComponent implements OnInit {
  readonly control = input.required<FormControl<string>>();
  readonly label = input.required<string>();
  readonly autocomplete = input('current-password');
  readonly showStrength = input(false);

  protected readonly visible = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly value = signal('');
  protected readonly strength = computed(() => passwordStrength(this.value()));

  ngOnInit(): void {
    this.value.set(this.control().value ?? '');
    this.control()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.value.set(value ?? ''));
  }
}
