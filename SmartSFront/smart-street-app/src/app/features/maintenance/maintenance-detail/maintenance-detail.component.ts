import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaintenanceService } from '../services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AppStateService } from '../../../core/state/app-state.service';
import {
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceType,
  MaintenancePriority
} from '../models/maintenance.models';

@Component({
  selector: 'app-maintenance-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    TranslateModule
  ],
  styleUrls: ['./maintenance-detail.component.scss'],
  template: `
    <div class="maintenance-detail-container">
      <div class="header-section">
        <div class="nav-section">
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            {{ 'app.back' | translate }}
          </button>
        </div>
        
        <div class="title-section" *ngIf="maintenanceRecord()">
          <div class="title-content">
            <h1>{{ maintenanceRecord()!.title }}</h1>
            <div class="badges">
              <mat-chip-set>
                <mat-chip [class]="'status-chip-' + maintenanceRecord()!.status.toLowerCase()">
                  {{ getStatusLabel(maintenanceRecord()!.status) | translate }}
                </mat-chip>
                <mat-chip [class]="'priority-chip-' + maintenanceRecord()!.priority.toLowerCase()">
                  {{ getPriorityLabel(maintenanceRecord()!.priority) | translate }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
          <div class="actions-section">
            <button mat-stroked-button (click)="editRecord()" *ngIf="canEdit()">
              <mat-icon>edit</mat-icon>
              {{ 'app.edit' | translate }}
            </button>
            <button mat-icon-button [matMenuTriggerFor]="actionMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionMenu>
              <button mat-menu-item (click)="editRecord()" *ngIf="canEdit()">
                <mat-icon>edit</mat-icon>
                {{ 'app.edit' | translate }}
              </button>
              <button mat-menu-item (click)="deleteRecord()" class="delete-action">
                <mat-icon>delete</mat-icon>
                {{ 'app.delete' | translate }}
              </button>
            </mat-menu>
          </div>
        </div>
      </div>

      <div class="content" *ngIf="!isLoading(); else loadingTemplate">
        <div class="detail-card" *ngIf="maintenanceRecord()">
          <mat-card class="info-card">
            <mat-card-content>
              <div class="card-section">
                <h3>{{ 'maintenance.basicInfo' | translate }}</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">{{ 'maintenance.fields.type' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>build</mat-icon>
                      {{ getTypeLabel(maintenanceRecord()!.type) | translate }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">{{ 'maintenance.fields.scheduledDate' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>schedule</mat-icon>
                      {{ maintenanceRecord()!.scheduledDate | date:'full' }}
                    </div>
                  </div>
                  <div class="info-item" *ngIf="maintenanceRecord()!.completedDate">
                    <div class="info-label">{{ 'maintenance.fields.completedDate' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>check_circle</mat-icon>
                      {{ maintenanceRecord()!.completedDate | date:'full' }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">{{ 'maintenance.fields.mileage' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>speed</mat-icon>
                      {{ maintenanceRecord()!.mileageAtService | number }} km
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-section" *ngIf="vehicleInfo()">
                <h3>{{ 'maintenance.vehicleInfo' | translate }}</h3>
                <div class="vehicle-info">
                  <div class="vehicle-main">
                    <mat-icon class="vehicle-icon">directions_car</mat-icon>
                    <div class="vehicle-details">
                      <div class="vehicle-name">{{ vehicleInfo()!.make }} {{ vehicleInfo()!.model }}</div>
                      <div class="vehicle-plate">{{ vehicleInfo()!.licensePlate }}</div>
                      <div class="vehicle-year">{{ vehicleInfo()!.year }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-section">
                <h3>{{ 'maintenance.description' | translate }}</h3>
                <div class="description-content">
                  {{ maintenanceRecord()!.description }}
                </div>
              </div>

              <div class="card-section" *ngIf="hasServiceDetails()">
                <h3>{{ 'maintenance.serviceDetails' | translate }}</h3>
                <div class="info-grid">
                  <div class="info-item" *ngIf="maintenanceRecord()!.technician">
                    <div class="info-label">{{ 'maintenance.fields.technician' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>person</mat-icon>
                      {{ maintenanceRecord()!.technician }}
                    </div>
                  </div>
                  <div class="info-item" *ngIf="maintenanceRecord()!.serviceProvider">
                    <div class="info-label">{{ 'maintenance.fields.serviceProvider' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>business</mat-icon>
                      {{ maintenanceRecord()!.serviceProvider }}
                    </div>
                  </div>
                  <div class="info-item" *ngIf="maintenanceRecord()!.cost">
                    <div class="info-label">{{ 'maintenance.fields.cost' | translate }}</div>
                    <div class="info-value cost">
                      <mat-icon>attach_money</mat-icon>
                      {{ maintenanceRecord()!.cost | number:'1.2-2' }} TND
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-section" *ngIf="maintenanceRecord()!.notes">
                <h3>{{ 'maintenance.fields.notes' | translate }}</h3>
                <div class="notes-content">
                  {{ maintenanceRecord()!.notes }}
                </div>
              </div>

              <div class="card-section">
                <h3>{{ 'maintenance.timestamps' | translate }}</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">{{ 'maintenance.createdAt' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>add_circle</mat-icon>
                      {{ maintenanceRecord()!.createdAt | date:'medium' }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">{{ 'maintenance.updatedAt' | translate }}</div>
                    <div class="info-value">
                      <mat-icon>edit</mat-icon>
                      {{ maintenanceRecord()!.updatedAt | date:'medium' }}
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'app.loading' | translate }}</p>
        </div>
      </ng-template>
    </div>
  `
})
export class MaintenanceDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private maintenanceService = inject(MaintenanceService);
  private vehicleService = inject(VehicleService);
  private appState = inject(AppStateService);
  private translate = inject(TranslateService);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly maintenanceRecord = signal<MaintenanceRecord | null>(null);
  
  private maintenanceId: string | null = null;

  protected readonly vehicleInfo = signal<any>(null);

  async ngOnInit(): Promise<void> {
    this.maintenanceId = this.route.snapshot.paramMap.get('id');
    
    if (!this.maintenanceId) {
      this.router.navigate(['/maintenance']);
      return;
    }

    this.isLoading.set(true);

    try {
      await Promise.all([
        this.maintenanceService.loadMaintenanceRecords(),
        this.vehicleService.loadVehicles()
      ]);

      const record = this.maintenanceService.getMaintenanceRecord(this.maintenanceId);
      if (record) {
        this.maintenanceRecord.set(record);
        const vehicle = this.vehicleService.vehicles().find(v => v.id === record.vehicleId);
        this.vehicleInfo.set(vehicle || null);
      } else {
        this.appState.showNotification(
          this.translate.instant('maintenance.recordNotFound'),
          'error'
        );
        this.router.navigate(['/maintenance']);
      }
    } catch (error) {
      console.error('Error loading maintenance record:', error);
      this.appState.showNotification(
        this.translate.instant('maintenance.loadError'),
        'error'
      );
      this.router.navigate(['/maintenance']);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/maintenance']);
  }

  protected editRecord(): void {
    if (this.maintenanceId) {
      this.router.navigate(['/maintenance', this.maintenanceId, 'edit']);
    }
  }

  protected async deleteRecord(): Promise<void> {
    if (!this.maintenanceRecord() || !this.maintenanceId) return;

    const confirmed = confirm(
      this.translate.instant('maintenance.confirmDelete', { 
        title: this.maintenanceRecord()!.title 
      })
    );
    
    if (confirmed) {
      try {
        await this.maintenanceService.deleteMaintenanceRecord(this.maintenanceId);
        this.appState.showNotification(
          this.translate.instant('maintenance.deleteSuccess'),
          'success'
        );
        this.router.navigate(['/maintenance']);
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        this.appState.showNotification(
          this.translate.instant('maintenance.deleteError'),
          'error'
        );
      }
    }
  }

  protected canEdit(): boolean {
    const record = this.maintenanceRecord();
    return record ? record.status !== MaintenanceStatus.COMPLETED : false;
  }

  protected hasServiceDetails(): boolean {
    const record = this.maintenanceRecord();
    return record ? !!(record.technician || record.serviceProvider || record.cost) : false;
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
}
