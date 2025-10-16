import { Component, inject, signal, computed, effect, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DriverService, Driver } from '../../../services/driver.service';
import { RoleVisibilityService, VisibilityRules } from '../../../core/services/role-visibility.service';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    TranslateModule,
  ],
  template: `
    <div class="drivers-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1>
              <mat-icon>person_pin</mat-icon>
              {{ 'drivers.title' | translate }}
            </h1>
            <p>{{ 'drivers.subtitle' | translate }}</p>
          </div>

          <div class="header-actions" *ngIf="roleVisibilityService.isVisible(addDriverVisibility)">
            <button mat-raised-button class="primary-action-btn" routerLink="/drivers/new">
              <mat-icon>add</mat-icon>
              {{ 'drivers.addDriver' | translate }}
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>group</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalDrivers() }}</h3>
                  <p>{{ 'drivers.totalDrivers' | translate }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon active">
                  <mat-icon>person_check</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ activeDrivers() }}</h3>
                  <p>{{ 'drivers.activeDrivers' | translate }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon available">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ availableDrivers() }}</h3>
                  <p>{{ 'drivers.availableDrivers' | translate }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon busy">
                  <mat-icon>directions_car</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ busyDrivers() }}</h3>
                  <p>{{ 'drivers.busyDrivers' | translate }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Filters Section -->
      <mat-card class="filters-section">
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'app.search' | translate }}</mat-label>
              <input matInput [formControl]="searchControl"
                     [placeholder]="'drivers.searchPlaceholder' | translate">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'drivers.fields.status' | translate }}</mat-label>
              <mat-select [formControl]="statusFilter" multiple>
                <mat-option value="">{{ 'app.filter' | translate }}</mat-option>
                <mat-option *ngFor="let status of driverStatuses" [value]="status.value">
                  <mat-icon>{{ status.icon }}</mat-icon>
                  {{ status.label | translate }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'drivers.fields.availability' | translate }}</mat-label>
              <mat-select [formControl]="availabilityFilter">
                <mat-option value="">{{ 'app.filter' | translate }}</mat-option>
                <mat-option value="available">{{ 'drivers.availability.available' | translate }}</mat-option>
                <mat-option value="busy">{{ 'drivers.availability.busy' | translate }}</mat-option>
                <mat-option value="offline">{{ 'drivers.availability.offline' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              {{ 'app.clear' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Drivers Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading()" class="loading-content">
            <mat-spinner></mat-spinner>
            <p>{{ 'drivers.messages.loadingDrivers' | translate }}</p>
            <p style="color: #666; font-size: 0.875rem; margin-top: 16px;">
              Debug: Loading drivers from API...
            </p>
          </div>

          <div *ngIf="!isLoading() && filteredDrivers().length === 0" class="empty-state">
            <mat-icon>person_off</mat-icon>
            <h3>{{ 'drivers.messages.noDrivers' | translate }}</h3>
            <p>{{ 'drivers.messages.createFirstDriver' | translate }}</p>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 0.875rem;">
              <strong>Debug Info:</strong><br>
              Total drivers signal: {{ drivers().length }}<br>
              Filtered drivers: {{ filteredDrivers().length }}<br>
              Is loading: {{ isLoading() }}
            </div>
            <button mat-raised-button color="primary" routerLink="/drivers/new"
                    *ngIf="roleVisibilityService.isVisible(addDriverVisibility)">
              <mat-icon>add</mat-icon>
              {{ 'drivers.addDriver' | translate }}
            </button>
            <button mat-stroked-button color="accent" (click)="testGraphQLConnection()"
                    style="margin-left: 8px;">
              <mat-icon>bug_report</mat-icon>
              Test GraphQL
            </button>
          </div>

          <div *ngIf="!isLoading() && filteredDrivers().length > 0" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="drivers-table">

              <!-- Avatar & Name Column -->
              <ng-container matColumnDef="driver">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="firstName">
                  {{ 'drivers.fields.driver' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <div class="driver-cell">
                    <div class="driver-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="driver-info">
                      <div class="driver-name">{{ driver.firstName }} {{ driver.lastName }}</div>
                      <div class="driver-email">{{ driver.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- License Number Column -->
              <ng-container matColumnDef="licenseNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="licenseNumber">
                  {{ 'drivers.fields.licenseNumber' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <div class="license-info">
                    <span class="license-number">{{ driver.licenseNumber || 'N/A' }}</span>
                    <mat-icon class="license-icon" [class.valid]="driver.licenseNumber"
                             [matTooltip]="driver.licenseNumber ? 'Valid License' : 'No License'">
                      {{ driver.licenseNumber ? 'verified' : 'warning' }}
                    </mat-icon>
                  </div>
                </td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="phoneNumber">
                  {{ 'drivers.fields.phone' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <div class="phone-cell">
                    <mat-icon>phone</mat-icon>
                    <span>{{ driver.phone || 'N/A' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="status">
                  {{ 'drivers.fields.status' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <mat-chip [class]="'status-' + driver.status.toLowerCase()">
                    <mat-icon matChipAvatar>{{ getStatusIcon(driver.status) }}</mat-icon>
                    {{ getStatusLabel(driver.status) | translate }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Availability Column -->
              <ng-container matColumnDef="availability">
                <th mat-header-cell *matHeaderCellDef>
                  {{ 'drivers.fields.availability' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <mat-chip [class]="'availability-' + getAvailabilityStatus(driver).toLowerCase()">
                    <mat-icon matChipAvatar>{{ getAvailabilityIcon(driver) }}</mat-icon>
                    {{ getAvailabilityLabel(driver) | translate }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Rating Column -->
              <ng-container matColumnDef="rating">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="rating">
                  {{ 'drivers.fields.rating' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <div class="rating-cell">
                    <mat-icon class="rating-star">star</mat-icon>
                    <span>{{ driver.rating || '0.0' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>
                  {{ 'app.actions' | translate }}
                </th>
                <td mat-cell *matCellDef="let driver">
                  <div class="actions-cell">
                    <button mat-icon-button [routerLink]="['/drivers', driver.id]"
                            matTooltip="{{ 'app.view' | translate }}">
                      <mat-icon>visibility</mat-icon>
                    </button>

                    <button mat-icon-button [routerLink]="['/drivers', driver.id, 'edit']"
                            *ngIf="roleVisibilityService.isVisible(editDriverVisibility)"
                            matTooltip="{{ 'app.edit' | translate }}">
                      <mat-icon>edit</mat-icon>
                    </button>

                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu"
                            matTooltip="{{ 'app.more' | translate }}">
                      <mat-icon>more_vert</mat-icon>
                    </button>

                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item (click)="assignToTrip(driver)"
                              *ngIf="roleVisibilityService.isVisible(editDriverVisibility)">
                        <mat-icon>assignment</mat-icon>
                        {{ 'drivers.actions.assignToTrip' | translate }}
                      </button>

                      <button mat-menu-item (click)="viewTrips(driver)">
                        <mat-icon>map</mat-icon>
                        {{ 'drivers.actions.viewTrips' | translate }}
                      </button>

                      <mat-divider></mat-divider>

                      <button mat-menu-item (click)="toggleStatus(driver)"
                              *ngIf="roleVisibilityService.isVisible(editDriverVisibility)"
                              [class]="driver.status === 'ACTIVE' ? 'warn-menu-item' : 'primary-menu-item'">
                        <mat-icon>{{ driver.status === 'ACTIVE' ? 'person_off' : 'person' }}</mat-icon>
                        {{ driver.status === 'ACTIVE' ? ('drivers.actions.deactivate' | translate) : ('drivers.actions.activate' | translate) }}
                      </button>
                    </mat-menu>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.highlighted-row]="row.currentTripId"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                           [showFirstLastButtons]="true"
                           [pageSize]="25">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .drivers-container {
      padding: var(--space-8);
      max-width: 1400px;
      margin: 0 auto;
      background-color: var(--color-background);
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--space-12) var(--space-8);
      margin: calc(-1 * var(--space-8)) calc(-1 * var(--space-8)) var(--space-12);
      border-radius: 0 0 24px 24px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-8);

        .title-section {
          h1 {
            margin: 0 0 8px 0;
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 16px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);

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

        .header-actions {
          display: flex;
          gap: 16px;
          align-items: center;

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

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-6);

        .stat-card {
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          border-top: 4px solid transparent;
          overflow: hidden;

          &:nth-child(1) {
            border-top-color: #2196F3;
          }

          &:nth-child(2) {
            border-top-color: #4CAF50;
          }

          &:nth-child(3) {
            border-top-color: #FF9800;
          }

          &:nth-child(4) {
            border-top-color: #9C27B0;
          }

          &:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          mat-card-content {
            padding: var(--space-8) !important;
          }

          .stat-content {
            display: flex;
            align-items: center;
            gap: var(--space-6);

            .stat-icon {
              width: 70px;
              height: 70px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;

              &::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                opacity: 0.1;
              }

              &.active::before {
                background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
              }

              &.available::before {
                background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
              }

              &.busy::before {
                background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
              }

              mat-icon {
                font-size: 2rem;
                width: 2rem;
                height: 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
                z-index: 1;
              }

              &.active mat-icon {
                background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              &.available mat-icon {
                background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              &.busy mat-icon {
                background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
            }

            .stat-info {
              h3 {
                margin: 0 0 4px 0;
                font-size: 2.25rem;
                font-weight: 700;
                color: var(--color-text-primary);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }

              p {
                margin: 0;
                color: var(--color-text-secondary);
                font-size: 0.9rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
            }
          }
        }
      }
    }

    .filters-section {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--space-8);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: var(--shadow-md);
      }

      mat-card-content {
        padding: var(--space-8) !important;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: var(--space-6);
        align-items: start;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .table-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: var(--shadow-md);
      }

      mat-card-content {
        padding: 0 !important;
      }

      .loading-content {
        text-align: center;
        padding: 80px 20px;

        mat-spinner {
          margin: 0 auto 16px;
        }

        p {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
          margin: var(--space-6) 0;
        }
      }

      .empty-state {
        text-align: center;
        padding: 80px 20px;
        color: var(--color-text-secondary);

        mat-icon {
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
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        p {
          margin: 0 0 var(--space-8) 0;
          font-size: 1rem;
        }
      }

      .table-container {
        overflow: auto;

        .drivers-table {
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
            padding: var(--space-6) var(--space-3);
          }

          .mat-mdc-cell {
            padding: var(--space-6) var(--space-3);
            border-bottom-color: var(--color-border);
          }

          .mat-mdc-row {
            transition: all 0.2s ease;

            &:hover {
              background-color: var(--color-surface-hover);
              transform: scale(1.01);
            }

            &.highlighted-row {
              background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
              border-left: 4px solid #667eea;
            }
          }

          .driver-cell {
            display: flex;
            align-items: center;
            gap: var(--space-3);

            .driver-avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

              mat-icon {
                font-size: 1.5rem;
                width: 1.5rem;
                height: 1.5rem;
              }
            }

            .driver-info {
              .driver-name {
                font-weight: 600;
                color: var(--color-text-primary);
                margin-bottom: 2px;
                font-size: 1rem;
              }

              .driver-email {
                font-size: 0.875rem;
                color: var(--color-text-secondary);
              }
            }
          }

          .license-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .license-number {
              font-family: 'Roboto Mono', monospace;
              background: var(--color-background-secondary);
              padding: 6px 12px;
              border-radius: var(--radius-md);
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--color-text-primary);
            }

            .license-icon {
              font-size: 1.25rem;
              width: 1.25rem;
              height: 1.25rem;

              &.valid {
                color: #4CAF50;
              }

              &:not(.valid) {
                color: #FF9800;
              }
            }
          }

          .phone-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text-primary);

            mat-icon {
              font-size: 1.125rem;
              width: 1.125rem;
              height: 1.125rem;
              color: var(--color-text-secondary);
            }
          }

          .rating-cell {
            display: flex;
            align-items: center;
            gap: 4px;

            .rating-star {
              color: #FFC107;
              font-size: 1.125rem;
              width: 1.125rem;
              height: 1.125rem;
            }

            span {
              font-weight: 600;
              color: var(--color-text-primary);
            }
          }

          .actions-cell {
            display: flex;
            gap: 4px;
            align-items: center;
          }
        }

        .mat-mdc-paginator {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
        }
      }
    }

    // Status and availability chips
    mat-chip {
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8rem;
      padding: 8px 12px;
      border: 2px solid transparent;
      
      &.status-active {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
        color: #2E7D32;
        border-color: rgba(76, 175, 80, 0.3);

        mat-icon {
          color: #4CAF50;
        }
      }

      &.status-inactive {
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
        color: #C62828;
        border-color: rgba(244, 67, 54, 0.3);

        mat-icon {
          color: #F44336;
        }
      }

      &.availability-available {
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
        color: #1565C0;
        border-color: rgba(33, 150, 243, 0.3);

        mat-icon {
          color: #2196F3;
        }
      }

      &.availability-busy {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.2) 100%);
        color: #E65100;
        border-color: rgba(255, 152, 0, 0.3);

        mat-icon {
          color: #FF9800;
        }
      }

      &.availability-offline {
        background: linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(158, 158, 158, 0.2) 100%);
        color: #424242;
        border-color: rgba(158, 158, 158, 0.3);

        mat-icon {
          color: #9E9E9E;
        }
      }
    }

    // Menu item colors
    .warn-menu-item {
      color: #F44336;
      
      &:hover {
        background: rgba(244, 67, 54, 0.1);
      }
    }

    .primary-menu-item {
      color: #4CAF50;
      
      &:hover {
        background: rgba(76, 175, 80, 0.1);
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .drivers-container {
        padding: var(--space-6);
      }

      .header-section {
        margin: calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) var(--space-8);
        padding: var(--space-8) var(--space-6);
        
        .header-content {
          flex-direction: column;
          gap: var(--space-6);
          align-items: stretch;
        }

        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
      }
    }
  `]
})
export class DriversListComponent implements OnInit, AfterViewInit {
  private driverService = inject(DriverService);
  protected roleVisibilityService = inject(RoleVisibilityService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  protected isLoading = signal(false);
  protected drivers = signal<Driver[]>([]);

  // Form controls for filtering
  protected searchControl = new FormControl('');
  protected statusFilter = new FormControl<string[]>([]);
  protected availabilityFilter = new FormControl('');

  // Filter signals for reactive filtering
  protected searchTerm = signal('');
  protected statusFilters = signal<string[]>([]);
  protected availabilityFilterValue = signal('');

  // Data source for table
  protected dataSource = new MatTableDataSource<Driver>([]);
  protected displayedColumns = ['driver', 'licenseNumber', 'phone', 'status', 'availability', 'rating', 'actions'];

  // Driver statuses
  protected driverStatuses = [
    { value: 'ACTIVE', label: 'drivers.status.active', icon: 'person' },
    { value: 'INACTIVE', label: 'drivers.status.inactive', icon: 'person_off' },
  ];

  // Role visibility configurations
  protected addDriverVisibility = VisibilityRules.MANAGER_OR_ADMIN;
  protected editDriverVisibility = VisibilityRules.MANAGER_OR_ADMIN;

  // Computed values for stats
  protected totalDrivers = computed(() => this.drivers().length);
  protected activeDrivers = computed(() =>
    this.drivers().filter(d => d.status === 'ACTIVE').length
  );
  protected availableDrivers = computed(() =>
    this.drivers().filter(d => d.status === 'ACTIVE' && !d.currentTripId).length
  );
  protected busyDrivers = computed(() =>
    this.drivers().filter(d => d.status === 'ACTIVE' && d.currentTripId).length
  );

  // Filtered drivers based on search and filters
  protected filteredDrivers = computed(() => {
    let filtered = this.drivers();

    const searchTerm = this.searchTerm().toLowerCase();
    const statusFilters = this.statusFilters();
    const availabilityFilter = this.availabilityFilterValue();

    if (searchTerm) {
      filtered = filtered.filter(driver =>
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm) ||
        driver.email?.toLowerCase().includes(searchTerm) ||
        driver.licenseNumber?.toLowerCase().includes(searchTerm) ||
        driver.phone?.toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilters.length > 0) {
      filtered = filtered.filter(driver => statusFilters.includes(driver.status));
    }

    if (availabilityFilter) {
      filtered = filtered.filter(driver => {
        const availability = this.getAvailabilityStatus(driver);
        return availability.toLowerCase() === availabilityFilter;
      });
    }

    return filtered;
  });

  constructor() {
    // Update data source when filtered drivers change
    effect(() => {
      this.dataSource.data = this.filteredDrivers();
    });
  }

  ngOnInit(): void {
    this.loadDrivers();
    this.setupFilterSubscriptions();
  }

  private setupFilterSubscriptions(): void {
    // Subscribe to search control changes and update signal
    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm.set(value || '');
    });

