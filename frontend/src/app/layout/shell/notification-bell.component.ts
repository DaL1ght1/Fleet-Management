import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import { MyNotificationsGQL } from '../../core/graphql/generated';
import { NotificationCenter } from '../../features/notifications/notification-center.service';
import { NotificationItemComponent } from '../../features/notifications/notification-item.component';

const PREVIEW_SIZE = 6;

@Component({
  selector: 'app-notification-bell',
  imports: [
    RouterLink,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslatePipe,
    NotificationItemComponent,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="panel"
      (menuOpened)="open.set(true)"
      (menuClosed)="open.set(false)"
      [matTooltip]="'notifications.title' | translate"
      [attr.aria-label]="'notifications.bellLabel' | translate: { count: center.unread() }"
    >
      <mat-icon
        [matBadge]="center.unread() > 99 ? '99+' : center.unread()"
        [matBadgeHidden]="center.unread() === 0"
        matBadgeSize="small"
        aria-hidden="false"
        >notifications</mat-icon
      >
    </button>
    <mat-menu #panel="matMenu" xPosition="before" class="notification-panel">
      <div class="panel" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="presentation">
        <header>
          <h2>{{ 'notifications.title' | translate }}</h2>
          @if (center.unread() > 0) {
            <button mat-button (click)="center.markAllRead()">{{ 'notifications.markAllRead' | translate }}</button>
          }
        </header>
        @if (latest.isLoading() && !latest.hasValue()) {
          <div class="state"><mat-spinner diameter="28" /></div>
        } @else if (!latest.value()?.length) {
          <div class="state">
            <mat-icon>notifications_off</mat-icon>
            <p>{{ 'notifications.empty' | translate }}</p>
          </div>
        } @else {
          <div class="list">
            @for (item of latest.value(); track item.id) {
              <app-notification-item [notification]="item" (opened)="center.open($event)" />
            }
          </div>
        }
        <a mat-stroked-button routerLink="/notifications" class="all">{{ 'notifications.seeAll' | translate }}</a>
      </div>
    </mat-menu>
  `,
  styles: `
    .panel {
      display: grid;
      gap: var(--space-2);
      inline-size: min(92vw, 400px);
      padding: var(--space-2) var(--space-2) var(--space-3);
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-2) 0 var(--space-3);
    }

    .list {
      display: grid;
      max-block-size: 420px;
      overflow-y: auto;
    }

    .state {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      padding: var(--space-8) var(--space-4);
      color: var(--ink-muted);
    }

    .all {
      margin-inline: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent {
  protected readonly center = inject(NotificationCenter);
  private readonly notificationsGql = inject(MyNotificationsGQL);
  protected readonly open = signal(false);

  protected readonly latest = rxResource({
    params: () => ({ open: this.open(), revision: this.center.revision() }),
    stream: ({ params }) =>
      params.open
        ? this.notificationsGql
            .fetch({ unreadOnly: false, page: 0, size: PREVIEW_SIZE })
            .pipe(map(result => result.data.myNotifications.items))
        : of(undefined),
  });
}
