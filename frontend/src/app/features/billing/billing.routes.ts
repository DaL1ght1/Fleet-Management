import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/invoice-list.page').then(m => m.InvoiceListPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/invoice-detail.page').then(m => m.InvoiceDetailPage),
  },
];