    // Subscribe to status filter changes and update signal
    this.statusFilter.valueChanges.subscribe(value => {
      this.statusFilters.set(value || []);
    });

    // Subscribe to availability filter changes and update signal
    this.availabilityFilter.valueChanges.subscribe(value => {
      this.availabilityFilterValue.set(value || '');
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected loadDrivers(): void {
    this.isLoading.set(true);
    
    this.driverService.getDrivers({}).subscribe({
      next: (response) => {
        const drivers = response?.drivers || [];
        this.drivers.set(drivers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.snackBar.open(
          this.translate.instant('drivers.messages.loadError'),
          'Close',
          { duration: 5000 }
        );
        this.isLoading.set(false);
      }
    });
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue([]);
    this.availabilityFilter.setValue('');
    // Also reset the signals directly to ensure immediate update
    this.searchTerm.set('');
    this.statusFilters.set([]);
    this.availabilityFilterValue.set('');
  }

  protected getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'person';
      case 'INACTIVE': return 'person_off';
      default: return 'help';
    }
  }

  protected getStatusLabel(status: string): string {
    return `drivers.status.${status.toLowerCase()}`;
  }

  protected getAvailabilityStatus(driver: Driver): string {
    if (driver.status !== 'ACTIVE') return 'offline';
    return driver.currentTripId ? 'busy' : 'available';
  }

  protected getAvailabilityIcon(driver: Driver): string {
    const status = this.getAvailabilityStatus(driver);
    switch (status) {
      case 'available': return 'check_circle';
      case 'busy': return 'directions_car';
      case 'offline': return 'offline_bolt';
      default: return 'help';
    }
  }

  protected getAvailabilityLabel(driver: Driver): string {
    const status = this.getAvailabilityStatus(driver);
    return `drivers.availability.${status}`;
  }

  protected toggleStatus(driver: Driver): void {
    const newStatus = driver.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const driverInput: any = {
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone || driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      status: newStatus,
      dateOfBirth: driver.dateOfBirth,
      hireDate: driver.hireDate,
      emergencyContactName: driver.emergencyContactName,
      emergencyContactPhone: driver.emergencyContactPhone
    };

    this.driverService.updateDriver(driver.id, driverInput).subscribe({
      next: (updatedDriver) => {
        if (updatedDriver) {
          this.loadDrivers(); // Reload the list
          
          const message = newStatus === 'ACTIVE'
            ? this.translate.instant('drivers.messages.activated')
            : this.translate.instant('drivers.messages.deactivated');

          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error updating driver status:', error);
        this.snackBar.open(
          this.translate.instant('drivers.messages.updateError'),
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  protected assignToTrip(driver: Driver): void {
    // Navigate to trip creation with driver pre-selected
    // This would be implemented based on your routing structure
    console.log('Assign driver to trip:', driver);
  }

  protected viewTrips(driver: Driver): void {
    // Navigate to trips filtered by driver
    // This would be implemented based on your routing structure
    console.log('View driver trips:', driver);
  }

  protected testGraphQLConnection(): void {
    console.log('🗋 Testing direct GraphQL connection...');

    this.driverService.getDrivers({}).subscribe({
      next: (response) => {
        console.log('🎉 GraphQL test successful:', response);
        this.snackBar.open(
          `GraphQL test successful! Found ${response?.drivers?.length || 0} drivers`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('🚨 GraphQL test failed:', error);
        this.snackBar.open(
          'GraphQL test failed - check console for details',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
