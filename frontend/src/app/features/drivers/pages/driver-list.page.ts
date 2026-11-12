import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
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
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { DriverStatus, DriversGQL } from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { debounced } from '../../../shared/util/debounced';
import { DRIVER_STATUSES } from '../driver-options';

@Component({
  selector: 'app-driver-list-page',
  imports: [
    DatePipe,
    DecimalPipe,
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
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
  ],
  templateUrl: './driver-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverListPage {
  protected readonly roles = Roles;
  protected readonly statuses = DRIVER_STATUSES;
  protected readonly columns = ['name', 'contact', 'license', 'status', 'availability', 'rating', 'trips'];

  protected readonly search = signal('');
  protected readonly status = signal<DriverStatus | null>(null);
  protected readonly availableOnly = signal(false);
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly driversGql = inject(DriversGQL);
  private readonly router = inject(Router);
  private readonly debouncedSearch = debounced(this.search);

  protected readonly drivers = rxResource({
    params: () => ({
      filter: {
        search: this.debouncedSearch() || null,
        status: this.status(),
        available: this.availableOnly() ? true : null,
      },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.driversGql.fetch(params).pipe(map(result => result.data.drivers)),
  });

  protected readonly rows = computed(() => this.drivers.value()?.items ?? []);
  protected readonly total = computed(() => this.drivers.value()?.totalCount ?? 0);

  protected changeFilter<T>(setter: (value: T) => void, value: T): void {
    setter(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/drivers', id]);
  }
}
