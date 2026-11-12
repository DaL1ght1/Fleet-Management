import { FuelType, VehicleStatus } from '../../core/graphql/generated';

export const VEHICLE_STATUSES: readonly VehicleStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
export const FUEL_TYPES: readonly FuelType[] = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
