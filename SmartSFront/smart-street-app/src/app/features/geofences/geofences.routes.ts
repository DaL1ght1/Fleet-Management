import { Routes } from '@angular/router';

export const geofencesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./geofences-list/geofences-list.component').then(m => m.GeofencesListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./geofence-form/geofence-form.component').then(m => m.GeofenceFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./geofence-detail/geofence-detail.component').then(m => m.GeofenceDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./geofence-form/geofence-form.component').then(m => m.GeofenceFormComponent),
  },
];
