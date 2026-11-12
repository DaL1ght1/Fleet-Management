import { TripStatus, TripType } from '../../core/graphql/generated';

export const TRIP_STATUSES: readonly TripStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
export const TRIP_TYPES: readonly TripType[] = ['RENTAL', 'MAINTENANCE', 'RELOCATION', 'EMERGENCY'];
