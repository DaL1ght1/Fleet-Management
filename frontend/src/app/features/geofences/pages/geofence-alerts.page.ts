import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  AcknowledgeAllGeofenceAlertsGQL,
  AcknowledgeGeofenceAlertGQL,
  GeofenceAlertsGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';

@Component({
  selector: 'app-geofence-alerts-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadStateComponent,
  ],
  templateUrl: './geofence-alerts.page.html',
  styleUrl: './geofence-alerts.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeofenceAlertsPage {
  protected readonly columns = ['severity', 'occurredAt', 'vehicle', 'type', 'zone', 'speed', 'actions'];
  protected readonly openOnly = signal(true);
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly alertsGql = inject(GeofenceAlertsGQL);
  private readonly acknowledgeGql = inject(AcknowledgeGeofenceAlertGQL);
  private readonly acknowledgeAllGql = inject(AcknowledgeAllGeofenceAlertsGQL);
  private readonly notifier = inject(Notifier);

  protected readonly alerts = rxResource({
    params: () => ({
      filter: { acknowledged: this.openOnly() ? false : null },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.alertsGql.fetch(params).pipe(map(result => result.data.geofenceAlerts)),
  });

  protected readonly rows = computed(() => this.alerts.value()?.items ?? []);
  protected readonly total = computed(() => this.alerts.value()?.totalCount ?? 0);

  protected changeOpenOnly(value: boolean): void {
    this.openOnly.set(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected async acknowledge(id: string): Promise<void> {
    if (await this.notifier.track(this.acknowledgeGql.mutate({ id }), 'geofences.acknowledged')) {
      this.alerts.reload();
    }
  }

  protected async acknowledgeAll(): Promise<void> {
    if (await this.notifier.track(this.acknowledgeAllGql.mutate(), 'geofences.acknowledged')) {
      this.alerts.reload();
    }
  }
}
