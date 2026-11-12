import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/customer-list.page').then(m => m.CustomerListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/customer-form.page').then(m => m.CustomerFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/customer-form.page').then(m => m.CustomerFormPage),
  },
];
