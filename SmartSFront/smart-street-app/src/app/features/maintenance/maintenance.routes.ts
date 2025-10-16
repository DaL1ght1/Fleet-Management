import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./maintenance-list/maintenance-list.component').then(m => m.MaintenanceListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./maintenance-form/maintenance-form.component').then(m => m.MaintenanceFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./maintenance-detail/maintenance-detail.component').then(m => m.MaintenanceDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./maintenance-form/maintenance-form.component').then(m => m.MaintenanceFormComponent),
  },
];
