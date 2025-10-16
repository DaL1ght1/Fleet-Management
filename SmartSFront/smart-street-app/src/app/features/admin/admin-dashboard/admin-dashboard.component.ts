import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

import { UserService } from '../../../core/services/user.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { KeycloakService } from '../../../core/services/keycloak.service';
import { User, Role } from '../../../core/models/user.model';

interface SystemMetric {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <div class="admin-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1>
              <mat-icon>admin_panel_settings</mat-icon>
              {{ 'admin.title' | translate }}
            </h1>
            <p>{{ 'admin.subtitle' | translate }}</p>
          </div>
          <div class="actions-section">
            <button mat-raised-button class="primary-action-btn" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              {{ 'app.refresh' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- System Metrics -->
      <div class="metrics-grid">
        <mat-card class="metric-card" *ngFor="let metric of systemMetrics(); let i = index" [attr.data-index]="i">
          <div class="metric-header">
            <div class="metric-icon">
              <mat-icon>{{ metric.icon }}</mat-icon>
            </div>
            <div class="metric-trend">
              <mat-icon class="trend-up">trending_up</mat-icon>
            </div>
          </div>
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-value">
                {{ metric.value }}<span *ngIf="metric.unit" class="unit">{{ metric.unit }}</span>
              </div>
              <div class="metric-title">{{ metric.title }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group class="admin-tabs">
        <!-- Users Tab -->
        <mat-tab [label]="'admin.userManagement' | translate">
          <div class="tab-content">
            <mat-card class="users-card">
              <div class="card-header">
                <mat-icon class="header-icon users-icon">people</mat-icon>
                <div class="header-text">
                  <h3>{{ 'admin.users' | translate }}</h3>
                  <p>Total users: {{ userService.users().length }}</p>
                </div>
              </div>
              <mat-card-content>
                <div *ngIf="isLoadingUsers()" class="loading-content">
                  <mat-icon class="loading-icon">refresh</mat-icon>
                  <h3>{{ 'app.loading' | translate }}</h3>
                  <p>Loading user data...</p>
                </div>

                <div *ngIf="!isLoadingUsers() && userService.users().length === 0" class="empty-state">
                  <mat-icon class="empty-icon">people_outline</mat-icon>
                  <h3>No Users Found</h3>
                  <p>No users are currently registered in the system.</p>
                </div>

                <div *ngIf="!isLoadingUsers() && userService.users().length > 0" class="table-container">
                  <table mat-table [dataSource]="userService.users()" class="users-table">
                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>{{ 'admin.fields.firstName' | translate }}</th>
                      <td mat-cell *matCellDef="let user">
                        <div class="user-info">
                          <div class="primary-info">{{ user.firstName }} {{ user.lastName }}</div>
                          <div class="secondary-info">{{ user.email }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Phone Column -->
                    <ng-container matColumnDef="phone">
                      <th mat-header-cell *matHeaderCellDef>{{ 'profile.fields.phone' | translate }}</th>
                      <td mat-cell *matCellDef="let user">{{ user.phoneNumber }}</td>
                    </ng-container>

                    <!-- Role Column -->
                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef>{{ 'admin.fields.role' | translate }}</th>
                      <td mat-cell *matCellDef="let user">
                        <mat-chip-set>
                          <mat-chip [color]="getRoleColor(user.role)">
                            {{ user.role }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <!-- Created Date Column -->
                    <ng-container matColumnDef="created">
                      <th mat-header-cell *matHeaderCellDef>{{ 'admin.fields.createdAt' | translate }}</th>
                      <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'short' }}</td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>{{ 'dashboard.quickActions' | translate }}</th>
                      <td mat-cell *matCellDef="let user">
                        <button mat-icon-button [matMenuTriggerFor]="userMenu" [matMenuTriggerData]="{ user: user }">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="userDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: userDisplayedColumns;"></tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- System Settings Tab -->
        <mat-tab [label]="'admin.settings' | translate">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'admin.settings' | translate }}</mat-card-title>
                <mat-card-subtitle>{{ 'admin.subtitle' | translate }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="empty-state">
                  <mat-icon>settings</mat-icon>
                  <h3>{{ 'admin.settings' | translate }}</h3>
                  <p>System configuration options will be available here.</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab [label]="'admin.analytics' | translate">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'admin.analytics' | translate }}</mat-card-title>
                <mat-card-subtitle>{{ 'dashboard.subtitle' | translate }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="empty-state">
                  <mat-icon>analytics</mat-icon>
                  <h3>{{ 'admin.analytics' | translate }}</h3>
                  <p>System analytics and reporting features will be displayed here.</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- User Actions Menu -->
    <mat-menu #userMenu="matMenu">
      <ng-template matMenuContent let-user="user">
        <button mat-menu-item>
          <mat-icon>visibility</mat-icon>
          <span>{{ 'app.view' | translate }}</span>
        </button>
        <button mat-menu-item>
          <mat-icon>edit</mat-icon>
          <span>{{ 'admin.editUser' | translate }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="confirmDeleteUser(user)" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>{{ 'admin.deleteUser' | translate }}</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .admin-container {
      padding: var(--space-8);
      background-color: var(--color-background);
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--space-8);
      margin: calc(-1 * var(--space-8)) calc(-1 * var(--space-8)) var(--space-12);
      border-radius: 0 0 24px 24px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .title-section {
        h1 {
          margin: 0 0 8px 0;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: var(--space-4);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

          mat-icon {
            font-size: 3rem;
            width: 3rem;
            height: 3rem;
            color: rgba(255, 255, 255, 0.9);
          }
        }

        p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          font-weight: 500;
        }
      }

      .actions-section {
        .primary-action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }

          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }

