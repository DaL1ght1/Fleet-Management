import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { InvoiceDocumentFragment, MyInvoicesGQL } from '../../core/graphql/generated';
import { AuthService } from '../../core/auth/auth.service';
import { InvoiceDocumentComponent } from '../billing/components/invoice-document.component';
import { LoadStateComponent } from '../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-my-invoices-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    InvoiceDocumentComponent,
    LoadStateComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './my-invoices.page.html',
  styleUrl: './my-invoices.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyInvoicesPage {
  private readonly myInvoicesGql = inject(MyInvoicesGQL);
  private readonly auth = inject(AuthService);

  protected readonly size = signal(PAGE_SIZE);
  protected readonly selectedId = signal<string | null>(null);

  protected readonly invoices = rxResource({
    params: () => ({ page: 0, size: this.size() }),
    stream: ({ params }) => this.myInvoicesGql.fetch(params).pipe(map(result => result.data.myInvoices)),
  });

  protected readonly items = computed(() => this.invoices.value()?.items ?? []);
  protected readonly selected = computed<InvoiceDocumentFragment | null>(
    () => this.items().find(invoice => invoice.id === this.selectedId()) ?? this.items()[0] ?? null,
  );
  protected readonly toPay = computed(() =>
    this.items()
      .filter(invoice => invoice.status === 'ISSUED')
      .reduce((sum, invoice) => sum + invoice.total, 0),
  );
  protected readonly overdueCount = computed(() => this.items().filter(invoice => invoice.overdue).length);
  protected readonly billTo = computed(() => {
    const account = this.auth.account();
    return account ? { fullName: this.auth.displayName(), email: account.email } : null;
  });

  protected select(invoice: InvoiceDocumentFragment): void {
    this.selectedId.set(invoice.id);
  }

  protected print(): void {
    window.print();
  }

  protected showMore(): void {
    this.size.update(size => size + PAGE_SIZE);
  }
}
