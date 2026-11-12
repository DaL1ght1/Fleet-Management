import { Routes } from '@angular/router';
import { roleGuard, ROLES_ROUTE_DATA } from '../../core/auth/role.guard';
import { Roles } from '../../core/auth/roles';

export const geofencesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/geofence-list.page').then(m => m.GeofenceListPage),
  },
  {
    path: 'alerts',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/geofence-alerts.page').then(m => m.GeofenceAlertsPage),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/geofence-form.page').then(m => m.GeofenceFormPage),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/geofence-form.page').then(m => m.GeofenceFormPage),
  },
];
