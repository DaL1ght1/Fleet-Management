import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  ExpenseKind,
  ExpenseStatus,
  ExpensesGQL,
  OutcomeGQL,
  PayExpenseGQL,
  PaymentMethod,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

const PAYMENT_METHODS: readonly PaymentMethod[] = ['BANK_TRANSFER', 'CASH', 'CARD'];

@Component({
  selector: 'app-outcome-panel',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    TranslatePipe,
    LoadStateComponent,
    StatCardComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './outcome-panel.component.html',
  styleUrl: './outcome-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutcomePanelComponent {
  protected readonly methods = PAYMENT_METHODS;
  protected readonly kinds: readonly (ExpenseKind | null)[] = [null, 'MAINTENANCE', 'SALARY'];
  protected readonly statuses: readonly (ExpenseStatus | null)[] = ['UNPAID', 'PAID', null];
  protected readonly columns = ['description', 'kind', 'related', 'dueDate', 'status', 'amount', 'actions'];

  protected readonly kind = signal<ExpenseKind | null>(null);
  protected readonly status = signal<ExpenseStatus | null>('UNPAID');
  protected readonly page = signal(0);
  protected readonly size = signal(20);
  protected readonly paying = signal<string | null>(null);

  private readonly outcomeGql = inject(OutcomeGQL);
  private readonly expensesGql = inject(ExpensesGQL);
  private readonly payGql = inject(PayExpenseGQL);
  private readonly notifier = inject(Notifier);

  protected readonly outcome = rxResource({
    stream: () => this.outcomeGql.fetch().pipe(map(result => result.data)),
  });

  protected readonly expenses = rxResource({
    params: () => ({
      filter: { kind: this.kind(), status: this.status() },
      page: this.page(),
      size: this.size(),
    }),
    stream: ({ params }) => this.expensesGql.fetch(params).pipe(map(result => result.data.expenses)),
  });

  protected readonly rows = computed(() => this.expenses.value()?.items ?? []);
  protected readonly total = computed(() => this.expenses.value()?.totalCount ?? 0);
  protected readonly payrollTotal = computed(() =>
    (this.outcome.value()?.upcomingSalaries ?? []).reduce((sum, salary) => sum + salary.amount, 0),
  );
  protected readonly netThisMonth = computed(() => {
    const outcome = this.outcome.value();
    return outcome ? outcome.billingStatistics.collectedThisMonth - outcome.expenseStatistics.paidThisMonth : 0;
  });

  protected showKind(kind: ExpenseKind | null): void {
    this.kind.set(kind);
    this.page.set(0);
  }

  protected showStatus(status: ExpenseStatus | null): void {
    this.status.set(status);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected async pay(id: string, method: PaymentMethod): Promise<void> {
    this.paying.set(id);
    if (await this.notifier.track(this.payGql.mutate({ id, method }), 'outcome.paid')) {
      this.expenses.reload();
      this.outcome.reload();
    }
    this.paying.set(null);
  }
}
