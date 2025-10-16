import { gql } from 'apollo-angular';

// Fragment for Trip fields
export const TRIP_FRAGMENT = gql`
  fragment TripFragment on Trip {
    id
    type
    status
    customerName
    customerPhone
    customerEmail
    pickupLocation {
      id
      name
      address
      latitude
      longitude
      notes
    }
    dropoffLocation {
      id
      name
      address
      latitude
      longitude
      notes
    }
    scheduledStart
    scheduledEnd
    actualStart
    actualEnd
    estimatedDuration
    vehicleId
    driverId
    distance
    duration
    basePrice
    pricePerKm
    totalPrice
    notes
    internalNotes
    customerNotes
    createdAt
    updatedAt
    createdBy
  }
`;

// Query to get all trips with filtering
export const GET_TRIPS = gql`
  query GetAllTrips {
    getAllTrips {
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
  }
`;

// Query to get a single trip by ID
export const GET_TRIP = gql`
  query GetTripById($id: UUID!) {
    getTripById(id: $id) {
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
  }
`;

// Mutation to create a new trip
export const CREATE_TRIP = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
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
    }
  }
`;

// Mutation to update an existing trip
export const UPDATE_TRIP = gql`
  ${TRIP_FRAGMENT}
  mutation UpdateTrip($id: ID!, $input: UpdateTripInput!) {
    updateTrip(id: $id, input: $input) {
      ...TripFragment
    }
  }
`;

// Mutation to delete a trip
export const DELETE_TRIP = gql`
  mutation DeleteTrip($id: ID!) {
    deleteTrip(id: $id) {
      success
      message
    }
  }
`;

// Mutation to update trip status
export const UPDATE_TRIP_STATUS = gql`
  mutation UpdateTripStatus($id: ID!, $status: TripStatus!) {
    updateTripStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// Query to get vehicles for dropdown
export const GET_VEHICLES_FOR_TRIP = gql`
  query GetVehiclesForTrip($filters: VehicleFiltersInput) {
    vehicles(filters: $filters) {
      vehicles {
        id
        make
        model
        licensePlate
        status
        year
        color
      }
    }
  }
`;

// Query to get drivers for dropdown
export const GET_DRIVERS_FOR_TRIP = gql`
  query GetDriversForTrip($search: String) {
    drivers(search: $search) {
      drivers {
        id
        firstName
        lastName
        email
        phone
        licenseNumber
        status
      }
    }
  }
`;

// Query to get locations for autocomplete
export const GET_LOCATIONS = gql`
  query GetLocations($search: String, $limit: Int = 10) {
    locations(search: $search, limit: $limit) {
      id
      name
      address
      latitude
      longitude
    }
  }
`;

// Subscription for real-time trip updates
export const TRIP_UPDATED = gql`
  subscription TripUpdated($id: ID!) {
    tripUpdated(id: $id) {
      id
      status
      actualStart
      actualEnd
      updatedAt
    }
  }
`;
