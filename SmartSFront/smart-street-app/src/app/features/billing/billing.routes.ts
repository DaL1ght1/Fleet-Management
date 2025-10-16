import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./billing-list/billing-list.component').then(m => m.BillingListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
];
