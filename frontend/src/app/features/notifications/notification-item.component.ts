import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationFieldsFragment, NotificationKind } from '../../core/graphql/generated';
import { LanguageService } from '../../core/i18n/language.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

const ICONS: Record<NotificationKind, string> = {
  GEOFENCE_ENTERED: 'login',
  GEOFENCE_EXITED: 'logout',
  SPEED_LIMIT_EXCEEDED: 'speed',
  MAINTENANCE_SCHEDULED: 'event_upcoming',
  MAINTENANCE_STARTED: 'build',
  MAINTENANCE_COMPLETED: 'task_alt',
  MAINTENANCE_OVERDUE: 'build_circle',
  TRIP_ASSIGNED: 'assignment_ind',
  TRIP_RESCHEDULED: 'update',
  TRIP_STARTED: 'play_circle',
  TRIP_COMPLETED: 'flag',
  TRIP_CANCELLED: 'cancel',
  INVOICE_ISSUED: 'receipt_long',
  INVOICE_PAID: 'paid',
  INVOICE_OVERDUE: 'running_with_errors',
  LICENSE_EXPIRING: 'badge',
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;

function formatValue(value: string, locale: string): string {
  if (DATE_ONLY.test(value)) {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
  }
  if (DATE_TIME.test(value)) {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
  return value;
}

@Component({
  selector: 'app-notification-item',
  imports: [MatIconModule, TranslatePipe, RelativeTimePipe],
  template: `
    <button type="button" class="item" [class.unread]="!notification().read" (click)="opened.emit(notification())">
      <span class="icon" [attr.data-severity]="notification().severity">
        <mat-icon>{{ icon() }}</mat-icon>
      </span>
      <span class="text">
        <span class="title">{{ 'notifications.kinds.' + notification().kind + '.title' | translate: params() }}</span>
        <span class="body">{{ 'notifications.kinds.' + notification().kind + '.body' | translate: params() }}</span>
        <span class="time">{{ notification().createdAt | relativeTime: language().code }}</span>
      </span>
      @if (!notification().read) {
        <span class="dot" aria-hidden="true"></span>
        <span class="visually-hidden">{{ 'notifications.unread' | translate }}</span>
      }
    </button>
  `,
  styles: `
    .item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: var(--space-3);
      align-items: start;
      inline-size: 100%;
      padding: var(--space-3) var(--space-4);
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
      border-radius: var(--radius-control);

      &:hover {
        background: var(--surface-hover);
      }
    }

    .icon {
      display: grid;
      place-items: center;
      inline-size: 36px;
      block-size: 36px;
      border-radius: 10px;
      background: var(--info-soft);
      color: var(--info);

      &[data-severity='WARNING'] {
        background: var(--warning-soft);
        color: var(--warning);
      }

      &[data-severity='CRITICAL'] {
        background: var(--danger-soft);
        color: var(--danger);
      }

      mat-icon {
        font-size: 20px;
        inline-size: 20px;
        block-size: 20px;
      }
    }

    .text {
      display: grid;
      gap: 2px;
      min-inline-size: 0;
    }

    .title {
      font-weight: 600;
    }

    .unread .title {
      font-weight: 700;
    }

    .body {
      color: var(--ink-muted);
      font-size: var(--text-sm);
      overflow-wrap: anywhere;
    }

    .time {
      color: var(--ink-faint);
      font-size: var(--text-xs);
    }

    .dot {
      inline-size: 9px;
      block-size: 9px;
      margin-block-start: 6px;
      border-radius: 50%;
      background: var(--signal-500);
      box-shadow: 0 0 0 3px rgb(255 194 51 / 25%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent {
  readonly notification = input.required<NotificationFieldsFragment>();
  readonly opened = output<NotificationFieldsFragment>();

  protected readonly language = inject(LanguageService).current;
  protected readonly icon = computed(() => ICONS[this.notification().kind] ?? 'notifications');
  protected readonly params = computed(() =>
    Object.fromEntries(
      this.notification().params.map(param => [param.key, formatValue(param.value, this.language().code)]),
    ),
  );
}
