import { Injectable, inject, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  MaintenanceRecord,
  MaintenanceFilter,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority
} from '../models/maintenance.models';

const GET_MAINTENANCE_RECORDS = gql`
  query GetMaintenanceRecords($filter: MaintenanceFilterInput) {
    maintenanceRecords(filter: $filter) {
      id
      vehicleId
      type
      status
      priority
      title
      description
      scheduledDate
      completedDate
      nextServiceDate
      mileageAtService
      cost
      technician
      serviceProvider
      notes
      createdAt
      updatedAt
    }
  }
`;

const CREATE_MAINTENANCE_RECORD = gql`
  mutation CreateMaintenanceRecord($input: CreateMaintenanceInput!) {
    createMaintenanceRecord(input: $input) {
      id
      vehicleId
      type
      status
      priority
      title
      description
      scheduledDate
      mileageAtService
      cost
      technician
      serviceProvider
      notes
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_MAINTENANCE_RECORD = gql`
  mutation UpdateMaintenanceRecord($input: UpdateMaintenanceInput!) {
    updateMaintenanceRecord(input: $input) {
      id
      vehicleId
      type
      status
      priority
      title
      description
      scheduledDate
      completedDate
      nextServiceDate
      mileageAtService
      cost
      technician
      serviceProvider
      notes
      createdAt
      updatedAt
    }
  }
`;

const DELETE_MAINTENANCE_RECORD = gql`
  mutation DeleteMaintenanceRecord($id: ID!) {
    deleteMaintenanceRecord(id: $id) {
      success
      message
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apollo = inject(Apollo);
  private maintenanceRecordsSubject = new BehaviorSubject<MaintenanceRecord[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  readonly maintenanceRecords = signal<MaintenanceRecord[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly overdueRecords = computed(() =>
    this.maintenanceRecords().filter(record =>
      record.status === MaintenanceStatus.OVERDUE ||
      (record.status === MaintenanceStatus.SCHEDULED &&
       new Date(record.scheduledDate) < new Date())
    )
  );

  readonly criticalRecords = computed(() =>
    this.maintenanceRecords().filter(record =>
      record.priority === MaintenancePriority.CRITICAL
    )
  );

  readonly upcomingRecords = computed(() =>
    this.maintenanceRecords().filter(record => {
      if (record.status !== MaintenanceStatus.SCHEDULED) return false;
      const scheduledDate = new Date(record.scheduledDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return scheduledDate <= nextWeek && scheduledDate >= new Date();
    })
  );

  async loadMaintenanceRecords(filter?: MaintenanceFilter): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.apollo.query<{ maintenanceRecords: MaintenanceRecord[] }>({
        query: GET_MAINTENANCE_RECORDS,
        variables: { filter },
        fetchPolicy: 'network-only'
      }).toPromise();

      if (result?.data) {
        const records = result.data.maintenanceRecords || [];
        this.maintenanceRecords.set(records);
        this.maintenanceRecordsSubject.next(records);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load maintenance records';
      this.error.set(errorMessage);
      console.error('Error loading maintenance records:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createMaintenanceRecord(request: CreateMaintenanceRequest): Promise<MaintenanceRecord> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.apollo.mutate<{ createMaintenanceRecord: MaintenanceRecord }>({
        mutation: CREATE_MAINTENANCE_RECORD,
        variables: { input: request }
      }).toPromise();

      if (result?.data?.createMaintenanceRecord) {
        const newRecord = result.data.createMaintenanceRecord;
        const currentRecords = this.maintenanceRecords();
        this.maintenanceRecords.set([...currentRecords, newRecord]);
        return newRecord;
      }
      throw new Error('Failed to create maintenance record');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create maintenance record';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateMaintenanceRecord(request: UpdateMaintenanceRequest): Promise<MaintenanceRecord> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.apollo.mutate<{ updateMaintenanceRecord: MaintenanceRecord }>({
        mutation: UPDATE_MAINTENANCE_RECORD,
        variables: { input: request }
      }).toPromise();

      if (result?.data?.updateMaintenanceRecord) {
        const updatedRecord = result.data.updateMaintenanceRecord;
        const currentRecords = this.maintenanceRecords();
        const updatedRecords = currentRecords.map(record =>
          record.id === updatedRecord.id ? updatedRecord : record
        );
        this.maintenanceRecords.set(updatedRecords);
        return updatedRecord;
      }
      throw new Error('Failed to update maintenance record');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update maintenance record';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteMaintenanceRecord(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.apollo.mutate<{ deleteMaintenanceRecord: { success: boolean; message: string } }>({
        mutation: DELETE_MAINTENANCE_RECORD,
        variables: { id }
      }).toPromise();

      if (result?.data?.deleteMaintenanceRecord?.success) {
        const currentRecords = this.maintenanceRecords();
        const filteredRecords = currentRecords.filter(record => record.id !== id);
        this.maintenanceRecords.set(filteredRecords);
      } else {
        throw new Error('Failed to delete maintenance record');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete maintenance record';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  getMaintenanceRecord(id: string): MaintenanceRecord | undefined {
    return this.maintenanceRecords().find(record => record.id === id);
  }

  getMaintenanceRecordsByVehicle(vehicleId: string): MaintenanceRecord[] {
    return this.maintenanceRecords().filter(record => record.vehicleId === vehicleId);
  }

  filterRecords(filter: MaintenanceFilter): MaintenanceRecord[] {
    let filtered = [...this.maintenanceRecords()];

    if (filter.vehicleId) {
      filtered = filtered.filter(record => record.vehicleId === filter.vehicleId);
    }

    if (filter.type) {
      filtered = filtered.filter(record => record.type === filter.type);
    }

    if (filter.status) {
      filtered = filtered.filter(record => record.status === filter.status);
    }

    if (filter.priority) {
      filtered = filtered.filter(record => record.priority === filter.priority);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(record =>
        new Date(record.scheduledDate) >= filter.dateFrom!
      );
    }

    if (filter.dateTo) {
      filtered = filtered.filter(record =>
        new Date(record.scheduledDate) <= filter.dateTo!
      );
    }

    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchTerm) ||
        record.description.toLowerCase().includes(searchTerm) ||
        record.technician?.toLowerCase().includes(searchTerm) ||
        record.serviceProvider?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  clearError(): void {
    this.error.set(null);
  }
}