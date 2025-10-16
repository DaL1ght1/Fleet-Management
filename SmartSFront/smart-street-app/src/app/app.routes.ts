import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { roleGuard, RoleConfig } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.vehiclesRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.STAFF_ONLY,
  },
  {
    path: 'trips',
    loadChildren: () => import('./features/trips/trips.routes').then(m => m.tripsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'billing',
    loadChildren: () => import('./features/billing/billing.routes').then(m => m.billingRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.MANAGER_OR_ADMIN,
  },
  {
    path: 'geofences',
    loadChildren: () => import('./features/geofences/geofences.routes').then(m => m.geofencesRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.MANAGER_OR_ADMIN,
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.maintenanceRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.STAFF_ONLY,
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.notificationsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.ADMIN_ONLY,
  },
  {
    path: 'drivers',
    loadChildren: () => import('./features/drivers/drivers.routes').then(m => m.driversRoutes),
    canActivate: [authGuard, roleGuard],
    data: RoleConfig.MANAGER_OR_ADMIN,
  },
  {
    path: 'map-test',
    loadComponent: () => import('./debug/map-test.component').then(m => m.MapTestComponent),
  },
  { path: '**', redirectTo: '/dashboard' },
];
