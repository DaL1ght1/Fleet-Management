import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: number; output: number; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  Long: { input: number; output: number; }
  UUID: { input: string; output: string; }
  join__FieldSet: { input: string; output: string; }
  link__Import: { input: string; output: string; }
};

export type AlertSeverity =
  | 'CRITICAL'
  | 'INFO'
  | 'WARNING';

export type AlertType =
  | 'SPEED_LIMIT_EXCEEDED'
  | 'VEHICLE_ENTERED'
  | 'VEHICLE_EXITED';

export type BillingStatistics = {
  __typename?: 'BillingStatistics';
  collectedThisMonth: Scalars['BigDecimal']['output'];
  drafts: Scalars['Int']['output'];
  outstanding: Scalars['BigDecimal']['output'];
  overdue: Scalars['BigDecimal']['output'];
  overdueCount: Scalars['Int']['output'];
};

export type CompleteTripInput = {
  additionalFees?: InputMaybe<Scalars['BigDecimal']['input']>;
  distanceKm: Scalars['BigDecimal']['input'];
  fuelCost?: InputMaybe<Scalars['BigDecimal']['input']>;
};

export type CompleteWorkOrderInput = {
  laborCost?: InputMaybe<Scalars['BigDecimal']['input']>;
  odometerKm?: InputMaybe<Scalars['Long']['input']>;
  partsCost?: InputMaybe<Scalars['BigDecimal']['input']>;
  resolutionNotes?: InputMaybe<Scalars['String']['input']>;
};

