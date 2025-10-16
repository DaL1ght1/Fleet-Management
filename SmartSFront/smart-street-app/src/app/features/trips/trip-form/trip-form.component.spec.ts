import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { TripFormComponent } from './trip-form.component';
import { TripService } from '../../../services/trip.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { DriverService } from '../../../services/driver.service';
import { TripStatus, TripType } from '../../../models/trip.model';

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;
  let tripService: jasmine.SpyObj<TripService>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let driverService: jasmine.SpyObj<DriverService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let activatedRoute: any;

  const mockVehicles = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC-123',
      color: 'Blue',
      status: 'ACTIVE'
    },
    {
      id: '2',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'XYZ-789',
      color: 'Red',
      status: 'ACTIVE'
    }
  ];

  const mockDrivers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Driver',
      email: 'john@example.com',
      status: 'ACTIVE'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Driver',
      email: 'jane@example.com',
      status: 'ACTIVE'
    }
  ];

  const mockTrip = {
    id: '1',
    type: TripType.PICKUP,
    status: TripStatus.SCHEDULED,
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerEmail: 'john@example.com',
    pickupLocation: {
      name: 'Airport',
      address: '123 Airport Rd'
    },
    dropoffLocation: {
      name: 'Hotel',
      address: '456 Hotel St'
    },
    scheduledStart: new Date('2024-01-15T10:00:00Z'),
    vehicleId: '1',
    driverId: '1',
    basePrice: 50.00,
    notes: 'Test trip'
  };

  beforeEach(async () => {
    const tripServiceSpy = jasmine.createSpyObj('TripService', [
      'getTrip', 'createTrip', 'updateTrip'
    ]);
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', [
      'loadVehicles', 'vehicles'
    ]);
    const driverServiceSpy = jasmine.createSpyObj('DriverService', [
      'getDriversForTrip'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('new')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        TripFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: TripService, useValue: tripServiceSpy },
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: DriverService, useValue: driverServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    tripService = TestBed.inject(TripService) as jasmine.SpyObj<TripService>;
    vehicleService = TestBed.inject(VehicleService) as jasmine.SpyObj<VehicleService>;
    driverService = TestBed.inject(DriverService) as jasmine.SpyObj<DriverService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default mocks
    vehicleService.loadVehicles.and.returnValue(Promise.resolve());
    vehicleService.vehicles.and.returnValue(mockVehicles);
    driverService.getDriversForTrip.and.returnValue(of(mockDrivers));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values for new trip', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('new');
      
      fixture.detectChanges();
      
      expect(component.tripForm).toBeTruthy();
      expect(component.tripForm.get('status')?.value).toBe(TripStatus.DRAFT);
      expect(component.tripForm.get('customerName')?.value).toBe('');
      expect(component.isEditMode()).toBe(false);
    });

    it('should set edit mode when trip ID is provided', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      tripService.getTrip.and.returnValue(of(mockTrip));
      
      fixture.detectChanges();
      
      expect(component.isEditMode()).toBe(true);
    });

    it('should load initial data on init', async () => {
      await component.ngOnInit();
      
      expect(vehicleService.loadVehicles).toHaveBeenCalled();
      expect(driverService.getDriversForTrip).toHaveBeenCalled();
      expect(component.vehicles().length).toBe(2);
      expect(component.drivers().length).toBe(2);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const form = component.tripForm;
      
      // Form should be invalid initially due to required fields
      expect(form.valid).toBeFalsy();
      
      // Fill required fields
      form.patchValue({
        type: TripType.PICKUP,
        customerName: 'John Doe',
        pickupLocation: { address: '123 Main St' },
        dropoffLocation: { address: '456 Oak Ave' },
        scheduledStart: new Date().toISOString()
      });
      
      expect(form.valid).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.tripForm.get('customerEmail');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate phone format', () => {
      const phoneControl = component.tripForm.get('customerPhone');
      
      phoneControl?.setValue('123');
      expect(phoneControl?.hasError('pattern')).toBeTruthy();
      
      phoneControl?.setValue('+1234567890');
      expect(phoneControl?.hasError('pattern')).toBeFalsy();
    });
  });

  describe('Trip Creation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Fill form with valid data
      component.tripForm.patchValue({
        type: TripType.PICKUP,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        pickupLocation: { address: '123 Main St' },
        dropoffLocation: { address: '456 Oak Ave' },
        scheduledStart: new Date().toISOString(),
        basePrice: 50
      });
    });

    it('should create trip successfully', async () => {
      tripService.createTrip.and.returnValue(of(mockTrip));
      
      await component.onSubmit();
      
      expect(tripService.createTrip).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Trip created successfully', 'Close', { duration: 3000 }
      );
      expect(router.navigate).toHaveBeenCalledWith(['/trips']);
    });

    it('should handle creation error', async () => {
      tripService.createTrip.and.returnValue(throwError(() => new Error('Creation failed')));
      
      await component.onSubmit();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to save trip', 'Close', { duration: 5000 }
      );
    });

    it('should not submit if form is invalid', async () => {
      component.tripForm.patchValue({ customerName: '' }); // Make form invalid
      
      await component.onSubmit();
      
      expect(tripService.createTrip).not.toHaveBeenCalled();
    });
  });

  describe('Trip Editing', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      tripService.getTrip.and.returnValue(of(mockTrip));
      fixture.detectChanges();
    });

    it('should load trip data for editing', async () => {
      await component.ngOnInit();
      
      expect(tripService.getTrip).toHaveBeenCalledWith('123');
      expect(component.tripForm.get('customerName')?.value).toBe('John Doe');
      expect(component.tripForm.get('type')?.value).toBe(TripType.PICKUP);
    });

    it('should update trip successfully', async () => {
      tripService.updateTrip.and.returnValue(of(mockTrip));
      
      await component.onSubmit();
      
      expect(tripService.updateTrip).toHaveBeenCalledWith('123', jasmine.any(Object));
      expect(snackBar.open).toHaveBeenCalledWith(
        'Trip updated successfully', 'Close', { duration: 3000 }
      );
    });
  });


  describe('Form Data Preparation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should prepare form data correctly', () => {
      const testDate = new Date('2024-01-15T10:00:00Z');
      component.tripForm.patchValue({
        type: TripType.PICKUP,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        pickupLocation: { address: '123 Main St' },
        dropoffLocation: { address: '456 Oak Ave' },
        scheduledStart: testDate.toISOString(),
        vehicleId: '1',
        basePrice: 50.00
      });

      const preparedData = (component as any).prepareFormData();

      expect(preparedData.type).toBe(TripType.PICKUP);
      expect(preparedData.customerName).toBe('John Doe');
      expect(preparedData.scheduledStart).toBeInstanceOf(Date);
      expect(preparedData.basePrice).toBe(50.00);
    });

    it('should handle optional fields correctly', () => {
      component.tripForm.patchValue({
        type: TripType.PICKUP,
        customerName: 'John Doe',
        pickupLocation: { address: '123 Main St' },
        dropoffLocation: { address: '456 Oak Ave' },
        scheduledStart: new Date().toISOString()
      });

      const preparedData = (component as any).prepareFormData();

      expect(preparedData.vehicleId).toBeUndefined();
      expect(preparedData.driverId).toBeUndefined();
      expect(preparedData.customerEmail).toBeUndefined();
    });
  });

  describe('Navigation and Cancellation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back on cancel without confirmation for clean form', () => {
      spyOn(window, 'confirm');
      
      component.onCancel();
      
      expect(window.confirm).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/trips']);
    });

    it('should show confirmation dialog for dirty form', () => {
      component.tripForm.markAsDirty();
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.onCancel();
      
      expect(window.confirm).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/trips']);
    });

    it('should not navigate if user cancels confirmation', () => {
      component.tripForm.markAsDirty();
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onCancel();
      
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during data loading', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      const loadingElement = fixture.nativeElement.querySelector('.loading-content');
      expect(loadingElement).toBeTruthy();
    });

    it('should show submitting state during form submission', () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle vehicle loading error gracefully', async () => {
      vehicleService.loadVehicles.and.returnValue(Promise.reject(new Error('Network error')));
      
      await component.loadInitialData();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load form data', 'Close', { duration: 5000 }
      );
    });

    it('should handle trip loading error', async () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('123');
      tripService.getTrip.and.returnValue(throwError(() => new Error('Trip not found')));
      
      await component.ngOnInit();
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load trip data', 'Close', { duration: 5000 }
      );
    });
  });

  describe('Trip Types and Statuses', () => {
    it('should have all trip types available', () => {
      expect(component.tripTypes).toBeDefined();
      expect(component.tripTypes.length).toBeGreaterThan(0);
      expect(component.tripTypes.map(t => t.value)).toContain(TripType.PICKUP);
      expect(component.tripTypes.map(t => t.value)).toContain(TripType.DELIVERY);
    });

    it('should have all trip statuses available', () => {
      expect(component.tripStatuses).toBeDefined();
      expect(component.tripStatuses.length).toBeGreaterThan(0);
      expect(component.tripStatuses.map(s => s.value)).toContain(TripStatus.DRAFT);
      expect(component.tripStatuses.map(s => s.value)).toContain(TripStatus.SCHEDULED);
    });
  });
});
