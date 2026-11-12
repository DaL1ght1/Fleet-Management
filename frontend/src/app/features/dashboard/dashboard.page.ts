import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import {
  BillingStatisticsGQL,
  DriverStatisticsGQL,
  FleetStatisticsGQL,
  MaintenanceStatisticsGQL,
  TripStatisticsGQL,
  TripsGQL,
  UnacknowledgedAlertCountGQL,
} from '../../core/graphql/generated';
import { AuthService } from '../../core/auth/auth.service';
import { Roles } from '../../core/auth/roles';
import { HasRoleDirective } from '../../core/auth/has-role.directive';
import { LanguageService } from '../../core/i18n/language.service';
import { LoadStateComponent } from '../../shared/ui/load-state/load-state.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { FleetSegment, FleetStatusBarComponent } from './fleet-status-bar.component';

const UPCOMING_TRIPS = 6;

interface Attention {
  icon: string;
  key: string;
  count: number;
  link: string;
  tone: 'danger' | 'warning';
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    HasRoleDirective,
    LoadStateComponent,
    StatCardComponent,
    StatusChipComponent,
    MoneyPipe,
    FleetStatusBarComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly roles = Roles;

  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly fleetGql = inject(FleetStatisticsGQL);
  private readonly tripStatisticsGql = inject(TripStatisticsGQL);
  private readonly driverStatisticsGql = inject(DriverStatisticsGQL);
  private readonly maintenanceGql = inject(MaintenanceStatisticsGQL);
  private readonly billingGql = inject(BillingStatisticsGQL);
  private readonly tripsGql = inject(TripsGQL);
  private readonly alertCountGql = inject(UnacknowledgedAlertCountGQL);
  private readonly management = computed(() => this.auth.hasAnyRole(Roles.MANAGEMENT));

  protected readonly language = inject(LanguageService).current;
  protected readonly firstName = computed(() => this.auth.account()?.firstName ?? this.auth.displayName());
  protected readonly today = new Date();

  protected readonly fleet = rxResource({
    stream: () => this.fleetGql.fetch().pipe(map(result => result.data.fleetStatistics)),
  });

  protected readonly tripStatistics = rxResource({
    params: () => this.management(),
    stream: ({ params: allowed }) =>
      allowed ? this.tripStatisticsGql.fetch().pipe(map(result => result.data.tripStatistics)) : of(null),
  });

  protected readonly driverStatistics = rxResource({
    params: () => this.management(),
    stream: ({ params: allowed }) =>
      allowed ? this.driverStatisticsGql.fetch().pipe(map(result => result.data.driverStatistics)) : of(null),
  });

  protected readonly maintenance = rxResource({
    params: () => this.management(),
    stream: ({ params: allowed }) =>
      allowed
        ? this.maintenanceGql.fetch().pipe(
            map(result => result.data.maintenanceStatistics),
            catchError(() => of(null)),
          )
        : of(null),
  });

  protected readonly billing = rxResource({
    params: () => this.management(),
    stream: ({ params: allowed }) =>
      allowed
        ? this.billingGql.fetch().pipe(
            map(result => result.data.billingStatistics),
            catchError(() => of(null)),
          )
        : of(null),
  });

  protected readonly openAlerts = rxResource({
    stream: () =>
      this.alertCountGql.fetch().pipe(
        map(result => result.data.unacknowledgedAlertCount),
        catchError(() => of(0)),
      ),
  });

  protected readonly upcoming = rxResource({
    stream: () =>
      this.tripsGql
        .fetch({
          filter: { status: 'SCHEDULED', scheduledFrom: new Date().toISOString() },
          page: 0,
          size: UPCOMING_TRIPS,
        })
        .pipe(map(result => result.data.trips.items)),
  });

  protected readonly segments = computed<readonly FleetSegment[]>(() => {
    const fleet = this.fleet.value();
    if (!fleet) {
      return [];
    }
    return [
      { key: 'inUse', value: fleet.inUse },
      { key: 'available', value: Math.max(0, fleet.active - fleet.inUse) },
      { key: 'maintenance', value: fleet.inMaintenance },
      { key: 'inactive', value: fleet.inactive },
    ];
  });

  protected readonly utilization = computed(() => {
    const fleet = this.fleet.value();
    return fleet && fleet.active > 0 ? Math.round((fleet.inUse / fleet.active) * 100) : 0;
  });

  protected readonly fleetSummary = computed(() =>
    this.segments()
      .map(segment => `${this.translate.instant('dashboard.segments.' + segment.key)}: ${segment.value}`)
      .join(', '),
  );

  protected readonly attention = computed<readonly Attention[]>(() => {
    const items: Attention[] = [
      {
        icon: 'notifications_active',
        key: 'dashboard.attention.alerts',
        count: this.openAlerts.value() ?? 0,
        link: '/geofences/alerts',
        tone: 'danger',
      },
      {
        icon: 'build_circle',
        key: 'dashboard.attention.overdueMaintenance',
        count: this.maintenance.value()?.overdue ?? 0,
        link: '/maintenance',
        tone: 'danger',
      },
      {
        icon: 'event_busy',
        key: 'dashboard.attention.maintenanceDue',
        count: this.fleet.value()?.maintenanceDue ?? 0,
        link: '/vehicles',
        tone: 'warning',
      },
      {
        icon: 'running_with_errors',
        key: 'dashboard.attention.overdueInvoices',
        count: this.billing.value()?.overdueCount ?? 0,
        link: '/billing',
        tone: 'danger',
      },
      {
        icon: 'edit_document',
        key: 'dashboard.attention.draftInvoices',
        count: this.billing.value()?.drafts ?? 0,
        link: '/billing',
        tone: 'warning',
      },
      {
        icon: 'badge',
        key: 'dashboard.attention.licenses',
        count: this.driverStatistics.value()?.licensesExpiringSoon ?? 0,
        link: '/drivers',
        tone: 'warning',
      },
    ];
    return items.filter(item => item.count > 0);
  });
}
