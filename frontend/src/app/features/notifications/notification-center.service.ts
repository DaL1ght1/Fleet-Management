import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of, switchMap, timer } from 'rxjs';
import {
  MarkAllNotificationsReadGQL,
  MarkNotificationReadGQL,
  NotificationFieldsFragment,
  UnreadNotificationCountGQL,
} from '../../core/graphql/generated';

const POLL_INTERVAL_MS = 30_000;

@Injectable()
export class NotificationCenter {
  private readonly unreadGql = inject(UnreadNotificationCountGQL);
  private readonly markReadGql = inject(MarkNotificationReadGQL);
  private readonly markAllGql = inject(MarkAllNotificationsReadGQL);
  private readonly router = inject(Router);
  private readonly unreadState = signal(0);
  private readonly revisionState = signal(0);

  readonly unread = this.unreadState.asReadonly();
  readonly revision = this.revisionState.asReadonly();

  constructor() {
    timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.unreadGql.fetch().pipe(
            map(result => result.data.unreadNotificationCount),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(count => {
        if (count !== null && count !== this.unreadState()) {
          this.unreadState.set(count);
          this.revisionState.update(revision => revision + 1);
        }
      });
  }

  async open(notification: NotificationFieldsFragment): Promise<void> {
    if (!notification.read) {
      await firstValueFrom(this.markReadGql.mutate({ id: notification.id })).catch(() => null);
      this.unreadState.update(count => Math.max(0, count - 1));
      this.revisionState.update(revision => revision + 1);
    }
    if (notification.link) {
      await this.router.navigateByUrl(notification.link);
    }
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(this.markAllGql.mutate()).catch(() => null);
    this.unreadState.set(0);
    this.revisionState.update(revision => revision + 1);
  }
}
