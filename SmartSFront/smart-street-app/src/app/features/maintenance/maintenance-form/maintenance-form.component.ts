import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaintenanceService } from '../services/maintenance.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AppStateService } from '../../../core/state/app-state.service';
import {
  MaintenanceType,
  MaintenancePriority,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest
} from '../models/maintenance.models';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  styleUrls: ['./maintenance-form.component.scss'],
  template: `
    <div class="maintenance-form-container">
      <div class="header-section">
        <button mat-stroked-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          {{ 'app.back' | translate }}
        </button>
        <h1>{{ isEditMode() ? ('maintenance.editRecord' | translate) : ('maintenance.schedule' | translate) }}</h1>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-content">
        <mat-spinner></mat-spinner>
        <p>{{ 'app.loading' | translate }}</p>
      </div>

      <!-- Form Content -->
      <form *ngIf="!isLoading()" [formGroup]="maintenanceForm" (ngSubmit)="onSubmit()" class="maintenance-form">
        <!-- Basic Information Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'maintenance.basicInfo' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.title' | translate }}</mat-label>
                <input matInput formControlName="title" [placeholder]="'maintenance.titlePlaceholder' | translate">
                <mat-error *ngIf="maintenanceForm.get('title')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.type' | translate }}</mat-label>
                <mat-select formControlName="type">
                  <mat-option *ngFor="let type of typeOptions" [value]="type">
                    {{ getTypeLabel(type) | translate }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="maintenanceForm.get('type')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.priority' | translate }}</mat-label>
                <mat-select formControlName="priority">
                  <mat-option *ngFor="let priority of priorityOptions" [value]="priority">
                    {{ getPriorityLabel(priority) | translate }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="maintenanceForm.get('priority')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'maintenance.fields.description' | translate }}</mat-label>
                <textarea matInput rows="3" formControlName="description" 
                         [placeholder]="'maintenance.descriptionPlaceholder' | translate"></textarea>
                <mat-error *ngIf="maintenanceForm.get('description')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Vehicle & Scheduling Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'maintenance.vehicleScheduling' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.vehicle' | translate }}</mat-label>
                <mat-select formControlName="vehicleId">
                  <mat-option *ngFor="let vehicle of vehicleService.vehicles()" [value]="vehicle.id">
                    {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.licensePlate }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="maintenanceForm.get('vehicleId')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.scheduledDate' | translate }}</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="scheduledDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="maintenanceForm.get('scheduledDate')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.mileage' | translate }}</mat-label>
                <input matInput type="number" formControlName="mileageAtService" 
                       [placeholder]="'maintenance.mileagePlaceholder' | translate">
                <mat-error *ngIf="maintenanceForm.get('mileageAtService')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
                <mat-error *ngIf="maintenanceForm.get('mileageAtService')?.hasError('min')">
                  {{ 'validation.minValue' | translate: { value: 0 } }}
                </mat-error>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Service Details Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'maintenance.serviceDetails' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.technician' | translate }}</mat-label>
                <input matInput formControlName="technician" 
                       [placeholder]="'maintenance.technicianPlaceholder' | translate">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.serviceProvider' | translate }}</mat-label>
                <input matInput formControlName="serviceProvider" 
                       [placeholder]="'maintenance.providerPlaceholder' | translate">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'maintenance.fields.cost' | translate }}</mat-label>
                <input matInput type="number" step="0.01" formControlName="cost" 
                       [placeholder]="'maintenance.costPlaceholder' | translate">
                <span matTextSuffix>TND</span>
                <mat-error *ngIf="maintenanceForm.get('cost')?.hasError('min')">
                  {{ 'validation.minValue' | translate: { value: 0 } }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'maintenance.fields.notes' | translate }}</mat-label>
                <textarea matInput rows="4" formControlName="notes" 
                         [placeholder]="'maintenance.notesPlaceholder' | translate"></textarea>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button type="button" mat-stroked-button (click)="goBack()" [disabled]="isSaving()">
            {{ 'app.cancel' | translate }}
          </button>
          <button type="submit" mat-raised-button color="primary" [disabled]="maintenanceForm.invalid || isSaving()">
            <mat-icon *ngIf="!isSaving()">{{ isEditMode() ? 'save' : 'schedule' }}</mat-icon>
            <mat-spinner diameter="20" *ngIf="isSaving()"></mat-spinner>
            {{ isEditMode() ? ('app.save' | translate) : ('maintenance.schedule' | translate) }}
          </button>
        </div>
      </form>

      <ng-template #loadingTemplate>
        <div class="loading">
          <mat-spinner diameter="48"></mat-spinner>
          <p>{{ 'app.loading' | translate }}</p>
        </div>
      </ng-template>
    </div>
  `
})
export class MaintenanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private maintenanceService = inject(MaintenanceService);
  protected vehicleService = inject(VehicleService);
  private appState = inject(AppStateService);
  private translate = inject(TranslateService);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isEditMode = signal<boolean>(false);
  private maintenanceId: string | null = null;

  protected readonly typeOptions = Object.values(MaintenanceType);
  protected readonly priorityOptions = Object.values(MaintenancePriority);

  protected maintenanceForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    type: ['', [Validators.required]],
    priority: [MaintenancePriority.MEDIUM, [Validators.required]],
    vehicleId: ['', [Validators.required]],
    scheduledDate: ['', [Validators.required]],
    mileageAtService: ['', [Validators.required, Validators.min(0)]],
    technician: [''],
    serviceProvider: [''],
    cost: ['', [Validators.min(0)]],
    notes: ['']
  });

  async ngOnInit(): Promise<void> {
    this.maintenanceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.maintenanceId);

    this.isLoading.set(true);
    
    try {
      await Promise.all([
        this.vehicleService.loadVehicles(),
        this.loadMaintenanceData()
      ]);
    } catch (error) {
      console.error('Error loading form data:', error);
      this.appState.showNotification(
        this.translate.instant('maintenance.loadError'),
        'error'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadMaintenanceData(): Promise<void> {
    if (this.maintenanceId) {
      await this.maintenanceService.loadMaintenanceRecords();
      const record = this.maintenanceService.getMaintenanceRecord(this.maintenanceId);
      
      if (record) {
        this.maintenanceForm.patchValue({
          title: record.title,
          description: record.description,
          type: record.type,
          priority: record.priority,
          vehicleId: record.vehicleId,
          scheduledDate: new Date(record.scheduledDate),
          mileageAtService: record.mileageAtService,
          technician: record.technician || '',
          serviceProvider: record.serviceProvider || '',
          cost: record.cost || '',
          notes: record.notes || ''
        });
      }
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.maintenanceForm.invalid) return;

    this.isSaving.set(true);

    try {
      const formValue = this.maintenanceForm.value;
      
      if (this.isEditMode() && this.maintenanceId) {
        const updateRequest: UpdateMaintenanceRequest = {
          id: this.maintenanceId,
          ...formValue,
          scheduledDate: formValue.scheduledDate
        };
        await this.maintenanceService.updateMaintenanceRecord(updateRequest);
        this.appState.showNotification(
          this.translate.instant('maintenance.updateSuccess'),
          'success'
        );
      } else {
        const createRequest: CreateMaintenanceRequest = {
          ...formValue,
          scheduledDate: formValue.scheduledDate
        };
        await this.maintenanceService.createMaintenanceRecord(createRequest);
        this.appState.showNotification(
          this.translate.instant('maintenance.createSuccess'),
          'success'
        );
      }

      this.goBack();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      const errorMessage = this.isEditMode() 
        ? 'maintenance.updateError' 
        : 'maintenance.createError';
      this.appState.showNotification(
        this.translate.instant(errorMessage),
        'error'
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/maintenance']);
  }

  protected getTypeLabel(type: MaintenanceType): string {
    return `maintenance.type.${type.toLowerCase()}`;
  }

  protected getPriorityLabel(priority: MaintenancePriority): string {
    return `maintenance.priority.${priority.toLowerCase()}`;
  }
}
