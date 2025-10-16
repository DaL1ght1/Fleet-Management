import { Routes } from '@angular/router';

export const notificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notifications-list/notifications-list.component').then(m => m.NotificationsListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./notification-detail/notification-detail.component').then(m => m.NotificationDetailComponent),
  },
];
