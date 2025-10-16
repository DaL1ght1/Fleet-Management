import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-geofence-form',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `<div class="container"><button mat-stroked-button routerLink="/geofences"><mat-icon>arrow_back</mat-icon>{{ 'app.back' | translate }}</button><h1>Geofence Form</h1><mat-card><mat-card-content><div style="text-align: center; padding: 48px;"><mat-icon style="font-size: 72px; width: 72px; height: 72px; color: rgba(0, 0, 0, 0.3);">edit</mat-icon><h2>Coming Soon</h2></div></mat-card-content></mat-card></div>`,
  styles: [`.container { padding: 24px; }`]
})
export class GeofenceFormComponent {
}
