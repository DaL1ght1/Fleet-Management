import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  MaintenanceStatisticsGQL,
  WorkOrderKind,
  WorkOrderStatus,
  WorkOrdersGQL,
} from '../../../core/graphql/generated';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { WORK_ORDER_KINDS, WORK_ORDER_STATUSES } from '../maintenance-options';

@Component({
  selector: 'app-work-order-list-page',
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './work-order-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderListPage {
  protected readonly kinds = WORK_ORDER_KINDS;
  protected readonly statuses = WORK_ORDER_STATUSES;
  protected readonly columns = ['title', 'vehicle', 'kind', 'priority', 'scheduledFor', 'status', 'totalCost'];

  protected readonly status = signal<WorkOrderStatus | null>(null);
  protected readonly kind = signal<WorkOrderKind | null>(null);
  protected readonly overdueOnly = signal(false);
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly workOrdersGql = inject(WorkOrdersGQL);
  private readonly statisticsGql = inject(MaintenanceStatisticsGQL);
  private readonly router = inject(Router);

  protected readonly statistics = rxResource({
    stream: () => this.statisticsGql.fetch().pipe(map(result => result.data.maintenanceStatistics)),
  });

  protected readonly workOrders = rxResource({
    params: () => ({
      filter: { status: this.status(), kind: this.kind(), overdue: this.overdueOnly() ? true : null },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.workOrdersGql.fetch(params).pipe(map(result => result.data.workOrders)),
  });

  protected readonly rows = computed(() => this.workOrders.value()?.items ?? []);
  protected readonly total = computed(() => this.workOrders.value()?.totalCount ?? 0);

  protected changeFilter<T>(setter: (value: T) => void, value: T): void {
    setter(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/maintenance', id]);
  }
}
