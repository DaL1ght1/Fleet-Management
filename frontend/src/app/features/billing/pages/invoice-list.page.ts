import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { BillingStatisticsGQL, InvoiceFilter, InvoicesGQL } from '../../../core/graphql/generated';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { OutcomePanelComponent } from '../components/outcome-panel.component';

type View = 'all' | 'drafts' | 'outstanding' | 'overdue' | 'paid';

const FILTERS: Record<View, InvoiceFilter | null> = {
  all: null,
  drafts: { status: 'DRAFT' },
  outstanding: { status: 'ISSUED' },
  overdue: { overdue: true },
  paid: { status: 'PAID' },
};

@Component({
  selector: 'app-invoice-list-page',
  imports: [
    DatePipe,
    RouterLink,
    OutcomePanelComponent,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './invoice-list.page.html',
  styleUrl: './invoice-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceListPage {
  readonly tab = input<string>();

  protected readonly views: readonly View[] = ['all', 'drafts', 'outstanding', 'overdue', 'paid'];
  protected readonly columns = ['number', 'customer', 'vehicle', 'createdAt', 'dueDate', 'status', 'total'];

  protected readonly view = signal<View>('all');
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly invoicesGql = inject(InvoicesGQL);
  private readonly statisticsGql = inject(BillingStatisticsGQL);
  private readonly router = inject(Router);

  protected readonly statistics = rxResource({
    stream: () => this.statisticsGql.fetch().pipe(map(result => result.data.billingStatistics)),
  });

  protected readonly invoices = rxResource({
    params: () => ({ filter: FILTERS[this.view()], page: this.page(), size: this.size() }),
    stream: ({ params }) => this.invoicesGql.fetch(params).pipe(map(result => result.data.invoices)),
  });

  protected readonly rows = computed(() => this.invoices.value()?.items ?? []);
  protected readonly total = computed(() => this.invoices.value()?.totalCount ?? 0);

  protected show(view: View): void {
    this.view.set(view);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/billing', id]);
  }
}
