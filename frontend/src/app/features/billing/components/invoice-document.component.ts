import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { InvoiceDocumentFragment } from '../../../core/graphql/generated';
import { BrandMarkComponent } from '../../../shared/ui/brand-mark/brand-mark.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

export interface BillTo {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
}

@Component({
  selector: 'app-invoice-document',
  imports: [DatePipe, DecimalPipe, PercentPipe, TranslatePipe, BrandMarkComponent, StatusChipComponent, MoneyPipe],
  templateUrl: './invoice-document.component.html',
  styleUrl: './invoice-document.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDocumentComponent {
  readonly invoice = input.required<InvoiceDocumentFragment>();
  readonly billTo = input<BillTo | null>(null);
}
