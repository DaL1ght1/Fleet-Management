import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  code: string;
  label: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: readonly Language[] = [
  { code: 'en', label: 'English', direction: 'ltr' },
  { code: 'fr', label: 'Français', direction: 'ltr' },
  { code: 'ar', label: 'العربية', direction: 'rtl' },
  { code: 'es', label: 'Español', direction: 'ltr' },
];

const STORAGE_KEY = 'smartstreet.language';
const DEFAULT_LANGUAGE = LANGUAGES[0];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly currentState = signal(DEFAULT_LANGUAGE);

  readonly current = this.currentState.asReadonly();

  init(): void {
    this.translate.setFallbackLang(DEFAULT_LANGUAGE.code);
    this.use(this.storedCode() ?? this.browserCode() ?? DEFAULT_LANGUAGE.code);
  }

  use(code: string): void {
    const language = LANGUAGES.find(candidate => candidate.code === code) ?? DEFAULT_LANGUAGE;
    this.translate.use(language.code);
    this.currentState.set(language);
    this.document.documentElement.lang = language.code;
    this.document.documentElement.dir = language.direction;
    this.store(language.code);
  }

  private browserCode(): string | null {
    const code = navigator.language?.slice(0, 2);
    return LANGUAGES.some(language => language.code === code) ? code : null;
  }

  private storedCode(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private store(code: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      return;
    }
  }
}
