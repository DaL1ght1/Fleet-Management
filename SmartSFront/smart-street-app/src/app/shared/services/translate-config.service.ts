import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  public readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    {code:'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  private readonly storageKey = 'smart-street-language';

  constructor(private translateService: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem(this.storageKey);
    let languageToUse = 'en'; // Default language

    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      languageToUse = savedLanguage;
    } else {
      // Try to detect browser language
      const browserLang = this.translateService.getBrowserLang();
      if (browserLang && this.isLanguageSupported(browserLang)) {
        languageToUse = browserLang;
      }
    }

    this.setLanguage(languageToUse);
  }

  public setLanguage(languageCode: string): void {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported. Falling back to English.`);
      languageCode = 'en';
    }

    this.translateService.setDefaultLang('en');
    this.translateService.use(languageCode);
    this.currentLanguageSubject.next(languageCode);

    // Save preference
    localStorage.setItem(this.storageKey, languageCode);

    // Set HTML lang attribute for accessibility
    document.documentElement.lang = languageCode;
  }

  public getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  public getLanguageInfo(code: string): Language | undefined {
    return this.supportedLanguages.find(lang => lang.code === code);
  }

  public getCurrentLanguageInfo(): Language {
    const current = this.getCurrentLanguage();
    return this.getLanguageInfo(current) || this.supportedLanguages[0];
  }

  public isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  public translate(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  public instant(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  public translateAsync(key: string, params?: any): Promise<string> {
    return this.translateService.get(key, params).toPromise() || Promise.resolve(key);
  }
}
