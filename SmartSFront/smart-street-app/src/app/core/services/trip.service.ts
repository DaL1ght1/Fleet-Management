import { Injectable, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, of } from 'rxjs';
import { AppStateService } from '../state/app-state.service';
import {
  Trip,
  TripInput,
  TripStatus,
  TripType,
  TripFilters,
  TripStatistics,
  UUID,
  ApiResponseTrip,
  ApiResponseTripList,
  ApiResponseVoid
} from '../models/trip.model';
import * as TripQueries from '../queries/trip.queries';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apollo = inject(Apollo);
  private appState = inject(AppStateService);

  // Reactive state with Signals
  private readonly _trips = signal<Trip[]>([]);
  private readonly _selectedTrip = signal<Trip | null>(null);
  private readonly _statistics = signal<TripStatistics | null>(null);
  private readonly _filters = signal<TripFilters>({
    search: '',
    status: '' as TripStatus | '',
    type: '' as TripType | '',
    vehicleId: undefined,
    driverId: undefined,
    startDate: undefined,
    endDate: undefined
  });

  // Public readonly signals
  public readonly trips = this._trips.asReadonly();
  public readonly selectedTrip = this._selectedTrip.asReadonly();
  public readonly statistics = this._statistics.asReadonly();
  public readonly filters = this._filters.asReadonly();

  // Computed signals
  public readonly filteredTrips = computed(() => {
    const trips = this._trips();
    const filters = this._filters();
    
    return trips.filter(trip => {
      // Search filter - case insensitive search across multiple fields
      const searchTerm = filters.search?.trim().toLowerCase() || '';
      const matchesSearch = !searchTerm || 
        (trip.vehicle?.make?.toLowerCase() || '').includes(searchTerm) ||
        (trip.vehicle?.model?.toLowerCase() || '').includes(searchTerm) ||
        (trip.vehicle?.licensePlate?.toLowerCase() || '').includes(searchTerm) ||
        (trip.driver?.firstName?.toLowerCase() || '').includes(searchTerm) ||
        (trip.driver?.lastName?.toLowerCase() || '').includes(searchTerm) ||
        (trip.startLocation?.address?.toLowerCase() || '').includes(searchTerm) ||
        (trip.endLocation?.address?.toLowerCase() || '').includes(searchTerm);
        
      // Status filter
      const matchesStatus = !filters.status || trip.status === filters.status;
      
      // Type filter
      const matchesType = !filters.type || trip.type === filters.type;
      
      // Vehicle filter
      const matchesVehicle = !filters.vehicleId || trip.vehicleId === filters.vehicleId;
      
      // Driver filter
      const matchesDriver = !filters.driverId || trip.driverId === filters.driverId;
      
      // Date filters
      const matchesStartDate = !filters.startDate || new Date(trip.scheduledStartTime) >= new Date(filters.startDate);
      const matchesEndDate = !filters.endDate || new Date(trip.scheduledStartTime) <= new Date(filters.endDate);
      
      return matchesSearch && matchesStatus && matchesType && 
             matchesVehicle && matchesDriver && matchesStartDate && matchesEndDate;
    });
  });

  public readonly tripCount = computed(() => this._trips().length);
  public readonly scheduledTrips = computed(() => 
    this._trips().filter(t => t.status === TripStatus.SCHEDULED).length
  );
  public readonly inProgressTrips = computed(() => 
    this._trips().filter(t => t.status === TripStatus.IN_PROGRESS).length
  );
  public readonly completedTrips = computed(() => 
    this._trips().filter(t => t.status === TripStatus.COMPLETED).length
  );
  public readonly cancelledTrips = computed(() => 
    this._trips().filter(t => t.status === TripStatus.CANCELLED).length
  );

  // State management methods
  setFilters(filters: Partial<TripFilters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  clearFilters(): void {
    this._filters.set({
      search: '',
      status: '' as TripStatus | '',
      type: '' as TripType | '',
      vehicleId: undefined,
      driverId: undefined,
      startDate: undefined,
      endDate: undefined
    });
  }

  // GraphQL Operations with error handling and loading states

  /**
   * Load all trips from the server
   */
  async loadTrips(filters?: TripFilters): Promise<void> {
    await this.appState.withLoading('trips-load', async () => {
      try {
        console.log('🚗 Attempting to load trips with filters:', filters);
        console.log('🚗 GraphQL Endpoint:', 'http://localhost:4000/graphql');
        console.log('🚗 Query variables:', { filters });
        
        const result = await this.apollo.query<{ getAllTrips: Trip[] }>({
          query: TripQueries.GET_ALL_TRIPS,
          variables: {},
          fetchPolicy: 'network-only',
          errorPolicy: 'all'
        }).toPromise();

        console.log('🚗 GraphQL result:', result);

        if (result?.data?.getAllTrips) {
          this._trips.set(result.data.getAllTrips);
          this.appState.showNotification(`Loaded ${result.data.getAllTrips.length} trips`, 'success');
          console.log('🚗 Trips loaded successfully:', result.data.getAllTrips);
        } else {
          console.warn('🚗 No trips data in response:', result);
          this._trips.set([]);
          throw new Error('No trips data received from server');
        }
      } catch (error) {
        console.error('🚗 Error loading trips:', error);
        this._trips.set([]);
        this.appState.showNotification('Failed to load trips from backend', 'error');
        throw error;
      }
    });
  }

  /**
   * Load a specific trip by ID
   */
  async loadTrip(id: UUID): Promise<Trip | null> {
    return this.appState.withLoading(`trip-${id}`, async () => {
      try {
        console.log('🚗 Loading trip with ID (type):', id, typeof id);
        
        // Ensure ID is treated as a string for UUID compatibility
        const tripId = String(id);
        
        const result = await this.apollo.query<{ getTripById: Trip }>({
          query: TripQueries.GET_TRIP_BY_ID,
          variables: { id: tripId },
          fetchPolicy: 'cache-first'
        }).toPromise();

        if (result?.data?.getTripById) {
          const trip = result.data.getTripById;
          this._selectedTrip.set(trip);
          return trip;
        } else {
          throw new Error('Trip not found');
        }
      } catch (error) {
        console.error(`Error loading trip ${id}:`, error);
        this._selectedTrip.set(null);
        throw error;
      }
    });
  }

  /**
   * Load trip statistics
   */
  async loadStatistics(startDate?: string, endDate?: string): Promise<void> {
    await this.appState.withLoading('trip-statistics', async () => {
      try {
        const result = await this.apollo.query<{ getTripStatistics: { success: boolean; message?: string; data: TripStatistics } }>({
          query: TripQueries.GET_TRIP_STATISTICS,
          variables: { startDate, endDate },
          fetchPolicy: 'network-only'
        }).toPromise();

        if (result?.data?.getTripStatistics?.success && result.data.getTripStatistics.data) {
          this._statistics.set(result.data.getTripStatistics.data);
        } else {
          // Use computed statistics from loaded trips as fallback
          const trips = this._trips();
          const completedTrips = trips.filter(t => t.status === TripStatus.COMPLETED);
          const mockStats: TripStatistics = {
            totalTrips: trips.length,
            completedTrips: completedTrips.length,
            cancelledTrips: trips.filter(t => t.status === TripStatus.CANCELLED).length,
            inProgressTrips: trips.filter(t => t.status === TripStatus.IN_PROGRESS).length,
            totalDistance: completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0),
            totalRevenue: completedTrips.reduce((sum, t) => sum + (t.totalCost || 0), 0),
            averageTripDuration: completedTrips.length > 0 ? 
              completedTrips.reduce((sum, t) => sum + (t.duration || 0), 0) / completedTrips.length : 0,
            averageTripDistance: completedTrips.length > 0 ? 
              completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0) / completedTrips.length : 0
          };
          this._statistics.set(mockStats);
        }
      } catch (error) {
        console.error('Error loading trip statistics:', error);
      }
    });
  }

  /**
   * Create a new trip
   */
  async createTrip(tripInput: TripInput): Promise<Trip> {
    return this.appState.withLoading('trip-create', async () => {
      try {
        const result = await this.apollo.mutate<{ createTrip: Trip }>({
          mutation: TripQueries.CREATE_TRIP,
          variables: { input: tripInput }
        }).toPromise();

        if (result?.data?.createTrip) {
          const newTrip = result.data.createTrip;
          this._trips.update(trips => [...trips, newTrip]);
          this.appState.showNotification('Trip created successfully', 'success');
          return newTrip;
        } else {
          throw new Error('Failed to create trip');
        }
      } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
      }
    });
  }

  /**
   * Update an existing trip
   */
  async updateTrip(id: UUID, tripInput: TripInput): Promise<Trip> {
    return this.appState.withLoading(`trip-update-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ updateTrip: Trip }>({
          mutation: TripQueries.UPDATE_TRIP,
          variables: { input: { id, ...tripInput } }
        }).toPromise();

        if (result?.data?.updateTrip) {
          const updatedTrip = result.data.updateTrip;
          this._trips.update(trips => 
            trips.map(t => t.id === id ? updatedTrip : t)
          );
          if (this._selectedTrip()?.id === id) {
            this._selectedTrip.set(updatedTrip);
          }
          this.appState.showNotification('Trip updated successfully', 'success');
          return updatedTrip;
        } else {
          throw new Error('Failed to update trip');
        }
      } catch (error) {
        console.error(`Error updating trip ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Update trip status
   */
  async updateTripStatus(id: UUID, status: TripStatus): Promise<void> {
    await this.appState.withLoading(`trip-status-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ updateTripStatus: ApiResponseTrip }>({
          mutation: TripQueries.UPDATE_TRIP_STATUS,
          variables: { id, status }
        }).toPromise();

        if (result?.data?.updateTripStatus?.success && result.data.updateTripStatus.data) {
          const updatedTrip = result.data.updateTripStatus.data;
          this._trips.update(trips => 
            trips.map(t => t.id === id ? updatedTrip : t)
          );
          if (this._selectedTrip()?.id === id) {
            this._selectedTrip.set(updatedTrip);
          }
          this.appState.showNotification(`Trip status updated to ${status}`, 'success');
        } else {
          const errorMessage = result?.data?.updateTripStatus?.message || 'Failed to update trip status';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error updating trip status ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Start a trip
   */
  async startTrip(id: UUID): Promise<void> {
    await this.updateTripStatus(id, TripStatus.IN_PROGRESS);
  }

  /**
   * Complete a trip
   */
  async completeTrip(id: UUID): Promise<void> {
    await this.updateTripStatus(id, TripStatus.COMPLETED);
  }

  /**
   * Cancel a trip
   */
  async cancelTrip(id: UUID, reason?: string): Promise<void> {
    await this.appState.withLoading(`trip-cancel-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ cancelTrip: ApiResponseTrip }>({
          mutation: TripQueries.CANCEL_TRIP,
          variables: { id, reason }
        }).toPromise();

        if (result?.data?.cancelTrip?.success) {
          const updatedTrip = result.data.cancelTrip.data;
          if (updatedTrip) {
            this._trips.update(trips => 
              trips.map(t => t.id === id ? updatedTrip : t)
            );
            if (this._selectedTrip()?.id === id) {
              this._selectedTrip.set(updatedTrip);
            }
          }
          this.appState.showNotification('Trip cancelled successfully', 'success');
        } else {
          const errorMessage = result?.data?.cancelTrip?.message || 'Failed to cancel trip';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error cancelling trip ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Delete a trip
   */
  async deleteTrip(id: UUID): Promise<void> {
    await this.appState.withLoading(`trip-delete-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ deleteTrip: boolean }>({
          mutation: TripQueries.DELETE_TRIP,
          variables: { id }
        }).toPromise();

        if (result?.data?.deleteTrip !== false) {
          this._trips.update(trips => trips.filter(t => t.id !== id));
          if (this._selectedTrip()?.id === id) {
            this._selectedTrip.set(null);
          }
          this.appState.showNotification('Trip deleted successfully', 'success');
        } else {
          throw new Error('Failed to delete trip');
        }
      } catch (error) {
        console.error(`Error deleting trip ${id}:`, error);
        throw error;
      }
    });
  }

  // Utility methods
  isLoading(operation?: string): boolean {
    if (operation) {
      return this.appState.isLoading(operation);
    }
    return this.appState.isLoading('trips-load') || 
           this.appState.isLoading('trip-create') ||
           this.appState.isLoading('trip-update') ||
           this.appState.isLoading('trip-delete');
  }

}
