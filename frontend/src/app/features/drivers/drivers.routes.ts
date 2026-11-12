import { Routes } from '@angular/router';
import { roleGuard, ROLES_ROUTE_DATA } from '../../core/auth/role.guard';
import { Roles } from '../../core/auth/roles';

export const driversRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/driver-list.page').then(m => m.DriverListPage),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/driver-form.page').then(m => m.DriverFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/driver-detail.page').then(m => m.DriverDetailPage),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/driver-form.page').then(m => m.DriverFormPage),
  },
];
