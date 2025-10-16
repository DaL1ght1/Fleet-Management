import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, VehicleInput, Status, FuelType } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="vehicle-form-container">
      <header class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <mat-icon>{{ isEditMode() ? 'edit' : 'add_circle' }}</mat-icon>
          </div>
          <div class="hero-text">
            <h1>{{ isEditMode() ? 'Edit Vehicle' : 'Add New Vehicle' }}</h1>
            <p>{{ isEditMode() ? 'Update vehicle information' : 'Enter vehicle details to add it to your fleet' }}</p>
          </div>
        </div>
        <button 
          mat-stroked-button 
          routerLink="/vehicles"
          class="back-btn">
          <mat-icon>arrow_back</mat-icon>
          Back to vehicles
        </button>
      </header>

      <form [formGroup]="vehicleForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-card class="section-card basic-info">
            <div class="card-header">
              <div class="header-icon">
                <mat-icon>info</mat-icon>
              </div>
              <div class="header-text">
                <h3>Basic Information</h3>
                <p>Enter vehicle identification details</p>
              </div>
            </div>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Make *</mat-label>
                  <input matInput formControlName="make" placeholder="Toyota, Ford, etc.">
                  <mat-error *ngIf="vehicleForm.get('make')?.hasError('required')">
                    Make is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Model *</mat-label>
                  <input matInput formControlName="model" placeholder="Camry, F-150, etc.">
                  <mat-error *ngIf="vehicleForm.get('model')?.hasError('required')">
                    Model is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Year *</mat-label>
                  <input matInput type="number" formControlName="year" placeholder="2023">
                  <mat-error *ngIf="vehicleForm.get('year')?.hasError('required')">
                    Year is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('year')?.hasError('min')">
                    Year must be 1900 or later
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('year')?.hasError('max')">
                    Year cannot be more than next year
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>License Plate *</mat-label>
                  <input matInput formControlName="licensePlate" placeholder="ABC-1234">
                  <mat-error *ngIf="vehicleForm.get('licensePlate')?.hasError('required')">
                    License plate is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Color *</mat-label>
                  <input matInput formControlName="color" placeholder="Red, Blue, Black, etc.">
                  <mat-error *ngIf="vehicleForm.get('color')?.hasError('required')">
                    Color is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status *</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="ACTIVE">Active</mat-option>
                    <mat-option value="INACTIVE">Inactive</mat-option>
                    <mat-option value="MAINTENANCE">Maintenance</mat-option>
                  </mat-select>
                  <mat-error *ngIf="vehicleForm.get('status')?.hasError('required')">
                    Status is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>VIN (Vehicle Identification Number) *</mat-label>
                  <input matInput formControlName="vin" placeholder="1HGBH41JXMN109186">
                  <mat-error *ngIf="vehicleForm.get('vin')?.hasError('required')">
                    VIN is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('vin')?.hasError('minlength')">
                    VIN must be at least 17 characters
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('vin')?.hasError('maxlength')">
                    VIN must be exactly 17 characters
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="section-card specifications">
            <div class="card-header">
              <div class="header-icon">
                <mat-icon>settings</mat-icon>
              </div>
              <div class="header-text">
                <h3>Specifications</h3>
                <p>Vehicle technical details</p>
              </div>
            </div>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Fuel Type *</mat-label>
                  <mat-select formControlName="fuelType">
                    <mat-option value="GASOLINE">Gasoline</mat-option>
                    <mat-option value="DIESEL">Diesel</mat-option>
                    <mat-option value="ELECTRIC">Electric</mat-option>
                    <mat-option value="HYBRID">Hybrid</mat-option>
                  </mat-select>
                  <mat-error *ngIf="vehicleForm.get('fuelType')?.hasError('required')">
                    Fuel type is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Seating Capacity *</mat-label>
                  <input matInput type="number" formControlName="seatingCapacity" placeholder="5">
                  <mat-error *ngIf="vehicleForm.get('seatingCapacity')?.hasError('required')">
                    Seating capacity is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('seatingCapacity')?.hasError('min')">
                    Seating capacity must be at least 1
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Current Mileage *</mat-label>
                  <input matInput type="number" formControlName="mileage" placeholder="25000">
                  <mat-hint>Miles</mat-hint>
                  <mat-error *ngIf="vehicleForm.get('mileage')?.hasError('required')">
                    Mileage is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('mileage')?.hasError('min')">
                    Mileage cannot be negative
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <div class="checkbox-field">
                  <mat-checkbox formControlName="gpsEnabled">
                    GPS Enabled
                  </mat-checkbox>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="section-card rental-info">
            <div class="card-header">
              <div class="header-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="header-text">
                <h3>Rental Information</h3>
                <p>Pricing and rental settings</p>
              </div>
            </div>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Daily Rental Rate *</mat-label>
                  <input matInput type="number" formControlName="rentalPricePerDay" placeholder="75.00" step="0.01">
                  <span matTextPrefix>$&nbsp;</span>
                  <span matTextSuffix>&nbsp;per day</span>
                  <mat-error *ngIf="vehicleForm.get('rentalPricePerDay')?.hasError('required')">
                    Daily rental rate is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('rentalPricePerDay')?.hasError('min')">
                    Daily rental rate must be greater than 0
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="section-card maintenance">
            <div class="card-header">
              <div class="header-icon">
                <mat-icon>build</mat-icon>
              </div>
              <div class="header-text">
                <h3>Maintenance Information</h3>
                <p>Service schedules and history</p>
              </div>
            </div>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Last Maintenance Date *</mat-label>
                  <input matInput [matDatepicker]="lastMaintenancePicker" formControlName="lastMaintenanceDate">
                  <mat-datepicker-toggle matIconSuffix [for]="lastMaintenancePicker"></mat-datepicker-toggle>
                  <mat-datepicker #lastMaintenancePicker></mat-datepicker>
                  <mat-error *ngIf="vehicleForm.get('lastMaintenanceDate')?.hasError('required')">
                    Last maintenance date is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Maintenance Interval *</mat-label>
                  <input matInput type="number" formControlName="maintenanceIntervalDays" placeholder="90">
                  <span matTextSuffix>days</span>
                  <mat-error *ngIf="vehicleForm.get('maintenanceIntervalDays')?.hasError('required')">
                    Maintenance interval is required
                  </mat-error>
                  <mat-error *ngIf="vehicleForm.get('maintenanceIntervalDays')?.hasError('min')">
                    Maintenance interval must be at least 1 day
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" mat-stroked-button routerLink="/vehicles">
            Cancel
          </button>
          <button type="submit" mat-raised-button color="primary"
                  [disabled]="vehicleForm.invalid || isSubmitting()">
            <mat-icon *ngIf="isSubmitting()">
              <mat-spinner diameter="20"></mat-spinner>
            </mat-icon>
            <mat-icon *ngIf="!isSubmitting()">{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
            {{ isSubmitting() ? 'Saving...' : (isEditMode() ? 'Update Vehicle' : 'Add Vehicle') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .vehicle-form-container {
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
      background: var(--color-background);
      min-height: 100vh;
    }

    .hero-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: var(--radius-2xl);
      padding: var(--space-6);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-lg);
      margin-bottom: var(--space-6);
      
      .hero-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
      
      .hero-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }
      
      .hero-text {
        h1 {
          margin: 0;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
        }
        
        p {
          margin: var(--space-1) 0 0;
          opacity: 0.9;
          font-size: var(--font-size-lg);
        }
      }
      
      .back-btn {
        color: #fff;
        border-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(10px);
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .form-grid {
      display: grid;
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .section-card {
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      border: 1px solid var(--color-border);
      
      .card-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-5);
        background: var(--color-background-secondary);
        border-bottom: 1px solid var(--color-border);
      }
      
      .header-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface);
      }
      
      &.basic-info .header-icon {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #fff;
      }
      
      &.specifications .header-icon {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
      }
      
      &.rental-info .header-icon {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
      }
      
      &.maintenance .header-icon {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: #fff;
      }
      
      .header-text {
        flex: 1;
        
        h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }
        
        p {
          margin: var(--space-1) 0 0;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
      }
      
      .form-row {
        display: flex;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
        align-items: flex-start;

        mat-form-field {
          flex: 1;

          &.full-width {
            flex: 1 1 100%;
          }
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          min-height: 56px;
          padding: var(--space-3);
          background: var(--color-background-secondary);
          border-radius: var(--radius-lg);
        }
      }

      .form-row:last-child {
        margin-bottom: 0;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-6) 0;
      border-top: 1px solid var(--color-border);
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      margin-top: var(--space-4);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);

      button {
        min-width: 140px;
        height: 48px;
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-semibold);
        
        mat-icon {
          margin-right: var(--space-2);
        }
        
        &[color="primary"] {
          background: linear-gradient(135deg, #667eea, #764ba2);
          
          &:hover:not([disabled]) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
          }
        }
      }
    }

    @media (max-width: 768px) {
      .vehicle-form-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .form-section .form-row {
        flex-direction: column;
        gap: 0;

        mat-form-field {
          margin-bottom: 16px;
        }
      }

      .form-actions {
        flex-direction: column-reverse;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class VehicleFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private snackBar = inject(MatSnackBar);

  protected isEditMode = signal(false);
  protected isSubmitting = signal(false);
  protected vehicleId = signal<string | null>(null);

  protected vehicleForm: FormGroup;

  constructor() {
    const currentYear = new Date().getFullYear();

    this.vehicleForm = this.fb.group({
      make: ['', [Validators.required]],
      model: ['', [Validators.required]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(currentYear + 1)]],
      licensePlate: ['', [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
      vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      color: ['', [Validators.required]],
      mileage: ['', [Validators.required, Validators.min(0)]],
      fuelType: ['', [Validators.required]],
      seatingCapacity: ['', [Validators.required, Validators.min(1)]],
      rentalPricePerDay: ['', [Validators.required, Validators.min(0.01)]],
      gpsEnabled: [false],
      lastMaintenanceDate: ['', [Validators.required]],
      maintenanceIntervalDays: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('id');

    if (vehicleId && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.vehicleId.set(vehicleId);
      this.loadVehicleForEdit(vehicleId);
    }
  }

  private async loadVehicleForEdit(vehicleId: string): Promise<void> {
    try {
      const vehicle = await this.vehicleService.loadVehicle(vehicleId);
      if (vehicle) {
        this.populateForm(vehicle);
      }
    } catch (error) {
      console.error('Error loading vehicle for edit:', error);
      this.snackBar.open('Failed to load vehicle details', 'Close', { duration: 5000 });
      this.router.navigate(['/vehicles']);
    }
  }

  private populateForm(vehicle: Vehicle): void {
    this.vehicleForm.patchValue({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      vin: vehicle.vin,
      color: vehicle.color,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      seatingCapacity: vehicle.seatingCapacity,
      rentalPricePerDay: vehicle.rentalPricePerDay,
      gpsEnabled: vehicle.gpsEnabled,
      lastMaintenanceDate: new Date(vehicle.lastMaintenanceDate),
      maintenanceIntervalDays: vehicle.maintenanceIntervalDays,
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.vehicleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.vehicleForm.value;
      const vehicleInput: VehicleInput = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        licensePlate: formData.licensePlate,
        status: formData.status as Status,
        vin: formData.vin,
        color: formData.color,
        mileage: parseInt(formData.mileage),
        fuelType: formData.fuelType as FuelType,
        seatingCapacity: parseInt(formData.seatingCapacity),
        rentalPricePerDay: parseFloat(formData.rentalPricePerDay),
        gpsEnabled: formData.gpsEnabled,
        lastMaintenanceDate: formData.lastMaintenanceDate.toISOString().split('T')[0],
        maintenanceIntervalDays: parseInt(formData.maintenanceIntervalDays),
      };

      if (this.isEditMode()) {
        await this.vehicleService.updateVehicle(this.vehicleId()!, vehicleInput);
        this.snackBar.open('Vehicle updated successfully', 'Close', { duration: 3000 });
      } else {
        await this.vehicleService.createVehicle(vehicleInput);
        this.snackBar.open('Vehicle added successfully', 'Close', { duration: 3000 });
      }

      this.router.navigate(['/vehicles']);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      const errorMessage = this.isEditMode() ? 'Failed to update vehicle' : 'Failed to add vehicle';
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }
}
