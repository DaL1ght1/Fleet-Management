import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { FuelType, VehicleStatus, VehiclesGQL } from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { debounced } from '../../../shared/util/debounced';
import { FUEL_TYPES, VEHICLE_STATUSES } from '../vehicle-options';

@Component({
  selector: 'app-vehicle-list-page',
  imports: [
    DecimalPipe,
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
    MatSlideToggleModule,
    MatTooltipModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
    MoneyPipe,
  ],
  templateUrl: './vehicle-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListPage {
  protected readonly roles = Roles;
  protected readonly statuses = VEHICLE_STATUSES;
  protected readonly fuelTypes = FUEL_TYPES;
  protected readonly columns = [
    'licensePlate',
    'vehicle',
    'status',
    'fuelType',
    'mileage',
    'dailyRate',
    'nextMaintenance',
  ];

  protected readonly search = signal('');
  protected readonly status = signal<VehicleStatus | null>(null);
  protected readonly fuelType = signal<FuelType | null>(null);
  protected readonly maintenanceDue = signal(false);
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly vehiclesGql = inject(VehiclesGQL);
  private readonly router = inject(Router);
  private readonly debouncedSearch = debounced(this.search);

  protected readonly vehicles = rxResource({
    params: () => ({
      filter: {
        search: this.debouncedSearch() || null,
        status: this.status(),
        fuelType: this.fuelType(),
        maintenanceDue: this.maintenanceDue() ? true : null,
      },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.vehiclesGql.fetch(params).pipe(map(result => result.data.vehicles)),
  });

  protected readonly rows = computed(() => this.vehicles.value()?.items ?? []);
  protected readonly total = computed(() => this.vehicles.value()?.totalCount ?? 0);

  protected changeFilter<T>(setter: (value: T) => void, value: T): void {
    setter(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/vehicles', id]);
  }
}
