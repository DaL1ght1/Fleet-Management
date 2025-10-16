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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TripService } from '../../../core/services/trip.service';
import { Trip, TripStatus, TripType } from '../../../core/models/trip.model';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  styleUrls: ['./trips-list.component.scss'],
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
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
  ],
  template: `
    <div class="trips-container">
      <div class="header-section">
        <div class="title-section">
          <h1>{{ 'trips.title' | translate }}</h1>
          <p>{{ 'trips.subtitle' | translate }}</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" routerLink="/trips/new">
            <mat-icon>add</mat-icon>
            {{ 'trips.newTrip' | translate }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">map</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ totalTrips() }}</div>
                <div class="stat-label">{{ 'dashboard.totalTrips' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #4caf50;">play_arrow</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ inProgressTrips() }}</div>
                <div class="stat-label">{{ 'trips.status.inProgress' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #ff9800;">schedule</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ scheduledTrips() }}</div>
                <div class="stat-label">{{ 'trips.status.scheduled' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #2196f3;">check_circle</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ completedTrips() }}</div>
                <div class="stat-label">{{ 'trips.status.completed' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>{{ 'app.search' | translate }}</mat-label>
              <input matInput [formControl]="searchControl" 
                     placeholder="Vehicle, driver, location...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.status' | translate }}</mat-label>
                <mat-select [formControl]="statusControl">
                  <mat-option value="">{{ 'app.filter' | translate }}</mat-option>
                  <mat-option value="SCHEDULED">{{ 'trips.status.scheduled' | translate }}</mat-option>
                  <mat-option value="IN_PROGRESS">{{ 'trips.status.inProgress' | translate }}</mat-option>
                  <mat-option value="COMPLETED">{{ 'trips.status.completed' | translate }}</mat-option>
                  <mat-option value="CANCELLED">{{ 'trips.status.cancelled' | translate }}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.type' | translate }}</mat-label>
                <mat-select [formControl]="typeControl">
                  <mat-option value="">{{ 'app.filter' | translate }}</mat-option>
                  <mat-option value="RENTAL">{{ 'trips.type.rental' | translate }}</mat-option>
                  <mat-option value="MAINTENANCE">{{ 'trips.type.maintenance' | translate }}</mat-option>
                  <mat-option value="RELOCATION">{{ 'trips.type.relocation' | translate }}</mat-option>
                  <mat-option value="EMERGENCY">{{ 'trips.type.emergency' | translate }}</mat-option>
                </mat-select>
              </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              {{ 'app.reset' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Trips Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading()" class="loading-content">
            <mat-spinner></mat-spinner>
            <p>{{ 'app.loading' | translate }}</p>
          </div>

          <div *ngIf="!isLoading() && filteredTrips().length === 0" class="empty-state">
            <mat-icon>map</mat-icon>
            <h3>{{ 'trips.messages.noTrips' | translate }}</h3>
            <p>{{ 'trips.messages.createFirstTrip' | translate }}</p>
            <button mat-raised-button color="primary" routerLink="/trips/new">
              <mat-icon>add</mat-icon>
              {{ 'trips.newTrip' | translate }}
            </button>
          </div>

          <div *ngIf="!isLoading() && filteredTrips().length > 0" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="trips-table">
              <!-- Trip ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'trips.fields.id' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                  <strong>#{{ trip.id.substring(0, 8) }}</strong>
                </td>
              </ng-container>

              <!-- Vehicle Column -->
              <ng-container matColumnDef="vehicle">
                <th mat-header-cell *matHeaderCellDef>{{ 'navigation.vehicles' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                <div class="vehicle-info" *ngIf="trip.vehicle">
                  <div class="primary-info">{{ trip.vehicle.year }} {{ trip.vehicle.make }} {{ trip.vehicle.model }}</div>
                  <div class="secondary-info">{{ trip.vehicle.licensePlate }}</div>
                </div>
                <div *ngIf="!trip.vehicle && trip.vehicleId" class="vehicle-info">
                  <div class="primary-info">Vehicle ID: {{ trip.vehicleId }}</div>
                </div>
                <div *ngIf="!trip.vehicle && !trip.vehicleId" class="no-vehicle">
                  <em>Vehicle not assigned</em>
                </div>
                </td>
              </ng-container>

              <!-- Route Column -->
              <ng-container matColumnDef="route">
                <th mat-header-cell *matHeaderCellDef>{{ 'trips.fields.route' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                  <div class="route-info">
                    <div class="route-from">
                      <mat-icon class="location-icon">location_on</mat-icon>
                      {{ getShortAddress(trip.startLocation?.address || 'N/A') }}
                    </div>
                    <mat-icon class="arrow-icon">arrow_downward</mat-icon>
                    <div class="route-to">
                      <mat-icon class="location-icon">flag</mat-icon>
                      {{ getShortAddress(trip.endLocation?.address || 'N/A') }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'trips.fields.status' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                  <mat-chip-set>
                    <mat-chip [color]="getStatusColor(trip.status)" [class]="'status-chip-' + trip.status.toLowerCase()">
                      {{ 'trips.status.' + trip.status.toLowerCase() | translate }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Scheduled Time Column -->
              <ng-container matColumnDef="scheduledTime">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="scheduledStart">{{ 'trips.fields.scheduledStart' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                  <div class="time-info">
                    <div class="date-time">{{ trip.scheduledStartTime | date:'MMM d, y' }}</div>
                    <div class="time">{{ trip.scheduledStartTime | date:'shortTime' }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ 'dashboard.quickActions' | translate }}</th>
                <td mat-cell *matCellDef="let trip">
                  <button mat-icon-button [matMenuTriggerFor]="tripMenu" [matMenuTriggerData]="{ trip: trip }">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="clickable-row" 
                  (click)="onRowClick(row)"
                  [routerLink]="['/trips', row.id]">
              </tr>
            </table>

            <mat-paginator #paginator
              [pageSizeOptions]="[10, 25, 50, 100]"
              [pageSize]="25"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Trip Actions Menu -->
    <mat-menu #tripMenu="matMenu">
      <ng-template matMenuContent let-trip="trip">
        <button mat-menu-item [routerLink]="['/trips', trip.id]">
          <mat-icon>visibility</mat-icon>
          <span>{{ 'trips.tripDetails' | translate }}</span>
        </button>
        <button mat-menu-item [routerLink]="['/trips', trip.id, 'edit']">
          <mat-icon>edit</mat-icon>
          <span>{{ 'app.edit' | translate }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="startTrip(trip)" 
                [disabled]="trip.status !== 'SCHEDULED'" 
                *ngIf="trip.status === 'SCHEDULED'">
          <mat-icon>play_arrow</mat-icon>
          <span>{{ 'trips.actions.start' | translate }}</span>
        </button>
        <button mat-menu-item (click)="completeTrip(trip)" 
                [disabled]="trip.status !== 'IN_PROGRESS'" 
                *ngIf="trip.status === 'IN_PROGRESS'">
          <mat-icon>check_circle</mat-icon>
          <span>{{ 'trips.actions.complete' | translate }}</span>
        </button>
        <button mat-menu-item (click)="cancelTrip(trip)" 
                [disabled]="trip.status === 'COMPLETED' || trip.status === 'CANCELLED'">
          <mat-icon>cancel</mat-icon>
          <span>{{ 'trips.actions.cancel' | translate }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="confirmDelete(trip)" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>{{ 'app.delete' | translate }}</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .trips-container {
      padding: var(--space-6);
      background: var(--color-background);
      min-height: 100vh;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: var(--radius-2xl);
      padding: var(--space-6);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-lg);
      margin-bottom: var(--space-6);
      
      .title-section {
        h1 {
          margin: 0 0 var(--space-2) 0;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: #fff;
        }
        
        p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-normal);
        }
      }
      
      .actions-section {
        button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          height: 48px;
          padding: 0 var(--space-6);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          
          mat-icon {
            margin-right: var(--space-2);
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .stat-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
        border-color: var(--color-primary-200);
      }
      
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
      
      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);
        
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
        
        &:has(mat-icon[color="primary"]) {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        &:has(mat-icon[style*="color: #4caf50"]) {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }
        
        &:has(mat-icon[style*="color: #ff9800"]) {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }
        
        &:has(mat-icon[style*="color: #2196f3"]) {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
      }
      
      .stat-details {
        flex: 1;
      }
      
      .stat-value {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        line-height: 1;
        margin-bottom: var(--space-2);
        color: var(--color-text-primary);
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .filters-card {
      margin-bottom: var(--space-6);
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      
      mat-card-content {
        padding: var(--space-5) !important;
      }
      
      .filters-row {
        display: flex;
        gap: var(--space-4);
        align-items: flex-end;
        flex-wrap: wrap;
      }
      
      .search-field {
        flex: 1;
        min-width: 320px;
        
        ::ng-deep {
          .mat-mdc-form-field {
            .mat-mdc-text-field-wrapper {
              border-radius: 12px;
            }
          }
        }
      }
      
      ::ng-deep {
        .mat-mdc-form-field {
          .mat-mdc-text-field-wrapper {
            border-radius: 8px;
          }
        }
        
        button[mat-stroked-button] {
          height: 48px;
          border-radius: 12px;
          border-color: #e0e0e0;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f5f5f5;
            border-color: #d0d0d0;
            transform: translateY(-1px);
          }
        }
      }
    }

    .table-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      
      mat-card-content {
        padding: 0 !important;
      }
      
      .table-container {
        overflow-x: auto;
        border-radius: var(--radius-xl);
      }
      
      .trips-table {
        width: 100%;
        
        .mat-mdc-header-row {
          background: #f8f9fa;
          border-radius: 16px 16px 0 0;
        }
        
        .mat-mdc-header-cell {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 24px;
        }
        
        .mat-mdc-cell {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .mat-mdc-row {
          transition: all 0.2s ease;
          
          &:hover {
            background: #f8f9fa;
            cursor: pointer;
          }
          
          &:last-child {
            .mat-mdc-cell {
              border-bottom: none;
            }
          }
        }
        
        .vehicle-info {
          .primary-info {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 0.95rem;
            margin-bottom: 4px;
          }
          
          .secondary-info {
            font-size: 0.85rem;
            color: rgba(0, 0, 0, 0.6);
            font-weight: 500;
          }
        }
        
        .route-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          .route-from, .route-to {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .route-from {
            color: #2e7d32;
          }
          
          .route-to {
            color: #d32f2f;
          }
          
          .location-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
          
          .arrow-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: #666;
            align-self: center;
            margin: 4px 0;
          }
        }
        
        .time-info {
          .date-time {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 0.95rem;
            margin-bottom: 4px;
          }
          
          .time {
            font-size: 0.85rem;
            color: rgba(0, 0, 0, 0.65);
            font-weight: 500;
          }
        }
        
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }
    }

    .loading-content, .empty-state {
      text-align: center;
      padding: 80px 40px;
      
      mat-spinner {
        margin: 0 auto 24px;
        transform: scale(1.2);
      }
      
      mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #e0e0e0;
        margin-bottom: 24px;
        opacity: 0.8;
      }
      
      h3 {
        margin: 0 0 12px 0;
        color: #666;
        font-size: 1.5rem;
        font-weight: 500;
      }
      
      p {
        margin: 0 0 32px 0;
        color: #999;
        font-size: 1.1rem;
        line-height: 1.5;
      }
      
      button {
        height: 48px;
        padding: 0 32px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 500;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    .delete-action {
      color: #f44336;
    }
    
    // Custom chip styling for trip status
    mat-chip-set {
      mat-chip {
        font-weight: 500;
        font-size: 12px;
        
        &[color="primary"], &.status-chip-scheduled {
          background-color: #fff3e0 !important;
          color: #e65100 !important;
          border: 1px solid #ff9800 !important;
        }
        
        &[color="accent"], &.status-chip-in_progress {
          background-color: #e8f5e8 !important;
          color: #2e7d32 !important;
          border: 1px solid #4caf50 !important;
        }
        
        &[color="warn"], &.status-chip-cancelled {
          background-color: #ffebee !important;
          color: #c62828 !important;
          border: 1px solid #f44336 !important;
        }
        
        &.status-chip-completed {
          background-color: #e3f2fd !important;
          color: #1565c0 !important;
          border: 1px solid #2196f3 !important;
        }
      }
    }

    @media (max-width: 768px) {
      .trips-container {
        padding: 16px;
      }
      
      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-row {
        flex-direction: column;
        align-items: stretch;
        
        .search-field {
          min-width: unset;
        }
      }
    }
  `]
})
export class TripsListComponent implements OnInit, AfterViewInit {
  protected tripService = inject(TripService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // Make enums available to template
  protected readonly TripStatus = TripStatus;
  protected readonly TripType = TripType;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Form controls for filters
  protected searchControl = new FormControl('');
  protected statusControl = new FormControl('');
  protected typeControl = new FormControl('');

  // Table configuration
  protected displayedColumns = ['id', 'vehicle', 'route', 'status', 'scheduledTime', 'actions'];
  protected dataSource = new MatTableDataSource<Trip>();

  // Loading and data signals
  protected isLoading = signal(false);
  protected trips = signal<Trip[]>([]);
  protected totalTrips = signal(0);
  protected scheduledTrips = signal(0);
  protected inProgressTrips = signal(0);
  protected completedTrips = signal(0);
  
  // Filter signals for reactive filtering
  protected searchTerm = signal('');
  protected statusFilter = signal('');
  protected typeFilter = signal('');
  
  // Computed filtered trips
  protected filteredTrips = computed(() => {
    let result = this.trips();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();
    
    if (search) {
      result = result.filter(trip => 
        trip.vehicle?.make?.toLowerCase().includes(search) ||
        trip.vehicle?.model?.toLowerCase().includes(search) ||
        trip.vehicle?.licensePlate?.toLowerCase().includes(search) ||
        trip.driver?.firstName?.toLowerCase().includes(search) ||
        trip.driver?.lastName?.toLowerCase().includes(search) ||
        trip.startLocation?.address?.toLowerCase().includes(search) ||
        trip.endLocation?.address?.toLowerCase().includes(search) ||
        trip.id?.toLowerCase().includes(search)
      );
    }
    
    if (status && status !== '') {
      result = result.filter(trip => trip.status === status);
    }
    
    if (type && type !== '') {
      result = result.filter(trip => trip.type === type);
    }
    
    return result;
  });

  // Set up reactive effect for data updates in injection context
  private updateDataSourceEffect = effect(() => {
    const trips = this.filteredTrips();
    console.log('Trips updated:', trips);
    if (this.dataSource) {
      this.dataSource.data = trips;
      
      // Ensure sorting is re-applied after data updates
      if (this.sort && this.dataSource.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  });

  ngOnInit() {
    this.initializeFilters();
    this.loadTrips();
  }

  ngAfterViewInit() {
    // Configure data source with paginator and sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Configure sorting for nested properties
    this.dataSource.sortingDataAccessor = (item: Trip, property: string) => {
      switch (property) {
        case 'scheduledStart':
          return item.scheduledStartTime;
        case 'status':
          return item.status;
        default:
          return (item as any)[property];
      }
    };
    
    // Initial data load
    this.dataSource.data = this.filteredTrips();
    
    console.log('🚗 Trips table initialized with sort:', this.sort, 'and paginator:', this.paginator);
  }

  private initializeFilters(): void {
    // Subscribe to search control changes and update signal
    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm.set(value || '');
    });

    // Subscribe to status control changes and update signal
    this.statusControl.valueChanges.subscribe(value => {
      this.statusFilter.set(value || '');
    });

    // Subscribe to type control changes and update signal  
    this.typeControl.valueChanges.subscribe(value => {
      this.typeFilter.set(value || '');
    });
  }

  private async loadTrips(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Use the core service's loadTrips method which uses signals
      await this.tripService.loadTrips();
      
      // Get trips from the service's signal
      const trips = this.tripService.trips();
      this.trips.set(trips);
      this.totalTrips.set(trips.length);
      
      // Calculate stats
      this.calculateStats(trips);
      
      console.log('🚗 Loaded trips from core service:', trips);
    } catch (error) {
      console.error('Error loading trips:', error);
      this.snackBar.open('Failed to load trips', 'Close', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.typeControl.setValue('');
    // Also reset the signals directly to ensure immediate update
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.typeFilter.set('');
  }

  private calculateStats(trips: Trip[]): void {
    this.scheduledTrips.set(trips.filter(trip => trip.status === TripStatus.SCHEDULED).length);
    this.inProgressTrips.set(trips.filter(trip => trip.status === TripStatus.IN_PROGRESS).length);
    this.completedTrips.set(trips.filter(trip => trip.status === TripStatus.COMPLETED).length);
  }

  protected getStatusColor(status: TripStatus): 'primary' | 'accent' | 'warn' | '' {
    switch (status) {
      case TripStatus.SCHEDULED:
        return 'primary';
      case TripStatus.IN_PROGRESS:
        return 'accent';
      case TripStatus.COMPLETED:
        return '';
      case TripStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }

  protected getShortAddress(address: string): string {
    return address.split(',')[0] || address;
  }

  protected onRowClick(trip: Trip): void {
    console.log('🚗 Trip row clicked - ID:', trip.id);
  }

  protected async startTrip(trip: Trip): Promise<void> {
    if (!trip.id) return;
    try {
      await this.tripService.startTrip(trip.id);
      this.snackBar.open('Trip started successfully', 'Close', { duration: 3000 });
      await this.loadTrips(); // Reload trips to reflect changes
    } catch (error) {
      console.error('Error starting trip:', error);
      this.snackBar.open('Failed to start trip', 'Close', { duration: 5000 });
    }
  }

  protected async completeTrip(trip: Trip): Promise<void> {
    if (!trip.id) return;
    try {
      await this.tripService.completeTrip(trip.id);
      this.snackBar.open('Trip completed successfully', 'Close', { duration: 3000 });
      await this.loadTrips(); // Reload trips to reflect changes
    } catch (error) {
      console.error('Error completing trip:', error);
      this.snackBar.open('Failed to complete trip', 'Close', { duration: 5000 });
    }
  }

  protected async cancelTrip(trip: Trip): Promise<void> {
    if (!trip.id) return;
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason !== null) { // User didn't cancel the prompt
      try {
        await this.tripService.cancelTrip(trip.id, reason);
        this.snackBar.open('Trip cancelled successfully', 'Close', { duration: 3000 });
        await this.loadTrips(); // Reload trips to reflect changes
      } catch (error) {
        console.error('Error cancelling trip:', error);
        this.snackBar.open('Failed to cancel trip', 'Close', { duration: 5000 });
      }
    }
  }

  protected confirmDelete(trip: Trip): void {
    if (!trip.id) return;
    
    const confirmed = confirm(`Are you sure you want to delete trip #${trip.id.substring(0, 8)}?`);
    
    if (confirmed) {
      this.deleteTrip(trip);
    }
  }

  private async deleteTrip(trip: Trip): Promise<void> {
    if (!trip.id) return;
    try {
      await this.tripService.deleteTrip(trip.id);
      this.snackBar.open('Trip deleted successfully', 'Close', { duration: 3000 });
      await this.loadTrips(); // Reload trips to reflect changes
    } catch (error) {
      console.error('Error deleting trip:', error);
      this.snackBar.open('Failed to delete trip', 'Close', { duration: 5000 });
    }
  }
}
