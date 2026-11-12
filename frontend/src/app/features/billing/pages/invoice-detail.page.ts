import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  InvoiceGQL,
  IssueInvoiceGQL,
  MarkInvoicePaidGQL,
  PaymentMethod,
  VoidInvoiceGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { InvoiceDocumentComponent } from '../components/invoice-document.component';

const PAYMENT_METHODS: readonly PaymentMethod[] = ['CASH', 'CARD', 'BANK_TRANSFER'];
const PAYMENT_TERMS = [0, 15, 30, 45, 60] as const;

@Component({
  selector: 'app-invoice-detail-page',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    InvoiceDocumentComponent,
  ],
  templateUrl: './invoice-detail.page.html',
  styles: `
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: var(--space-6);
      align-items: start;

      @media (max-width: 1100px) {
        grid-template-columns: 1fr;
      }
    }

    .actions {
      position: sticky;
      inset-block-start: calc(var(--topbar-height) + var(--space-4));
      display: grid;
      gap: var(--space-3);

      button,
      a,
      mat-form-field {
        inline-size: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailPage {
  readonly id = input.required<string>();

  protected readonly methods = PAYMENT_METHODS;
  protected readonly terms = PAYMENT_TERMS;
  protected readonly paymentTerm = signal<number>(30);
  protected readonly busy = signal(false);

  private readonly invoiceGql = inject(InvoiceGQL);
  private readonly issueGql = inject(IssueInvoiceGQL);
  private readonly payGql = inject(MarkInvoicePaidGQL);
  private readonly voidGql = inject(VoidInvoiceGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);

  protected readonly invoice = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.invoiceGql.fetch(params).pipe(map(result => result.data.invoice)),
  });

  protected async issue(): Promise<void> {
    await this.run(this.issueGql.mutate({ id: this.id(), paymentTermDays: this.paymentTerm() }), 'billing.issued');
  }

  protected async markPaid(method: PaymentMethod): Promise<void> {
    await this.run(this.payGql.mutate({ id: this.id(), method }), 'billing.paid');
  }

  protected async voidInvoice(): Promise<void> {
    const reason = await this.confirm.prompt('billing.voidTitle', 'billing.voidReason', 'billing.void');
    if (reason) {
      await this.run(this.voidGql.mutate({ id: this.id(), reason }), 'billing.voided');
    }
  }

  protected print(): void {
    window.print();
  }

  private async run(operation: Parameters<Notifier['track']>[0], successKey: string): Promise<void> {
    this.busy.set(true);
    if (await this.notifier.track(operation, successKey)) {
      this.invoice.reload();
    }
    this.busy.set(false);
  }
}
