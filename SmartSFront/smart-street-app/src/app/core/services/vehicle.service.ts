import { Injectable, inject, signal, computed } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, map, catchError, of } from 'rxjs';
import { AppStateService } from '../state/app-state.service';
import {
  Vehicle,
  VehicleInput,
  Status,
  UUID,
  ApiResponseVehicle,
  ApiResponseVehicleList,
  ApiResponseVoid,
  ApiResponseLong
} from '../models/vehicle.model';
import * as VehicleQueries from '../queries/vehicle.queries';

// Re-export Vehicle type for convenience
export type { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apollo = inject(Apollo);
  private appState = inject(AppStateService);

  // Reactive state with Signals
  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _selectedVehicle = signal<Vehicle | null>(null);
  private readonly _filters = signal({
    search: '',
    status: '' as Status | '',
    make: '',
    model: ''
  });

  // Public readonly signals
  public readonly vehicles = this._vehicles.asReadonly();
  public readonly selectedVehicle = this._selectedVehicle.asReadonly();
  public readonly filters = this._filters.asReadonly();

  // Computed signals
  public readonly filteredVehicles = computed(() => {
    const vehicles = this._vehicles();
    const filters = this._filters();
    
    return vehicles.filter(vehicle => {
      // Search filter - case insensitive search across multiple fields
      const searchTerm = filters.search?.trim().toLowerCase() || '';
      const matchesSearch = !searchTerm || 
        (vehicle.make?.toLowerCase() || '').includes(searchTerm) ||
        (vehicle.model?.toLowerCase() || '').includes(searchTerm) ||
        (vehicle.licensePlate?.toLowerCase() || '').includes(searchTerm) ||
        (vehicle.vin?.toLowerCase() || '').includes(searchTerm) ||
        (vehicle.color?.toLowerCase() || '').includes(searchTerm);
        
      // Status filter
      const matchesStatus = !filters.status || vehicle.status === filters.status;
      
      // Make filter
      const matchesMake = !filters.make || vehicle.make === filters.make;
      
      // Model filter
      const matchesModel = !filters.model || vehicle.model === filters.model;
      
      return matchesSearch && matchesStatus && matchesMake && matchesModel;
    });
  });

  public readonly vehicleCount = computed(() => this._vehicles().length);
  public readonly activeVehicles = computed(() => 
    this._vehicles().filter(v => v.status === Status.ACTIVE).length
  );
  public readonly maintenanceVehicles = computed(() => 
    this._vehicles().filter(v => v.status === Status.MAINTENANCE).length
  );
  public readonly inactiveVehicles = computed(() => 
    this._vehicles().filter(v => v.status === Status.INACTIVE).length
  );

  // State management methods
  setFilters(filters: Partial<{
    search: string;
    status: Status | '';
    make: string;
    model: string;
  }>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  clearFilters(): void {
    this._filters.set({
      search: '',
      status: '' as Status | '',
      make: '',
      model: ''
    });
  }

  // GraphQL Operations with error handling and loading states

  /**
   * Load all vehicles from the server
   */
  async loadVehicles(): Promise<void> {
    await this.appState.withLoading('vehicles-load', async () => {
      try {
        const result = await this.apollo.query<{ getAllVehicle: ApiResponseVehicleList }>({
          query: VehicleQueries.GET_ALL_VEHICLES,
          fetchPolicy: 'network-only',
          errorPolicy: 'all'
        }).toPromise();

        if (result?.data?.getAllVehicle?.success && result.data.getAllVehicle.data) {
          const vehicles = result.data.getAllVehicle.data;
          this._vehicles.set(vehicles);
          this.appState.showNotification(`Loaded ${vehicles.length} vehicles`, 'success');
        } else {
          const errorMessage = result?.data?.getAllVehicle?.message || 'Failed to load vehicles';
          throw new Error(errorMessage);
        }
      } catch (error) {
        this.appState.showNotification('Failed to load vehicles', 'error');
        throw error;
      }
    });
  }

  /**
   * Load a specific vehicle by ID
   */
  async loadVehicle(id: UUID): Promise<Vehicle | null> {
    return this.appState.withLoading(`vehicle-${id}`, async () => {
      try {
        // Ensure ID is treated as a string for UUID compatibility
        const vehicleId = String(id);
        
        const result = await this.apollo.query<{ getVehicleById: ApiResponseVehicle }>({
          query: VehicleQueries.GET_VEHICLE_BY_ID,
          variables: { id: vehicleId },
          fetchPolicy: 'cache-first'
        }).toPromise();

        if (result?.data?.getVehicleById?.success && result.data.getVehicleById.data) {
          const vehicle = result.data.getVehicleById.data;
          this._selectedVehicle.set(vehicle);
          return vehicle;
        } else {
          const errorMessage = result?.data?.getVehicleById?.message || 'Vehicle not found';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error loading vehicle ${id}:`, error);
        
        // Fallback: Try to find vehicle in loaded vehicles (for mock data)
        const existingVehicle = this._vehicles().find(v => v.id === id);
        if (existingVehicle) {
          this._selectedVehicle.set(existingVehicle);
          return existingVehicle;
        }
        
        this._selectedVehicle.set(null);
        throw error;
      }
    });
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicleInput: VehicleInput): Promise<Vehicle> {
    return this.appState.withLoading('vehicle-create', async () => {
      try {
        const result = await this.apollo.mutate<{ registerVehicle: ApiResponseVehicle }>({
          mutation: VehicleQueries.REGISTER_VEHICLE,
          variables: { vehicle: vehicleInput }
        }).toPromise();

        if (result?.data?.registerVehicle?.success && result.data.registerVehicle.data) {
          const newVehicle = result.data.registerVehicle.data;
          this._vehicles.update(vehicles => [...vehicles, newVehicle]);
          this.appState.showNotification('Vehicle created successfully', 'success');
          return newVehicle;
        } else {
          const errorMessage = result?.data?.registerVehicle?.message || 'Failed to create vehicle';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error creating vehicle:', error);
        throw error;
      }
    });
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id: UUID, vehicleInput: VehicleInput): Promise<Vehicle> {
    return this.appState.withLoading(`vehicle-update-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ updateVehicle: ApiResponseVehicle }>({
          mutation: VehicleQueries.UPDATE_VEHICLE,
          variables: { id, vehicle: vehicleInput }
        }).toPromise();

        if (result?.data?.updateVehicle?.success && result.data.updateVehicle.data) {
          const updatedVehicle = result.data.updateVehicle.data;
          this._vehicles.update(vehicles => 
            vehicles.map(v => v.id === id ? updatedVehicle : v)
          );
          if (this._selectedVehicle()?.id === id) {
            this._selectedVehicle.set(updatedVehicle);
          }
          this.appState.showNotification('Vehicle updated successfully', 'success');
          return updatedVehicle;
        } else {
          const errorMessage = result?.data?.updateVehicle?.message || 'Failed to update vehicle';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error updating vehicle ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Update vehicle status only
   */
  async updateVehicleStatus(id: UUID, status: Status): Promise<void> {
    await this.appState.withLoading(`vehicle-status-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ updateVehicleStatus: ApiResponseVoid }>({
          mutation: VehicleQueries.UPDATE_VEHICLE_STATUS,
          variables: { id, status }
        }).toPromise();

        if (result?.data?.updateVehicleStatus?.success) {
          this._vehicles.update(vehicles => 
            vehicles.map(v => v.id === id ? { ...v, status } : v)
          );
          if (this._selectedVehicle()?.id === id) {
            this._selectedVehicle.update(vehicle => 
              vehicle ? { ...vehicle, status } : vehicle
            );
          }
          this.appState.showNotification(`Vehicle status updated to ${status}`, 'success');
        } else {
          const errorMessage = result?.data?.updateVehicleStatus?.message || 'Failed to update vehicle status';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error updating vehicle status ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(id: UUID): Promise<void> {
    await this.appState.withLoading(`vehicle-delete-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ deleteVehicle: ApiResponseVoid }>({
          mutation: VehicleQueries.DELETE_VEHICLE,
          variables: { id }
        }).toPromise();

        if (result?.data?.deleteVehicle?.success) {
          this._vehicles.update(vehicles => vehicles.filter(v => v.id !== id));
          if (this._selectedVehicle()?.id === id) {
            this._selectedVehicle.set(null);
          }
          this.appState.showNotification('Vehicle deleted successfully', 'success');
        } else {
          const errorMessage = result?.data?.deleteVehicle?.message || 'Failed to delete vehicle';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`Error deleting vehicle ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Search vehicles by license plate
   */
  async searchByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.appState.withLoading('vehicle-search-license', async () => {
      try {
        const result = await this.apollo.query<{ getVehicleByLicensePlate: ApiResponseVehicle }>({
          query: VehicleQueries.GET_VEHICLE_BY_LICENSE_PLATE,
          variables: { licensePlate },
          fetchPolicy: 'network-only'
        }).toPromise();

        if (result?.data?.getVehicleByLicensePlate?.success && result.data.getVehicleByLicensePlate.data) {
          return result.data.getVehicleByLicensePlate.data;
        }
        return null;
      } catch (error) {
        console.error('Error searching vehicle by license plate:', error);
        throw error;
      }
    });
  }

  /**
   * Get available vehicles for trip assignment
   */
  getAvailableVehicles(): Observable<Vehicle[]> {
    return of(this._vehicles().filter(v => v.status === Status.ACTIVE));
  }

  /**
   * Get loading state for specific operations
   */
  isLoading(operation: string): boolean {
    return this.appState.isLoading(operation);
  }

  /**
   * Get error state for specific operations
   */
  getError(operation: string): string | null {
    return this.appState.getError(operation);
  }
}