export type Customer = {
  __typename?: 'Customer';
  accountId: Maybe<Scalars['UUID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CustomerInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerPage = {
  __typename?: 'CustomerPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Customer>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DeviceRegistration = {
  __typename?: 'DeviceRegistration';
  apiKey: Scalars['String']['output'];
  device: TelemetryDevice;
};

export type Driver = {
  __typename?: 'Driver';
  accountId: Maybe<Scalars['UUID']['output']>;
  available: Scalars['Boolean']['output'];
  completedTrips: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentTripId: Maybe<Scalars['UUID']['output']>;
  dateOfBirth: Maybe<Scalars['Date']['output']>;
  email: Scalars['String']['output'];
  emergencyContact: Maybe<EmergencyContact>;
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  hireDate: Scalars['Date']['output'];
  id: Scalars['UUID']['output'];
  lastName: Scalars['String']['output'];
  licenseExpired: Scalars['Boolean']['output'];
  licenseExpiryDate: Scalars['Date']['output'];
  licenseNumber: Scalars['String']['output'];
  monthlySalary: Maybe<Scalars['BigDecimal']['output']>;
  nextPayday: Maybe<Scalars['Date']['output']>;
  phoneNumber: Scalars['String']['output'];
  rating: Maybe<Scalars['Float']['output']>;
  ratingCount: Scalars['Int']['output'];
  status: DriverStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type DriverFilter = {
  available?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DriverStatus>;
};

export type DriverPage = {
  __typename?: 'DriverPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Driver>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type DriverStatistics = {
  __typename?: 'DriverStatistics';
  active: Scalars['Int']['output'];
  available: Scalars['Int']['output'];
  inactive: Scalars['Int']['output'];
  licensesExpiringSoon: Scalars['Int']['output'];
  onLeave: Scalars['Int']['output'];
  onTrip: Scalars['Int']['output'];
  suspended: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type DriverStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ON_LEAVE'
  | 'SUSPENDED';

export type EmergencyContact = {
  __typename?: 'EmergencyContact';
  name: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
};

export type EmergencyContactInput = {
  name: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['BigDecimal']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  driver: Maybe<Driver>;
  dueDate: Scalars['Date']['output'];
  id: Scalars['UUID']['output'];
  kind: ExpenseKind;
  overdue: Scalars['Boolean']['output'];
  paidOn: Maybe<Scalars['Date']['output']>;
  paymentMethod: Maybe<PaymentMethod>;
  status: ExpenseStatus;
  vehicle: Maybe<Vehicle>;
  workOrderId: Maybe<Scalars['UUID']['output']>;
};

export type ExpenseFilter = {
  kind?: InputMaybe<ExpenseKind>;
  status?: InputMaybe<ExpenseStatus>;
};

export type ExpenseKind =
  | 'MAINTENANCE'
  | 'SALARY';

export type ExpensePage = {
  __typename?: 'ExpensePage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Expense>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ExpenseStatistics = {
  __typename?: 'ExpenseStatistics';
  maintenanceTotal: Scalars['BigDecimal']['output'];
  maintenanceUnpaid: Scalars['BigDecimal']['output'];
  paidThisMonth: Scalars['BigDecimal']['output'];
  salariesTotal: Scalars['BigDecimal']['output'];
  salariesUnpaid: Scalars['BigDecimal']['output'];
  unpaidCount: Scalars['Int']['output'];
  unpaidTotal: Scalars['BigDecimal']['output'];
};

export type ExpenseStatus =
  | 'PAID'
  | 'UNPAID';

export type FleetStatistics = {
  __typename?: 'FleetStatistics';
  active: Scalars['Int']['output'];
  inMaintenance: Scalars['Int']['output'];
  inUse: Scalars['Int']['output'];
  inactive: Scalars['Int']['output'];
  maintenanceDue: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type FuelType =
  | 'DIESEL'
  | 'ELECTRIC'
  | 'GASOLINE'
  | 'HYBRID';

export type GeoPoint = {
  __typename?: 'GeoPoint';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type GeoPointInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type Geofence = {
  __typename?: 'Geofence';
  active: Scalars['Boolean']['output'];
  center: Maybe<GeoPoint>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  kind: GeofenceKind;
  name: Scalars['String']['output'];
  polygon: Maybe<Array<GeoPoint>>;
  radiusMeters: Maybe<Scalars['Float']['output']>;
  speedLimitKph: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  vehiclesInside: Scalars['Int']['output'];
};

export type GeofenceAlert = {
  __typename?: 'GeofenceAlert';
  acknowledged: Scalars['Boolean']['output'];
  acknowledgedAt: Maybe<Scalars['DateTime']['output']>;
  geofence: Maybe<Geofence>;
  geofenceId: Scalars['UUID']['output'];
  geofenceName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  occurredAt: Scalars['DateTime']['output'];
  severity: AlertSeverity;
  speedKph: Scalars['Float']['output'];
  speedLimitKph: Maybe<Scalars['Float']['output']>;
  type: AlertType;
  vehicle: Vehicle;
};

export type GeofenceAlertFilter = {
  acknowledged?: InputMaybe<Scalars['Boolean']['input']>;
  geofenceId?: InputMaybe<Scalars['UUID']['input']>;
  severity?: InputMaybe<AlertSeverity>;
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
};

export type GeofenceAlertPage = {
  __typename?: 'GeofenceAlertPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<GeofenceAlert>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type GeofenceInput = {
  center?: InputMaybe<GeoPointInput>;
  kind: GeofenceKind;
  name: Scalars['String']['input'];
  polygon?: InputMaybe<Array<GeoPointInput>>;
  radiusMeters?: InputMaybe<Scalars['Float']['input']>;
  speedLimitKph?: InputMaybe<Scalars['Float']['input']>;
};

export type GeofenceKind =
  | 'DEPOT'
  | 'RESTRICTED'
  | 'SERVICE_AREA';

export type Invoice = {
  __typename?: 'Invoice';
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer: Maybe<Customer>;
  dueDate: Maybe<Scalars['Date']['output']>;
  id: Scalars['UUID']['output'];
  issuedOn: Maybe<Scalars['Date']['output']>;
  lines: Array<InvoiceLine>;
  number: Scalars['String']['output'];
  overdue: Scalars['Boolean']['output'];
  paidOn: Maybe<Scalars['Date']['output']>;
  paymentMethod: Maybe<PaymentMethod>;
  status: InvoiceStatus;
  subtotal: Scalars['BigDecimal']['output'];
  taxAmount: Scalars['BigDecimal']['output'];
  taxRate: Scalars['BigDecimal']['output'];
  total: Scalars['BigDecimal']['output'];
  trip: Trip;
  vehicle: Vehicle;
  voidReason: Maybe<Scalars['String']['output']>;
};

export type InvoiceFilter = {
  customerId?: InputMaybe<Scalars['UUID']['input']>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<InvoiceStatus>;
};

export type InvoiceLine = {
  __typename?: 'InvoiceLine';
  amount: Scalars['BigDecimal']['output'];
  description: Scalars['String']['output'];
};

export type InvoicePage = {
  __typename?: 'InvoicePage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Invoice>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PAID'
  | 'VOID';

export type Location = {
  __typename?: 'Location';
  address: Scalars['String']['output'];
  city: Maybe<Scalars['String']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  state: Maybe<Scalars['String']['output']>;
  zipCode: Maybe<Scalars['String']['output']>;
};

export type LocationInput = {
  address: Scalars['String']['input'];
  city?: InputMaybe<Scalars['String']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type MaintenanceStatistics = {
  __typename?: 'MaintenanceStatistics';
  completedThisMonth: Scalars['Int']['output'];
  costThisMonth: Scalars['BigDecimal']['output'];
  inProgress: Scalars['Int']['output'];
  overdue: Scalars['Int']['output'];
  scheduled: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acknowledgeAllGeofenceAlerts: Scalars['Int']['output'];
  acknowledgeGeofenceAlert: GeofenceAlert;
  cancelTrip: Trip;
  cancelWorkOrder: WorkOrder;
  changeDriverStatus: Driver;
  changeVehicleStatus: Vehicle;
  completeMaintenance: Vehicle;
  completeTrip: Trip;
  completeWorkOrder: WorkOrder;
  createGeofence: Geofence;
  deleteCustomer: Scalars['Boolean']['output'];
  deleteDriver: Scalars['Boolean']['output'];
  deleteGeofence: Scalars['Boolean']['output'];
  deleteTrip: Scalars['Boolean']['output'];
  deleteVehicle: Scalars['Boolean']['output'];
  issueInvoice: Invoice;
  markAllNotificationsRead: Scalars['Int']['output'];
  markInvoicePaid: Invoice;
  markNotificationRead: Notification;
  payExpense: Expense;
  rateDriver: Driver;
  recordOdometerReading: Vehicle;
  registerCustomer: Customer;
  registerDriver: Driver;
  registerTelemetryDevice: DeviceRegistration;
  registerVehicle: Vehicle;
  requestTrip: Trip;
  revokeTelemetryDevice: TelemetryDevice;
  scheduleTrip: Trip;
  scheduleWorkOrder: WorkOrder;
  setGeofenceActive: Geofence;
  startTrip: Trip;
  startWorkOrder: WorkOrder;
  updateCustomer: Customer;
  updateDriver: Driver;
  updateGeofence: Geofence;
  updateTripPlan: Trip;
  updateVehicle: Vehicle;
  updateWorkOrder: WorkOrder;
  voidInvoice: Invoice;
};


export type MutationAcknowledgeGeofenceAlertArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationCancelTripArgs = {
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelWorkOrderArgs = {
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationChangeDriverStatusArgs = {
  id: Scalars['UUID']['input'];
  status: DriverStatus;
};


export type MutationChangeVehicleStatusArgs = {
  id: Scalars['UUID']['input'];
  status: VehicleStatus;
};


export type MutationCompleteMaintenanceArgs = {
  date: InputMaybe<Scalars['Date']['input']>;
  id: Scalars['UUID']['input'];
};


export type MutationCompleteTripArgs = {
  id: Scalars['UUID']['input'];
  input: CompleteTripInput;
};


export type MutationCompleteWorkOrderArgs = {
  id: Scalars['UUID']['input'];
  input: CompleteWorkOrderInput;
};


export type MutationCreateGeofenceArgs = {
  input: GeofenceInput;
};


export type MutationDeleteCustomerArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteDriverArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteGeofenceArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteTripArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeleteVehicleArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationIssueInvoiceArgs = {
  id: Scalars['UUID']['input'];
  paymentTermDays?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationMarkInvoicePaidArgs = {
  id: Scalars['UUID']['input'];
  method: PaymentMethod;
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationPayExpenseArgs = {
  id: Scalars['UUID']['input'];
  method: PaymentMethod;
};


export type MutationRateDriverArgs = {
  id: Scalars['UUID']['input'];
  rating: Scalars['Int']['input'];
};


export type MutationRecordOdometerReadingArgs = {
  id: Scalars['UUID']['input'];
  mileage: Scalars['Long']['input'];
};


export type MutationRegisterCustomerArgs = {
  input: CustomerInput;
};


export type MutationRegisterDriverArgs = {
  input: RegisterDriverInput;
};


export type MutationRegisterTelemetryDeviceArgs = {
  label: Scalars['String']['input'];
  vehicleId: Scalars['UUID']['input'];
};


export type MutationRegisterVehicleArgs = {
  input: RegisterVehicleInput;
};


export type MutationRequestTripArgs = {
  input: TripRequestInput;
};


export type MutationRevokeTelemetryDeviceArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationScheduleTripArgs = {
  input: ScheduleTripInput;
};


export type MutationScheduleWorkOrderArgs = {
  input: WorkOrderInput;
};


export type MutationSetGeofenceActiveArgs = {
  active: Scalars['Boolean']['input'];
  id: Scalars['UUID']['input'];
};


export type MutationStartTripArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationStartWorkOrderArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationUpdateCustomerArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateCustomerInput;
};


export type MutationUpdateDriverArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateDriverInput;
};


export type MutationUpdateGeofenceArgs = {
  id: Scalars['UUID']['input'];
  input: GeofenceInput;
};


export type MutationUpdateTripPlanArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateTripPlanInput;
};


export type MutationUpdateVehicleArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateVehicleInput;
};


export type MutationUpdateWorkOrderArgs = {
  id: Scalars['UUID']['input'];
  input: UpdateWorkOrderInput;
};


export type MutationVoidInvoiceArgs = {
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  kind: NotificationKind;
  link: Maybe<Scalars['String']['output']>;
  params: Array<NotificationParam>;
  read: Scalars['Boolean']['output'];
  severity: NotificationSeverity;
};

export type NotificationKind =
  | 'GEOFENCE_ENTERED'
  | 'GEOFENCE_EXITED'
  | 'INVOICE_ISSUED'
  | 'INVOICE_OVERDUE'
  | 'INVOICE_PAID'
  | 'LICENSE_EXPIRING'
  | 'MAINTENANCE_COMPLETED'
  | 'MAINTENANCE_OVERDUE'
  | 'MAINTENANCE_SCHEDULED'
  | 'MAINTENANCE_STARTED'
  | 'SPEED_LIMIT_EXCEEDED'
  | 'TRIP_ASSIGNED'
  | 'TRIP_CANCELLED'
  | 'TRIP_COMPLETED'
  | 'TRIP_RESCHEDULED'
  | 'TRIP_STARTED';

export type NotificationPage = {
  __typename?: 'NotificationPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Notification>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type NotificationParam = {
  __typename?: 'NotificationParam';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type NotificationSeverity =
  | 'CRITICAL'
  | 'INFO'
  | 'WARNING';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'CASH';

export type Query = {
  __typename?: 'Query';
  billingStatistics: BillingStatistics;
  customer: Maybe<Customer>;
  customers: CustomerPage;
  driver: Maybe<Driver>;
  driverStatistics: DriverStatistics;
  drivers: DriverPage;
  expenseStatistics: ExpenseStatistics;
  expenses: ExpensePage;
  fleetStatistics: FleetStatistics;
  geofence: Maybe<Geofence>;
  geofenceAlerts: GeofenceAlertPage;
  geofences: Array<Geofence>;
  invoice: Maybe<Invoice>;
  invoices: InvoicePage;
  maintenanceStatistics: MaintenanceStatistics;
  myDriverProfile: Maybe<Driver>;
  myInvoices: InvoicePage;
  myNotifications: NotificationPage;
  myTrips: TripPage;
  trip: Maybe<Trip>;
  tripQuote: TripQuote;
  tripStatistics: TripStatistics;
  trips: TripPage;
  unacknowledgedAlertCount: Scalars['Int']['output'];
  unreadNotificationCount: Scalars['Int']['output'];
  upcomingSalaries: Array<UpcomingSalary>;
  vehicle: Maybe<Vehicle>;
  vehicleByLicensePlate: Maybe<Vehicle>;
  vehicleByVin: Maybe<Vehicle>;
  vehiclePositions: Array<VehiclePosition>;
  vehicles: VehiclePage;
  workOrder: Maybe<WorkOrder>;
  workOrders: WorkOrderPage;
};


export type QueryCustomerArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryCustomersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDriverArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryDriversArgs = {
  filter: InputMaybe<DriverFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryExpensesArgs = {
  filter: InputMaybe<ExpenseFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGeofenceArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryGeofenceAlertsArgs = {
  filter: InputMaybe<GeofenceAlertFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInvoiceArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryInvoicesArgs = {
  filter: InputMaybe<InvoiceFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyInvoicesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyNotificationsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyTripsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTripArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryTripQuoteArgs = {
  input: TripRequestInput;
};


export type QueryTripsArgs = {
  filter: InputMaybe<TripFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUpcomingSalariesArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryVehicleArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryVehicleByLicensePlateArgs = {
  licensePlate: Scalars['String']['input'];
};


export type QueryVehicleByVinArgs = {
  vin: Scalars['String']['input'];
};


export type QueryVehiclesArgs = {
  filter: InputMaybe<VehicleFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkOrderArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryWorkOrdersArgs = {
  filter: InputMaybe<WorkOrderFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

export type RegisterDriverInput = {
  accountId?: InputMaybe<Scalars['UUID']['input']>;
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  email: Scalars['String']['input'];
  emergencyContact?: InputMaybe<EmergencyContactInput>;
  firstName: Scalars['String']['input'];
  hireDate?: InputMaybe<Scalars['Date']['input']>;
  lastName: Scalars['String']['input'];
  licenseExpiryDate: Scalars['Date']['input'];
  licenseNumber: Scalars['String']['input'];
  monthlySalary?: InputMaybe<Scalars['BigDecimal']['input']>;
  phoneNumber: Scalars['String']['input'];
};

export type RegisterVehicleInput = {
  color: Scalars['String']['input'];
  dailyRate: Scalars['BigDecimal']['input'];
  fuelType: FuelType;
  gpsEnabled: Scalars['Boolean']['input'];
  lastMaintenanceDate: Scalars['Date']['input'];
  licensePlate: Scalars['String']['input'];
  maintenanceIntervalDays: Scalars['Int']['input'];
  make: Scalars['String']['input'];
  mileage: Scalars['Long']['input'];
  model: Scalars['String']['input'];
  seatingCapacity: Scalars['Int']['input'];
  vin: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type ScheduleTripInput = {
  costs?: InputMaybe<TripCostsInput>;
  customerId?: InputMaybe<Scalars['UUID']['input']>;
  customerNotes?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['UUID']['input']>;
  endLocation: LocationInput;
  estimatedDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  scheduledEnd: Scalars['DateTime']['input'];
  scheduledStart: Scalars['DateTime']['input'];
  startLocation: LocationInput;
  type: TripType;
  vehicleId: Scalars['UUID']['input'];
  waypoints?: InputMaybe<Array<LocationInput>>;
};

export type TelemetryDevice = {
  __typename?: 'TelemetryDevice';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  label: Scalars['String']['output'];
  lastSeenAt: Maybe<Scalars['DateTime']['output']>;
  revoked: Scalars['Boolean']['output'];
};

export type TrackPoint = {
  __typename?: 'TrackPoint';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  recordedAt: Scalars['DateTime']['output'];
  speedKph: Scalars['Float']['output'];
};

export type Trip = {
  __typename?: 'Trip';
  actualDurationMinutes: Maybe<Scalars['Int']['output']>;
  cancellationReason: Maybe<Scalars['String']['output']>;
  completedAt: Maybe<Scalars['DateTime']['output']>;
  costs: TripCosts;
  createdAt: Scalars['DateTime']['output'];
  customer: Maybe<Customer>;
  customerNotes: Maybe<Scalars['String']['output']>;
  distanceKm: Maybe<Scalars['BigDecimal']['output']>;
  driver: Maybe<Driver>;
  endLocation: Location;
  estimatedDurationMinutes: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  internalNotes: Maybe<Scalars['String']['output']>;
  invoice: Maybe<Invoice>;
  notes: Maybe<Scalars['String']['output']>;
  scheduledEnd: Scalars['DateTime']['output'];
  scheduledStart: Scalars['DateTime']['output'];
  startLocation: Location;
  startedAt: Maybe<Scalars['DateTime']['output']>;
  status: TripStatus;
  type: TripType;
  updatedAt: Scalars['DateTime']['output'];
  vehicle: Vehicle;
  waypoints: Array<Location>;
};

export type TripCosts = {
  __typename?: 'TripCosts';
  additionalFees: Maybe<Scalars['BigDecimal']['output']>;
  baseRate: Maybe<Scalars['BigDecimal']['output']>;
  fuelCost: Maybe<Scalars['BigDecimal']['output']>;
  totalCost: Maybe<Scalars['BigDecimal']['output']>;
};

export type TripCostsInput = {
  additionalFees?: InputMaybe<Scalars['BigDecimal']['input']>;
  baseRate?: InputMaybe<Scalars['BigDecimal']['input']>;
  fuelCost?: InputMaybe<Scalars['BigDecimal']['input']>;
};

export type TripFilter = {
  customerId?: InputMaybe<Scalars['UUID']['input']>;
  driverId?: InputMaybe<Scalars['UUID']['input']>;
  scheduledFrom?: InputMaybe<Scalars['DateTime']['input']>;
  scheduledTo?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<TripStatus>;
  type?: InputMaybe<TripType>;
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
};

export type TripPage = {
  __typename?: 'TripPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Trip>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type TripQuote = {
  __typename?: 'TripQuote';
  arriveAt: Scalars['DateTime']['output'];
  departAt: Scalars['DateTime']['output'];
  distanceKm: Scalars['BigDecimal']['output'];
  durationMinutes: Scalars['Int']['output'];
  price: Scalars['BigDecimal']['output'];
  vehicleAvailable: Scalars['Boolean']['output'];
};

export type TripRequestInput = {
  customerId?: InputMaybe<Scalars['UUID']['input']>;
  departAt?: InputMaybe<Scalars['DateTime']['input']>;
  driverId?: InputMaybe<Scalars['UUID']['input']>;
  from: LocationInput;
  notes?: InputMaybe<Scalars['String']['input']>;
  routeDistanceKm?: InputMaybe<Scalars['BigDecimal']['input']>;
  routeDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  to: LocationInput;
  type?: InputMaybe<TripType>;
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
};

export type TripStatistics = {
  __typename?: 'TripStatistics';
  cancelled: Scalars['Int']['output'];
  completed: Scalars['Int']['output'];
  inProgress: Scalars['Int']['output'];
  scheduled: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalDistanceKm: Scalars['BigDecimal']['output'];
  totalRevenue: Scalars['BigDecimal']['output'];
};

export type TripStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'SCHEDULED';

export type TripType =
  | 'EMERGENCY'
  | 'MAINTENANCE'
  | 'RELOCATION'
  | 'RENTAL';

export type UpcomingSalary = {
  __typename?: 'UpcomingSalary';
  amount: Scalars['BigDecimal']['output'];
  driver: Driver;
  driverName: Maybe<Scalars['String']['output']>;
  payday: Scalars['Date']['output'];
};

export type UpdateCustomerInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDriverInput = {
  accountId?: InputMaybe<Scalars['UUID']['input']>;
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<EmergencyContactInput>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  hireDate?: InputMaybe<Scalars['Date']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  licenseExpiryDate?: InputMaybe<Scalars['Date']['input']>;
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
  monthlySalary?: InputMaybe<Scalars['BigDecimal']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTripPlanInput = {
  costs?: InputMaybe<TripCostsInput>;
  customerId?: InputMaybe<Scalars['UUID']['input']>;
  customerNotes?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['UUID']['input']>;
  endLocation?: InputMaybe<LocationInput>;
  estimatedDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  scheduledEnd?: InputMaybe<Scalars['DateTime']['input']>;
  scheduledStart?: InputMaybe<Scalars['DateTime']['input']>;
  startLocation?: InputMaybe<LocationInput>;
  type?: InputMaybe<TripType>;
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
  waypoints?: InputMaybe<Array<LocationInput>>;
};

export type UpdateVehicleInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  dailyRate?: InputMaybe<Scalars['BigDecimal']['input']>;
  fuelType?: InputMaybe<FuelType>;
  gpsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  licensePlate?: InputMaybe<Scalars['String']['input']>;
  maintenanceIntervalDays?: InputMaybe<Scalars['Int']['input']>;
  make?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  seatingCapacity?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWorkOrderInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  kind?: InputMaybe<WorkOrderKind>;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledFor?: InputMaybe<Scalars['Date']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  vendor?: InputMaybe<Scalars['String']['input']>;
};

export type Vehicle = {
  __typename?: 'Vehicle';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentGeofences: Array<Geofence>;
  currentTripId: Maybe<Scalars['UUID']['output']>;
  dailyRate: Scalars['BigDecimal']['output'];
  fuelType: FuelType;
  gpsEnabled: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  inUse: Scalars['Boolean']['output'];
  lastMaintenanceDate: Scalars['Date']['output'];
  lastPosition: Maybe<VehiclePosition>;
  licensePlate: Scalars['String']['output'];
  maintenanceDue: Scalars['Boolean']['output'];
  maintenanceIntervalDays: Scalars['Int']['output'];
  make: Scalars['String']['output'];
  mileage: Scalars['Long']['output'];
  model: Scalars['String']['output'];
  nextMaintenanceDate: Scalars['Date']['output'];
  seatingCapacity: Scalars['Int']['output'];
  status: VehicleStatus;
  telemetryDevices: Array<TelemetryDevice>;
  track: Array<TrackPoint>;
  updatedAt: Scalars['DateTime']['output'];
  vin: Scalars['String']['output'];
  workOrders: Array<WorkOrder>;
  year: Scalars['Int']['output'];
};


export type VehicleTrackArgs = {
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};

export type VehicleFilter = {
  fuelType?: InputMaybe<FuelType>;
  maintenanceDue?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<VehicleStatus>;
};

export type VehiclePage = {
  __typename?: 'VehiclePage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Vehicle>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type VehiclePosition = {
  __typename?: 'VehiclePosition';
  fuelLevelPercent: Maybe<Scalars['Float']['output']>;
  headingDegrees: Maybe<Scalars['Float']['output']>;
  ignitionOn: Maybe<Scalars['Boolean']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  moving: Scalars['Boolean']['output'];
  odometerKm: Maybe<Scalars['Float']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  speedKph: Scalars['Float']['output'];
  stale: Scalars['Boolean']['output'];
  vehicle: Vehicle;
};

export type VehicleStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'MAINTENANCE';

export type WorkOrder = {
  __typename?: 'WorkOrder';
  autoGenerated: Scalars['Boolean']['output'];
  cancellationReason: Maybe<Scalars['String']['output']>;
  completedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  kind: WorkOrderKind;
  laborCost: Maybe<Scalars['BigDecimal']['output']>;
  odometerKm: Maybe<Scalars['Long']['output']>;
  overdue: Scalars['Boolean']['output'];
  partsCost: Maybe<Scalars['BigDecimal']['output']>;
  priority: WorkOrderPriority;
  resolutionNotes: Maybe<Scalars['String']['output']>;
  scheduledFor: Scalars['Date']['output'];
  startedAt: Maybe<Scalars['DateTime']['output']>;
  status: WorkOrderStatus;
  title: Scalars['String']['output'];
  totalCost: Scalars['BigDecimal']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vehicle: Vehicle;
  vendor: Maybe<Scalars['String']['output']>;
};

export type WorkOrderFilter = {
  kind?: InputMaybe<WorkOrderKind>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<WorkOrderStatus>;
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
};

export type WorkOrderInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  kind: WorkOrderKind;
  priority: WorkOrderPriority;
  scheduledFor: Scalars['Date']['input'];
  title: Scalars['String']['input'];
  vehicleId: Scalars['UUID']['input'];
  vendor?: InputMaybe<Scalars['String']['input']>;
};

export type WorkOrderKind =
  | 'INSPECTION'
  | 'PREVENTIVE'
  | 'REPAIR';

export type WorkOrderPage = {
  __typename?: 'WorkOrderPage';
  hasNext: Scalars['Boolean']['output'];
  items: Array<WorkOrder>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type WorkOrderPriority =
  | 'CRITICAL'
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type WorkOrderStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'SCHEDULED';

export type Join__Graph =
  | 'BILLING'
  | 'GEOFENCE'
  | 'MAINTENANCE'
  | 'NOTIFICATIONS'
  | 'TELEMETRY'
  | 'TRIPS'
  | 'USERS'
  | 'VEHICLES';

export type Link__Purpose =
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  | 'EXECUTION'
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  | 'SECURITY';

export type InvoiceSummaryFragment = { __typename?: 'Invoice', id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string };

export type InvoiceDocumentFragment = { __typename?: 'Invoice', subtotal: number, taxRate: number, taxAmount: number, paymentMethod: PaymentMethod | null, voidReason: string | null, id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string, lines: Array<{ __typename?: 'InvoiceLine', description: string, amount: number }>, trip: { __typename?: 'Trip', id: string, type: TripType, scheduledStart: string, completedAt: string | null, distanceKm: number | null, startLocation: { __typename?: 'Location', address: string, city: string | null }, endLocation: { __typename?: 'Location', address: string, city: string | null } }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } };

export type InvoicesQueryVariables = Exact<{
  filter: InputMaybe<InvoiceFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type InvoicesQuery = { __typename?: 'Query', invoices: { __typename?: 'InvoicePage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Invoice', id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string, customer: { __typename?: 'Customer', id: string, fullName: string, email: string } | null, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string } }> } };

export type InvoiceQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type InvoiceQuery = { __typename?: 'Query', invoice: { __typename?: 'Invoice', subtotal: number, taxRate: number, taxAmount: number, paymentMethod: PaymentMethod | null, voidReason: string | null, id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string, customer: { __typename?: 'Customer', id: string, fullName: string, email: string, phoneNumber: string | null } | null, lines: Array<{ __typename?: 'InvoiceLine', description: string, amount: number }>, trip: { __typename?: 'Trip', id: string, type: TripType, scheduledStart: string, completedAt: string | null, distanceKm: number | null, startLocation: { __typename?: 'Location', address: string, city: string | null }, endLocation: { __typename?: 'Location', address: string, city: string | null } }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } | null };

export type BillingStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type BillingStatisticsQuery = { __typename?: 'Query', billingStatistics: { __typename?: 'BillingStatistics', drafts: number, outstanding: number, overdue: number, overdueCount: number, collectedThisMonth: number } };

export type IssueInvoiceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  paymentTermDays: InputMaybe<Scalars['Int']['input']>;
}>;


export type IssueInvoiceMutation = { __typename?: 'Mutation', issueInvoice: { __typename?: 'Invoice', id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string } };

export type MarkInvoicePaidMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  method: PaymentMethod;
}>;


export type MarkInvoicePaidMutation = { __typename?: 'Mutation', markInvoicePaid: { __typename?: 'Invoice', paymentMethod: PaymentMethod | null, id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string } };

export type VoidInvoiceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
}>;


export type VoidInvoiceMutation = { __typename?: 'Mutation', voidInvoice: { __typename?: 'Invoice', voidReason: string | null, id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string } };

export type ExpenseFieldsFragment = { __typename?: 'Expense', id: string, kind: ExpenseKind, status: ExpenseStatus, description: string | null, amount: number, dueDate: string, overdue: boolean, paidOn: string | null, paymentMethod: PaymentMethod | null, workOrderId: string | null, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string } | null, driver: { __typename?: 'Driver', id: string, fullName: string } | null };

export type ExpensesQueryVariables = Exact<{
  filter: InputMaybe<ExpenseFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type ExpensesQuery = { __typename?: 'Query', expenses: { __typename?: 'ExpensePage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Expense', id: string, kind: ExpenseKind, status: ExpenseStatus, description: string | null, amount: number, dueDate: string, overdue: boolean, paidOn: string | null, paymentMethod: PaymentMethod | null, workOrderId: string | null, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string } | null, driver: { __typename?: 'Driver', id: string, fullName: string } | null }> } };

export type OutcomeQueryVariables = Exact<{ [key: string]: never; }>;


export type OutcomeQuery = { __typename?: 'Query', expenseStatistics: { __typename?: 'ExpenseStatistics', maintenanceTotal: number, maintenanceUnpaid: number, salariesTotal: number, salariesUnpaid: number, unpaidTotal: number, unpaidCount: number, paidThisMonth: number }, upcomingSalaries: Array<{ __typename?: 'UpcomingSalary', driverName: string | null, payday: string, amount: number, driver: { __typename?: 'Driver', id: string, fullName: string } }>, billingStatistics: { __typename?: 'BillingStatistics', collectedThisMonth: number } };

export type PayExpenseMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  method: PaymentMethod;
}>;


export type PayExpenseMutation = { __typename?: 'Mutation', payExpense: { __typename?: 'Expense', id: string, kind: ExpenseKind, status: ExpenseStatus, description: string | null, amount: number, dueDate: string, overdue: boolean, paidOn: string | null, paymentMethod: PaymentMethod | null, workOrderId: string | null, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string } | null, driver: { __typename?: 'Driver', id: string, fullName: string } | null } };

export type CustomerDetailsFragment = { __typename?: 'Customer', id: string, firstName: string, lastName: string, fullName: string, email: string, phoneNumber: string | null, createdAt: string, updatedAt: string };

export type CustomersQueryVariables = Exact<{
  search: InputMaybe<Scalars['String']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type CustomersQuery = { __typename?: 'Query', customers: { __typename?: 'CustomerPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Customer', id: string, firstName: string, lastName: string, fullName: string, email: string, phoneNumber: string | null, createdAt: string, updatedAt: string }> } };

export type CustomerQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type CustomerQuery = { __typename?: 'Query', customer: { __typename?: 'Customer', id: string, firstName: string, lastName: string, fullName: string, email: string, phoneNumber: string | null, createdAt: string, updatedAt: string } | null };

export type RegisterCustomerMutationVariables = Exact<{
  input: CustomerInput;
}>;


export type RegisterCustomerMutation = { __typename?: 'Mutation', registerCustomer: { __typename?: 'Customer', id: string, firstName: string, lastName: string, fullName: string, email: string, phoneNumber: string | null, createdAt: string, updatedAt: string } };

export type UpdateCustomerMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdateCustomerInput;
}>;


export type UpdateCustomerMutation = { __typename?: 'Mutation', updateCustomer: { __typename?: 'Customer', id: string, firstName: string, lastName: string, fullName: string, email: string, phoneNumber: string | null, createdAt: string, updatedAt: string } };

export type DeleteCustomerMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteCustomerMutation = { __typename?: 'Mutation', deleteCustomer: boolean };

export type DriverSummaryFragment = { __typename?: 'Driver', id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number };

export type DriverDetailsFragment = { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null };

export type DriversQueryVariables = Exact<{
  filter: InputMaybe<DriverFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type DriversQuery = { __typename?: 'Query', drivers: { __typename?: 'DriverPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Driver', id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number }> } };

export type DriverQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DriverQuery = { __typename?: 'Query', driver: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } | null };

export type MyDriverProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MyDriverProfileQuery = { __typename?: 'Query', myDriverProfile: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } | null };

export type DriverStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type DriverStatisticsQuery = { __typename?: 'Query', driverStatistics: { __typename?: 'DriverStatistics', total: number, active: number, inactive: number, suspended: number, onLeave: number, available: number, onTrip: number, licensesExpiringSoon: number } };

export type RegisterDriverMutationVariables = Exact<{
  input: RegisterDriverInput;
}>;


export type RegisterDriverMutation = { __typename?: 'Mutation', registerDriver: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } };

export type UpdateDriverMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdateDriverInput;
}>;


export type UpdateDriverMutation = { __typename?: 'Mutation', updateDriver: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } };

export type ChangeDriverStatusMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  status: DriverStatus;
}>;


