import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly currencyCode = 'TND';
  private readonly currencySymbol = 'د.ت'; // Tunisian Dinar symbol
  private readonly locale = 'ar-TN'; // Arabic Tunisia locale

  /**
   * Format amount as Tunisian Dinar currency
   * @param amount - The amount to format
   * @param options
   * @returns Formatted currency string
   */
  formatTND(
    amount: number | string,
    options: {
      showSymbol?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      useIntlFormat?: boolean;
    } = {}
  ): string {
    const {
      showSymbol = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 3,
      useIntlFormat = true
    } = options;

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return showSymbol ? `0.00 ${this.currencySymbol}` : '0.00';
    }

    if (useIntlFormat) {
      try {
        const formatter = new Intl.NumberFormat(this.locale, {
          style: 'currency',
          currency: this.currencyCode,
          minimumFractionDigits,
          maximumFractionDigits,
        });
        return formatter.format(numericAmount);
      } catch (error) {
        // Fallback if locale is not supported
        return this.formatTNDFallback(numericAmount, showSymbol, minimumFractionDigits);
      }
    }

    return this.formatTNDFallback(numericAmount, showSymbol, minimumFractionDigits);
  }

  /**
   * Fallback formatting method
   */
  private formatTNDFallback(
    amount: number,
    showSymbol: boolean,
    fractionDigits: number
  ): string {
    const formatted = amount.toFixed(fractionDigits);
    const parts = formatted.split('.');
    const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const fractionalPart = parts[1] || '00';

    const result = `${wholePart}.${fractionalPart}`;
    return showSymbol ? `${result} ${this.currencySymbol}` : result;
  }

  /**
   * Format amount with compact notation for large numbers
   * @param amount - The amount to format
   * @returns Formatted string (e.g., "1.2K TND", "1.5M TND")
   */
  formatCompactTND(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return `0 ${this.currencySymbol}`;
    }

    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currencyCode,
        notation: 'compact',
        maximumFractionDigits: 1,
      });
      return formatter.format(numericAmount);
    } catch (error) {
      // Fallback for compact formatting
      if (numericAmount >= 1000000) {
        return `${(numericAmount / 1000000).toFixed(1)}M ${this.currencySymbol}`;
      } else if (numericAmount >= 1000) {
        return `${(numericAmount / 1000).toFixed(1)}K ${this.currencySymbol}`;
      }
      return this.formatTND(numericAmount);
    }
  }

  /**
   * Parse currency string to number
   * @param currencyString - String containing currency amount
   * @returns Numeric value or null if parsing fails
   */
  parseTND(currencyString: string): number | null {
    if (!currencyString) return null;

    // Remove currency symbols, spaces, and commas
    const cleanString = currencyString
      .replace(this.currencySymbol, '')
      .replace(/[^\d.-]/g, '')
      .trim();

    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Get currency information
   */
  getCurrencyInfo() {
    return {
      code: this.currencyCode,
      symbol: this.currencySymbol,
      name: 'Tunisian Dinar',
      nameAr: 'الدينار التونسي',
      locale: this.locale,
      symbolPosition: 'after', // In Tunisia, symbol typically comes after the amount
      decimalSeparator: '.',
      thousandsSeparator: ','
    };
  }

  /**
   * Convert between different currencies (if needed for international features)
   * This is a placeholder - would need real exchange rate API in production
   */
  convertToTND(amount: number, fromCurrency: string): number {
    // This would typically call an exchange rate service
    // For now, return the amount as-is (1:1 conversion)
    return amount;
  }

  /**
   * Format price range
   * @param minAmount - Minimum amount
   * @param maxAmount - Maximum amount
   * @returns Formatted range string
   */
  formatPriceRange(minAmount: number, maxAmount: number): string {
    const min = this.formatTND(minAmount, { showSymbol: false });
    const max = this.formatTND(maxAmount, { showSymbol: true });
    return `${min} - ${max}`;
  }

  /**
   * Calculate percentage of amount
   * @param amount - Base amount
   * @param percentage - Percentage to calculate
   * @returns Formatted percentage amount
   */
  calculatePercentage(amount: number, percentage: number): string {
    const result = (amount * percentage) / 100;
    return this.formatTND(result);
  }

  /**
   * Add tax to amount
   * @param amount - Base amount
   * @param taxRate - Tax rate as percentage (e.g., 18 for 18%)
   * @returns Object with base amount, tax amount, and total
   */
  addTax(amount: number, taxRate: number = 18) {
    const baseAmount = amount;
    const taxAmount = (amount * taxRate) / 100;
    const totalAmount = baseAmount + taxAmount;

    return {
      baseAmount: this.formatTND(baseAmount),
      taxAmount: this.formatTND(taxAmount),
      totalAmount: this.formatTND(totalAmount),
      taxRate: `${taxRate}%`,
      rawValues: {
        baseAmount,
        taxAmount,
        totalAmount
      }
    };
  }
}
