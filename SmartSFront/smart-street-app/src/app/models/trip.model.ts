export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TripType {
  PASSENGER = 'PASSENGER',
  CARGO = 'CARGO',
  EMERGENCY = 'EMERGENCY',
  RENTAL = 'RENTAL',
  MAINTENANCE = 'MAINTENANCE',
  RELOCATION = 'RELOCATION'
}

export interface Location {
  id?: string;
  name?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface Trip {
  id?: string;
  type: TripType;
  status: TripStatus;
  
  // Customer Information
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Location & Route
  pickupLocation?: Location;
  dropoffLocation?: Location;
  
  // Scheduling
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  estimatedDuration?: number; // in minutes
  
  // Vehicle & Driver
  vehicleId?: string;
  driverId?: string;
  
  // Trip Data
  distance?: number; // in kilometers
  duration?: number; // in minutes
  
  // Pricing
  basePrice?: number;
  pricePerKm?: number;
  totalPrice?: number;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  customerNotes?: string;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface TripFilters {
  status?: TripStatus[];
  type?: TripType[];
  vehicleId?: string;
  driverId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface TripListResponse {
  trips: Trip[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LocationInput {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

export interface CreateTripInput {
  vehicleId: string | null;
  driverId: string | null;
  type: TripType | null;
  status: TripStatus | null;
  startLocation: LocationInput;
  endLocation: LocationInput;
  waypoints: LocationInput[];
  startTime: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  endTime: string | null;
  distance: number | null;
  duration: number | null;
  estimatedDuration: number | null;
  baseRate: number | null;
  totalCost: number | null;
  fuelCost: number | null;
  additionalFees: number | null;
  notes: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  id: string;
}

// Vehicle and Driver interfaces for dropdowns
export interface VehicleOption {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  status: string;
}

export interface DriverOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
}
