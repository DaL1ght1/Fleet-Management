import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `<div class="container"><div class="header"><h1>{{ 'notifications.title' | translate }}</h1><button mat-stroked-button><mat-icon>mark_email_read</mat-icon>{{ 'notifications.markAllRead' | translate }}</button></div><mat-card><mat-card-content><div style="text-align: center; padding: 48px;"><mat-icon style="font-size: 72px; width: 72px; height: 72px; color: rgba(0, 0, 0, 0.3);">notifications</mat-icon><h2>{{ 'notifications.title' | translate }}</h2><p>Notifications management features coming soon.</p></div></mat-card-content></mat-card></div>`,
  styles: [`.container { padding: 24px; } .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; } .header h1 { margin: 0; }`]
})
export class NotificationsListComponent {
}
