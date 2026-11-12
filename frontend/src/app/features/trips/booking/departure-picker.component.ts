import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/i18n/language.service';

const SLOT_MINUTES = 15;
const FIRST_HOUR = 5;
const LAST_HOUR = 23;
const BOOKING_HORIZON_DAYS = 90;
const MINIMUM_LEAD_MINUTES = 30;

type Period = 'morning' | 'afternoon' | 'evening';

interface Slot {
  label: string;
  minutes: number;
  period: Period;
}

const SLOTS: readonly Slot[] = Array.from(
  { length: ((LAST_HOUR - FIRST_HOUR) * 60) / SLOT_MINUTES + 1 },
  (_, index) => {
    const minutes = FIRST_HOUR * 60 + index * SLOT_MINUTES;
    const hours = Math.floor(minutes / 60);
    return {
      minutes,
      label: `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      period: hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening',
    };
  },
);

const PERIODS: readonly Period[] = ['morning', 'afternoon', 'evening'];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

@Component({
  selector: 'app-departure-picker',
  imports: [DatePipe, MatDatepickerModule, MatIconModule, TranslatePipe],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="mode segmented" role="group" [attr.aria-label]="'booking.when' | translate">
      <button type="button" [attr.aria-pressed]="!scheduled()" (click)="leaveNow()">
        <mat-icon>bolt</mat-icon>
        {{ 'booking.now' | translate }}
      </button>
      <button type="button" [attr.aria-pressed]="scheduled()" (click)="schedule()">
        <mat-icon>event</mat-icon>
        {{ 'booking.later' | translate }}
      </button>
    </div>

    @if (scheduled()) {
      <div class="planner">
        <mat-calendar
          class="calendar"
          [selected]="day()"
          [minDate]="today"
          [maxDate]="horizon"
          (selectedChange)="chooseDay($event)"
        />
        <div class="times">
          <p class="chosen">
            @if (departAt(); as chosen) {
              <mat-icon>schedule</mat-icon>
              {{ chosen | date: 'EEEE d MMMM, HH:mm' : undefined : language().code }}
            } @else {
              {{ 'booking.pickTime' | translate }}
            }
          </p>
          @for (period of periods; track period) {
            @if (slotsFor(period).length) {
              <div class="period">
                <span class="period-label">{{ 'booking.periods.' + period | translate }}</span>
                <div class="slots" role="listbox" [attr.aria-label]="'booking.periods.' + period | translate">
                  @for (slot of slotsFor(period); track slot.minutes) {
                    <button
                      type="button"
                      role="option"
                      class="slot"
                      [attr.aria-selected]="slot.minutes === minutes()"
                      (click)="chooseTime(slot.minutes)"
                    >
                      {{ slot.label }}
                    </button>
                  }
                </div>
              </div>
            }
          }
          @if (!hasSlots()) {
            <p class="muted">{{ 'booking.noSlots' | translate }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
    }

    .mode {
      display: grid;
      grid-template-columns: 1fr 1fr;
      inline-size: 100%;
      border-radius: var(--radius-control);

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        border-radius: 6px;
      }
    }

    .planner {
      display: grid;
      gap: var(--space-4);
    }

    .calendar {
      border: 1px solid var(--line);
      border-radius: var(--radius-surface);
      --mat-datepicker-calendar-date-selected-state-background-color: var(--signal-500);
      --mat-datepicker-calendar-date-selected-state-text-color: var(--signal-ink);
      --mat-datepicker-calendar-date-today-outline-color: var(--accent);
    }

    .chosen {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-block-end: var(--space-3);
      font-weight: 600;
    }

    .period + .period {
      margin-block-start: var(--space-3);
    }

    .period-label {
      display: block;
      margin-block-end: var(--space-2);
      color: var(--ink-muted);
      font-size: var(--text-sm);
    }

    .slots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: var(--space-2);
    }

    .slot {
      padding: var(--space-2) 0;
      border: 1px solid var(--line);
      border-radius: var(--radius-control);
      background: var(--surface);
      color: var(--ink);
      font: inherit;
      font-variant-numeric: tabular-nums;
      cursor: pointer;

      &:hover {
        border-color: var(--line-strong);
      }

      &[aria-selected='true'] {
        border-color: var(--signal-500);
        background: var(--signal-500);
        color: var(--signal-ink);
        font-weight: 700;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeparturePickerComponent {
  readonly departAt = model<Date | null>(null);
  readonly scheduled = model(false);

  protected readonly language = inject(LanguageService).current;
  protected readonly periods = PERIODS;
  protected readonly today = startOfDay(new Date());
  protected readonly horizon = new Date(this.today.getTime() + BOOKING_HORIZON_DAYS * 86_400_000);

  protected readonly day = signal<Date>(this.today);
  protected readonly minutes = signal<number | null>(null);

  private readonly earliestToday = computed(() => {
    this.day();
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + MINIMUM_LEAD_MINUTES;
  });

  private readonly availableSlots = computed(() =>
    this.day().getTime() === this.today.getTime() ? SLOTS.filter(slot => slot.minutes >= this.earliestToday()) : SLOTS,
  );

  protected readonly hasSlots = computed(() => this.availableSlots().length > 0);

  constructor() {
    const dateAdapter = inject(DateAdapter);
    effect(() => dateAdapter.setLocale(this.language().code));
  }

  protected slotsFor(period: Period): readonly Slot[] {
    return this.availableSlots().filter(slot => slot.period === period);
  }

  protected leaveNow(): void {
    this.scheduled.set(false);
    this.minutes.set(null);
    this.departAt.set(null);
  }

  protected schedule(): void {
    this.scheduled.set(true);
    if (!this.availableSlots().length) {
      this.chooseDay(new Date(this.today.getTime() + 86_400_000));
    }
  }

  protected chooseDay(day: Date | null): void {
    if (!day) {
      return;
    }
    this.day.set(startOfDay(day));
    const minutes = this.minutes();
    if (minutes !== null && !this.availableSlots().some(slot => slot.minutes === minutes)) {
      this.minutes.set(null);
    }
    this.emit();
  }

  protected chooseTime(minutes: number): void {
    this.minutes.set(minutes);
    this.emit();
  }

  private emit(): void {
    const minutes = this.minutes();
    if (minutes === null) {
      this.departAt.set(null);
      return;
    }
    const departure = new Date(this.day());
    departure.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    this.departAt.set(departure);
  }
}
