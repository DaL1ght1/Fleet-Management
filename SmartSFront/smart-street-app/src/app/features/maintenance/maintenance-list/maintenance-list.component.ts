import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaintenanceService } from '../services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AppStateService } from '../../../core/state/app-state.service';
import {
  MaintenanceRecord,
  MaintenanceFilter,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority
} from '../models/maintenance.models';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  styleUrls: ['./maintenance-list.component.scss'],
  template: `
    <div class="list-container">
      <!-- Modern Header Section -->
      <div class="list-header">
        <div class="header-left">
          <div class="page-title">
            <div class="title-icon">
              <mat-icon>build</mat-icon>
            </div>
            {{ 'maintenance.title' | translate }}
          </div>
          <p class="page-subtitle">{{ 'maintenance.subtitle' | translate }}</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button class="btn btn-primary" (click)="navigateToNew()">
            <mat-icon>add</mat-icon>
            {{ 'maintenance.schedule' | translate }}
          </button>
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card overdue" (click)="filterByOverdue()">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ overdueCount() }}</div>
              <div class="stat-label">{{ 'maintenance.overdue' | translate }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <mat-icon>trending_up</mat-icon>
          </div>
        </div>

        <div class="stat-card critical" (click)="filterByCritical()">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>priority_high</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ criticalCount() }}</div>
              <div class="stat-label">{{ 'maintenance.critical' | translate }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <mat-icon>warning_amber</mat-icon>
          </div>
        </div>

        <div class="stat-card upcoming" (click)="filterByUpcoming()">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ upcomingCount() }}</div>
              <div class="stat-label">{{ 'maintenance.upcoming' | translate }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <mat-icon>trending_flat</mat-icon>
          </div>
        </div>

        <div class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>format_list_bulleted</mat-icon>
            </div>
            <div class="stat-details">
              <div class="stat-value">{{ maintenanceService.maintenanceRecords().length }}</div>
              <div class="stat-label">{{ 'maintenance.records' | translate }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <mat-icon>insights</mat-icon>
          </div>
        </div>
      </div>

      <!-- Enhanced Filters -->
      <div class="filters-card">
        <div class="filters-header">
          <div class="filters-title">
            <mat-icon>filter_list</mat-icon>
            {{ 'app.filters' | translate }}
          </div>
          <button mat-button class="btn btn-ghost" (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            {{ 'app.clear' | translate }}
          </button>
        </div>
        
        <div class="filters-grid">
          <div class="search-box">
            <mat-icon class="search-icon">search</mat-icon>
            <input type="text" 
                   [ngModel]="searchTerm()" 
                   (ngModelChange)="searchTerm.set($event)" 
                   (input)="onFilterChange()"
                   [placeholder]="'maintenance.searchPlaceholder' | translate">
          </div>
          
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>{{ 'maintenance.filterByStatus' | translate }}</mat-label>
            <mat-select [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)" (selectionChange)="onFilterChange()">
              <mat-option value="">{{ 'maintenance.allStatuses' | translate }}</mat-option>
              <mat-option *ngFor="let status of statusOptions" [value]="status">
                {{ getStatusLabel(status) | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>{{ 'maintenance.filterByType' | translate }}</mat-label>
            <mat-select [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)" (selectionChange)="onFilterChange()">
              <mat-option value="">{{ 'maintenance.allTypes' | translate }}</mat-option>
              <mat-option *ngFor="let type of typeOptions" [value]="type">
                {{ getTypeLabel(type) | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>{{ 'maintenance.filterByPriority' | translate }}</mat-label>
            <mat-select [ngModel]="selectedPriority()" (ngModelChange)="selectedPriority.set($event)" (selectionChange)="onFilterChange()">
              <mat-option value="">{{ 'maintenance.allPriorities' | translate }}</mat-option>
              <mat-option *ngFor="let priority of priorityOptions" [value]="priority">
                {{ getPriorityLabel(priority) | translate }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Modern Records Layout -->
      <div class="maintenance-records" *ngIf="!maintenanceService.isLoading(); else loadingTemplate">
        <div class="data-table-card" *ngIf="filteredRecords().length > 0; else noRecordsTemplate">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <div class="results-count">
                {{ filteredRecords().length }} {{ 'app.results' | translate }}
              </div>
            </div>
            <div class="toolbar-right">
              <button mat-icon-button>
                <mat-icon>view_list</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>view_module</mat-icon>
              </button>
            </div>
          </div>
          
          <div class="records-list">
            <div class="record-card priority-{{ record.priority.toLowerCase() }}" *ngFor="let record of filteredRecords()" (click)="navigateToDetail(record.id)">
              <div class="record-priority" [ngClass]="'priority-' + record.priority.toLowerCase()"></div>
              
              <div class="record-main">
                <div class="record-header">
                  <div class="record-title">{{ record.title }}</div>
                  <div class="record-status-badge badge" [ngClass]="'badge-' + getStatusBadgeClass(record.status)">
                    {{ getStatusLabel(record.status) | translate }}
                  </div>
                </div>
                
                <div class="record-meta">
                  <div class="meta-item">
                    <mat-icon>build</mat-icon>
                    <span>{{ getTypeLabel(record.type) | translate }}</span>
                  </div>
                  <div class="meta-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ record.scheduledDate | date:'MMM dd, yyyy' }}</span>
                  </div>
                  <div class="meta-item" *ngIf="getVehicleInfo(record.vehicleId) as vehicle">
                    <mat-icon>directions_car</mat-icon>
                    <span>{{ vehicle.make }} {{ vehicle.model }}</span>
                  </div>
                  <div class="meta-item" *ngIf="record.cost">
                    <mat-icon>attach_money</mat-icon>
                    <span>{{ record.cost | currency }}</span>
                  </div>
                </div>
                
                <div class="record-description" *ngIf="record.description">
                  {{ record.description }}
                </div>
              </div>
              
              <div class="record-actions" (click)="$event.stopPropagation()">
                <button mat-icon-button class="action-btn" [matMenuTriggerFor]="recordMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #recordMenu>
                  <button mat-menu-item (click)="navigateToDetail(record.id)">
                    <mat-icon>visibility</mat-icon>
                    {{ 'app.view' | translate }}
                  </button>
                  <button mat-menu-item (click)="navigateToEdit(record.id)">
                    <mat-icon>edit</mat-icon>
                    {{ 'app.edit' | translate }}
                  </button>
                  <button mat-menu-item (click)="deleteRecord(record)" class="delete-action">
                    <mat-icon>delete</mat-icon>
                    {{ 'app.delete' | translate }}
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="empty-state-container">
          <div class="loading">
            <div class="loading-spinner-lg"></div>
            <p>{{ 'maintenance.loading' | translate }}</p>
          </div>
        </div>
      </ng-template>

      <ng-template #noRecordsTemplate>
        <div class="empty-state-container">
          <div class="empty-icon">
            <mat-icon>build_circle</mat-icon>
          </div>
          <div class="empty-title">{{ 'maintenance.noRecords' | translate }}</div>
          <div class="empty-description">{{ 'maintenance.noRecordsDescription' | translate }}</div>
          <div class="empty-actions">
            <button mat-raised-button class="btn btn-primary" (click)="navigateToNew()">
              <mat-icon>add</mat-icon>
              {{ 'maintenance.scheduleFirst' | translate }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class MaintenanceListComponent implements OnInit {
  private router = inject(Router);
  private appState = inject(AppStateService);
  protected maintenanceService = inject(MaintenanceService);
  private vehicleService = inject(VehicleService);
  private translate = inject(TranslateService);

  protected searchTerm = signal<string>('');
  protected selectedStatus = signal<string>('');
  protected selectedType = signal<string>('');
  protected selectedPriority = signal<string>('');

  protected readonly statusOptions = Object.values(MaintenanceStatus);
  protected readonly typeOptions = Object.values(MaintenanceType);
  protected readonly priorityOptions = Object.values(MaintenancePriority);

  protected readonly filteredRecords = computed(() => {
    const filter: MaintenanceFilter = {
      searchTerm: this.searchTerm() || undefined,
      status: this.selectedStatus() as MaintenanceStatus || undefined,
      type: this.selectedType() as MaintenanceType || undefined,
      priority: this.selectedPriority() as MaintenancePriority || undefined
    };
    
    return this.maintenanceService.filterRecords(filter);
  });

  protected readonly overdueCount = computed(() => 
    this.maintenanceService.overdueRecords().length
  );

  protected readonly criticalCount = computed(() => 
    this.maintenanceService.criticalRecords().length
  );

  protected readonly upcomingCount = computed(() => 
    this.maintenanceService.upcomingRecords().length
  );

  async ngOnInit(): Promise<void> {
    try {
      await Promise.all([
        this.maintenanceService.loadMaintenanceRecords(),
        this.vehicleService.loadVehicles()
      ]);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      this.appState.showNotification(
        this.translate.instant('maintenance.loadError'),
        'error'
      );
    }
  }

  protected onFilterChange(): void {

  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedType.set('');
    this.selectedPriority.set('');
  }

  protected filterByOverdue(): void {
    this.clearFilters();
    this.selectedStatus.set(MaintenanceStatus.OVERDUE);
  }

  protected filterByCritical(): void {
    this.clearFilters();
    this.selectedPriority.set(MaintenancePriority.CRITICAL);
  }

  protected filterByUpcoming(): void {
    this.clearFilters();
    this.selectedStatus.set(MaintenanceStatus.SCHEDULED);
  }

  protected navigateToNew(): void {
    this.router.navigate(['/maintenance/new']);
  }

  protected navigateToDetail(id: string): void {
    this.router.navigate(['/maintenance', id]);
  }

  protected navigateToEdit(id: string): void {
    this.router.navigate(['/maintenance', id, 'edit']);
  }

  protected async deleteRecord(record: MaintenanceRecord): Promise<void> {
    const confirmed = confirm(
      this.translate.instant('maintenance.confirmDelete', { title: record.title })
    );
    
    if (confirmed) {
      try {
        await this.maintenanceService.deleteMaintenanceRecord(record.id);
        this.appState.showNotification(
          this.translate.instant('maintenance.deleteSuccess'),
          'success'
        );
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        this.appState.showNotification(
          this.translate.instant('maintenance.deleteError'),
          'error'
        );
      }
    }
  }

  protected getStatusLabel(status: MaintenanceStatus): string {
    return `maintenance.status.${status.toLowerCase()}`;
  }

  protected getTypeLabel(type: MaintenanceType): string {
    return `maintenance.type.${type.toLowerCase()}`;
  }

  protected getPriorityLabel(priority: MaintenancePriority): string {
    return `maintenance.priority.${priority.toLowerCase()}`;
  }

  protected getVehicleInfo(vehicleId: string) {
    return this.vehicleService.vehicles().find(v => v.id === vehicleId);
  }

  protected getStatusBadgeClass(status: MaintenanceStatus): string {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return 'success';
      case MaintenanceStatus.IN_PROGRESS:
        return 'warning';
      case MaintenanceStatus.OVERDUE:
        return 'error';
      case MaintenanceStatus.CANCELLED:
        return 'error';
      case MaintenanceStatus.SCHEDULED:
      default:
        return 'info';
    }
  }
}
