import { Routes } from '@angular/router';
import { roleGuard, ROLES_ROUTE_DATA } from '../../core/auth/role.guard';
import { Roles } from '../../core/auth/roles';

export const vehiclesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/vehicle-list.page').then(m => m.VehicleListPage),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/vehicle-form.page').then(m => m.VehicleFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/vehicle-detail.page').then(m => m.VehicleDetailPage),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/vehicle-form.page').then(m => m.VehicleFormPage),
  },
];
