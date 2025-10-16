import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { FetchPolicy } from '@apollo/client/core';
import {
  Trip,
  TripFilters,
  TripListResponse,
  CreateTripInput,
  UpdateTripInput,
  TripStatus,
  TripType,
  VehicleOption,
  DriverOption
} from '../models/trip.model';
import {
  GET_ALL_TRIPS as GET_TRIPS,
  GET_TRIP_BY_ID as GET_TRIP,
  CREATE_TRIP,
  UPDATE_TRIP,
  DELETE_TRIP,
  UPDATE_TRIP_STATUS
} from '../core/queries/trip.queries';

// Re-export types for convenience
export type { CreateTripInput, Trip } from '../models/trip.model';
export { TripType, TripStatus } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private apollo: Apollo) {}

  /**
   * Get list of trips with filtering and pagination
   */
  getTrips(
    filters?: TripFilters,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'scheduledStart',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Observable<TripListResponse | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{getAllTrips: any[]}>({
      query: GET_TRIPS,
      fetchPolicy: 'network-only' as FetchPolicy
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.getAllTrips) {
          // Convert date strings to Date objects and adapt structure
          const trips = result.data.getAllTrips.map((trip: any) => ({
            id: trip.id,
            type: trip.type,
            status: trip.status,
            vehicleId: trip.vehicleId,
            driverId: trip.driverId,
            // Map backend locations to frontend structure
            pickupLocation: trip.startLocation ? {
              name: trip.startLocation.address, // Use address as name if name not provided
              address: trip.startLocation.address || '',
              latitude: trip.startLocation.latitude,
              longitude: trip.startLocation.longitude
            } : undefined,
            dropoffLocation: trip.endLocation ? {
              name: trip.endLocation.address, // Use address as name if name not provided
              address: trip.endLocation.address || '',
              latitude: trip.endLocation.latitude,
              longitude: trip.endLocation.longitude
            } : undefined,
            // Map backend times to frontend structure
            scheduledStart: trip.scheduledStartTime ? new Date(trip.scheduledStartTime) : undefined,
            scheduledEnd: trip.scheduledEndTime ? new Date(trip.scheduledEndTime) : undefined,
            actualStart: trip.startTime ? new Date(trip.startTime) : undefined,
            actualEnd: trip.endTime ? new Date(trip.endTime) : undefined,
            // Map other fields
            distance: trip.distance,
            duration: trip.duration,
            estimatedDuration: trip.estimatedDuration,
            basePrice: trip.baseRate,
            totalPrice: trip.totalCost,
            notes: trip.notes,
            customerNotes: trip.customerNotes,
            internalNotes: trip.internalNotes,
            // Map customer name from driver info if available
            customerName: trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : undefined,
            createdAt: trip.createdAt ? new Date(trip.createdAt) : undefined,
            updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : undefined
          }));
          
          return {
            trips,
            total: trips.length,
            page: 1,
            pageSize: trips.length
          };
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load trips');
        return of(null);
      })
    );
  }

  /**
   * Get a single trip by ID
   */
  getTrip(id: string): Observable<Trip | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{trip: Trip}>({
      query: GET_TRIP,
      variables: { id },
      fetchPolicy: 'cache-first' as FetchPolicy
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.trip) {
          // Convert date strings to Date objects
          const trip = result.data.trip;
          return {
            ...trip,
            scheduledStart: trip.scheduledStart ? new Date(trip.scheduledStart) : undefined,
            scheduledEnd: trip.scheduledEnd ? new Date(trip.scheduledEnd) : undefined,
            actualStart: trip.actualStart ? new Date(trip.actualStart) : undefined,
            actualEnd: trip.actualEnd ? new Date(trip.actualEnd) : undefined,
            createdAt: trip.createdAt ? new Date(trip.createdAt) : undefined,
            updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : undefined
          };
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load trip');
        return of(null);
      })
    );
  }

  /**
   * Create a new trip
   */
  createTrip(input: CreateTripInput): Observable<Trip | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{createTrip: any}>({
      mutation: CREATE_TRIP,
      variables: { trip: input },
      refetchQueries: [{ query: GET_TRIPS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.createTrip?.success && result.data.createTrip.data) {
          const trip = result.data.createTrip.data;
          return {
            ...trip,
            scheduledStart: trip.scheduledStartTime ? new Date(trip.scheduledStartTime) : undefined,
            scheduledEnd: trip.scheduledEndTime ? new Date(trip.scheduledEndTime) : undefined,
            actualStart: trip.startTime ? new Date(trip.startTime) : undefined,
            actualEnd: trip.endTime ? new Date(trip.endTime) : undefined,
            createdAt: trip.createdAt ? new Date(trip.createdAt) : undefined,
            updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : undefined
          };
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to create trip');
        return of(null);
      })
    );
  }

  /**
   * Update an existing trip
   */
  updateTrip(id: string, input: Partial<CreateTripInput>): Observable<Trip | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{updateTrip: Trip}>({
      mutation: UPDATE_TRIP,
      variables: { id, input },
      refetchQueries: [{ query: GET_TRIPS }, { query: GET_TRIP, variables: { id } }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.updateTrip) {
          const trip = result.data.updateTrip;
          return {
            ...trip,
            scheduledStart: trip.scheduledStart ? new Date(trip.scheduledStart) : undefined,
            scheduledEnd: trip.scheduledEnd ? new Date(trip.scheduledEnd) : undefined,
            actualStart: trip.actualStart ? new Date(trip.actualStart) : undefined,
            actualEnd: trip.actualEnd ? new Date(trip.actualEnd) : undefined,
            createdAt: trip.createdAt ? new Date(trip.createdAt) : undefined,
            updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : undefined
          };
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to update trip');
        return of(null);
      })
    );
  }

  /**
   * Update trip status
   */
  updateTripStatus(id: string, status: TripStatus): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate({
      mutation: UPDATE_TRIP_STATUS,
      variables: { id, status },
      refetchQueries: [{ query: GET_TRIPS }, { query: GET_TRIP, variables: { id } }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        return !!result.data;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to update trip status');
        return of(false);
      })
    );
  }

  /**
   * Delete a trip
   */
  deleteTrip(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{deleteTrip: {success: boolean, message: string}}>({
      mutation: DELETE_TRIP,
      variables: { id },
      refetchQueries: [{ query: GET_TRIPS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        return result.data?.deleteTrip?.success || false;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to delete trip');
        return of(false);
      })
    );
  }

  /**
   * Get available vehicles for trip assignment
   * TODO: Implement proper GraphQL query when available
   */
  getVehiclesForTrip(): Observable<VehicleOption[]> {
    // Placeholder implementation - will be replaced with proper GraphQL query
    return of([]);
  }

  /**
   * Get available drivers for trip assignment
   * TODO: Implement proper GraphQL query when available
   */
  getDriversForTrip(): Observable<DriverOption[]> {
    // Placeholder implementation - will be replaced with proper GraphQL query
    return of([]);
  }

  /**
   * Get locations for autocomplete
   * TODO: Implement proper GraphQL query when available
   */
  getLocations(search: string): Observable<any[]> {
    // Placeholder implementation - will be replaced with proper GraphQL query
    return of([]);
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
   * Get status color for chips
   */
  getStatusColor(status: TripStatus): string {
    const statusColors: Record<TripStatus, string> = {
      [TripStatus.SCHEDULED]: 'primary',
      [TripStatus.ACTIVE]: 'accent',
      [TripStatus.COMPLETED]: 'accent',
      [TripStatus.CANCELLED]: 'warn'
    };
    return statusColors[status] || 'default';
  }
}
