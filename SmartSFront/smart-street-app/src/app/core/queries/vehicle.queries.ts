import { gql } from 'apollo-angular';

/** Fragment to keep Vehicle field selections consistent across operations */
export const VEHICLE_FIELDS = gql`
  fragment VehicleFields on Vehicle {
    id
    color
    fuelType
    gpsEnabled
    lastMaintenanceDate
    licensePlate
    maintenanceIntervalDays
    make
    mileage
    model
    nextMaintenanceDate
    rentalPricePerDay
    seatingCapacity
    status
    vin
    year
  }
`;

/** ======================= QUERIES ======================= */

export const GET_ALL_VEHICLES = gql`
  query GetAllVehicle {
    getAllVehicle {
      data {
        id
        color
        fuelType
        gpsEnabled
        lastMaintenanceDate
        licensePlate
        maintenanceIntervalDays
        make
        mileage
        model
        nextMaintenanceDate
        rentalPricePerDay
        seatingCapacity
        status
        vin
        year
      }
      message
      success
    }
  }
`;

export const GET_VEHICLE_BY_ID = gql`
  query GetVehicleById($id: UUID!) {
    getVehicleById(id: $id) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

export const GET_VEHICLE_BY_LICENSE_PLATE = gql`
  query GetVehicleByLicensePlate($licensePlate: String!) {
    getVehicleByLicensePlate(licensePlate: $licensePlate) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

export const GET_VEHICLE_BY_VIN = gql`
  query GetVehicleByVin($vin: String!) {
    getVehicleByVin(vin: $vin) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

export const GET_VEHICLES_BY_MAKE_AND_MODEL = gql`
  query GetVehicleByMakeAndModel($make: String!, $model: String!) {
    getVehicleByMakeAndModel(make: $make, model: $model) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

/** ======================= MUTATIONS ======================= */

export const REGISTER_VEHICLE = gql`
  mutation RegisterVehicle($vehicle: VehicleInput!) {
    registerVehicle(vehicle: $vehicle) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($id: UUID!, $vehicle: VehicleInput!) {
    updateVehicle(id: $id, vehicle: $vehicle) {
      success
      message
      data {
        ...VehicleFields
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

export const UPDATE_VEHICLE_STATUS = gql`
  mutation UpdateVehicleStatus($id: UUID!, $status: Status!) {
    updateVehicleStatus(id: $id, status: $status) {
      success
      message
    }
  }
`;

export const CHANGE_VEHICLE_MILEAGE = gql`
  mutation ChangeVehicleMileage($id: UUID!, $mileage: Long!) {
    changeVehicleMileage(id: $id, mileage: $mileage) {
      success
      message
      data
    }
  }
`;

export const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: UUID!) {
    deleteVehicle(id: $id) {
      success
      message
    }
  }
`;
