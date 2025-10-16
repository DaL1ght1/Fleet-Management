export type UUID = string;
export type ISODate = string;
export type Long = number;

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export interface Vehicle {
  id: string;
  color: string;
  fuelType: FuelType;
  gpsEnabled: boolean;
  lastMaintenanceDate: ISODate;
  licensePlate: string;
  maintenanceIntervalDays: number;
  make: string;
  mileage: Long;
  model: string;
  nextMaintenanceDate: ISODate;
  rentalPricePerDay: number;
  seatingCapacity: number;
  status: Status;
  vin: string;
  year: number;
}

export interface VehicleInput {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: Status;
  vin: string;
  color: string;
  mileage: Long;
  fuelType: FuelType;
  seatingCapacity: number;
  rentalPricePerDay: Long;
  gpsEnabled: boolean;
  lastMaintenanceDate: ISODate;
  maintenanceIntervalDays: number;
}

export interface ApiResponseVehicleList {
  success: boolean;
  message?: string | null;
  data: Vehicle[];
}

export interface ApiResponseVehicle {
  success: boolean;
  message?: string | null;
  data: Vehicle | null;
}

export interface ApiResponseLong {
  success: boolean;
  message?: string | null;
  data: Long | null;
}

export interface ApiResponseVoid {
  success: boolean;
  message?: string | null;
}
