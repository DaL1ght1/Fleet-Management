import { Routes } from '@angular/router';

export const vehiclesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./vehicles-list/vehicles-list.component').then(m => m.VehiclesListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
  },
];
