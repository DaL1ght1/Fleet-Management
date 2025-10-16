export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  title: string;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  nextServiceDate?: Date;
  mileageAtService: number;
  cost?: number;
  technician?: string;
  serviceProvider?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  intervalMiles: number;
  intervalMonths: number;
  lastServiceDate?: Date;
  lastServiceMileage?: number;
  nextDueDate: Date;
  nextDueMileage: number;
  isActive: boolean;
}

export enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_ROTATION = 'TIRE_ROTATION',
  BRAKE_INSPECTION = 'BRAKE_INSPECTION',
  ENGINE_SERVICE = 'ENGINE_SERVICE',
  TRANSMISSION_SERVICE = 'TRANSMISSION_SERVICE',
  AIR_FILTER_REPLACEMENT = 'AIR_FILTER_REPLACEMENT',
  BATTERY_CHECK = 'BATTERY_CHECK',
  COOLING_SYSTEM = 'COOLING_SYSTEM',
  EXHAUST_SYSTEM = 'EXHAUST_SYSTEM',
  INSPECTION = 'INSPECTION',
  REPAIR = 'REPAIR',
  CUSTOM = 'CUSTOM'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface MaintenanceFilter {
  vehicleId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface CreateMaintenanceRequest {
  vehicleId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  title: string;
  description: string;
  scheduledDate: Date;
  mileageAtService: number;
  cost?: number;
  technician?: string;
  serviceProvider?: string;
  notes?: string;
}

export interface UpdateMaintenanceRequest extends Partial<CreateMaintenanceRequest> {
  id: string;
  status?: MaintenanceStatus;
  completedDate?: Date;
}