import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { TripService } from './trip.service';
import { TripStatus, TripType, Trip, CreateTripInput } from '../models/trip.model';

describe('TripService', () => {
  let service: TripService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  const mockTrip: Trip = {
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
    scheduledEnd: new Date('2024-01-15T12:00:00Z'),
    vehicleId: 'vehicle-1',
    driverId: 'driver-1',
    estimatedDuration: 120,
    basePrice: 50.00,
    totalPrice: 65.00,
    notes: 'Test trip',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-10T09:00:00Z')
  };

  const mockTripListResponse = {
    trips: [mockTrip],
    total: 1,
    page: 1,
    pageSize: 20
  };

  beforeEach(() => {
    const apolloSpyObj = jasmine.createSpyObj('Apollo', ['query', 'mutate', 'watchQuery']);

    TestBed.configureTestingModule({
      providers: [
        TripService,
        { provide: Apollo, useValue: apolloSpyObj }
      ]
    });
    
    service = TestBed.inject(TripService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTrips', () => {
    it('should return trips list on successful query', (done) => {
      apolloSpy.query.and.returnValue(of({
        data: { trips: mockTripListResponse },
        loading: false,
        networkStatus: 7
      }));

      service.getTrips().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.trips.length).toBe(1);
        expect(result?.total).toBe(1);
        expect(result?.trips[0].id).toBe('1');
        expect(result?.trips[0].scheduledStart).toBeInstanceOf(Date);
        done();
      });

      expect(apolloSpy.query).toHaveBeenCalledWith({
        query: jasmine.any(Object),
        variables: {
          filters: undefined,
          page: 1,
          pageSize: 20,
          sortBy: 'scheduledStart',
          sortDirection: 'DESC'
        },
        fetchPolicy: 'cache-and-network'
      });
    });

    it('should handle query error gracefully', (done) => {
      apolloSpy.query.and.returnValue(throwError(() => new Error('Network error')));

      service.getTrips().subscribe(result => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should apply filters correctly', (done) => {
      const filters = {
        status: [TripStatus.SCHEDULED],
        type: [TripType.PICKUP],
        search: 'John'
      };

      apolloSpy.query.and.returnValue(of({
        data: { trips: mockTripListResponse },
        loading: false,
        networkStatus: 7
      }));

      service.getTrips(filters, 2, 10, 'createdAt', 'ASC').subscribe(() => {
        expect(apolloSpy.query).toHaveBeenCalledWith({
          query: jasmine.any(Object),
          variables: {
            filters,
            page: 2,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: 'ASC'
          },
          fetchPolicy: 'cache-and-network'
        });
        done();
      });
    });
  });

  describe('getTrip', () => {
    it('should return single trip on successful query', (done) => {
      apolloSpy.query.and.returnValue(of({
        data: { trip: mockTrip },
        loading: false,
        networkStatus: 7
      }));

      service.getTrip('1').subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.id).toBe('1');
        expect(result?.customerName).toBe('John Doe');
        expect(result?.scheduledStart).toBeInstanceOf(Date);
        done();
      });
    });

    it('should return null when trip not found', (done) => {
      apolloSpy.query.and.returnValue(of({
        data: { trip: null },
        loading: false,
        networkStatus: 7
      }));

      service.getTrip('999').subscribe(result => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('createTrip', () => {
    const mockInput: CreateTripInput = {
      type: TripType.PICKUP,
      status: TripStatus.DRAFT,
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      pickupLocation: {
        name: 'Home',
        address: '789 Home Ave'
      },
      dropoffLocation: {
        name: 'Office',
        address: '321 Office Blvd'
      },
      scheduledStart: new Date('2024-01-20T09:00:00Z'),
      basePrice: 40.00
    };

    it('should create trip successfully', (done) => {
      const expectedTrip = { ...mockTrip, ...mockInput, id: '2' };
      
      apolloSpy.mutate.and.returnValue(of({
        data: { createTrip: expectedTrip }
      }));

      service.createTrip(mockInput).subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.id).toBe('2');
        expect(result?.customerName).toBe('Jane Doe');
        expect(result?.type).toBe(TripType.PICKUP);
        done();
      });

      expect(apolloSpy.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object),
        variables: { input: mockInput },
        refetchQueries: [{ query: jasmine.any(Object) }]
      });
    });

    it('should handle creation error', (done) => {
      apolloSpy.mutate.and.returnValue(throwError(() => new Error('Creation failed')));

      service.createTrip(mockInput).subscribe(result => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('updateTrip', () => {
    const updateInput = {
      customerName: 'John Updated',
      basePrice: 75.00
    };

    it('should update trip successfully', (done) => {
      const updatedTrip = { ...mockTrip, ...updateInput };
      
      apolloSpy.mutate.and.returnValue(of({
        data: { updateTrip: updatedTrip }
      }));

      service.updateTrip('1', updateInput).subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.customerName).toBe('John Updated');
        expect(result?.basePrice).toBe(75.00);
        done();
      });

      expect(apolloSpy.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object),
        variables: { id: '1', input: updateInput },
        refetchQueries: [
          { query: jasmine.any(Object) },
          { query: jasmine.any(Object), variables: { id: '1' } }
        ]
      });
    });
  });

  describe('updateTripStatus', () => {
    it('should update trip status successfully', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: { updateTripStatus: { id: '1', status: TripStatus.IN_PROGRESS, updatedAt: new Date() } }
      }));

      service.updateTripStatus('1', TripStatus.IN_PROGRESS).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      expect(apolloSpy.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object),
        variables: { id: '1', status: TripStatus.IN_PROGRESS },
        refetchQueries: [
          { query: jasmine.any(Object) },
          { query: jasmine.any(Object), variables: { id: '1' } }
        ]
      });
    });

    it('should handle status update error', (done) => {
      apolloSpy.mutate.and.returnValue(throwError(() => new Error('Update failed')));

      service.updateTripStatus('1', TripStatus.COMPLETED).subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('deleteTrip', () => {
    it('should delete trip successfully', (done) => {
      apolloSpy.mutate.and.returnValue(of({
        data: { deleteTrip: { success: true, message: 'Deleted successfully' } }
      }));

      service.deleteTrip('1').subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      expect(apolloSpy.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object),
        variables: { id: '1' },
        refetchQueries: [{ query: jasmine.any(Object) }]
      });
    });

    it('should handle deletion error', (done) => {
      apolloSpy.mutate.and.returnValue(throwError(() => new Error('Deletion failed')));

      service.deleteTrip('1').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });
  });

  describe('getVehiclesForTrip', () => {
    const mockVehicles = [
      { id: '1', make: 'Toyota', model: 'Camry', licensePlate: 'ABC123', status: 'ACTIVE' },
      { id: '2', make: 'Honda', model: 'Civic', licensePlate: 'XYZ789', status: 'ACTIVE' }
    ];

    it('should return vehicles for trip assignment', (done) => {
      apolloSpy.query.and.returnValue(of({
        data: { vehicles: { vehicles: mockVehicles } },
        loading: false,
        networkStatus: 7
      }));

      service.getVehiclesForTrip().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[0].make).toBe('Toyota');
        done();
      });

      expect(apolloSpy.query).toHaveBeenCalledWith({
        query: jasmine.any(Object),
        variables: { filters: { status: 'ACTIVE' } },
        fetchPolicy: 'cache-first'
      });
    });

    it('should return empty array on error', (done) => {
      apolloSpy.query.and.returnValue(throwError(() => new Error('Network error')));

      service.getVehiclesForTrip().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('getDriversForTrip', () => {
    const mockDrivers = [
      { id: '1', firstName: 'John', lastName: 'Driver', email: 'john@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Driver', email: 'jane@example.com' }
    ];

    it('should return drivers for trip assignment', (done) => {
      apolloSpy.query.and.returnValue(of({
        data: { drivers: { drivers: mockDrivers } },
        loading: false,
        networkStatus: 7
      }));

      service.getDriversForTrip().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[0].firstName).toBe('John');
        done();
      });
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      expect(service.getStatusColor(TripStatus.DRAFT)).toBe('default');
      expect(service.getStatusColor(TripStatus.SCHEDULED)).toBe('primary');
      expect(service.getStatusColor(TripStatus.IN_PROGRESS)).toBe('accent');
      expect(service.getStatusColor(TripStatus.COMPLETED)).toBe('primary');
      expect(service.getStatusColor(TripStatus.CANCELLED)).toBe('warn');
      expect(service.getStatusColor(TripStatus.DELAYED)).toBe('warn');
    });
  });

  describe('loading and error states', () => {
    it('should track loading state during operations', () => {
      const loadingSubject = service.loading$;
      let loadingStates: boolean[] = [];

      loadingSubject.subscribe(loading => {
        loadingStates.push(loading);
      });

      apolloSpy.query.and.returnValue(of({
        data: { trips: mockTripListResponse },
        loading: false,
        networkStatus: 7
      }));

      service.getTrips().subscribe();

      // Should have started with false, then true during operation, then false when complete
      expect(loadingStates).toContain(true);
    });
  });
});
