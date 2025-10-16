export type UUID = string;
export type ISODate = string;
export type Long = number;

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TripType {
  RENTAL = 'RENTAL',
  MAINTENANCE = 'MAINTENANCE',
  RELOCATION = 'RELOCATION',
  EMERGENCY = 'EMERGENCY',
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Driver {
  id: UUID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface Trip {
  id: UUID;
  vehicleId: UUID;
  driverId?: UUID;
  type: TripType;
  status: TripStatus;
  
  // Route information
  startLocation: Location;
  endLocation: Location;
  waypoints?: Location[];
  
  // Trip details
  startTime?: ISODate;
  endTime?: ISODate;
  scheduledStartTime: ISODate;
  scheduledEndTime?: ISODate;
  
  // Metrics
  distance?: number; // in miles
  duration?: number; // in minutes
  estimatedDuration?: number; // in minutes
  
  // Financial
  baseRate?: number;
  totalCost?: number;
  fuelCost?: number;
  additionalFees?: number;
  
  // Additional data
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  
  // Timestamps
  createdAt: ISODate;
  updatedAt: ISODate;
  
  // Related data (populated)
  vehicle?: {
    id: UUID;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
  
  driver?: Driver;
}

export interface TripInput {
  vehicleId: UUID;
  driverId?: UUID;
  type: TripType;
  
  startLocation: Location;
  endLocation: Location;
  waypoints?: Location[];
  
  scheduledStartTime: ISODate;
  scheduledEndTime?: ISODate;
  
  baseRate?: number;
  estimatedDuration?: number;
  
  notes?: string;
  customerNotes?: string;
}

export interface TripFilters {
  status?: TripStatus | '';
  type?: TripType | '';
  vehicleId?: UUID;
  driverId?: UUID;
  startDate?: ISODate;
  endDate?: ISODate;
  search?: string;
}

// API Response types
export interface ApiResponseTripList {
  success: boolean;
  message?: string | null;
  data: Trip[];
}

export interface ApiResponseTrip {
  success: boolean;
  message?: string | null;
  data: Trip | null;
}

export interface ApiResponseVoid {
  success: boolean;
  message?: string | null;
}

// Trip statistics
export interface TripStatistics {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  inProgressTrips: number;
  totalDistance: number;
  totalRevenue: number;
  averageTripDuration: number;
  averageTripDistance: number;
}