export type ChangeDriverStatusMutation = { __typename?: 'Mutation', changeDriverStatus: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } };

export type RateDriverMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  rating: Scalars['Int']['input'];
}>;


export type RateDriverMutation = { __typename?: 'Mutation', rateDriver: { __typename?: 'Driver', accountId: string | null, firstName: string, lastName: string, dateOfBirth: string | null, hireDate: string, monthlySalary: number | null, nextPayday: string | null, currentTripId: string | null, ratingCount: number, createdAt: string, updatedAt: string, id: string, fullName: string, email: string, phoneNumber: string, licenseNumber: string, licenseExpiryDate: string, licenseExpired: boolean, status: DriverStatus, available: boolean, rating: number | null, completedTrips: number, emergencyContact: { __typename?: 'EmergencyContact', name: string, phoneNumber: string } | null } };

export type DeleteDriverMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteDriverMutation = { __typename?: 'Mutation', deleteDriver: boolean };

export type PositionFieldsFragment = { __typename?: 'VehiclePosition', latitude: number, longitude: number, speedKph: number, headingDegrees: number | null, fuelLevelPercent: number | null, odometerKm: number | null, ignitionOn: boolean | null, recordedAt: string, moving: boolean, stale: boolean };

export type FleetPositionsQueryVariables = Exact<{ [key: string]: never; }>;