    .metric-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &[data-index="0"]::before {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      }
      
      &[data-index="1"]::before {
        background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
      }
      
      &[data-index="2"]::before {
        background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      }
      
      &[data-index="3"]::before {
        background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4) var(--space-6) 0;

        .metric-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);

          mat-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }

        .metric-trend {
          .trend-up {
            color: #4CAF50;
            font-size: 1.5rem;
            width: 1.5rem;
            height: 1.5rem;
            opacity: 0.7;
          }
        }
      }

      mat-card-content {
        padding: var(--space-4) var(--space-6) var(--space-6) !important;
      }

      .metric-content {
        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: var(--space-2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          .unit {
            font-size: 1.2rem;
            color: var(--color-text-secondary);
            font-weight: 500;
            background: none;
            -webkit-text-fill-color: var(--color-text-secondary);
          }
        }

        .metric-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }

    .admin-tabs {
      .mat-mdc-tab {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .tab-content {
      padding: var(--space-8) 0;
    }

    .users-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        box-shadow: var(--shadow-md);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-8) var(--space-8) var(--space-6);
        border-bottom: 1px solid var(--color-border);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);

        .header-icon {
          width: 3rem;
          height: 3rem;
          font-size: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.users-icon {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
            color: #2196F3;
          }
        }

        .header-text {
          h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          p {
            margin: var(--space-1) 0 0 0;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
          }
        }
      }

      mat-card-content {
        padding: var(--space-8) !important;
      }
    }

    .loading-content {
      text-align: center;
      padding: var(--space-12) var(--space-8);
      
      .loading-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: var(--space-6);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: spin 1s linear infinite;
      }
      
      h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-8);
      
      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: var(--space-6);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        opacity: 0.7;
      }
      
      h3 {
        margin: 0 0 var(--space-3) 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
        line-height: 1.5;
      }
    }

    .table-container {
      overflow: auto;
    }

    .users-table {
      width: 100%;

      .mat-mdc-header-row {
        background: var(--color-background-secondary);
      }

      .mat-mdc-header-cell {
        color: var(--color-text-primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.875rem;
        padding: var(--space-4) var(--space-3);
      }

      .mat-mdc-cell {
        padding: var(--space-4) var(--space-3);
        border-bottom-color: var(--color-border);
      }

      .mat-mdc-row {
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--color-surface-hover);
          transform: scale(1.005);
        }
      }

      .user-info {
        .primary-info {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 1rem;
          margin-bottom: 2px;
        }

        .secondary-info {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
      }

      mat-chip {
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 0.8rem;
        padding: 6px 12px;
        border: 1px solid transparent;
        
        &[color="accent"] {
          background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.2) 100%);
          color: #6A1B9A;
          border-color: rgba(156, 39, 176, 0.3);
        }
        
        &[color="primary"] {
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
          color: #1565C0;
          border-color: rgba(33, 150, 243, 0.3);
        }
      }
    }

    .delete-action {
      color: #F44336;
      
      &:hover {
        background: rgba(244, 67, 54, 0.1);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .admin-container {
        padding: var(--space-4);
      }

      .header-section {
        margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) var(--space-8);
        padding: var(--space-6) var(--space-4);
        
        .header-content {
          flex-direction: column;
          gap: var(--space-4);
          align-items: stretch;
        }
        
        .title-section h1 {
          font-size: 2rem;
          
          mat-icon {
            font-size: 2.5rem;
            width: 2.5rem;
            height: 2.5rem;
          }
        }
      }

      .metrics-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
      
      .card-header {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3) !important;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  protected userService = inject(UserService);
  protected vehicleService = inject(VehicleService);
  protected keycloakService = inject(KeycloakService);

  protected userDisplayedColumns = ['name', 'phone', 'role', 'created', 'actions'];

  protected systemMetrics = computed(() => {
    const totalUsers = this.userService.users().length;
    const totalVehicles = this.vehicleService.vehicleCount();
    const activeVehicles = this.vehicleService.activeVehicles();

    return [
      {
        title: 'Total Users',
        value: totalUsers,
        icon: 'people',
        color: '#1976d2'
      },
      {
        title: 'Total Vehicles',
        value: totalVehicles,
        icon: 'directions_car',
        color: '#388e3c'
      },
      {
        title: 'Active Vehicles',
        value: activeVehicles,
        icon: 'check_circle',
        color: '#4caf50'
      },
      {
        title: 'System Uptime',
        value: '99.9',
        unit: '%',
        icon: 'trending_up',
        color: '#7b1fa2'
      }
    ] as SystemMetric[];
  });

  ngOnInit() {
    this.loadData();
  }

  protected async loadData(): Promise<void> {
    try {
      await Promise.allSettled([
        this.userService.loadUsers(),
        this.vehicleService.loadVehicles()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }

  protected async refreshData(): Promise<void> {
    await this.loadData();
  }

  protected isLoadingUsers(): boolean {
    return this.userService.isLoading('users-load');
  }

  protected getRoleColor(role: Role): string {
    return role === 'ADMIN' ? 'accent' : 'primary';
  }

  protected confirmDeleteUser(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`);

    if (confirmed) {
      this.deleteUser(user);
    }
  }

  private async deleteUser(user: User): Promise<void> {
    try {
      await this.userService.deleteUser(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}
