import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';

const pad = (value: number): string => String(value).padStart(2, '0');

function parse(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

@Component({
  selector: 'app-date-field',
  imports: [MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslatePipe],
  providers: [
    provideNativeDateAdapter(),
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateFieldComponent), multi: true },
  ],
  template: `
    <mat-form-field appearance="outline" [subscriptSizing]="subscript()" class="field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        readonly
        [required]="required()"
        [disabled]="disabled()"
        [matDatepicker]="picker"
        [min]="min()"
        [max]="max()"
        [value]="date()"
        (click)="picker.open()"
        (dateChange)="choose($event.value)"
      />
      @if (clearable() && date()) {
        <button
          mat-icon-button
          matIconSuffix
          type="button"
          (click)="choose(null)"
          [attr.aria-label]="'common.clear' | translate"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker [startView]="startView()" />
      @if (error()) {
        <mat-hint class="error-text">{{ error() }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }

    .field {
      inline-size: 100%;
    }

    input {
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFieldComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly required = input(false);
  readonly clearable = input(false);
  readonly error = input<string | null>(null);
  readonly startView = input<'month' | 'year' | 'multi-year'>('month');
  readonly subscript = input<'fixed' | 'dynamic'>('fixed');

  protected readonly date = signal<Date | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    const dateAdapter = inject(DateAdapter);
    const language = inject(LanguageService).current;
    effect(() => dateAdapter.setLocale(language().code));
  }

  writeValue(value: string | null): void {
    this.date.set(parse(value));
  }

  registerOnChange(onChange: (value: string | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected choose(date: Date | null): void {
    this.date.set(date);
    this.onTouched();
    this.onChange(date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : null);
  }
}
