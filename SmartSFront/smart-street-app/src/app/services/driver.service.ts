import { Injectable, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, of, BehaviorSubject } from 'rxjs';
import { gql } from 'apollo-angular';
import { FetchPolicy } from '@apollo/client/core';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  status: DriverStatus;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  currentTripId?: string; // Current assigned trip
  rating?: number; // Driver rating
  createdAt?: Date;
  updatedAt?: Date;
}

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE'
}

export interface DriverInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  status?: DriverStatus;
  dateOfBirth?: string;
  hireDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface DriverFilters {
  search?: string;
  status?: DriverStatus;
}

export interface DriverListResponse {
  drivers: Driver[];
  total: number;
  page: number;
  pageSize: number;
}

// GraphQL scalar types
const UUID_SCALAR = gql`
  scalar UUID
`;

// GraphQL Queries and Mutations
const GET_ALL_DRIVERS = gql`
  query GetAllDrivers {
    drivers {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      licenseExpiryDate
      status
      dateOfBirth
      hireDate
      emergencyContactName
      emergencyContactPhone
      currentTripId
      rating
      createdAt
      updatedAt
    }
  }
`;

const GET_DRIVER_BY_ID = gql`
  query GetDriverById($id: UUID!) {
    getDriverById(id: $id) {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      licenseExpiryDate
      status
      dateOfBirth
      hireDate
      emergencyContactName
      emergencyContactPhone
      currentTripId
      rating
      createdAt
      updatedAt
    }
  }
`;

const CREATE_DRIVER = gql`
  mutation CreateDriver($input: DriverDto!) {
    createDriver(input: $input) {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      licenseExpiryDate
      status
      dateOfBirth
      hireDate
      emergencyContactName
      emergencyContactPhone
      currentTripId
      rating
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_DRIVER = gql`
  mutation UpdateDriver($id: UUID!, $input: DriverDto!) {
    updateDriver(id: $id, input: $input) {
      createdAt
      currentTripId
      dateOfBirth
      email
      emergencyContactName
      emergencyContactPhone
      firstName
      hireDate
      id
      lastName
      licenseExpiryDate
      licenseNumber
      phone
      rating
      status
      updatedAt
    }
  }
`;

const DELETE_DRIVER = gql`
  mutation DeleteDriver($id: UUID!) {
    deleteDriver(id: $id)
  }
`;

const SEARCH_DRIVERS = gql`
  query SearchDriversByName($name: String!) {
    searchDriversByName(name: $name) {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      status
      currentTripId
      rating
    }
  }