export type FleetPositionsQuery = { __typename?: 'Query', vehiclePositions: Array<{ __typename?: 'VehiclePosition', latitude: number, longitude: number, speedKph: number, headingDegrees: number | null, fuelLevelPercent: number | null, odometerKm: number | null, ignitionOn: boolean | null, recordedAt: string, moving: boolean, stale: boolean, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string, status: VehicleStatus } }> };

export type VehicleTelemetryQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
}>;


export type VehicleTelemetryQuery = { __typename?: 'Query', vehicle: { __typename?: 'Vehicle', id: string, lastPosition: { __typename?: 'VehiclePosition', latitude: number, longitude: number, speedKph: number, headingDegrees: number | null, fuelLevelPercent: number | null, odometerKm: number | null, ignitionOn: boolean | null, recordedAt: string, moving: boolean, stale: boolean } | null, track: Array<{ __typename?: 'TrackPoint', latitude: number, longitude: number, speedKph: number, recordedAt: string }> } | null };

export type VehicleDevicesQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type VehicleDevicesQuery = { __typename?: 'Query', vehicle: { __typename?: 'Vehicle', id: string, telemetryDevices: Array<{ __typename?: 'TelemetryDevice', id: string, label: string, createdAt: string, lastSeenAt: string | null, revoked: boolean }> } | null };

export type RegisterTelemetryDeviceMutationVariables = Exact<{
  vehicleId: Scalars['UUID']['input'];
  label: Scalars['String']['input'];
}>;


export type RegisterTelemetryDeviceMutation = { __typename?: 'Mutation', registerTelemetryDevice: { __typename?: 'DeviceRegistration', apiKey: string, device: { __typename?: 'TelemetryDevice', id: string } } };

export type RevokeTelemetryDeviceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type RevokeTelemetryDeviceMutation = { __typename?: 'Mutation', revokeTelemetryDevice: { __typename?: 'TelemetryDevice', id: string, revoked: boolean } };

export type GeofenceFieldsFragment = { __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null };

export type GeofencesQueryVariables = Exact<{ [key: string]: never; }>;


export type GeofencesQuery = { __typename?: 'Query', geofences: Array<{ __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null }> };

export type GeofenceQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type GeofenceQuery = { __typename?: 'Query', geofence: { __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null } | null };

export type GeofenceAlertsQueryVariables = Exact<{
  filter: InputMaybe<GeofenceAlertFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type GeofenceAlertsQuery = { __typename?: 'Query', geofenceAlerts: { __typename?: 'GeofenceAlertPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'GeofenceAlert', id: string, type: AlertType, severity: AlertSeverity, geofenceId: string, geofenceName: string, speedKph: number, speedLimitKph: number | null, occurredAt: string, acknowledged: boolean, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string } }> } };

export type UnacknowledgedAlertCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnacknowledgedAlertCountQuery = { __typename?: 'Query', unacknowledgedAlertCount: number };

export type CreateGeofenceMutationVariables = Exact<{
  input: GeofenceInput;
}>;


export type CreateGeofenceMutation = { __typename?: 'Mutation', createGeofence: { __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null } };

export type UpdateGeofenceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: GeofenceInput;
}>;


export type UpdateGeofenceMutation = { __typename?: 'Mutation', updateGeofence: { __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null } };

export type SetGeofenceActiveMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  active: Scalars['Boolean']['input'];
}>;


export type SetGeofenceActiveMutation = { __typename?: 'Mutation', setGeofenceActive: { __typename?: 'Geofence', id: string, name: string, kind: GeofenceKind, active: boolean, radiusMeters: number | null, speedLimitKph: number | null, vehiclesInside: number, updatedAt: string, polygon: Array<{ __typename?: 'GeoPoint', latitude: number, longitude: number }> | null, center: { __typename?: 'GeoPoint', latitude: number, longitude: number } | null } };

export type DeleteGeofenceMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteGeofenceMutation = { __typename?: 'Mutation', deleteGeofence: boolean };

export type AcknowledgeGeofenceAlertMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type AcknowledgeGeofenceAlertMutation = { __typename?: 'Mutation', acknowledgeGeofenceAlert: { __typename?: 'GeofenceAlert', id: string, acknowledged: boolean } };

export type AcknowledgeAllGeofenceAlertsMutationVariables = Exact<{ [key: string]: never; }>;


export type AcknowledgeAllGeofenceAlertsMutation = { __typename?: 'Mutation', acknowledgeAllGeofenceAlerts: number };

export type WorkOrderSummaryFragment = { __typename?: 'WorkOrder', id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } };

export type WorkOrderDetailsFragment = { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } };

