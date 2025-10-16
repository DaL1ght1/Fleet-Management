import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="notification-center">
      <!-- Notifications will be handled by MatSnackBar -->
    </div>
  `,
  styles: [`
    .notification-center {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    }
  `]
})
export class NotificationCenterComponent {
  private appState = inject(AppStateService);
  private snackBar = inject(MatSnackBar);
  
  private openSnackBars = new Map<string, MatSnackBarRef<any>>();

  constructor() {
    // Subscribe to notifications from app state
    const notifications = this.appState.notifications();
    if (Array.isArray(notifications)) {
      notifications.forEach(notification => {
        if (!this.openSnackBars.has(notification.id)) {
          this.showSnackBar(notification);
        }
      });
    }
  }

  private showSnackBar(notification: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
  }): void {
    const config = {
      duration: this.getDuration(notification.type),
      panelClass: [`snackbar-${notification.type}`],
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
    };

    const snackBarRef = this.snackBar.open(
      notification.message,
      'Close',
      config
    );

    this.openSnackBars.set(notification.id, snackBarRef);

    // Remove from tracking when closed
    snackBarRef.afterDismissed().subscribe(() => {
      this.openSnackBars.delete(notification.id);
      this.appState.removeNotification(notification.id);
    });
  }

  private getDuration(type: string): number {
    switch (type) {
      case 'success':
        return 4000;
      case 'info':
        return 5000;
      case 'warning':
        return 6000;
      case 'error':
        return 8000;
      default:
        return 5000;
    }
  }
}
