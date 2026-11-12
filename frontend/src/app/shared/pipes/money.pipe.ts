import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

const CURRENCY = 'TND';

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly language = inject(LanguageService);
  private formatter: Intl.NumberFormat | null = null;
  private formatterLocale = '';

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    const locale = this.language.current().code;
    if (this.formatter === null || this.formatterLocale !== locale) {
      this.formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: CURRENCY });
      this.formatterLocale = locale;
    }
    return this.formatter.format(value);
  }
}