export type WorkOrdersQueryVariables = Exact<{
  filter: InputMaybe<WorkOrderFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type WorkOrdersQuery = { __typename?: 'Query', workOrders: { __typename?: 'WorkOrderPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'WorkOrder', id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } }> } };

export type WorkOrderQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type WorkOrderQuery = { __typename?: 'Query', workOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } | null };

export type MaintenanceStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type MaintenanceStatisticsQuery = { __typename?: 'Query', maintenanceStatistics: { __typename?: 'MaintenanceStatistics', scheduled: number, inProgress: number, overdue: number, completedThisMonth: number, costThisMonth: number } };

export type VehicleWorkOrdersQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type VehicleWorkOrdersQuery = { __typename?: 'Query', vehicle: { __typename?: 'Vehicle', id: string, workOrders: Array<{ __typename?: 'WorkOrder', id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } }> } | null };

export type ScheduleWorkOrderMutationVariables = Exact<{
  input: WorkOrderInput;
}>;


export type ScheduleWorkOrderMutation = { __typename?: 'Mutation', scheduleWorkOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } };

export type UpdateWorkOrderMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdateWorkOrderInput;
}>;


export type UpdateWorkOrderMutation = { __typename?: 'Mutation', updateWorkOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } };

export type StartWorkOrderMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type StartWorkOrderMutation = { __typename?: 'Mutation', startWorkOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } };

export type CompleteWorkOrderMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: CompleteWorkOrderInput;
}>;


export type CompleteWorkOrderMutation = { __typename?: 'Mutation', completeWorkOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } };

export type CancelWorkOrderMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
}>;


export type CancelWorkOrderMutation = { __typename?: 'Mutation', cancelWorkOrder: { __typename?: 'WorkOrder', description: string | null, startedAt: string | null, completedAt: string | null, odometerKm: number | null, partsCost: number | null, laborCost: number | null, resolutionNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, kind: WorkOrderKind, priority: WorkOrderPriority, status: WorkOrderStatus, title: string, vendor: string | null, scheduledFor: string, overdue: boolean, autoGenerated: boolean, totalCost: number, vehicle: { __typename?: 'Vehicle', id: string, mileage: number, status: VehicleStatus, licensePlate: string, make: string, model: string } } };

export type MaintenanceVehicleOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MaintenanceVehicleOptionsQuery = { __typename?: 'Query', vehicles: { __typename?: 'VehiclePage', items: Array<{ __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string, status: VehicleStatus }> } };

export type MyTripsQueryVariables = Exact<{
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyTripsQuery = { __typename?: 'Query', myTrips: { __typename?: 'TripPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Trip', distanceKm: number | null, startedAt: string | null, completedAt: string | null, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string }, driver: { __typename?: 'Driver', id: string, fullName: string } | null, costs: { __typename?: 'TripCosts', totalCost: number | null } }> } };

export type MyInvoicesQueryVariables = Exact<{
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyInvoicesQuery = { __typename?: 'Query', myInvoices: { __typename?: 'InvoicePage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Invoice', subtotal: number, taxRate: number, taxAmount: number, paymentMethod: PaymentMethod | null, voidReason: string | null, id: string, number: string, status: InvoiceStatus, total: number, currency: string, issuedOn: string | null, dueDate: string | null, paidOn: string | null, overdue: boolean, createdAt: string, lines: Array<{ __typename?: 'InvoiceLine', description: string, amount: number }>, trip: { __typename?: 'Trip', id: string, type: TripType, scheduledStart: string, completedAt: string | null, distanceKm: number | null, startLocation: { __typename?: 'Location', address: string, city: string | null }, endLocation: { __typename?: 'Location', address: string, city: string | null } }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } }> } };

export type NotificationFieldsFragment = { __typename?: 'Notification', id: string, kind: NotificationKind, severity: NotificationSeverity, link: string | null, read: boolean, createdAt: string, params: Array<{ __typename?: 'NotificationParam', key: string, value: string }> };

export type MyNotificationsQueryVariables = Exact<{
  unreadOnly: InputMaybe<Scalars['Boolean']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyNotificationsQuery = { __typename?: 'Query', myNotifications: { __typename?: 'NotificationPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Notification', id: string, kind: NotificationKind, severity: NotificationSeverity, link: string | null, read: boolean, createdAt: string, params: Array<{ __typename?: 'NotificationParam', key: string, value: string }> }> } };

export type UnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationCountQuery = { __typename?: 'Query', unreadNotificationCount: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: string, read: boolean } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: number };

export type LocationFieldsFragment = { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null };

export type TripSummaryFragment = { __typename?: 'Trip', id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string }, driver: { __typename?: 'Driver', id: string, fullName: string } | null, costs: { __typename?: 'TripCosts', totalCost: number | null } };

export type TripDetailsFragment = { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } };

export type TripsQueryVariables = Exact<{
  filter: InputMaybe<TripFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type TripsQuery = { __typename?: 'Query', trips: { __typename?: 'TripPage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Trip', id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string }, driver: { __typename?: 'Driver', id: string, fullName: string } | null, costs: { __typename?: 'TripCosts', totalCost: number | null } }> } };

export type TripQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type TripQuery = { __typename?: 'Query', trip: { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } | null };

export type TripStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type TripStatisticsQuery = { __typename?: 'Query', tripStatistics: { __typename?: 'TripStatistics', total: number, scheduled: number, inProgress: number, completed: number, cancelled: number, totalDistanceKm: number, totalRevenue: number } };

export type TripResourceOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type TripResourceOptionsQuery = { __typename?: 'Query', vehicles: { __typename?: 'VehiclePage', items: Array<{ __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string, inUse: boolean }> }, drivers: { __typename?: 'DriverPage', items: Array<{ __typename?: 'Driver', id: string, fullName: string, available: boolean }> } };

export type UpdateTripPlanMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdateTripPlanInput;
}>;


export type UpdateTripPlanMutation = { __typename?: 'Mutation', updateTripPlan: { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } };

export type StartTripMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type StartTripMutation = { __typename?: 'Mutation', startTrip: { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } };

export type CompleteTripMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: CompleteTripInput;
}>;


export type CompleteTripMutation = { __typename?: 'Mutation', completeTrip: { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } };

export type CancelTripMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  reason: Scalars['String']['input'];
}>;


export type CancelTripMutation = { __typename?: 'Mutation', cancelTrip: { __typename?: 'Trip', startedAt: string | null, completedAt: string | null, estimatedDurationMinutes: number | null, actualDurationMinutes: number | null, distanceKm: number | null, notes: string | null, customerNotes: string | null, internalNotes: string | null, cancellationReason: string | null, createdAt: string, updatedAt: string, id: string, type: TripType, status: TripStatus, scheduledStart: string, scheduledEnd: string, waypoints: Array<{ __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }>, costs: { __typename?: 'TripCosts', baseRate: number | null, fuelCost: number | null, additionalFees: number | null, totalCost: number | null }, driver: { __typename?: 'Driver', id: string, fullName: string, phoneNumber: string } | null, startLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, endLocation: { __typename?: 'Location', latitude: number, longitude: number, address: string, city: string | null, state: string | null, zipCode: string | null }, vehicle: { __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string } } };

export type DeleteTripMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteTripMutation = { __typename?: 'Mutation', deleteTrip: boolean };

export type TripQuoteQueryVariables = Exact<{
  input: TripRequestInput;
}>;


export type TripQuoteQuery = { __typename?: 'Query', tripQuote: { __typename?: 'TripQuote', distanceKm: number, durationMinutes: number, departAt: string, arriveAt: string, price: number, vehicleAvailable: boolean } };

export type RequestTripMutationVariables = Exact<{
  input: TripRequestInput;
}>;


export type RequestTripMutation = { __typename?: 'Mutation', requestTrip: { __typename?: 'Trip', id: string } };

export type BookingOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type BookingOptionsQuery = { __typename?: 'Query', vehicles: { __typename?: 'VehiclePage', items: Array<{ __typename?: 'Vehicle', id: string, licensePlate: string, make: string, model: string }> }, drivers: { __typename?: 'DriverPage', items: Array<{ __typename?: 'Driver', id: string, fullName: string }> }, customers: { __typename?: 'CustomerPage', items: Array<{ __typename?: 'Customer', id: string, fullName: string, email: string }> } };

export type VehicleSummaryFragment = { __typename?: 'Vehicle', id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean };

export type VehicleDetailsFragment = { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean };

export type VehiclesQueryVariables = Exact<{
  filter: InputMaybe<VehicleFilter>;
  page: InputMaybe<Scalars['Int']['input']>;
  size: InputMaybe<Scalars['Int']['input']>;
}>;


export type VehiclesQuery = { __typename?: 'Query', vehicles: { __typename?: 'VehiclePage', totalCount: number, page: number, size: number, hasNext: boolean, items: Array<{ __typename?: 'Vehicle', id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean }> } };

export type VehicleQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type VehicleQuery = { __typename?: 'Query', vehicle: { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean } | null };

export type FleetStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type FleetStatisticsQuery = { __typename?: 'Query', fleetStatistics: { __typename?: 'FleetStatistics', total: number, active: number, inactive: number, inMaintenance: number, inUse: number, maintenanceDue: number } };

export type RegisterVehicleMutationVariables = Exact<{
  input: RegisterVehicleInput;
}>;


export type RegisterVehicleMutation = { __typename?: 'Mutation', registerVehicle: { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean } };

export type UpdateVehicleMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  input: UpdateVehicleInput;
}>;


export type UpdateVehicleMutation = { __typename?: 'Mutation', updateVehicle: { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean } };

export type ChangeVehicleStatusMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  status: VehicleStatus;
}>;


export type ChangeVehicleStatusMutation = { __typename?: 'Mutation', changeVehicleStatus: { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean } };

export type RecordOdometerReadingMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  mileage: Scalars['Long']['input'];
}>;


export type RecordOdometerReadingMutation = { __typename?: 'Mutation', recordOdometerReading: { __typename?: 'Vehicle', vin: string, color: string, seatingCapacity: number, gpsEnabled: boolean, lastMaintenanceDate: string, maintenanceIntervalDays: number, currentTripId: string | null, createdAt: string, updatedAt: string, id: string, make: string, model: string, year: number, licensePlate: string, status: VehicleStatus, fuelType: FuelType, mileage: number, dailyRate: number, nextMaintenanceDate: string, maintenanceDue: boolean, inUse: boolean } };

export type DeleteVehicleMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteVehicleMutation = { __typename?: 'Mutation', deleteVehicle: boolean };

export const InvoiceSummaryFragmentDoc = gql`
    fragment InvoiceSummary on Invoice {
  id
  number
  status
  total
  currency
  issuedOn
  dueDate
  paidOn
  overdue
  createdAt
}
    `;
