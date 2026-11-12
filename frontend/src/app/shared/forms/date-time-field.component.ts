import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';

const SLOT_MINUTES = 15;
const pad = (value: number): string => String(value).padStart(2, '0');

const TIMES: readonly string[] = Array.from(
  { length: (24 * 60) / SLOT_MINUTES },
  (_, index) => `${pad(Math.floor((index * SLOT_MINUTES) / 60))}:${pad((index * SLOT_MINUTES) % 60)}`,
);

@Component({
  selector: 'app-date-time-field',
  imports: [MatDatepickerModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslatePipe],
  providers: [
    provideNativeDateAdapter(),
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateTimeFieldComponent), multi: true },
  ],
  template: `
    <fieldset class="field" [disabled]="disabled()">
      <legend>{{ label() }}</legend>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="date" (click)="picker.open()">
        <mat-label>{{ 'common.date' | translate }}</mat-label>
        <input matInput readonly [matDatepicker]="picker" [value]="date()" (dateChange)="chooseDate($event.value)" />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="time">
        <mat-label>{{ 'common.time' | translate }}</mat-label>
        <mat-select [value]="time()" (valueChange)="chooseTime($event)">
          @for (option of times; track option) {
            <mat-option [value]="option">{{ option }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </fieldset>
  `,
  styles: `
    .field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 104px;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      border: 0;
      min-inline-size: 0;
    }

    legend {
      margin-block-end: var(--space-2);
      color: var(--ink-muted);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .date input {
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeFieldComponent implements ControlValueAccessor {
  readonly label = input.required<string>();

  protected readonly times = TIMES;
  protected readonly date = signal<Date | null>(null);
  protected readonly time = signal<string | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    const dateAdapter = inject(DateAdapter);
    const language = inject(LanguageService).current;
    effect(() => dateAdapter.setLocale(language().code));
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.date.set(null);
      this.time.set(null);
      return;
    }
    const parsed = new Date(value);
    const minutes = Math.round((parsed.getHours() * 60 + parsed.getMinutes()) / SLOT_MINUTES) * SLOT_MINUTES;
    this.date.set(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    this.time.set(TIMES[Math.min(minutes / SLOT_MINUTES, TIMES.length - 1)]);
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected chooseDate(date: Date | null): void {
    this.date.set(date);
    this.emit();
  }

  protected chooseTime(time: string): void {
    this.time.set(time);
    this.emit();
  }

  private emit(): void {
    const date = this.date();
    const time = this.time() ?? '09:00';
    this.onTouched();
    if (date) {
      this.time.set(time);
      this.onChange(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`);
    }
  }
}
