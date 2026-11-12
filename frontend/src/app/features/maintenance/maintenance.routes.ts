import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/work-order-list.page').then(m => m.WorkOrderListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/work-order-form.page').then(m => m.WorkOrderFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/work-order-detail.page').then(m => m.WorkOrderDetailPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/work-order-form.page').then(m => m.WorkOrderFormPage),
  },
];
