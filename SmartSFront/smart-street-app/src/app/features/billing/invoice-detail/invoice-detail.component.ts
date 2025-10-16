import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="invoice-detail-container">
      <div class="header-section">
        <button mat-stroked-button routerLink="/billing">
          <mat-icon>arrow_back</mat-icon>
          {{ 'app.back' | translate }}
        </button>
        <h1>{{ 'billing.invoice' | translate }}</h1>
      </div>
      <mat-card class="coming-soon-card">
        <mat-card-content>
          <div class="coming-soon-content">
            <mat-icon>info</mat-icon>
            <h2>Invoice Details Coming Soon</h2>
            <p>Detailed invoice information will be displayed here.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-detail-container { padding: 24px; }
    .header-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header-section h1 { margin: 0; font-size: 2rem; font-weight: 400; }
    .coming-soon-card { text-align: center; padding: 48px 24px; }
    .coming-soon-content mat-icon { font-size: 72px; width: 72px; height: 72px; color: rgba(0, 0, 0, 0.3); margin-bottom: 24px; }
  `]
})
export class InvoiceDetailComponent {
}
