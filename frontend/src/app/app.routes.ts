import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { guestGuard, roleGuard, ROLES_ROUTE_DATA } from './core/auth/role.guard';
import { AuthService } from './core/auth/auth.service';
import { Roles } from './core/auth/roles';

const home = () => inject(AuthService).homeRoute();

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: home },
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'sign-in',
        canActivate: [guestGuard],
        title: 'SmartStreet',
        loadComponent: () => import('./features/auth/sign-in.page').then(m => m.SignInPage),
      },
      {
        path: 'sign-up',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/sign-up.page').then(m => m.SignUpPage),
      },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/forgot-password.page').then(m => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        data: { mode: 'reset' },
        loadComponent: () => import('./features/auth/set-password.page').then(m => m.SetPasswordPage),
      },
      {
        path: 'activate',
        data: { mode: 'activate' },
        loadComponent: () => import('./features/auth/set-password.page').then(m => m.SetPasswordPage),
      },
    ],
  },
  {
    path: '',
    canActivate: [roleGuard],
    loadComponent: () => import('./layout/shell/shell').then(m => m.Shell),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.STAFF },
        loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'fleet-map',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.STAFF },
        loadComponent: () => import('./features/fleet-map/fleet-map.page').then(m => m.FleetMapPage),
      },
      {
        path: 'trips',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.STAFF },
        loadChildren: () => import('./features/trips/trips.routes').then(m => m.tripsRoutes),
      },
      {
        path: 'vehicles',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.STAFF },
        loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.vehiclesRoutes),
      },
      {
        path: 'maintenance',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
        loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.maintenanceRoutes),
      },
      {
        path: 'geofences',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.STAFF },
        loadChildren: () => import('./features/geofences/geofences.routes').then(m => m.geofencesRoutes),
      },
      {
        path: 'drivers',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
        loadChildren: () => import('./features/drivers/drivers.routes').then(m => m.driversRoutes),
      },
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
        loadChildren: () => import('./features/customers/customers.routes').then(m => m.customersRoutes),
      },
      {
        path: 'billing',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
        loadChildren: () => import('./features/billing/billing.routes').then(m => m.billingRoutes),
      },
      {
        path: 'my/trips',
        loadComponent: () => import('./features/my/my-trips.page').then(m => m.MyTripsPage),
      },
      {
        path: 'my/trips/new',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: ['USER'] },
        loadComponent: () => import('./features/trips/pages/trip-booking.page').then(m => m.TripBookingPage),
      },
      {
        path: 'my/invoices',
        canActivate: [roleGuard],
        data: { [ROLES_ROUTE_DATA]: ['USER'] },
        loadComponent: () => import('./features/my/my-invoices.page').then(m => m.MyInvoicesPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.page').then(m => m.NotificationsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
      },
    ],
  },
  { path: '**', redirectTo: home },
];
