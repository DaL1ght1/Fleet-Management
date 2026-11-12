import { Routes } from '@angular/router';
import { roleGuard, ROLES_ROUTE_DATA } from '../../core/auth/role.guard';
import { Roles } from '../../core/auth/roles';

export const tripsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/trip-list.page').then(m => m.TripListPage),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/trip-booking.page').then(m => m.TripBookingPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/trip-detail.page').then(m => m.TripDetailPage),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { [ROLES_ROUTE_DATA]: Roles.MANAGEMENT },
    loadComponent: () => import('./pages/trip-form.page').then(m => m.TripFormPage),
  },
];
