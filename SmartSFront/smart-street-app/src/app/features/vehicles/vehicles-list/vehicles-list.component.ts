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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, Status, FuelType } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicles-list',
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
    TranslateModule,
  ],
  template: `
    <div class="vehicles-container">
      <div class="header-section">
        <div class="title-section">
          <h1>{{ 'vehicles.title' | translate }}</h1>
          <p>{{ 'vehicles.subtitle' | translate }}</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" routerLink="/vehicles/new">
            <mat-icon>add</mat-icon>
            {{ 'vehicles.addVehicle' | translate }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">directions_car</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ vehicleService.vehicleCount() }}</div>
                <div class="stat-label">{{ 'dashboard.totalVehicles' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #4caf50;">check_circle</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ vehicleService.activeVehicles() }}</div>
                <div class="stat-label">{{ 'dashboard.activeVehicles' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #ff9800;">build</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ vehicleService.maintenanceVehicles() }}</div>
                <div class="stat-label">{{ 'vehicles.status.maintenance' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #f44336;">pause</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ vehicleService.inactiveVehicles() }}</div>
                <div class="stat-label">{{ 'vehicles.status.inactive' | translate }}</div>
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
              <input matInput [formControl]="searchControl" [placeholder]="'vehicles.fields.make' + ', ' + ('vehicles.fields.model' | translate) + ', ' + ('vehicles.fields.licensePlate' | translate) + ', ' + ('vehicles.fields.vin' | translate)">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'vehicles.fields.status' | translate }}</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">{{ 'app.filter' | translate }}</mat-option>
                <mat-option value="ACTIVE">{{ 'vehicles.status.active' | translate }}</mat-option>
                <mat-option value="INACTIVE">{{ 'vehicles.status.inactive' | translate }}</mat-option>
                <mat-option value="MAINTENANCE">{{ 'vehicles.status.maintenance' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              {{ 'app.reset' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Vehicles Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div *ngIf="isLoading()" class="loading-content">
            <mat-spinner></mat-spinner>
            <p>{{ 'app.loading' | translate }}</p>
          </div>
          

          <div *ngIf="!isLoading() && filteredVehicles().length === 0" class="empty-state">
            <mat-icon>directions_car</mat-icon>
            <h3>{{ 'vehicles.messages.loadError' | translate }}</h3>
            <p>{{ 'vehicles.subtitle' | translate }}</p>
            <button mat-raised-button color="primary" routerLink="/vehicles/new">
              <mat-icon>add</mat-icon>
              {{ 'vehicles.addVehicle' | translate }}
            </button>
          </div>

          <div *ngIf="!isLoading() && filteredVehicles().length > 0" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="vehicles-table">
              <!-- License Plate Column -->
              <ng-container matColumnDef="licensePlate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'vehicles.fields.licensePlate' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  <strong>{{ vehicle.licensePlate }}</strong>
                </td>
              </ng-container>

              <!-- Vehicle Info Column -->
              <ng-container matColumnDef="vehicleInfo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="make">{{ 'navigation.vehicles' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  <div class="vehicle-info">
                    <div class="primary-info">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</div>
                    <div class="secondary-info">{{ vehicle.color }} • {{ vehicle.fuelType }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'vehicles.fields.status' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  <mat-chip-set>
                    <mat-chip 
                      [color]="getStatusColor(vehicle.status)" 
                      [class]="'status-chip-' + vehicle.status.toLowerCase()">
                      {{ 'vehicles.status.' + vehicle.status.toLowerCase() | translate }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Mileage Column -->
              <ng-container matColumnDef="mileage">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'vehicles.fields.mileage' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  {{ vehicle.mileage | number }} miles
                </td>
              </ng-container>

              <!-- Seating Column -->
              <ng-container matColumnDef="seating">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="seatingCapacity">{{ 'vehicles.fields.seatingCapacity' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  {{ vehicle.seatingCapacity }} seats
                </td>
              </ng-container>

              <!-- Daily Rate Column -->
              <ng-container matColumnDef="dailyRate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="rentalPricePerDay">{{ 'billing.fields.amount' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  {{ vehicle.rentalPricePerDay | currency }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>{{ 'dashboard.quickActions' | translate }}</th>
                <td mat-cell *matCellDef="let vehicle">
                  <button mat-icon-button [matMenuTriggerFor]="vehicleMenu" [matMenuTriggerData]="{ vehicle: vehicle }">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="clickable-row" 
                  (click)="onRowClick(row)"
                  [routerLink]="['/vehicles', row.id]">
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

    <!-- Vehicle Actions Menu -->
    <mat-menu #vehicleMenu="matMenu">
      <ng-template matMenuContent let-vehicle="vehicle">
        <button mat-menu-item [routerLink]="['/vehicles', vehicle.id]">
          <mat-icon>visibility</mat-icon>
          <span>{{ 'vehicles.vehicleDetails' | translate }}</span>
        </button>
        <button mat-menu-item [routerLink]="['/vehicles', vehicle.id, 'edit']">
          <mat-icon>edit</mat-icon>
          <span>{{ 'app.edit' | translate }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="updateStatus(vehicle, Status.ACTIVE)" 
                [disabled]="vehicle.status === Status.ACTIVE">
          <mat-icon>play_arrow</mat-icon>
          <span>{{ 'vehicles.status.active' | translate }}</span>
        </button>
        <button mat-menu-item (click)="updateStatus(vehicle, Status.MAINTENANCE)" 
                [disabled]="vehicle.status === Status.MAINTENANCE">
          <mat-icon>build</mat-icon>
          <span>{{ 'vehicles.status.maintenance' | translate }}</span>
        </button>
        <button mat-menu-item (click)="updateStatus(vehicle, Status.INACTIVE)" 
                [disabled]="vehicle.status === Status.INACTIVE">
          <mat-icon>pause</mat-icon>
          <span>{{ 'vehicles.status.inactive' | translate }}</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="confirmDelete(vehicle)" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>{{ 'app.delete' | translate }}</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .vehicles-container {
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
        
        &:has(mat-icon[style*="color: #f44336"]) {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
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
              border-radius: var(--radius-lg);
            }
          }
        }
      }
      
      ::ng-deep {
        .mat-mdc-form-field {
          .mat-mdc-text-field-wrapper {
            border-radius: var(--radius-md);
          }
        }
        
        button[mat-stroked-button] {
          height: 48px;
          border-radius: var(--radius-lg);
          border-color: var(--color-border);
          transition: all 0.3s ease;
          
          &:hover {
            background: var(--color-background-secondary);
            border-color: var(--color-primary-300);
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
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
      
      .vehicles-table {
        width: 100%;
        
        .mat-mdc-header-row {
          background: var(--color-background-secondary);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        }
        
        .mat-mdc-header-cell {
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          font-size: var(--font-size-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: var(--space-4) var(--space-6);
        }
        
        .mat-mdc-cell {
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--color-border);
        }
        
        .mat-mdc-row {
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--color-background-secondary);
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
            font-weight: var(--font-weight-bold);
            color: var(--color-text-primary);
            font-size: var(--font-size-base);
            margin-bottom: var(--space-1);
          }
          
          .secondary-info {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
            font-weight: var(--font-weight-medium);
          }
        }
        
        .clickable-row {
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--color-background-secondary);
            transform: scale(1.005);
          }
        }
      }
    }

    .loading-content, .empty-state {
      text-align: center;
      padding: var(--space-20) var(--space-10);
      
      mat-spinner {
        margin: 0 auto var(--space-6);
        transform: scale(1.2);
      }
      
      mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: var(--color-text-tertiary);
        margin-bottom: var(--space-6);
        opacity: 0.6;
      }
      
      h3 {
        margin: 0 0 var(--space-3) 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-medium);
      }
      
      p {
        margin: 0 0 var(--space-8) 0;
        color: var(--color-text-tertiary);
        font-size: var(--font-size-lg);
        line-height: 1.5;
      }
      
      button {
        background: linear-gradient(135deg, #667eea, #764ba2);
        height: 48px;
        padding: 0 var(--space-8);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      }
    }
    
    .delete-action {
      color: var(--color-error);
    }
    
    // Custom chip styling for better status visualization
    mat-chip-set {
      mat-chip {
        font-weight: 500;
        font-size: 12px;
        padding: 4px 12px;
        
        &[color="primary"], &.status-chip-active {
          background-color: #e8f5e8 !important;
          color: #2e7d32 !important;
          border: 1px solid #4caf50 !important;
        }
        
        &[color="accent"], &.status-chip-maintenance {
          background-color: #fff8e1 !important;
          color: #f57c00 !important;
          border: 1px solid #ff9800 !important;
        }
        
        &[color="warn"], &.status-chip-inactive {
          background-color: #ffebee !important;
          color: #c62828 !important;
          border: 1px solid #f44336 !important;
        }
        
        // Default styling for chips without specific color
        &:not([color]):not(.status-chip-active):not(.status-chip-maintenance):not(.status-chip-inactive) {
          background-color: #f5f5f5 !important;
          color: #666 !important;
          border: 1px solid #ccc !important;
        }
      }
    }

    @media (max-width: 768px) {
      .vehicles-container {
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
export class VehiclesListComponent implements OnInit, AfterViewInit {
  protected vehicleService = inject(VehicleService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // Make Status enum available to template
  protected readonly Status = Status;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Form controls for filters
  protected searchControl = new FormControl('');
  protected statusControl = new FormControl('');

  // Table configuration
  protected displayedColumns = ['licensePlate', 'vehicleInfo', 'status', 'mileage', 'seating', 'dailyRate', 'actions'];
  protected dataSource = new MatTableDataSource<Vehicle>();

  // Computed properties
  protected filteredVehicles = this.vehicleService.filteredVehicles;
  protected isLoading = computed(() => this.vehicleService.isLoading('vehicles-load'));

  ngOnInit() {
    this.initializeFilters();
    this.loadVehicles();
  }

  // Set up reactive effect for data updates in injection context
  private updateDataSourceEffect = effect(() => {
    const vehicles = this.filteredVehicles();
    console.log('Vehicles updated:', vehicles);
    if (this.dataSource) {
      this.dataSource.data = vehicles;
      
      // Ensure sorting is re-applied after data updates
      if (this.sort && this.dataSource.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  });

  ngAfterViewInit() {
    // Configure data source with paginator and sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Configure sorting for nested properties
    this.dataSource.sortingDataAccessor = (item: Vehicle, property: string) => {
      switch (property) {
        case 'vehicleInfo':
        case 'make':
          return item.make;
        case 'seatingCapacity':
          return item.seatingCapacity;
        case 'rentalPricePerDay':
          return item.rentalPricePerDay;
        case 'status':
          return item.status;
        case 'licensePlate':
          return item.licensePlate;
        case 'mileage':
          return item.mileage;
        default:
          return (item as any)[property];
      }
    };
    
    // Initial data load
    this.dataSource.data = this.filteredVehicles();
    
    console.log('🚗 Table initialized with sort:', this.sort, 'and paginator:', this.paginator);
  }

  private initializeFilters(): void {
    // Subscribe to search control changes
    this.searchControl.valueChanges.subscribe(value => {
      this.vehicleService.setFilters({ search: value || '' });
    });

    // Subscribe to status control changes
    this.statusControl.valueChanges.subscribe(value => {
      this.vehicleService.setFilters({ 
        status: value as Status || '' as Status | '' 
      });
    });
  }

  private async loadVehicles(): Promise<void> {
    try {
      await this.vehicleService.loadVehicles();
      this.dataSource.data = this.filteredVehicles();
    } catch (error) {
      console.error('Error loading vehicles:', error);
      this.snackBar.open('Failed to load vehicles', 'Close', { duration: 5000 });
    }
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.vehicleService.clearFilters();
  }

  protected getStatusColor(status: Status | string): 'primary' | 'accent' | 'warn' | '' {
    const statusStr = status.toString().toUpperCase();
    switch (statusStr) {
      case 'ACTIVE':
        return 'primary';  // Blue for active
      case 'MAINTENANCE':
        return 'accent';   // Orange/amber for maintenance
      case 'INACTIVE':
        return 'warn';     // Red for inactive
      default:
        return '';
    }
  }

  protected async updateStatus(vehicle: Vehicle, status: Status): Promise<void> {
    try {
      await this.vehicleService.updateVehicleStatus(vehicle.id, status);
      // The service will handle updating the reactive state
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      this.snackBar.open('Failed to update vehicle status', 'Close', { duration: 5000 });
    }
  }

  protected confirmDelete(vehicle: Vehicle): void {
    const confirmed = confirm(`Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})?`);
    
    if (confirmed) {
      this.deleteVehicle(vehicle);
    }
  }

  private async deleteVehicle(vehicle: Vehicle): Promise<void> {
    try {
      await this.vehicleService.deleteVehicle(vehicle.id);
      // The service will handle updating the reactive state
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      this.snackBar.open('Failed to delete vehicle', 'Close', { duration: 5000 });
    }
  }

  protected onRowClick(vehicle: Vehicle): void {
    console.log('🚗 Vehicle row clicked - ID:', vehicle.id, 'License:', vehicle.licensePlate);
  }
}
