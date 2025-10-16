import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
    <div class="billing-container">
      <div class="header-section">
        <div class="title-section">
          <h1>{{ 'billing.title' | translate }}</h1>
          <p>{{ 'billing.subtitle' | translate }}</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" routerLink="/billing/new">
            <mat-icon>add</mat-icon>
            {{ 'app.create' | translate }} {{ 'billing.invoice' | translate }}
          </button>
        </div>
      </div>

      <mat-card class="coming-soon-card">
        <mat-card-content>
          <div class="coming-soon-content">
            <mat-icon>receipt</mat-icon>
            <h2>{{ 'billing.title' | translate }}</h2>
            <p>Invoice and billing management features coming soon. Create, track, and manage your fleet billing efficiently.</p>
            <div class="feature-list">
              <div class="feature-item">
                <mat-icon>receipt_long</mat-icon>
                <span>Invoice Generation</span>
              </div>
              <div class="feature-item">
                <mat-icon>payment</mat-icon>
                <span>Payment Tracking</span>
              </div>
              <div class="feature-item">
                <mat-icon>analytics</mat-icon>
                <span>Revenue Analytics</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .billing-container {
      padding: 24px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      
      .title-section {
        h1 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 400;
        }
        
        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 1.1rem;
        }
      }
    }

    .coming-soon-card {
      text-align: center;
      padding: 48px 24px;
      
      .coming-soon-content {
        max-width: 600px;
        margin: 0 auto;
        
        > mat-icon {
          font-size: 72px;
          width: 72px;
          height: 72px;
          color: rgba(0, 0, 0, 0.3);
          margin-bottom: 24px;
        }
        
        h2 {
          margin: 0 0 16px 0;
          font-size: 1.8rem;
          font-weight: 400;
        }
        
        p {
          margin: 0 0 32px 0;
          font-size: 1.1rem;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.6);
        }
      }
      
      .feature-list {
        display: flex;
        justify-content: center;
        gap: 32px;
        flex-wrap: wrap;
        
        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          
          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: var(--mdc-theme-primary, #1976d2);
          }
          
          span {
            font-size: 0.875rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.7);
          }
        }
      }
    }

    @media (max-width: 768px) {
      .billing-container {
        padding: 16px;
      }
      
      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .feature-list {
        gap: 24px;
      }
    }
  `]
})
export class BillingListComponent {
}
