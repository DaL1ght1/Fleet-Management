import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DateFieldComponent } from '../../../shared/forms/date-field.component';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { TripStatus, TripType, TripsGQL } from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { TRIP_STATUSES, TRIP_TYPES } from '../trip-options';

@Component({
  selector: 'app-trip-list-page',
  imports: [
    DateFieldComponent,
    DatePipe,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
    MoneyPipe,
  ],
  templateUrl: './trip-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripListPage {
  protected readonly roles = Roles;
  protected readonly statuses = TRIP_STATUSES;
  protected readonly types = TRIP_TYPES;
  protected readonly columns = ['schedule', 'route', 'vehicle', 'driver', 'type', 'status', 'cost'];

  protected readonly status = signal<TripStatus | null>(null);
  protected readonly type = signal<TripType | null>(null);
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly tripsGql = inject(TripsGQL);
  private readonly router = inject(Router);

  protected readonly trips = rxResource({
    params: () => ({
      filter: {
        status: this.status(),
        type: this.type(),
        scheduledFrom: this.from() ? new Date(this.from()).toISOString() : null,
        scheduledTo: this.to() ? new Date(`${this.to()}T23:59:59`).toISOString() : null,
      },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.tripsGql.fetch(params).pipe(map(result => result.data.trips)),
  });

  protected readonly rows = computed(() => this.trips.value()?.items ?? []);
  protected readonly total = computed(() => this.trips.value()?.totalCount ?? 0);

  protected changeFilter<T>(setter: (value: T) => void, value: T): void {
    setter(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/trips', id]);
  }
}
