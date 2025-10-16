import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateConfigService, Language } from '../../services/translate-config.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="languageMenu"
      [attr.aria-label]="'Change language' | translate"
      class="language-selector">
      <span class="flag">{{ currentLanguage.flag }}</span>
    </button>

    <mat-menu #languageMenu="matMenu" class="language-menu">
      <button 
        mat-menu-item 
        *ngFor="let language of supportedLanguages"
        (click)="selectLanguage(language.code)"
        [class.active]="language.code === currentLanguage.code">
        <span class="flag">{{ language.flag }}</span>
        <span class="language-name">{{ language.name }}</span>
        <mat-icon *ngIf="language.code === currentLanguage.code" class="check-icon">check</mat-icon>
      </button>
    </mat-menu>
  `,
  styles: [`
    .language-selector {
      .flag {
        font-size: 1.2em;
        display: inline-block;
      }
    }

    .language-menu {
      .mat-mdc-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 48px;

        .flag {
          font-size: 1.1em;
          min-width: 24px;
        }

        .language-name {
          flex: 1;
        }

        .check-icon {
          color: var(--mdc-theme-primary, #1976d2);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &.active {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }
    }

    :host-context(.dark-theme) .language-menu .mat-mdc-menu-item.active {
      background-color: rgba(255, 255, 255, 0.08);
    }
  `]
})
export class LanguageSelectorComponent {
  private translateConfigService = inject(TranslateConfigService);

  currentLanguage: Language = this.translateConfigService.getCurrentLanguageInfo();
  supportedLanguages: Language[] = this.translateConfigService.supportedLanguages;

  constructor() {
    // Subscribe to language changes
    this.translateConfigService.currentLanguage$.subscribe(languageCode => {
      this.currentLanguage = this.translateConfigService.getLanguageInfo(languageCode) 
        || this.supportedLanguages[0];
    });
  }

  selectLanguage(languageCode: string): void {
    this.translateConfigService.setLanguage(languageCode);
  }
}
