import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { MyNotificationsGQL, NotificationFieldsFragment } from '../../core/graphql/generated';
import { LoadStateComponent } from '../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { NotificationCenter } from './notification-center.service';
import { NotificationItemComponent } from './notification-item.component';

const PAGE_SIZE = 25;
const DAY_MS = 86_400_000;

type Bucket = 'today' | 'week' | 'earlier';

@Component({
  selector: 'app-notifications-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    NotificationItemComponent,
  ],
  template: `
    <app-page-header [title]="'notifications.title' | translate" [subtitle]="'notifications.subtitle' | translate">
      <button mat-stroked-button (click)="markAll()" [disabled]="center.unread() === 0">
        <mat-icon>done_all</mat-icon>
        {{ 'notifications.markAllRead' | translate }}
      </button>
    </app-page-header>

    <div class="filters">
      <div class="segmented" role="group" [attr.aria-label]="'notifications.title' | translate">
        <button type="button" [attr.aria-pressed]="!unreadOnly()" (click)="unreadOnly.set(false)">
          {{ 'notifications.all' | translate }}
        </button>
        <button type="button" [attr.aria-pressed]="unreadOnly()" (click)="unreadOnly.set(true)">
          {{ 'notifications.unreadOnly' | translate: { count: center.unread() } }}
        </button>
      </div>
    </div>

    <app-load-state
      [loading]="notifications.isLoading() && !notifications.hasValue()"
      [failed]="notifications.status() === 'error'"
      [empty]="notifications.hasValue() && !groups().length"
      [emptyMessage]="'notifications.empty' | translate"
      emptyIcon="notifications_off"
      (retry)="notifications.reload()"
    >
      @for (group of groups(); track group.bucket) {
        <section class="group card">
          <h2>{{ 'notifications.buckets.' + group.bucket | translate }}</h2>
          @for (item of group.items; track item.id) {
            <app-notification-item [notification]="item" (opened)="open($event)" />
          }
        </section>
      }
      @if (notifications.value()?.hasNext) {
        <div class="more">
          <button mat-stroked-button (click)="size.set(size() + pageSize)">{{ 'common.showMore' | translate }}</button>
        </div>
      }
    </app-load-state>
  `,
  styles: `
    .group {
      display: grid;
      gap: 2px;
      margin-block-end: var(--space-4);
      padding: var(--space-4);

      h2 {
        padding: var(--space-1) var(--space-4) var(--space-2);
        font-size: var(--text-lg);
      }
    }

    .more {
      display: flex;
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  protected readonly center = inject(NotificationCenter);
  private readonly notificationsGql = inject(MyNotificationsGQL);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly unreadOnly = signal(false);
  protected readonly size = signal(PAGE_SIZE);

  protected readonly notifications = rxResource({
    params: () => ({ unreadOnly: this.unreadOnly(), size: this.size(), revision: this.center.revision() }),
    stream: ({ params }) =>
      this.notificationsGql
        .fetch({ unreadOnly: params.unreadOnly, page: 0, size: params.size })
        .pipe(map(result => result.data.myNotifications)),
  });

  protected readonly groups = computed(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const buckets = new Map<Bucket, NotificationFieldsFragment[]>();
    for (const item of this.notifications.value()?.items ?? []) {
      const time = new Date(item.createdAt).getTime();
      const bucket: Bucket = time >= startOfToday ? 'today' : time >= startOfToday - 6 * DAY_MS ? 'week' : 'earlier';
      buckets.set(bucket, [...(buckets.get(bucket) ?? []), item]);
    }
    return [...buckets.entries()].map(([bucket, items]) => ({ bucket, items }));
  });

  protected open(notification: NotificationFieldsFragment): void {
    void this.center.open(notification);
  }

  protected markAll(): void {
    void this.center.markAllRead();
  }
}
