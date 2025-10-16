import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppStateService } from '../../core/state/app-state.service';
import { KeycloakService } from '../../core/services/keycloak.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { CurrencyService } from '../../core/services/currency.service';

interface KPICard {
  titleKey: string;
  title?: string;
  value: string | number;
  changeKey?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <section class="dashboard view">
      <header class="hero">
        <div class="hero__content">
          <h1 class="hero__title">{{ 'dashboard.title' | translate }}, {{ displayName() }}!</h1>
          <p class="hero__subtitle">{{ 'dashboard.subtitle' | translate }}</p>
          <div class="hero__actions">
            <button mat-raised-button color="primary" (click)="navigateToAddVehicle()">
              <mat-icon>directions_car</mat-icon>
              {{ 'dashboard.addVehicle' | translate }}
            </button>
            <button mat-stroked-button (click)="navigateToNewTrip()">
              <mat-icon>map</mat-icon>
              {{ 'trips.newTrip' | translate }}
            </button>
            <button mat-stroked-button (click)="navigateToAddDriver()">
              <mat-icon>person_add</mat-icon>
              {{ 'dashboard.addDriver' | translate }}
            </button>
          </div>
        </div>
      </header>

      <div class="kpis" *ngIf="!isLoading(); else loadingTemplate">
        <mat-card class="kpi" *ngFor="let kpi of kpiCards()">
          <mat-card-content>
            <div class="kpi__content">
              <div class="kpi__icon"><mat-icon>{{ kpi.icon }}</mat-icon></div>
              <div class="kpi__details">
                <div class="kpi__value">{{ kpi.value }}</div>
                <div class="kpi__label">{{ kpi.titleKey | translate }}</div>
                <div class="kpi__change" *ngIf="kpi.changeKey || kpi.change">
                  {{ (kpi.changeKey ? (kpi.changeKey | translate) : kpi.change) }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading"><mat-spinner></mat-spinner><p>{{ 'app.loading' | translate }}</p></div>
      </ng-template>
    </section>
  `,
  styles: [`
    /* Ultra-Modern Dashboard Styling */
    .dashboard {
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8B5FBF 100%);
      min-height: 100vh;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow-x: hidden;
    }

    /* Animated Background */
    .dashboard::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%);
      animation: backgroundMove 20s ease-in-out infinite;
      z-index: -1;
    }

    @keyframes backgroundMove {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(1deg) scale(1.02); }
    }

    /* Hero Section - Glass Morphism */
    .hero {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 2.5rem;
      color: white;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00d4ff, #667eea, #764ba2, transparent);
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(100%); }
    }

    .hero__title {
      margin: 0 0 0.75rem 0;
      font-size: 2.25rem;
      font-weight: 700;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      letter-spacing: -0.02em;
    }

    .hero__subtitle {
      margin: 0 0 2rem 0;
      opacity: 0.95;
      font-size: 1.125rem;
      font-weight: 400;
      color: white;
    }

    .hero__actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero__actions button {
      border-radius: 16px !important;
      padding: 0.875rem 1.5rem !important;
      font-weight: 600 !important;
      text-transform: none !important;
      letter-spacing: 0.01em !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      backdrop-filter: blur(10px);
    }

    .hero__actions .mat-raised-button {
      background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3) !important;
    }

    .hero__actions .mat-raised-button:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 12px 35px rgba(0, 212, 255, 0.4) !important;
    }

    .hero__actions .mat-stroked-button {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
      color: white !important;
    }

    .hero__actions .mat-stroked-button:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
      transform: translateY(-2px) !important;
    }

    /* KPI Cards - Ultra Modern Glass */
    .kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .kpi {
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(24px) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative;
      overflow: hidden;
    }

    .kpi:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 50px rgba(102, 126, 234, 0.2) !important;
    }

    .kpi mat-card-content {
      padding: 1.5rem !important;
    }

    .kpi__content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .kpi__icon {
      background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%);
      padding: 1rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    }

    .kpi__icon mat-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: white !important;
    }

    .kpi__details {
      flex: 1;
    }

    .kpi__value {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.25rem;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .kpi__label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .kpi__change {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }

    /* Loading State */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: white;
    }

    .loading mat-spinner {
      color: #00d4ff;
    }

    .loading p {
      font-size: 1.125rem;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }
      
      .hero {
        padding: 1.5rem;
      }
      
      .hero__title {
        font-size: 1.875rem;
      }
      
      .kpis {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .hero__actions {
        flex-direction: column;
      }
      
      .hero__actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .hero__title {
        font-size: 1.5rem;
      }
      
      .kpi__content {
        gap: 1rem;
      }
      
      .kpi__value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private appState = inject(AppStateService);
  private keycloak = inject(KeycloakService);
  private translateService = inject(TranslateService);
  private vehicleService = inject(VehicleService);
  private currencyService = inject(CurrencyService);
  private router = inject(Router);
  
  protected readonly isLoading = signal(false); // TODO: Connect to real loading state
  
  protected readonly displayName = computed(() => {
    const profile = this.keycloak.userProfile();
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.username || profile?.email || 'User';
  });
  
  protected readonly kpiCards = computed<KPICard[]>(() => [
    {
      titleKey: 'dashboard.totalVehicles',
      value: this.vehicleService.vehicleCount(),
      change: `${this.vehicleService.activeVehicles()} active`,
      changeType: 'positive' as const,
      icon: 'directions_car',
      color: '#1976d2'
    },
    {
      titleKey: 'dashboard.tripsToday', 
      value: 8,
      change: '+3 today',
      changeType: 'positive' as const,
      icon: 'navigation',
      color: '#388e3c'
    },
    {
      titleKey: 'dashboard.maintenanceAlerts',
      value: this.vehicleService.maintenanceVehicles(),
      change: '2 overdue',
      changeType: this.vehicleService.maintenanceVehicles() > 0 ? 'negative' as const : 'neutral' as const,
      icon: 'build',
      color: '#f57c00'
    },
    {
      titleKey: 'dashboard.pendingBills',
      value: this.currencyService.formatTND(76411, { maximumFractionDigits: 0 }),
      change: '+12% vs last month',
      changeType: 'positive' as const,
      icon: 'attach_money',
      color: '#7b1fa2'
    }
  ]);

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      
      // Load vehicles from GraphQL backend
      await this.vehicleService.loadVehicles();
      
      console.log('Vehicles loaded:', this.vehicleService.vehicles());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.appState.showNotification('Failed to load dashboard data', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Navigation methods
  navigateToAddVehicle(): void {
    this.router.navigate(['/vehicles/new']);
  }

  navigateToNewTrip(): void {
    this.router.navigate(['/trips/new']);
  }

  navigateToAddDriver(): void {
    this.router.navigate(['/drivers/new']);
  }
}
