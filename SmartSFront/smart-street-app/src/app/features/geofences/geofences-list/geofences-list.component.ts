import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-geofences-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="geofences-container">
      <div class="header-section">
        <div class="title-section">
          <h1>{{ 'geofences.title' | translate }}</h1>
          <p>{{ 'geofences.subtitle' | translate }}</p>
        </div>
        <div class="actions-section">
          <button mat-raised-button color="primary" routerLink="/geofences/new">
            <mat-icon>add</mat-icon>
            {{ 'geofences.createGeofence' | translate }}
          </button>
        </div>
      </div>
      <mat-card class="coming-soon-card">
        <mat-card-content>
          <div class="coming-soon-content">
            <mat-icon>location_on</mat-icon>
            <h2>{{ 'geofences.title' | translate }}</h2>
            <p>Geofence management features coming soon. Create and manage geographic boundaries for your fleet.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .geofences-container { padding: 24px; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .title-section h1 { margin: 0 0 8px 0; font-size: 2rem; font-weight: 400; }
    .title-section p { margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 1.1rem; }
    .coming-soon-card { text-align: center; padding: 48px 24px; }
    .coming-soon-content mat-icon { font-size: 72px; width: 72px; height: 72px; color: rgba(0, 0, 0, 0.3); margin-bottom: 24px; }
  `]
})
export class GeofencesListComponent {
}