`;

const GET_AVAILABLE_DRIVERS = gql`
  query GetAvailableDrivers {
    getAvailableDrivers {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
      status
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apollo = inject(Apollo);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Reactive state with Signals
  private readonly _drivers = signal<Driver[]>([]);
  private readonly _selectedDriver = signal<Driver | null>(null);
  private readonly _filters = signal<DriverFilters>({
    search: '',
    status: undefined
  });

  // Public readonly signals
  public readonly drivers = this._drivers.asReadonly();
  public readonly selectedDriver = this._selectedDriver.asReadonly();
  public readonly filters = this._filters.asReadonly();

  // Computed signals
  public readonly filteredDrivers = computed(() => {
    const drivers = this._drivers();
    const filters = this._filters();

    return drivers.filter(driver => {
      // Search filter - case insensitive search across multiple fields
      const searchTerm = filters.search?.trim().toLowerCase() || '';
      const matchesSearch = !searchTerm ||
        (driver.firstName?.toLowerCase() || '').includes(searchTerm) ||
        (driver.lastName?.toLowerCase() || '').includes(searchTerm) ||
        (driver.email?.toLowerCase() || '').includes(searchTerm) ||
        (driver.licenseNumber?.toLowerCase() || '').includes(searchTerm);

      // Status filter
      const matchesStatus = !filters.status || driver.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  });

  public readonly activeDrivers = computed(() =>
    this._drivers().filter(d => d.status === DriverStatus.ACTIVE).length
  );

  /**
   * Set filters for driver list
   */
  setFilters(filters: Partial<DriverFilters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this._filters.set({
      search: '',
      status: undefined
    });
  }

  /**
   * Load all drivers into cache (for initialization)
   */
  async loadDrivers(): Promise<void> {
    try {
      const result = await this.apollo.query<{ drivers: Driver[] }>({
        query: GET_ALL_DRIVERS,
        fetchPolicy: 'network-only' as FetchPolicy,
        errorPolicy: 'all'
      }).toPromise();

      if (result?.data?.drivers) {
        const drivers = result.data.drivers.map(driver => ({
          ...driver,
          // Keep phone as is, add phoneNumber alias for compatibility
          phoneNumber: driver.phone,
          createdAt: driver.createdAt ? new Date(driver.createdAt) : undefined,
          updatedAt: driver.updatedAt ? new Date(driver.updatedAt) : undefined,
        }));

        this._drivers.set(drivers);
      } else {
      }
    } catch (error) {
    }
  }

  /**
   * Load all drivers from the server
   */
  getDrivers(
    filters?: DriverFilters,
    page: number = 1,
    pageSize: number = 50
  ): Observable<DriverListResponse | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{ drivers: Driver[] }>({
      query: GET_ALL_DRIVERS,
      fetchPolicy: 'network-only' as FetchPolicy,
      errorPolicy: 'all'
    }).pipe(
      map(result => {
        this.setLoading(false);

        if (result.data?.drivers) {
          // Convert date strings to Date objects
          const drivers = result.data.drivers.map(driver => ({
            ...driver,
            // Keep phone as is, add phoneNumber alias for compatibility
            phoneNumber: driver.phone,
            createdAt: driver.createdAt ? new Date(driver.createdAt) : undefined,
            updatedAt: driver.updatedAt ? new Date(driver.updatedAt) : undefined,
          }));

          this._drivers.set(drivers);

          // Return in the expected format
          return {
            drivers,
            total: drivers.length,
            page: 1,
            pageSize: drivers.length,
          };
        }

        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load drivers');
        return of(null);
      })
    );
  }


  /**
   * Get a single driver by ID
   */
  getDriver(id: string): Observable<Driver | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{getDriverById: Driver}>({
      query: GET_DRIVER_BY_ID,
      variables: { id },
      fetchPolicy: 'cache-first' as FetchPolicy
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.getDriverById) {
          const driver = {
            ...result.data.getDriverById,
            // Keep phone as is, add phoneNumber alias for compatibility
            phoneNumber: result.data.getDriverById.phone,
            createdAt: result.data.getDriverById.createdAt ? new Date(result.data.getDriverById.createdAt) : undefined,
            updatedAt: result.data.getDriverById.updatedAt ? new Date(result.data.getDriverById.updatedAt) : undefined
          };
          this._selectedDriver.set(driver);
          return driver;
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load driver');
        return of(null);
      })
    );
  }

  /**
   * Create a new driver
   */
  createDriver(input: DriverInput): Observable<Driver | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{createDriver: Driver}>({
      mutation: CREATE_DRIVER,
      variables: { input },
      refetchQueries: [{ query: GET_ALL_DRIVERS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.createDriver) {
          const driver = {
            ...result.data.createDriver,
            // Keep phone as is, add phoneNumber alias for compatibility
            phoneNumber: result.data.createDriver.phone,
            createdAt: result.data.createDriver.createdAt ? new Date(result.data.createDriver.createdAt) : undefined,
            updatedAt: result.data.createDriver.updatedAt ? new Date(result.data.createDriver.updatedAt) : undefined
          };

          this._drivers.update(drivers => [...drivers, driver]);
          return driver;
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to create driver');
        return of(null);
      })
    );
  }

  /**
   * Update an existing driver
   */
  updateDriver(id: string, input: DriverInput): Observable<Driver | null> {

    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{updateDriver: Driver}>({
      mutation: UPDATE_DRIVER,
      variables: { id, input },
      refetchQueries: [{ query: GET_ALL_DRIVERS }, { query: GET_DRIVER_BY_ID, variables: { id } }]
    }).pipe(
      map(result => {
        this.setLoading(false);

        if (result.data?.updateDriver) {
          const driver = {
            ...result.data.updateDriver,
            // Keep phone as is, add phoneNumber alias for compatibility
            phoneNumber: result.data.updateDriver.phone,
            createdAt: result.data.updateDriver.createdAt ? new Date(result.data.updateDriver.createdAt) : undefined,
            updatedAt: result.data.updateDriver.updatedAt ? new Date(result.data.updateDriver.updatedAt) : undefined
          };


          // Update cache
          this._drivers.update(drivers => {
            const updatedDrivers = drivers.map(d => d.id === id ? driver : d);
            return updatedDrivers;
          });

          if (this._selectedDriver()?.id === id) {
            this._selectedDriver.set(driver);
          }

          return driver;
        } else {
          return null;
        }
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to update driver');

        // Log GraphQL errors in detail
        if (error.graphQLErrors) {
        }
        if (error.networkError) {
        }

        return of(null);
      })
    );
  }

  /**
   * Delete a driver
   */
  deleteDriver(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{deleteDriver: boolean}>({
      mutation: DELETE_DRIVER,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_DRIVERS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        const success = result.data?.deleteDriver || false;

        if (success) {
          this._drivers.update(drivers => drivers.filter(d => d.id !== id));
          if (this._selectedDriver()?.id === id) {
            this._selectedDriver.set(null);
          }
        }

        return success;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to delete driver');
        return of(false);
      })
    );
  }

  /**
   * Get available drivers for trip assignment
   */
  getAvailableDrivers(): Observable<Driver[]> {
    return this.apollo.query<{getAvailableDrivers: Driver[]}>({
      query: GET_AVAILABLE_DRIVERS,
      fetchPolicy: 'cache-first' as FetchPolicy
    }).pipe(
      map(result => result.data?.getAvailableDrivers || []),
      catchError(error => {
        return of([]);
      })
    );
  }

  /**
   * Search drivers by name or email
   */
  searchDrivers(search?: string, limit: number = 10): Observable<Driver[]> {
    if (!search || search.length < 2) {
      // Return active drivers from cache if no search term
      return of(this._drivers().filter(d => d.status === DriverStatus.ACTIVE).slice(0, limit));
    }

    return this.apollo.query<{searchDriversByName: Driver[]}>({
      query: SEARCH_DRIVERS,
      variables: { name: search },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data?.searchDriversByName || []),
      catchError(error => {
        // Fallback to local search
        const searchTerm = search.toLowerCase();
        return of(
          this._drivers()
            .filter(driver =>
              driver.status === DriverStatus.ACTIVE &&
              (driver.firstName.toLowerCase().includes(searchTerm) ||
               driver.lastName.toLowerCase().includes(searchTerm) ||
               driver.email.toLowerCase().includes(searchTerm))
            )
            .slice(0, limit)
        );
      })
    );
  }

  /**
   * Get drivers for trip assignment (active drivers only)
   */
  getDriversForTrip(): Observable<Driver[]> {

    // If we have drivers in cache, use them first
    const cachedActiveDrivers = this._drivers().filter(d => d.status === DriverStatus.ACTIVE);

    if (cachedActiveDrivers.length > 0) {
      return of(cachedActiveDrivers);
    }

    // Otherwise, fetch from server
    return this.apollo.query<{drivers: Driver[]}>({
      query: GET_ALL_DRIVERS,
      fetchPolicy: 'cache-first'
    }).pipe(
      map(result => {
        const drivers = result.data?.drivers || [];

        // Filter for active drivers only and add phoneNumber alias
        const activeDrivers = drivers
          .filter(driver => driver.status === DriverStatus.ACTIVE)
          .map(driver => ({
            ...driver,
            // Keep phone as is, add phoneNumber alias for compatibility
            phoneNumber: driver.phone,
            createdAt: driver.createdAt ? new Date(driver.createdAt) : undefined,
            updatedAt: driver.updatedAt ? new Date(driver.updatedAt) : undefined,
          }));


        // Update cache with all drivers
        if (drivers.length > 0) {
          const allDriversFormatted = drivers.map(driver => ({
            ...driver,
            phoneNumber: driver.phone,
            createdAt: driver.createdAt ? new Date(driver.createdAt) : undefined,
            updatedAt: driver.updatedAt ? new Date(driver.updatedAt) : undefined,
          }));
          this._drivers.set(allDriversFormatted);
        }

        return activeDrivers;
      }),
      catchError(error => {
        // Return active drivers from cache as fallback
        const fallbackDrivers = this._drivers().filter(d => d.status === DriverStatus.ACTIVE);
        return of(fallbackDrivers);
      })
    );
  }

  // Helper methods
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get full driver name
   */
  getDriverDisplayName(driver: Driver): string {
    return `${driver.firstName} ${driver.lastName}`;
  }

  /**
   * Check if driver license is expired or expiring soon
   */
  isLicenseExpiringSoon(driver: Driver, daysThreshold: number = 30): boolean {
    if (!driver.licenseExpiryDate) return false;

    const expiryDate = new Date(driver.licenseExpiryDate);
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + daysThreshold);

    return expiryDate <= threshold;
  }
}
