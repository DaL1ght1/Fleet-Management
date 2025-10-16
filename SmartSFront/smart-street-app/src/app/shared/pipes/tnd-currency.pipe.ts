import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'tndCurrency',
  standalone: true
})
export class TndCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(
    value: number | string | null | undefined,
    showSymbol: boolean = true,
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 3
  ): string {
    if (value == null || value === '') {
      return showSymbol ? `0.00 ${this.currencyService.getCurrencyInfo().symbol}` : '0.00';
    }

    return this.currencyService.formatTND(value, {
      showSymbol,
      minimumFractionDigits,
      maximumFractionDigits
    });
  }
}

@Pipe({
  name: 'tndCompact',
  standalone: true
})
export class TndCompactPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') {
      return `0 ${this.currencyService.getCurrencyInfo().symbol}`;
    }

    return this.currencyService.formatCompactTND(value);
  }
}

@Pipe({
  name: 'tndRange',
  standalone: true
})
export class TndRangePipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(minValue: number | null | undefined, maxValue: number | null | undefined): string {
    if (minValue == null || maxValue == null) {
      return 'N/A';
    }

    return this.currencyService.formatPriceRange(minValue, maxValue);
  }
}