import { Component, Input, OnChanges, SimpleChanges, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MapService, LocationData, MapRoute } from '../../../core/services/map.service';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="route-map-container">
      <div class="map-placeholder" *ngIf="!startLocation || !endLocation">
        <div class="placeholder-content">
          <mat-icon>map</mat-icon>
          <p>Map preview will appear when start and end locations are set</p>
        </div>
      </div>
      
      <div class="map-content" *ngIf="startLocation && endLocation">
        <div class="map-header">
          <h4>Route Preview</h4>
          <div class="map-actions">
            <button class="map-btn" (click)="openInMaps()">
              <mat-icon>open_in_new</mat-icon>
              Open in Maps
            </button>
          </div>
        </div>
        
        <div class="simple-map">
          <div class="route-line"></div>
          <div class="location-marker start-marker">
            <mat-icon>play_circle</mat-icon>
            <span class="marker-label">Start</span>
          </div>
          <div class="location-marker end-marker">
            <mat-icon>stop_circle</mat-icon>
            <span class="marker-label">End</span>
          </div>
          <div class="waypoint-marker" *ngFor="let waypoint of waypoints; let i = index">
            <mat-icon>location_on</mat-icon>
            <span class="marker-label">{{ i + 1 }}</span>
          </div>
        </div>
        
        <div class="route-summary" *ngIf="route">
          <div class="summary-item">
            <mat-icon>straighten</mat-icon>
            <span>{{ route.distance }}</span>
          </div>
          <div class="summary-item">
            <mat-icon>schedule</mat-icon>
            <span>{{ route.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './route-map.component.scss'
})
export class RouteMapComponent implements OnChanges {
  @Input() startLocation: LocationData | null = null;
  @Input() endLocation: LocationData | null = null;
  @Input() waypoints: LocationData[] = [];
  @Input() route: MapRoute | null = null;

  private mapService = inject(MapService);
  private platformId = inject(PLATFORM_ID);

  mapEmbedUrl = signal<string>('');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['endLocation'] && this.endLocation) {
      this.updateMapUrl();
    }
  }

  private updateMapUrl() {
    if (this.endLocation && isPlatformBrowser(this.platformId)) {
      const embedUrl = this.mapService.getMapEmbedUrl(this.endLocation, 12);
      this.mapEmbedUrl.set(embedUrl);
    }
  }

  openInMaps() {
    if (this.endLocation) {
      const url = this.mapService.getNavigationUrl(this.endLocation);
      if (isPlatformBrowser(this.platformId)) {
        window.open(url, '_blank');
      }
    }
  }
}