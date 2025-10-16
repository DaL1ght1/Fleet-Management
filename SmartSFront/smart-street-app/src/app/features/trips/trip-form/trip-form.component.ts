import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, startWith, map } from 'rxjs';

import { TripService } from '../../../services/trip.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { DriverService } from '../../../services/driver.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TndCurrencyPipe } from '../../../shared/pipes/tnd-currency.pipe';
import { Trip, TripStatus, TripType, CreateTripInput, Location, VehicleOption, DriverOption } from '../../../models/trip.model';
import { Vehicle } from '../../../core/models/vehicle.model';
import { Driver } from '../../../services/driver.service';
import { InteractiveMapComponent } from '../../../shared/components/interactive-map/interactive-map.component';
import { MapService, MapCoordinates, LocationData } from '../../../core/services/map.service';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    TranslateModule,
    TndCurrencyPipe,
    InteractiveMapComponent,
  ],
  template: `
    <div class="trip-form-container">
      <div class="header-section">
        <button mat-stroked-button routerLink="/trips">
          <mat-icon>arrow_back</mat-icon>
          {{ 'app.back' | translate }}
        </button>
        <h1>{{ isEditMode() ? ('trips.editTrip' | translate) : ('trips.newTrip' | translate) }}</h1>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-content">
        <mat-spinner></mat-spinner>
        <p>{{ 'app.loading' | translate }}</p>
      </div>

      <!-- Form Content -->
      <form *ngIf="!isLoading()" [formGroup]="tripForm" (ngSubmit)="onSubmit()" class="trip-form">
        <!-- Basic Information Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.basicInfo' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.basicInfo' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <!-- Trip Type -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.type' | translate }}</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option *ngFor="let type of tripTypes" [value]="type.value">
                    <mat-icon>{{ type.icon }}</mat-icon>
                    {{ type.label | translate }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="tripForm.get('type')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Trip Status (Edit Mode Only) -->
              <mat-form-field appearance="outline" *ngIf="isEditMode()">
                <mat-label>{{ 'trips.fields.status' | translate }}</mat-label>
                <mat-select formControlName="status">
                  <mat-option *ngFor="let status of tripStatuses" [value]="status.value">
                    <mat-icon>{{ status.icon }}</mat-icon>
                    {{ status.label | translate }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Customer fields removed - not supported by backend schema -->
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Location Information Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.locationInfo' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.locationInfo' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="location-section">
              <h3>{{ 'trips.fields.pickupLocation' | translate }}</h3>
              <div formGroupName="pickupLocation" class="location-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'trips.fields.address' | translate }}</mat-label>
                  <input matInput formControlName="address" required
                         [placeholder]="'trips.placeholders.enterAddress' | translate">
                  <mat-icon matSuffix>location_on</mat-icon>
                  <mat-error *ngIf="tripForm.get('pickupLocation.address')?.hasError('required')">
                    {{ 'validation.required' | translate }}
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-icon class="location-separator">arrow_downward</mat-icon>

              <h3>{{ 'trips.fields.dropoffLocation' | translate }}</h3>
              <div formGroupName="dropoffLocation" class="location-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'trips.fields.address' | translate }}</mat-label>
                  <input matInput formControlName="address" required
                         [placeholder]="'trips.placeholders.enterAddress' | translate">
                  <mat-icon matSuffix>flag</mat-icon>
                  <mat-error *ngIf="tripForm.get('dropoffLocation.address')?.hasError('required')">
                    {{ 'validation.required' | translate }}
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Interactive Map for selecting locations -->
              <app-interactive-map
                (locationSelected)="onMapLocationSelected($event)"
                (locationRemoved)="onMapLocationRemoved($event)"
              ></app-interactive-map>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Vehicle and Driver Assignment Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.vehicleDriverInfo' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.vehicleDriverInfo' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <!-- Vehicle Selection -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.vehicle' | translate }}</mat-label>
                <mat-select formControlName="vehicleId" required>
                  <mat-option value="">{{ 'app.selectOption' | translate }}</mat-option>
                  <mat-option *ngFor="let vehicle of vehicles()" [value]="vehicle.id">
                    <div class="vehicle-option">
                      <span class="vehicle-main">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</span>
                      <span class="vehicle-details">{{ vehicle.licensePlate }} • {{ vehicle.color }}</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="tripForm.get('vehicleId')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Driver Selection -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.driver' | translate }} ({{ drivers().length }})</mat-label>
                <mat-select formControlName="driverId">
                  <mat-option value="">{{ 'app.selectOption' | translate }}</mat-option>
                  <mat-option *ngFor="let driver of drivers()" [value]="driver.id">
                    {{ driver.firstName }} {{ driver.lastName }}
                    <span *ngIf="driver.licenseNumber"> ({{ driver.licenseNumber }})</span>
                  </mat-option>
                </mat-select>
                <mat-hint>Available drivers: {{ drivers().length }}</mat-hint>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Scheduling Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.scheduling' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.scheduling' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <!-- Scheduled Start -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.scheduledStart' | translate }}</mat-label>
                <input matInput type="datetime-local" formControlName="scheduledStart" required
                       (change)="onScheduledStartChange()">
                <mat-icon matSuffix>schedule</mat-icon>
                <mat-error *ngIf="tripForm.get('scheduledStart')?.hasError('required')">
                  {{ 'validation.required' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Estimated Duration -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.estimatedDuration' | translate }}</mat-label>
                <input matInput type="number" formControlName="estimatedDuration" min="1"
                       (change)="onDurationChange()" [placeholder]="'Enter duration in minutes'">
                <mat-icon matSuffix>timer</mat-icon>
                <mat-hint>Duration in minutes</mat-hint>
              </mat-form-field>

              <!-- Estimated Arrival (Auto-calculated) -->
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.estimatedArrival' | translate }}</mat-label>
                <input matInput type="datetime-local" formControlName="scheduledEnd" readonly
                       class="calculated-field">
                <mat-icon matSuffix>schedule_send</mat-icon>
                <mat-hint>Auto-calculated from start time + duration</mat-hint>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Pricing Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.pricingInfo' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.pricingInfo' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.basePrice' | translate }}</mat-label>
                <input matInput type="number" formControlName="basePrice" min="0" step="0.01"
                       [placeholder]="'trips.placeholders.enterPrice' | translate">
                <span matTextPrefix>{{ getCurrencySymbol() }}</span>
                <mat-hint>Base price in {{ getCurrencyCode() }}</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.pricePerKm' | translate }}</mat-label>
                <input matInput type="number" formControlName="pricePerKm" min="0" step="0.01"
                       [placeholder]="'trips.placeholders.enterPrice' | translate">
                <span matTextPrefix>{{ getCurrencySymbol() }}</span>
                <mat-hint>Price per kilometer</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'trips.fields.totalPrice' | translate }}</mat-label>
                <input matInput type="number" formControlName="totalPrice" min="0" step="0.01" readonly
                       class="calculated-field">
                <span matTextPrefix>{{ getCurrencySymbol() }}</span>
                <mat-hint>Total estimated cost</mat-hint>
              </mat-form-field>
            </div>

            <!-- Price Preview -->
            <div class="price-preview" *ngIf="getTotalPrice() > 0">
              <h4>Price Breakdown</h4>
              <div class="price-breakdown">
                <div class="price-line">
                  <span>Base Price:</span>
                  <span>{{ tripForm.get('basePrice')?.value | tndCurrency }}</span>
                </div>
                <div class="price-line" *ngIf="tripForm.get('pricePerKm')?.value">
                  <span>Distance Rate:</span>
                  <span>{{ tripForm.get('pricePerKm')?.value | tndCurrency }}/km</span>
                </div>
                <div class="price-line price-total">
                  <span><strong>Estimated Total:</strong></span>
                  <span><strong>{{ getTotalPrice() | tndCurrency }}</strong></span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notes Section -->
        <mat-card class="form-section">
          <mat-card-header>
            <mat-card-title>{{ 'trips.sections.notesInfo' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'trips.sections.notesInfo' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="notes-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'trips.fields.notes' | translate }}</mat-label>
                <textarea matInput formControlName="notes" rows="3"
                          [placeholder]="'trips.placeholders.enterNotes' | translate"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'trips.fields.customerNotes' | translate }}</mat-label>
                <textarea matInput formControlName="customerNotes" rows="3"
                          [placeholder]="'Customer instructions or special requests' | translate"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'trips.fields.internalNotes' | translate }}</mat-label>
                <textarea matInput formControlName="internalNotes" rows="3"
                          [placeholder]="'Internal notes for drivers and staff' | translate"></textarea>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" mat-stroked-button (click)="onCancel()">
            <mat-icon>cancel</mat-icon>
            {{ 'app.cancel' | translate }}
          </button>

          <div class="action-buttons">
            <button type="submit" mat-raised-button color="primary" [disabled]="tripForm.invalid || isSubmitting()">
              <mat-spinner diameter="20" *ngIf="isSubmitting()"></mat-spinner>
              <mat-icon *ngIf="!isSubmitting()">{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
              {{ isSubmitting() ? ('trips.messages.savingTrip' | translate) : (isEditMode() ? ('trips.updateTrip' | translate) : ('trips.createTrip' | translate)) }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .trip-form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;

      h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 400;
        color: #333;
      }
    }

    .loading-content {
      text-align: center;
      padding: 80px 20px;

      mat-spinner {
        margin: 0 auto 16px;
      }

      p {
        color: #666;
        font-size: 1.1rem;
      }
    }

    .trip-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      mat-card-header {
        margin-bottom: 16px;

        mat-card-title {
          font-size: 1.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        mat-card-subtitle {
          color: #7f8c8d;
          margin-top: 4px;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      align-items: start;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .location-section {
      h3 {
        margin: 0 0 16px 0;
        font-size: 1.2rem;
        font-weight: 500;
        color: #34495e;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(45deg, #3498db, #2ecc71);
          border-radius: 2px;
        }
      }

      .location-separator {
        display: block;
        text-align: center;
        margin: 24px 0;
        font-size: 2rem;
        color: #3498db;
      }
    }

    .location-form {
      margin-bottom: 24px;
    }

    // Interactive map styling
    app-interactive-map {
      margin-top: 24px;
      display: block;
    }

    .location-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .vehicle-option {
      display: flex;
      flex-direction: column;

      .vehicle-main {
        font-weight: 500;
        font-size: 1rem;
      }

      .vehicle-details {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 2px;
      }
    }

    .notes-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .full-width {
        width: 100%;
      }
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 0;
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;

      .action-buttons {
        display: flex;
        gap: 16px;
        align-items: center;
      }
    }

    // Enhanced form field styles
    mat-form-field {
      width: 100%;

      &.full-width {
        grid-column: 1 / -1;
      }

      .mat-mdc-form-field-subscript-wrapper {
        margin-top: 8px;
      }
    }

    // Error message styling
    mat-error {
      font-size: 0.875rem;
      margin-top: 4px;
    }

    // Button enhancements
    button {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-spinner {
        margin-right: 8px;
      }
    }

    // Card styling improvements
    mat-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      padding: 0;

      mat-card-content {
        padding: 24px;
      }
    }

    // Input prefix/suffix styling
    .mat-mdc-form-field-icon-suffix mat-icon,
    .mat-mdc-form-field-icon-prefix mat-icon {
      color: rgba(0, 0, 0, 0.54);
    }

    // Responsive design
    @media (max-width: 768px) {
      .trip-form-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        h1 {
          font-size: 2rem;
        }
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .action-buttons {
          justify-content: stretch;

          button {
            flex: 1;
          }
        }
      }
    }

    // Focus and hover states
    mat-form-field:focus-within {
      .mat-mdc-form-field-outline {
        border-color: #3498db;
      }
    }

    // Calculated field styling
    .calculated-field {
      background-color: #f8f9fa !important;
      color: #6c757d !important;
      cursor: not-allowed;
    }

    // Price preview section
    .price-preview {
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      border: 1px solid #dee2e6;

      h4 {
        margin: 0 0 16px 0;
        color: #495057;
        font-size: 1.1rem;
        font-weight: 500;
      }
    }

    .price-breakdown {
      .price-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #dee2e6;

        &:last-child {
          border-bottom: none;
        }

        &.price-total {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 2px solid #495057;
          font-size: 1.1rem;
          color: #495057;
        }
      }
    }
  `]
})
export class TripFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private vehicleService = inject(VehicleService);
  private driverService = inject(DriverService);
  private currencyService = inject(CurrencyService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private mapService = inject(MapService);

  protected isLoading = signal(false);
  protected isSubmitting = signal(false);
  protected isEditMode = signal(false);
  protected tripId = signal<string | null>(null);

  protected vehicles = signal<Vehicle[]>([]);
  protected drivers = signal<Driver[]>([]);

  // Map selection state
  protected startCoordinates = signal<MapCoordinates | null>(null);
  protected endCoordinates = signal<MapCoordinates | null>(null);

  protected tripTypes = [
    { value: TripType.RENTAL, label: 'trips.type.rental', icon: 'car_rental' },
    { value: TripType.MAINTENANCE, label: 'trips.type.maintenance', icon: 'build' },
    { value: TripType.RELOCATION, label: 'trips.type.relocation', icon: 'location_on' },
    { value: TripType.EMERGENCY, label: 'trips.type.emergency', icon: 'emergency' }
  ];

  protected tripStatuses = [
    { value: TripStatus.SCHEDULED, label: 'trips.status.scheduled', icon: 'schedule' },
    { value: TripStatus.ACTIVE, label: 'trips.status.active', icon: 'play_arrow' },
    { value: TripStatus.COMPLETED, label: 'trips.status.completed', icon: 'check_circle' },
    { value: TripStatus.CANCELLED, label: 'trips.status.cancelled', icon: 'cancel' }
  ];

  protected tripForm: FormGroup = this.fb.group({
    type: ['', Validators.required],
    status: [TripStatus.SCHEDULED],
    // Customer fields removed - not supported by backend schema
    pickupLocation: this.fb.group({
      name: [''],
      address: ['', Validators.required]
    }),
    dropoffLocation: this.fb.group({
      name: [''],
      address: ['', Validators.required]
    }),
    vehicleId: ['', Validators.required],
    driverId: [''],
    scheduledStart: ['', Validators.required],
    scheduledEnd: [''],
    estimatedDuration: [''],
    basePrice: [''],
    pricePerKm: [''],
    totalPrice: [''],
    notes: [''],
    internalNotes: [''],
    customerNotes: ['']
  });

  async ngOnInit(): Promise<void> {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.tripId.set(id);
    }

    // Load initial data
    await this.loadInitialData();

    // Load trip data if editing
    if (this.isEditMode()) {
      await this.loadTripData();
    }
  }

  protected async loadInitialData(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Load vehicles from existing service
      await this.vehicleService.loadVehicles();
      const vehicles = this.vehicleService.vehicles();
      this.vehicles.set(vehicles.filter(v => v.status === 'ACTIVE'));

      // Load all drivers first, then get drivers for trips
      await this.driverService.loadDrivers();

      this.driverService.getDriversForTrip().subscribe({
        next: (driversResult) => {
          this.drivers.set(driversResult || []);
        },
        error: (error) => {
          this.drivers.set([]);
        }
      });

    } catch (error) {
      this.snackBar.open('Failed to load form data', 'Close', { duration: 5000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async loadTripData(): Promise<void> {
    const tripId = this.tripId();
    if (!tripId) return;

    try {
      const trip = await this.tripService.getTrip(tripId).toPromise();

      if (trip) {
        this.populateForm(trip);
      }
    } catch (error) {
      this.snackBar.open('Failed to load trip data', 'Close', { duration: 5000 });
    }
  }

  protected populateForm(trip: Trip): void {
    this.tripForm.patchValue({
      type: trip.type,
      status: trip.status,
      customerName: trip.customerName || '',
      customerPhone: trip.customerPhone || '',
      customerEmail: trip.customerEmail || '',
      pickupLocation: {
        name: trip.pickupLocation?.name || '',
        address: trip.pickupLocation?.address || ''
      },
      dropoffLocation: {
        name: trip.dropoffLocation?.name || '',
        address: trip.dropoffLocation?.address || ''
      },
      vehicleId: trip.vehicleId || '',
      driverId: trip.driverId || '',
      scheduledStart: trip.scheduledStart || '',
      scheduledEnd: trip.scheduledEnd || '',
      estimatedDuration: trip.estimatedDuration || '',
      basePrice: trip.basePrice || '',
      pricePerKm: trip.pricePerKm || '',
      totalPrice: trip.totalPrice || '',
      notes: trip.notes || '',
      customerNotes: trip.customerNotes || '',
      internalNotes: trip.internalNotes || ''
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.tripForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched(this.tripForm);
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.prepareFormData();

      if (this.isEditMode()) {
        const tripId = this.tripId();
        if (tripId) {
          await this.tripService.updateTrip(tripId, formData).toPromise();
          this.snackBar.open(this.translate.instant('trips.messages.tripUpdated'), 'Close', { duration: 3000 });
        }
      } else {
        await this.tripService.createTrip(formData).toPromise();
        this.snackBar.open(this.translate.instant('trips.messages.tripCreated'), 'Close', { duration: 3000 });
      }

      this.router.navigate(['/trips']);
    } catch (error) {
      console.error('Error saving trip:', error);
      this.snackBar.open('Failed to save trip', 'Close', { duration: 5000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }


  protected onCancel(): void {
    if (this.tripForm.dirty) {
      const confirmMessage = this.translate.instant('trips.messages.confirmCancel');
      const confirmed = confirm(confirmMessage);
      if (!confirmed) return;
    }

    this.router.navigate(['/trips']);
  }

  private prepareFormData(): any {
    const formValue = this.tripForm.value;
    const startCoords = this.startCoordinates();
    const endCoords = this.endCoordinates();

    const tripData = {
      type: formValue.type,
      status: formValue.status || TripStatus.SCHEDULED,
      vehicleId: formValue.vehicleId && formValue.vehicleId.trim() !== '' ? formValue.vehicleId : null,
      driverId: formValue.driverId && formValue.driverId.trim() !== '' ? formValue.driverId : null,
      startLocation: {
        latitude: startCoords ? startCoords.lat : 0,
        longitude: startCoords ? startCoords.lng : 0,
        address: formValue.pickupLocation.address,
        city: null,
        state: null,
        zipCode: null
      },
      endLocation: {
        latitude: endCoords ? endCoords.lat : 0,
        longitude: endCoords ? endCoords.lng : 0,
        address: formValue.dropoffLocation.address,
        city: null,
        state: null,
        zipCode: null
      },
      scheduledStartTime: formValue.scheduledStart ? new Date(formValue.scheduledStart).toISOString() : null,
      scheduledEndTime: formValue.scheduledEnd ? new Date(formValue.scheduledEnd).toISOString() : null,
      estimatedDuration: formValue.estimatedDuration ? parseInt(formValue.estimatedDuration) : null,
      baseRate: formValue.basePrice ? parseFloat(formValue.basePrice) : null,
      notes: formValue.notes && formValue.notes.trim() !== '' ? formValue.notes : null,
      customerNotes: formValue.customerNotes && formValue.customerNotes.trim() !== '' ? formValue.customerNotes : null,
      internalNotes: formValue.internalNotes && formValue.internalNotes.trim() !== '' ? formValue.internalNotes : null
    };

    // Remove null values to avoid sending them to GraphQL
    Object.keys(tripData).forEach(key => {
      if ((tripData as any)[key] === null) {
        delete (tripData as any)[key];
      }
    });

    return tripData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Date calculation methods
  protected onScheduledStartChange(): void {
    this.calculateEstimatedArrival();
  }

  protected onDurationChange(): void {
    this.calculateEstimatedArrival();
  }

  private calculateEstimatedArrival(): void {
    const startDate = this.tripForm.get('scheduledStart')?.value;
    const duration = this.tripForm.get('estimatedDuration')?.value;

    if (startDate && duration && duration > 0) {
      const start = new Date(startDate);
      const estimated = new Date(start.getTime() + (duration * 60 * 1000)); // Convert minutes to milliseconds

      // Format for datetime-local input
      const formattedDate = estimated.toISOString().slice(0, 16);
      this.tripForm.get('scheduledEnd')?.setValue(formattedDate, { emitEvent: false });
    }
  }

  // Currency methods
  protected getCurrencySymbol(): string {
    return this.currencyService.getCurrencyInfo().symbol;
  }

  protected getCurrencyCode(): string {
    return this.currencyService.getCurrencyInfo().code;
  }

  protected getTotalPrice(): number {
    const basePrice = parseFloat(this.tripForm.get('basePrice')?.value) || 0;
    const pricePerKm = parseFloat(this.tripForm.get('pricePerKm')?.value) || 0;

    // For now, just return base price. In real implementation, you'd calculate distance
    // and multiply by pricePerKm, then add to basePrice
    const estimatedDistance = 10; // This would come from a mapping service
    const total = basePrice + (pricePerKm * estimatedDistance);

    // Update the total price field
    this.tripForm.get('totalPrice')?.setValue(total.toFixed(2), { emitEvent: false });

    return total;
  }

  // Map selection handlers
  protected onMapLocationSelected(event: any): void {
    if (!event) return;
    const { selectionType, coordinates, locationData } = event;

    if (selectionType === 'start') {
      this.startCoordinates.set(coordinates);
      if (locationData?.address) {
        this.tripForm.get('pickupLocation.address')?.setValue(locationData.address);
      } else {
        // If address missing, try reverse geocoding via service
        this.mapService.reverseGeocode(coordinates).subscribe((data: LocationData | null) => {
          if (data?.address) {
            this.tripForm.get('pickupLocation.address')?.setValue(data.address);
          }
        });
      }
    }

    if (selectionType === 'end') {
      this.endCoordinates.set(coordinates);
      if (locationData?.address) {
        this.tripForm.get('dropoffLocation.address')?.setValue(locationData.address);
      } else {
        this.mapService.reverseGeocode(coordinates).subscribe((data: LocationData | null) => {
          if (data?.address) {
            this.tripForm.get('dropoffLocation.address')?.setValue(data.address);
          }
        });
      }
    }
  }

  protected onMapLocationRemoved(event: any): void {
    // If start or end removed, clear coordinates
    if (!event || !event.type) {
      this.startCoordinates.set(null);
      this.endCoordinates.set(null);
      return;
    }
    if (event.type === 'start') this.startCoordinates.set(null);
    if (event.type === 'end') this.endCoordinates.set(null);
  }

  // Debug method
  protected getDebugInfo(): string {
    return `Drivers: ${this.drivers().length}, Vehicles: ${this.vehicles().length}`;
  }
}
