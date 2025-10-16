import { Routes } from '@angular/router';

export const tripsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trips-list/trips-list.component').then(m => m.TripsListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./components/trip-create/trip-create.component').then(m => m.TripCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./trip-detail/trip-detail.component').then(m => m.TripDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./trip-form/trip-form.component').then(m => m.TripFormComponent),
  },
];
