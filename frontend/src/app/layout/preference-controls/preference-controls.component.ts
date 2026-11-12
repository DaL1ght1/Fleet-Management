import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { LANGUAGES, LanguageService } from '../../core/i18n/language.service';
import { PreferencesService } from '../preferences.service';

@Component({
  selector: 'app-preference-controls',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslatePipe],
  template: `
    <button
      mat-icon-button
      (click)="preferences.toggleTheme()"
      [matTooltip]="'app.toggleTheme' | translate"
      [attr.aria-label]="'app.toggleTheme' | translate"
    >
      <mat-icon>{{ preferences.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
    <button
      mat-icon-button
      [matMenuTriggerFor]="languageMenu"
      [matTooltip]="'app.language' | translate"
      [attr.aria-label]="'app.language' | translate"
    >
      <mat-icon>translate</mat-icon>
    </button>
    <mat-menu #languageMenu="matMenu">
      @for (language of languages; track language.code) {
        <button mat-menu-item (click)="language.code !== current().code && languageService.use(language.code)">
          <mat-icon>{{ language.code === current().code ? 'check' : '' }}</mat-icon>
          <span [attr.lang]="language.code">{{ language.label }}</span>
        </button>
      }
    </mat-menu>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenceControlsComponent {
  protected readonly preferences = inject(PreferencesService);
  protected readonly languageService = inject(LanguageService);
  protected readonly languages = LANGUAGES;
  protected readonly current = this.languageService.current;
}