export const InvoiceDocumentFragmentDoc = gql`
    fragment InvoiceDocument on Invoice {
  ...InvoiceSummary
  lines {
    description
    amount
  }
  subtotal
  taxRate
  taxAmount
  paymentMethod
  voidReason
  trip {
    id
    type
    scheduledStart
    completedAt
    distanceKm
    startLocation {
      address
      city
    }
    endLocation {
      address
      city
    }
  }
  vehicle {
    id
    licensePlate
    make
    model
  }
}
    ${InvoiceSummaryFragmentDoc}`;
export const ExpenseFieldsFragmentDoc = gql`
    fragment ExpenseFields on Expense {
  id
  kind
  status
  description
  amount
  dueDate
  overdue
  paidOn
  paymentMethod
  workOrderId
  vehicle {
    id
    licensePlate
  }
  driver {
    id
    fullName
  }
}
    `;
export const CustomerDetailsFragmentDoc = gql`
    fragment CustomerDetails on Customer {
  id
  firstName
  lastName
  fullName
  email
  phoneNumber
  createdAt
  updatedAt
}
    `;
export const DriverSummaryFragmentDoc = gql`
    fragment DriverSummary on Driver {
  id
  fullName
  email
  phoneNumber
  licenseNumber
  licenseExpiryDate
  licenseExpired
  status
  available
  rating
  completedTrips
}
    `;
export const DriverDetailsFragmentDoc = gql`
    fragment DriverDetails on Driver {
  ...DriverSummary
  accountId
  firstName
  lastName
  dateOfBirth
  hireDate
  monthlySalary
  nextPayday
  emergencyContact {
    name
    phoneNumber
  }
  currentTripId
  ratingCount
  createdAt
  updatedAt
}
    ${DriverSummaryFragmentDoc}`;
export const PositionFieldsFragmentDoc = gql`
    fragment PositionFields on VehiclePosition {
  latitude
  longitude
  speedKph
  headingDegrees
  fuelLevelPercent
  odometerKm
  ignitionOn
  recordedAt
  moving
  stale
}
    `;
export const GeofenceFieldsFragmentDoc = gql`
    fragment GeofenceFields on Geofence {
  id
  name
  kind
  active
  polygon {
    latitude
    longitude
  }
  center {
    latitude
    longitude
  }
  radiusMeters
  speedLimitKph
  vehiclesInside
  updatedAt
}
    `;
export const WorkOrderSummaryFragmentDoc = gql`
    fragment WorkOrderSummary on WorkOrder {
  id
  kind
  priority
  status
  title
  vendor
  scheduledFor
  overdue
  autoGenerated
  totalCost
  vehicle {
    id
    licensePlate
    make
    model
  }
}
    `;
export const WorkOrderDetailsFragmentDoc = gql`
    fragment WorkOrderDetails on WorkOrder {
  ...WorkOrderSummary
  description
  startedAt
  completedAt
  odometerKm
  partsCost
  laborCost
  resolutionNotes
  cancellationReason
  createdAt
  updatedAt
  vehicle {
    id
    mileage
    status
  }
}
    ${WorkOrderSummaryFragmentDoc}`;
export const NotificationFieldsFragmentDoc = gql`
    fragment NotificationFields on Notification {
  id
  kind
  severity
  params {
    key
    value
  }
  link
  read
  createdAt
}
    `;
export const LocationFieldsFragmentDoc = gql`
    fragment LocationFields on Location {
  latitude
  longitude
  address
  city
  state
  zipCode
}
    `;
export const TripSummaryFragmentDoc = gql`
    fragment TripSummary on Trip {
  id
  type
  status
  scheduledStart
  scheduledEnd
  startLocation {
    ...LocationFields
  }
  endLocation {
    ...LocationFields
  }
  vehicle {
    id
    licensePlate
    make
    model
  }
  driver {
    id
    fullName
  }
  costs {
    totalCost
  }
}
    ${LocationFieldsFragmentDoc}`;
export const TripDetailsFragmentDoc = gql`
    fragment TripDetails on Trip {
  ...TripSummary
  waypoints {
    ...LocationFields
  }
  startedAt
  completedAt
  estimatedDurationMinutes
  actualDurationMinutes
  distanceKm
  costs {
    baseRate
    fuelCost
    additionalFees
    totalCost
  }
  driver {
    id
    fullName
    phoneNumber
  }
  notes
  customerNotes
  internalNotes
  cancellationReason
  createdAt
  updatedAt
}
    ${TripSummaryFragmentDoc}
${LocationFieldsFragmentDoc}`;
export const VehicleSummaryFragmentDoc = gql`
    fragment VehicleSummary on Vehicle {
  id
  make
  model
  year
  licensePlate
  status
  fuelType
  mileage
  dailyRate
  nextMaintenanceDate
  maintenanceDue
  inUse
}
    `;
export const VehicleDetailsFragmentDoc = gql`
    fragment VehicleDetails on Vehicle {
  ...VehicleSummary
  vin
  color
  seatingCapacity
  gpsEnabled
  lastMaintenanceDate
  maintenanceIntervalDays
  currentTripId
  createdAt
  updatedAt
}
    ${VehicleSummaryFragmentDoc}`;
