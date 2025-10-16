import { Routes } from '@angular/router';

export const driversRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./drivers-list/drivers-list.component').then(m => m.DriversListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./driver-form/driver-form.component').then(m => m.DriverFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./driver-detail/driver-detail.component').then(m => m.DriverDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./driver-form/driver-form.component').then(m => m.DriverFormComponent),
  },
];