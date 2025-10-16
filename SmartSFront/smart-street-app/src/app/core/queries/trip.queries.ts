import { gql } from 'apollo-angular';

/** Fragment to keep Trip field selections consistent across operations */
export const TRIP_FIELDS = gql`
  fragment TripFields on Trip {
    id
    vehicleId
    driverId
    type
    status
    startLocation {
      latitude
      longitude
      address
      city
      state
      zipCode
    }
    endLocation {
      latitude
      longitude
      address
      city
      state
      zipCode
    }
    waypoints {
      latitude
      longitude
      address
      city
      state
      zipCode
    }
    startTime
    endTime
    scheduledStartTime
    scheduledEndTime
    distance
    duration
    estimatedDuration
    baseRate
    totalCost
    fuelCost
    additionalFees
    notes
    customerNotes
    internalNotes
    createdAt
    updatedAt
    vehicle {
      id
      make
      model
      year
      licensePlate
      color
    }
    driver {
      id
      firstName
      lastName
      email
      phone
      licenseNumber
    }
  }
`;

/** ======================= QUERIES ======================= */

export const GET_ALL_TRIPS = gql`
  query GetAllTrips {
    getAllTrips {
      ...TripFields
    }
  }
  ${TRIP_FIELDS}
`;

export const GET_TRIP_BY_ID = gql`
  query GetTripById($id: UUID!) {
    getTripById(id: $id) {
      ...TripFields
    }
  }
  ${TRIP_FIELDS}
`;

export const GET_TRIPS_BY_VEHICLE = gql`
  query GetTripsByVehicle($vehicleId: UUID!, $limit: Int, $offset: Int) {
    getTripsByVehicle(vehicleId: $vehicleId, limit: $limit, offset: $offset) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const GET_TRIPS_BY_DRIVER = gql`
  query GetTripsByDriver($driverId: UUID!, $limit: Int, $offset: Int) {
    getTripsByDriver(driverId: $driverId, limit: $limit, offset: $offset) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const GET_TRIPS_BY_STATUS = gql`
  query GetTripsByStatus($status: TripStatus!, $limit: Int, $offset: Int) {
    getTripsByStatus(status: $status, limit: $limit, offset: $offset) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const GET_TRIP_STATISTICS = gql`
  query GetTripStatistics($startDate: ISODate, $endDate: ISODate) {
    getTripStatistics(startDate: $startDate, endDate: $endDate) {
      success
      message
      data {
        totalTrips
        completedTrips
        cancelledTrips
        inProgressTrips
        totalDistance
        totalRevenue
        averageTripDuration
        averageTripDistance
      }
    }
  }
`;

/** ======================= MUTATIONS ======================= */

export const CREATE_TRIP = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
      ...TripFields
    }
  }
  ${TRIP_FIELDS}
`;

export const UPDATE_TRIP = gql`
  mutation UpdateTrip($input: UpdateTripInput!) {
    updateTrip(input: $input) {
      ...TripFields
    }
  }
  ${TRIP_FIELDS}
`;

export const UPDATE_TRIP_STATUS = gql`
  mutation UpdateTripStatus($id: UUID!, $status: TripStatus!) {
    updateTripStatus(id: $id, status: $status) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const START_TRIP = gql`
  mutation StartTrip($id: UUID!, $actualStartLocation: LocationInput) {
    startTrip(id: $id, actualStartLocation: $actualStartLocation) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const END_TRIP = gql`
  mutation EndTrip($id: UUID!, $actualEndLocation: LocationInput, $actualDistance: Float, $actualDuration: Int) {
    endTrip(id: $id, actualEndLocation: $actualEndLocation, actualDistance: $actualDistance, actualDuration: $actualDuration) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const CANCEL_TRIP = gql`
  mutation CancelTrip($id: UUID!, $reason: String) {
    cancelTrip(id: $id, reason: $reason) {
      success
      message
      data {
        ...TripFields
      }
    }
  }
  ${TRIP_FIELDS}
`;

export const DELETE_TRIP = gql`
  mutation DeleteTrip($id: UUID!) {
    deleteTrip(id: $id)
  }
`;