export const InvoicesDocument = gql`
    query Invoices($filter: InvoiceFilter, $page: Int, $size: Int) {
  invoices(filter: $filter, page: $page, size: $size) {
    items {
      ...InvoiceSummary
      customer {
        id
        fullName
        email
      }
      vehicle {
        id
        licensePlate
      }
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${InvoiceSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class InvoicesGQL extends Apollo.Query<InvoicesQuery, InvoicesQueryVariables> {
    override document = InvoicesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const InvoiceDocument = gql`
    query Invoice($id: UUID!) {
  invoice(id: $id) {
    ...InvoiceDocument
    customer {
      id
      fullName
      email
      phoneNumber
    }
  }
}
    ${InvoiceDocumentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class InvoiceGQL extends Apollo.Query<InvoiceQuery, InvoiceQueryVariables> {
    override document = InvoiceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BillingStatisticsDocument = gql`
    query BillingStatistics {
  billingStatistics {
    drafts
    outstanding
    overdue
    overdueCount
    collectedThisMonth
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class BillingStatisticsGQL extends Apollo.Query<BillingStatisticsQuery, BillingStatisticsQueryVariables> {
    override document = BillingStatisticsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const IssueInvoiceDocument = gql`
    mutation IssueInvoice($id: UUID!, $paymentTermDays: Int) {
  issueInvoice(id: $id, paymentTermDays: $paymentTermDays) {
    ...InvoiceSummary
  }
}
    ${InvoiceSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class IssueInvoiceGQL extends Apollo.Mutation<IssueInvoiceMutation, IssueInvoiceMutationVariables> {
    override document = IssueInvoiceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MarkInvoicePaidDocument = gql`
    mutation MarkInvoicePaid($id: UUID!, $method: PaymentMethod!) {
  markInvoicePaid(id: $id, method: $method) {
    ...InvoiceSummary
    paymentMethod
  }
}
    ${InvoiceSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class MarkInvoicePaidGQL extends Apollo.Mutation<MarkInvoicePaidMutation, MarkInvoicePaidMutationVariables> {
    override document = MarkInvoicePaidDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VoidInvoiceDocument = gql`
    mutation VoidInvoice($id: UUID!, $reason: String!) {
  voidInvoice(id: $id, reason: $reason) {
    ...InvoiceSummary
    voidReason
  }
}
    ${InvoiceSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class VoidInvoiceGQL extends Apollo.Mutation<VoidInvoiceMutation, VoidInvoiceMutationVariables> {
    override document = VoidInvoiceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ExpensesDocument = gql`
    query Expenses($filter: ExpenseFilter, $page: Int, $size: Int) {
  expenses(filter: $filter, page: $page, size: $size) {
    items {
      ...ExpenseFields
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${ExpenseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ExpensesGQL extends Apollo.Query<ExpensesQuery, ExpensesQueryVariables> {
    override document = ExpensesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const OutcomeDocument = gql`
    query Outcome {
  expenseStatistics {
    maintenanceTotal
    maintenanceUnpaid
    salariesTotal
    salariesUnpaid
    unpaidTotal
    unpaidCount
    paidThisMonth
  }
  upcomingSalaries(days: 30) {
    driver {
      id
      fullName
    }
    driverName
    payday
    amount
  }
  billingStatistics {
    collectedThisMonth
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class OutcomeGQL extends Apollo.Query<OutcomeQuery, OutcomeQueryVariables> {
    override document = OutcomeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const PayExpenseDocument = gql`
    mutation PayExpense($id: UUID!, $method: PaymentMethod!) {
  payExpense(id: $id, method: $method) {
    ...ExpenseFields
  }
}
    ${ExpenseFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class PayExpenseGQL extends Apollo.Mutation<PayExpenseMutation, PayExpenseMutationVariables> {
    override document = PayExpenseDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CustomersDocument = gql`
    query Customers($search: String, $page: Int, $size: Int) {
  customers(search: $search, page: $page, size: $size) {
    items {
      ...CustomerDetails
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${CustomerDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CustomersGQL extends Apollo.Query<CustomersQuery, CustomersQueryVariables> {
    override document = CustomersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CustomerDocument = gql`
    query Customer($id: UUID!) {
  customer(id: $id) {
    ...CustomerDetails
  }
}
    ${CustomerDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CustomerGQL extends Apollo.Query<CustomerQuery, CustomerQueryVariables> {
    override document = CustomerDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RegisterCustomerDocument = gql`
    mutation RegisterCustomer($input: CustomerInput!) {
  registerCustomer(input: $input) {
    ...CustomerDetails
  }
}
    ${CustomerDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class RegisterCustomerGQL extends Apollo.Mutation<RegisterCustomerMutation, RegisterCustomerMutationVariables> {
    override document = RegisterCustomerDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateCustomerDocument = gql`
    mutation UpdateCustomer($id: UUID!, $input: UpdateCustomerInput!) {
  updateCustomer(id: $id, input: $input) {
    ...CustomerDetails
  }
}
    ${CustomerDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateCustomerGQL extends Apollo.Mutation<UpdateCustomerMutation, UpdateCustomerMutationVariables> {
    override document = UpdateCustomerDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteCustomerDocument = gql`
    mutation DeleteCustomer($id: UUID!) {
  deleteCustomer(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteCustomerGQL extends Apollo.Mutation<DeleteCustomerMutation, DeleteCustomerMutationVariables> {
    override document = DeleteCustomerDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DriversDocument = gql`
    query Drivers($filter: DriverFilter, $page: Int, $size: Int) {
  drivers(filter: $filter, page: $page, size: $size) {
    items {
      ...DriverSummary
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${DriverSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class DriversGQL extends Apollo.Query<DriversQuery, DriversQueryVariables> {
    override document = DriversDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DriverDocument = gql`
    query Driver($id: UUID!) {
  driver(id: $id) {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class DriverGQL extends Apollo.Query<DriverQuery, DriverQueryVariables> {
    override document = DriverDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MyDriverProfileDocument = gql`
    query MyDriverProfile {
  myDriverProfile {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class MyDriverProfileGQL extends Apollo.Query<MyDriverProfileQuery, MyDriverProfileQueryVariables> {
    override document = MyDriverProfileDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DriverStatisticsDocument = gql`
    query DriverStatistics {
  driverStatistics {
    total
    active
    inactive
    suspended
    onLeave
    available
    onTrip
    licensesExpiringSoon
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DriverStatisticsGQL extends Apollo.Query<DriverStatisticsQuery, DriverStatisticsQueryVariables> {
    override document = DriverStatisticsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RegisterDriverDocument = gql`
    mutation RegisterDriver($input: RegisterDriverInput!) {
  registerDriver(input: $input) {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class RegisterDriverGQL extends Apollo.Mutation<RegisterDriverMutation, RegisterDriverMutationVariables> {
    override document = RegisterDriverDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateDriverDocument = gql`
    mutation UpdateDriver($id: UUID!, $input: UpdateDriverInput!) {
  updateDriver(id: $id, input: $input) {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateDriverGQL extends Apollo.Mutation<UpdateDriverMutation, UpdateDriverMutationVariables> {
    override document = UpdateDriverDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ChangeDriverStatusDocument = gql`
    mutation ChangeDriverStatus($id: UUID!, $status: DriverStatus!) {
  changeDriverStatus(id: $id, status: $status) {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ChangeDriverStatusGQL extends Apollo.Mutation<ChangeDriverStatusMutation, ChangeDriverStatusMutationVariables> {
    override document = ChangeDriverStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RateDriverDocument = gql`
    mutation RateDriver($id: UUID!, $rating: Int!) {
  rateDriver(id: $id, rating: $rating) {
    ...DriverDetails
  }
}
    ${DriverDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class RateDriverGQL extends Apollo.Mutation<RateDriverMutation, RateDriverMutationVariables> {
    override document = RateDriverDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteDriverDocument = gql`
    mutation DeleteDriver($id: UUID!) {
  deleteDriver(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteDriverGQL extends Apollo.Mutation<DeleteDriverMutation, DeleteDriverMutationVariables> {
    override document = DeleteDriverDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const FleetPositionsDocument = gql`
    query FleetPositions {
  vehiclePositions {
    ...PositionFields
    vehicle {
      id
      licensePlate
      make
      model
      status
    }
  }
}
    ${PositionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class FleetPositionsGQL extends Apollo.Query<FleetPositionsQuery, FleetPositionsQueryVariables> {
    override document = FleetPositionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VehicleTelemetryDocument = gql`
    query VehicleTelemetry($id: UUID!, $from: DateTime!, $to: DateTime!) {
  vehicle(id: $id) {
    id
    lastPosition {
      ...PositionFields
    }
    track(from: $from, to: $to) {
      latitude
      longitude
      speedKph
      recordedAt
    }
  }
}
    ${PositionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class VehicleTelemetryGQL extends Apollo.Query<VehicleTelemetryQuery, VehicleTelemetryQueryVariables> {
    override document = VehicleTelemetryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VehicleDevicesDocument = gql`
    query VehicleDevices($id: UUID!) {
  vehicle(id: $id) {
    id
    telemetryDevices {
      id
      label
      createdAt
      lastSeenAt
      revoked
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class VehicleDevicesGQL extends Apollo.Query<VehicleDevicesQuery, VehicleDevicesQueryVariables> {
    override document = VehicleDevicesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RegisterTelemetryDeviceDocument = gql`
    mutation RegisterTelemetryDevice($vehicleId: UUID!, $label: String!) {
  registerTelemetryDevice(vehicleId: $vehicleId, label: $label) {
    apiKey
    device {
      id
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RegisterTelemetryDeviceGQL extends Apollo.Mutation<RegisterTelemetryDeviceMutation, RegisterTelemetryDeviceMutationVariables> {
    override document = RegisterTelemetryDeviceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RevokeTelemetryDeviceDocument = gql`
    mutation RevokeTelemetryDevice($id: UUID!) {
  revokeTelemetryDevice(id: $id) {
    id
    revoked
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RevokeTelemetryDeviceGQL extends Apollo.Mutation<RevokeTelemetryDeviceMutation, RevokeTelemetryDeviceMutationVariables> {
    override document = RevokeTelemetryDeviceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GeofencesDocument = gql`
    query Geofences {
  geofences {
    ...GeofenceFields
  }
}
    ${GeofenceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GeofencesGQL extends Apollo.Query<GeofencesQuery, GeofencesQueryVariables> {
    override document = GeofencesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GeofenceDocument = gql`
    query Geofence($id: UUID!) {
  geofence(id: $id) {
    ...GeofenceFields
  }
}
    ${GeofenceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GeofenceGQL extends Apollo.Query<GeofenceQuery, GeofenceQueryVariables> {
    override document = GeofenceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GeofenceAlertsDocument = gql`
    query GeofenceAlerts($filter: GeofenceAlertFilter, $page: Int, $size: Int) {
  geofenceAlerts(filter: $filter, page: $page, size: $size) {
    items {
      id
      type
      severity
      geofenceId
      geofenceName
      speedKph
      speedLimitKph
      occurredAt
      acknowledged
      vehicle {
        id
        licensePlate
      }
    }
    totalCount
    page
    size
    hasNext
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GeofenceAlertsGQL extends Apollo.Query<GeofenceAlertsQuery, GeofenceAlertsQueryVariables> {
    override document = GeofenceAlertsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UnacknowledgedAlertCountDocument = gql`
    query UnacknowledgedAlertCount {
  unacknowledgedAlertCount
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UnacknowledgedAlertCountGQL extends Apollo.Query<UnacknowledgedAlertCountQuery, UnacknowledgedAlertCountQueryVariables> {
    override document = UnacknowledgedAlertCountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CreateGeofenceDocument = gql`
    mutation CreateGeofence($input: GeofenceInput!) {
  createGeofence(input: $input) {
    ...GeofenceFields
  }
}
    ${GeofenceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CreateGeofenceGQL extends Apollo.Mutation<CreateGeofenceMutation, CreateGeofenceMutationVariables> {
    override document = CreateGeofenceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateGeofenceDocument = gql`
    mutation UpdateGeofence($id: UUID!, $input: GeofenceInput!) {
  updateGeofence(id: $id, input: $input) {
    ...GeofenceFields
  }
}
    ${GeofenceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateGeofenceGQL extends Apollo.Mutation<UpdateGeofenceMutation, UpdateGeofenceMutationVariables> {
    override document = UpdateGeofenceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SetGeofenceActiveDocument = gql`
    mutation SetGeofenceActive($id: UUID!, $active: Boolean!) {
  setGeofenceActive(id: $id, active: $active) {
    ...GeofenceFields
  }
}
    ${GeofenceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class SetGeofenceActiveGQL extends Apollo.Mutation<SetGeofenceActiveMutation, SetGeofenceActiveMutationVariables> {
    override document = SetGeofenceActiveDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteGeofenceDocument = gql`
    mutation DeleteGeofence($id: UUID!) {
  deleteGeofence(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteGeofenceGQL extends Apollo.Mutation<DeleteGeofenceMutation, DeleteGeofenceMutationVariables> {
    override document = DeleteGeofenceDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AcknowledgeGeofenceAlertDocument = gql`
    mutation AcknowledgeGeofenceAlert($id: UUID!) {
  acknowledgeGeofenceAlert(id: $id) {
    id
    acknowledged
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AcknowledgeGeofenceAlertGQL extends Apollo.Mutation<AcknowledgeGeofenceAlertMutation, AcknowledgeGeofenceAlertMutationVariables> {
    override document = AcknowledgeGeofenceAlertDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const AcknowledgeAllGeofenceAlertsDocument = gql`
    mutation AcknowledgeAllGeofenceAlerts {
  acknowledgeAllGeofenceAlerts
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AcknowledgeAllGeofenceAlertsGQL extends Apollo.Mutation<AcknowledgeAllGeofenceAlertsMutation, AcknowledgeAllGeofenceAlertsMutationVariables> {
    override document = AcknowledgeAllGeofenceAlertsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const WorkOrdersDocument = gql`
    query WorkOrders($filter: WorkOrderFilter, $page: Int, $size: Int) {
  workOrders(filter: $filter, page: $page, size: $size) {
    items {
      ...WorkOrderSummary
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${WorkOrderSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class WorkOrdersGQL extends Apollo.Query<WorkOrdersQuery, WorkOrdersQueryVariables> {
    override document = WorkOrdersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const WorkOrderDocument = gql`
    query WorkOrder($id: UUID!) {
  workOrder(id: $id) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class WorkOrderGQL extends Apollo.Query<WorkOrderQuery, WorkOrderQueryVariables> {
    override document = WorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MaintenanceStatisticsDocument = gql`
    query MaintenanceStatistics {
  maintenanceStatistics {
    scheduled
    inProgress
    overdue
    completedThisMonth
    costThisMonth
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MaintenanceStatisticsGQL extends Apollo.Query<MaintenanceStatisticsQuery, MaintenanceStatisticsQueryVariables> {
    override document = MaintenanceStatisticsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VehicleWorkOrdersDocument = gql`
    query VehicleWorkOrders($id: UUID!) {
  vehicle(id: $id) {
    id
    workOrders {
      ...WorkOrderSummary
    }
  }
}
    ${WorkOrderSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class VehicleWorkOrdersGQL extends Apollo.Query<VehicleWorkOrdersQuery, VehicleWorkOrdersQueryVariables> {
    override document = VehicleWorkOrdersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ScheduleWorkOrderDocument = gql`
    mutation ScheduleWorkOrder($input: WorkOrderInput!) {
  scheduleWorkOrder(input: $input) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ScheduleWorkOrderGQL extends Apollo.Mutation<ScheduleWorkOrderMutation, ScheduleWorkOrderMutationVariables> {
    override document = ScheduleWorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateWorkOrderDocument = gql`
    mutation UpdateWorkOrder($id: UUID!, $input: UpdateWorkOrderInput!) {
  updateWorkOrder(id: $id, input: $input) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateWorkOrderGQL extends Apollo.Mutation<UpdateWorkOrderMutation, UpdateWorkOrderMutationVariables> {
    override document = UpdateWorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const StartWorkOrderDocument = gql`
    mutation StartWorkOrder($id: UUID!) {
  startWorkOrder(id: $id) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class StartWorkOrderGQL extends Apollo.Mutation<StartWorkOrderMutation, StartWorkOrderMutationVariables> {
    override document = StartWorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CompleteWorkOrderDocument = gql`
    mutation CompleteWorkOrder($id: UUID!, $input: CompleteWorkOrderInput!) {
  completeWorkOrder(id: $id, input: $input) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CompleteWorkOrderGQL extends Apollo.Mutation<CompleteWorkOrderMutation, CompleteWorkOrderMutationVariables> {
    override document = CompleteWorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CancelWorkOrderDocument = gql`
    mutation CancelWorkOrder($id: UUID!, $reason: String!) {
  cancelWorkOrder(id: $id, reason: $reason) {
    ...WorkOrderDetails
  }
}
    ${WorkOrderDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CancelWorkOrderGQL extends Apollo.Mutation<CancelWorkOrderMutation, CancelWorkOrderMutationVariables> {
    override document = CancelWorkOrderDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MaintenanceVehicleOptionsDocument = gql`
    query MaintenanceVehicleOptions {
  vehicles(size: 100) {
    items {
      id
      licensePlate
      make
      model
      status
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MaintenanceVehicleOptionsGQL extends Apollo.Query<MaintenanceVehicleOptionsQuery, MaintenanceVehicleOptionsQueryVariables> {
    override document = MaintenanceVehicleOptionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MyTripsDocument = gql`
    query MyTrips($page: Int, $size: Int) {
  myTrips(page: $page, size: $size) {
    items {
      ...TripSummary
      distanceKm
      startedAt
      completedAt
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${TripSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class MyTripsGQL extends Apollo.Query<MyTripsQuery, MyTripsQueryVariables> {
    override document = MyTripsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MyInvoicesDocument = gql`
    query MyInvoices($page: Int, $size: Int) {
  myInvoices(page: $page, size: $size) {
    items {
      ...InvoiceDocument
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${InvoiceDocumentFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class MyInvoicesGQL extends Apollo.Query<MyInvoicesQuery, MyInvoicesQueryVariables> {
    override document = MyInvoicesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MyNotificationsDocument = gql`
    query MyNotifications($unreadOnly: Boolean, $page: Int, $size: Int) {
  myNotifications(unreadOnly: $unreadOnly, page: $page, size: $size) {
    items {
      ...NotificationFields
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${NotificationFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class MyNotificationsGQL extends Apollo.Query<MyNotificationsQuery, MyNotificationsQueryVariables> {
    override document = MyNotificationsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UnreadNotificationCountDocument = gql`
    query UnreadNotificationCount {
  unreadNotificationCount
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UnreadNotificationCountGQL extends Apollo.Query<UnreadNotificationCountQuery, UnreadNotificationCountQueryVariables> {
    override document = UnreadNotificationCountDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MarkNotificationReadDocument = gql`
    mutation MarkNotificationRead($id: UUID!) {
  markNotificationRead(id: $id) {
    id
    read
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MarkNotificationReadGQL extends Apollo.Mutation<MarkNotificationReadMutation, MarkNotificationReadMutationVariables> {
    override document = MarkNotificationReadDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const MarkAllNotificationsReadDocument = gql`
    mutation MarkAllNotificationsRead {
  markAllNotificationsRead
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MarkAllNotificationsReadGQL extends Apollo.Mutation<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables> {
    override document = MarkAllNotificationsReadDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TripsDocument = gql`
    query Trips($filter: TripFilter, $page: Int, $size: Int) {
  trips(filter: $filter, page: $page, size: $size) {
    items {
      ...TripSummary
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${TripSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class TripsGQL extends Apollo.Query<TripsQuery, TripsQueryVariables> {
    override document = TripsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TripDocument = gql`
    query Trip($id: UUID!) {
  trip(id: $id) {
    ...TripDetails
  }
}
    ${TripDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class TripGQL extends Apollo.Query<TripQuery, TripQueryVariables> {
    override document = TripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TripStatisticsDocument = gql`
    query TripStatistics {
  tripStatistics {
    total
    scheduled
    inProgress
    completed
    cancelled
    totalDistanceKm
    totalRevenue
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TripStatisticsGQL extends Apollo.Query<TripStatisticsQuery, TripStatisticsQueryVariables> {
    override document = TripStatisticsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TripResourceOptionsDocument = gql`
    query TripResourceOptions {
  vehicles(filter: {status: ACTIVE}, size: 100) {
    items {
      id
      licensePlate
      make
      model
      inUse
    }
  }
  drivers(filter: {status: ACTIVE}, size: 100) {
    items {
      id
      fullName
      available
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TripResourceOptionsGQL extends Apollo.Query<TripResourceOptionsQuery, TripResourceOptionsQueryVariables> {
    override document = TripResourceOptionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateTripPlanDocument = gql`
    mutation UpdateTripPlan($id: UUID!, $input: UpdateTripPlanInput!) {
  updateTripPlan(id: $id, input: $input) {
    ...TripDetails
  }
}
    ${TripDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateTripPlanGQL extends Apollo.Mutation<UpdateTripPlanMutation, UpdateTripPlanMutationVariables> {
    override document = UpdateTripPlanDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const StartTripDocument = gql`
    mutation StartTrip($id: UUID!) {
  startTrip(id: $id) {
    ...TripDetails
  }
}
    ${TripDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class StartTripGQL extends Apollo.Mutation<StartTripMutation, StartTripMutationVariables> {
    override document = StartTripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CompleteTripDocument = gql`
    mutation CompleteTrip($id: UUID!, $input: CompleteTripInput!) {
  completeTrip(id: $id, input: $input) {
    ...TripDetails
  }
}
    ${TripDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CompleteTripGQL extends Apollo.Mutation<CompleteTripMutation, CompleteTripMutationVariables> {
    override document = CompleteTripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CancelTripDocument = gql`
    mutation CancelTrip($id: UUID!, $reason: String!) {
  cancelTrip(id: $id, reason: $reason) {
    ...TripDetails
  }
}
    ${TripDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CancelTripGQL extends Apollo.Mutation<CancelTripMutation, CancelTripMutationVariables> {
    override document = CancelTripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteTripDocument = gql`
    mutation DeleteTrip($id: UUID!) {
  deleteTrip(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteTripGQL extends Apollo.Mutation<DeleteTripMutation, DeleteTripMutationVariables> {
    override document = DeleteTripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const TripQuoteDocument = gql`
    query TripQuote($input: TripRequestInput!) {
  tripQuote(input: $input) {
    distanceKm
    durationMinutes
    departAt
    arriveAt
    price
    vehicleAvailable
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class TripQuoteGQL extends Apollo.Query<TripQuoteQuery, TripQuoteQueryVariables> {
    override document = TripQuoteDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RequestTripDocument = gql`
    mutation RequestTrip($input: TripRequestInput!) {
  requestTrip(input: $input) {
    id
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class RequestTripGQL extends Apollo.Mutation<RequestTripMutation, RequestTripMutationVariables> {
    override document = RequestTripDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const BookingOptionsDocument = gql`
    query BookingOptions {
  vehicles(filter: {status: ACTIVE}, size: 100) {
    items {
      id
      licensePlate
      make
      model
    }
  }
  drivers(filter: {status: ACTIVE}, size: 100) {
    items {
      id
      fullName
    }
  }
  customers(size: 100) {
    items {
      id
      fullName
      email
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class BookingOptionsGQL extends Apollo.Query<BookingOptionsQuery, BookingOptionsQueryVariables> {
    override document = BookingOptionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VehiclesDocument = gql`
    query Vehicles($filter: VehicleFilter, $page: Int, $size: Int) {
  vehicles(filter: $filter, page: $page, size: $size) {
    items {
      ...VehicleSummary
    }
    totalCount
    page
    size
    hasNext
  }
}
    ${VehicleSummaryFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class VehiclesGQL extends Apollo.Query<VehiclesQuery, VehiclesQueryVariables> {
    override document = VehiclesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const VehicleDocument = gql`
    query Vehicle($id: UUID!) {
  vehicle(id: $id) {
    ...VehicleDetails
  }
}
    ${VehicleDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class VehicleGQL extends Apollo.Query<VehicleQuery, VehicleQueryVariables> {
    override document = VehicleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const FleetStatisticsDocument = gql`
    query FleetStatistics {
  fleetStatistics {
    total
    active
    inactive
    inMaintenance
    inUse
    maintenanceDue
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class FleetStatisticsGQL extends Apollo.Query<FleetStatisticsQuery, FleetStatisticsQueryVariables> {
    override document = FleetStatisticsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RegisterVehicleDocument = gql`
    mutation RegisterVehicle($input: RegisterVehicleInput!) {
  registerVehicle(input: $input) {
    ...VehicleDetails
  }
}
    ${VehicleDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class RegisterVehicleGQL extends Apollo.Mutation<RegisterVehicleMutation, RegisterVehicleMutationVariables> {
    override document = RegisterVehicleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateVehicleDocument = gql`
    mutation UpdateVehicle($id: UUID!, $input: UpdateVehicleInput!) {
  updateVehicle(id: $id, input: $input) {
    ...VehicleDetails
  }
}
    ${VehicleDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateVehicleGQL extends Apollo.Mutation<UpdateVehicleMutation, UpdateVehicleMutationVariables> {
    override document = UpdateVehicleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const ChangeVehicleStatusDocument = gql`
    mutation ChangeVehicleStatus($id: UUID!, $status: VehicleStatus!) {
  changeVehicleStatus(id: $id, status: $status) {
    ...VehicleDetails
  }
}
    ${VehicleDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ChangeVehicleStatusGQL extends Apollo.Mutation<ChangeVehicleStatusMutation, ChangeVehicleStatusMutationVariables> {
    override document = ChangeVehicleStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const RecordOdometerReadingDocument = gql`
    mutation RecordOdometerReading($id: UUID!, $mileage: Long!) {
  recordOdometerReading(id: $id, mileage: $mileage) {
    ...VehicleDetails
  }
}
    ${VehicleDetailsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class RecordOdometerReadingGQL extends Apollo.Mutation<RecordOdometerReadingMutation, RecordOdometerReadingMutationVariables> {
    override document = RecordOdometerReadingDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const DeleteVehicleDocument = gql`
    mutation DeleteVehicle($id: UUID!) {
  deleteVehicle(id: $id)
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DeleteVehicleGQL extends Apollo.Mutation<DeleteVehicleMutation, DeleteVehicleMutationVariables> {
    override document = DeleteVehicleDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }