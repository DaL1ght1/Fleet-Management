import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

import { MapService, LocationData, MapRoute, MapCoordinates } from '../../../core/services/map.service';

export interface LocationMapOptions {
  height?: string;
  showNavigation?: boolean;
  showDistance?: boolean;
  showStaticMap?: boolean;
  enableInteractiveMap?: boolean;
  zoom?: number;
}

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <div class="location-map-container">
      
      <!-- Single Location Display -->
      <div *ngIf="location && !endLocation" class="single-location">
        <div class="location-header">
          <div class="location-info">
            <mat-icon class="location-icon">place</mat-icon>
            <div class="location-details">
              <div class="location-name">{{ location.address }}</div>
              <div class="location-formatted" *ngIf="location.formattedAddress && location.formattedAddress !== location.address">
                {{ location.formattedAddress }}
              </div>
            </div>
          </div>
          
          <div class="location-actions" *ngIf="options?.showNavigation">
            <a mat-icon-button 
               [href]="getNavigationUrl(location)" 
               target="_blank"
               matTooltip="Navigate to location">
              <mat-icon>navigation</mat-icon>
            </a>
          </div>
        </div>
        
        <!-- Geocoding Status -->
        <div class="geocoding-status">
          <div *ngIf="isGeocodingLocation()" class="loading-geocode">
            <mat-spinner diameter="16"></mat-spinner>
            <span>{{ 'map.geocodingLocation' | translate }}</span>
          </div>
          
          <div *ngIf="!isGeocodingLocation() && !location.coordinates" class="geocode-failed">
            <mat-icon color="warn">warning</mat-icon>
            <span>{{ 'map.geocodingFailed' | translate }}</span>
            <button mat-button color="primary" (click)="retryGeocode(location)">
              {{ 'app.retry' | translate }}
            </button>
          </div>
          
          <div *ngIf="location.coordinates" class="geocode-success">
            <mat-icon color="accent">check_circle</mat-icon>
            <span>{{ 'map.locationFound' | translate }}</span>
            <small>({{ location.coordinates.lat | number:'1.4-4' }}, {{ location.coordinates.lng | number:'1.4-4' }})</small>
          </div>
        </div>
        
        <!-- Single Location Map -->
        <div *ngIf="location.coordinates && options?.showStaticMap" class="map-display">
          <div class="map-frame" [style.height]="(options && options.height) || '200px'">
            <iframe [src]="getSingleLocationMapUrl(location)" 
                    [style.height]="(options && options.height) || '200px'"
                    frameborder="0" 
                    scrolling="no"
                    class="map-iframe">
            </iframe>
          </div>
        </div>
      </div>
      
      <!-- Route Display (Two Locations) -->
      <div *ngIf="location && endLocation" class="route-display">
        <div class="route-header">
          <h4>{{ 'map.routeOverview' | translate }}</h4>
          <div class="route-actions" *ngIf="options?.showNavigation">
            <a mat-stroked-button 
               [href]="getNavigationUrl(endLocation)" 
               target="_blank"
               class="navigate-btn">
              <mat-icon>navigation</mat-icon>
              {{ 'map.navigate' | translate }}
            </a>
          </div>
        </div>
        
        <!-- Route Details -->
        <div class="route-details">
          <!-- Start Location -->
          <div class="route-point start-point">
            <div class="point-indicator">
              <mat-icon>radio_button_checked</mat-icon>
            </div>
            <div class="point-info">
              <div class="point-label">{{ 'map.from' | translate }}</div>
              <div class="point-address">{{ location.address }}</div>
              <div class="geocoding-status" *ngIf="isGeocodingLocation()">
                <mat-spinner diameter="12"></mat-spinner>
                {{ 'map.geocoding' | translate }}
              </div>
            </div>
          </div>
          
          <!-- Route Line -->
          <div class="route-line">
            <div class="line-connector"></div>
            <!-- Route Info -->
            <div class="route-info" *ngIf="routeData()">
              <div class="route-stat">
                <mat-icon>straighten</mat-icon>
                <span>{{ routeData()?.distance || 'N/A' }}</span>
              </div>
              <div class="route-stat">
                <mat-icon>schedule</mat-icon>
                <span>{{ routeData()?.duration || 'N/A' }}</span>
              </div>
            </div>
            <div class="route-loading" *ngIf="isCalculatingRoute()">
              <mat-spinner diameter="16"></mat-spinner>
              <span>{{ 'map.calculatingRoute' | translate }}</span>
            </div>
          </div>
          
          <!-- End Location -->
          <div class="route-point end-point">
            <div class="point-indicator">
              <mat-icon>place</mat-icon>
            </div>
            <div class="point-info">
              <div class="point-label">{{ 'map.to' | translate }}</div>
              <div class="point-address">{{ endLocation.address }}</div>
              <div class="geocoding-status" *ngIf="isGeocodingEndLocation()">
                <mat-spinner diameter="12"></mat-spinner>
                {{ 'map.geocoding' | translate }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Route Map -->
        <div *ngIf="showRouteMap()" class="map-display route-map">
          <div class="map-frame" [style.height]="(options && options.height) || '300px'">
            <iframe [src]="getRouteMapUrl()" 
                    [style.height]="(options && options.height) || '300px'"
                    frameborder="0" 
                    scrolling="no"
                    class="map-iframe">
            </iframe>
          </div>
        </div>
        
        <!-- Route Actions -->
        <div class="route-actions-bar" *ngIf="routeData()">
          <button mat-button (click)="recalculateRoute()">
            <mat-icon>refresh</mat-icon>
            {{ 'map.recalculate' | translate }}
          </button>
          
          <button mat-button (click)="exportRoute()" *ngIf="routeData()">
            <mat-icon>file_download</mat-icon>
            {{ 'map.export' | translate }}
          </button>
        </div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="!location" class="no-location">
        <mat-icon>location_off</mat-icon>
        <p>{{ 'map.noLocationProvided' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .location-map-container {
      width: 100%;
      
      .single-location {
        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          .location-info {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            flex: 1;
            
            .location-icon {
              color: #2196f3;
              font-size: 24px;
              width: 24px;
              height: 24px;
              margin-top: 2px;
            }
            
            .location-details {
              .location-name {
                font-size: 1rem;
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
              }
              
              .location-formatted {
                font-size: 0.875rem;
                color: #666;
                line-height: 1.4;
              }
            }
          }
          
          .location-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
      
      .geocoding-status {
        margin: 12px 0;
        
        .loading-geocode,
        .geocode-failed,
        .geocode-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .loading-geocode {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .geocode-failed {
          background-color: #fff3e0;
          color: #f57c00;
        }
        
        .geocode-success {
          background-color: #e8f5e8;
          color: #388e3c;
          
          small {
            margin-left: 8px;
            opacity: 0.7;
            font-family: monospace;
          }
        }
      }
      
      .route-display {
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          h4 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 500;
            color: #333;
          }
        }
        
        .route-details {
          position: relative;
          margin-bottom: 20px;
          
          .route-point {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 12px 0;
            
            .point-indicator {
              margin-top: 2px;
              
              mat-icon {
                font-size: 20px;
                width: 20px;
                height: 20px;
              }
              
              &.start-point mat-icon {
                color: #4caf50;
              }
              
              &.end-point mat-icon {
                color: #f44336;
              }
            }
            
            .point-info {
              flex: 1;
              
              .point-label {
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
                margin-bottom: 4px;
                letter-spacing: 0.5px;
              }
              
              .point-address {
                font-size: 0.95rem;
                color: #333;
                line-height: 1.4;
              }
              
              .geocoding-status {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                font-size: 0.8rem;
                color: #666;
              }
            }
          }
          
          .route-line {
            display: flex;
            align-items: center;
            margin: 8px 0;
            padding-left: 10px;
            
            .line-connector {
              width: 2px;
              height: 40px;
              background: linear-gradient(to bottom, #4caf50, #f44336);
              margin-right: 24px;
            }
            
            .route-info {
              display: flex;
              gap: 20px;
              background: #f8f9fa;
              padding: 8px 16px;
              border-radius: 20px;
              border: 1px solid #e9ecef;
              
              .route-stat {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.875rem;
                color: #495057;
                
                mat-icon {
                  font-size: 16px;
                  width: 16px;
                  height: 16px;
                  color: #6c757d;
                }
              }
            }
            
            .route-loading {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.875rem;
              color: #666;
            }
          }
        }
      }
      
      .map-display {
        margin: 16px 0;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        
        .map-frame {
          width: 100%;
          position: relative;
          
          .map-iframe {
            width: 100%;
            border: none;
            display: block;
          }
        }
        
        &.route-map {
          margin: 20px 0;
        }
      }
      
      .route-actions-bar {
        display: flex;
        gap: 12px;
        justify-content: center;
        padding: 16px 0;
        border-top: 1px solid #e0e0e0;
        margin-top: 16px;
      }
      
      .no-location {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          color: #ccc;
        }
        
        p {
          margin: 0;
          font-size: 1rem;
        }
      }
      
      .navigate-btn {
        mat-icon {
          margin-right: 8px;
        }
      }
    }
    
    // Responsive design
    @media (max-width: 768px) {
      .location-map-container {
        .route-display .route-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }
        
        .route-line .route-info {
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        
        .route-actions-bar {
          flex-direction: column;
          
          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class LocationMapComponent implements OnInit, OnChanges {
  private mapService = inject(MapService);
  private sanitizer = inject(DomSanitizer);

  @Input() location: LocationData | null = null;
  @Input() endLocation: LocationData | null = null;
  @Input() options: LocationMapOptions = {
    height: '200px',
    showNavigation: true,
    showDistance: true,
    showStaticMap: true,
    enableInteractiveMap: false,
    zoom: 15
  };

  @Output() locationGeocoded = new EventEmitter<LocationData>();
  @Output() routeCalculated = new EventEmitter<MapRoute>();
  @Output() error = new EventEmitter<string>();

  // Component state
  protected isGeocodingLocation = signal(false);
  protected isGeocodingEndLocation = signal(false);
  protected isCalculatingRoute = signal(false);
  protected routeData = signal<MapRoute | null>(null);

  // Computed properties
  protected showRouteMap = computed(() => {
    return this.options?.showStaticMap && 
           this.location?.coordinates && 
           this.endLocation?.coordinates;
  });

  ngOnInit(): void {
    this.initializeLocations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location'] || changes['endLocation']) {
      this.initializeLocations();
    }
  }

  private async initializeLocations(): Promise<void> {
    // Geocode primary location if needed
    if (this.location && !this.location.coordinates) {
      await this.geocodeLocation(this.location, 'location');
    }

    // Geocode end location if needed
    if (this.endLocation && !this.endLocation.coordinates) {
      await this.geocodeLocation(this.endLocation, 'endLocation');
    }

    // Calculate route if both locations have coordinates
    if (this.location?.coordinates && this.endLocation?.coordinates) {
      await this.calculateRoute();
    }
  }

  private async geocodeLocation(location: LocationData, type: 'location' | 'endLocation'): Promise<void> {
    if (type === 'location') {
      this.isGeocodingLocation.set(true);
    } else {
      this.isGeocodingEndLocation.set(true);
    }

    try {
      const geocoded = await this.mapService.geocodeAddress(location.address).toPromise();
      
      if (geocoded && geocoded.coordinates) {
        // Update the location object
        location.coordinates = geocoded.coordinates;
        location.formattedAddress = geocoded.formattedAddress;
        location.city = geocoded.city;
        location.country = geocoded.country;
        
        this.locationGeocoded.emit(location);
      }
    } catch (error) {
      console.error(`Error geocoding ${type}:`, error);
      this.error.emit(`Failed to geocode ${type === 'location' ? 'start' : 'end'} location`);
    } finally {
      if (type === 'location') {
        this.isGeocodingLocation.set(false);
      } else {
        this.isGeocodingEndLocation.set(false);
      }
    }
  }

  private async calculateRoute(): Promise<void> {
    if (!this.location || !this.endLocation) return;

    this.isCalculatingRoute.set(true);
    
    try {
      const route = await this.mapService.calculateRoute(this.location, this.endLocation).toPromise();
      
      if (route) {
        this.routeData.set(route);
        this.routeCalculated.emit(route);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      this.error.emit('Failed to calculate route');
    } finally {
      this.isCalculatingRoute.set(false);
    }
  }

  protected async retryGeocode(location: LocationData): Promise<void> {
    const type = location === this.endLocation ? 'endLocation' : 'location';
    await this.geocodeLocation(location, type);
  }

  protected async recalculateRoute(): Promise<void> {
    await this.calculateRoute();
  }

  protected exportRoute(): void {
    const route = this.routeData();
    if (!route) return;

    const routeData = {
      from: route.startLocation.address,
      to: route.endLocation.address,
      distance: route.distance,
      duration: route.duration,
      coordinates: {
        start: route.startLocation.coordinates,
        end: route.endLocation.coordinates
      }
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  protected getSingleLocationMapUrl(location: LocationData): SafeResourceUrl {
    const mapUrl = this.mapService.getMapEmbedUrl(location, this.options?.zoom);
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  protected getRouteMapUrl(): SafeResourceUrl {
    if (!this.location?.coordinates || !this.endLocation?.coordinates) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    const { lat: startLat, lng: startLng } = this.location.coordinates;
    const { lat: endLat, lng: endLng } = this.endLocation.coordinates;
    
    // Create bounding box that includes both points
    const minLat = Math.min(startLat, endLat) - 0.01;
    const maxLat = Math.max(startLat, endLat) + 0.01;
    const minLng = Math.min(startLng, endLng) - 0.01;
    const maxLng = Math.max(startLng, endLng) + 0.01;
    
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${startLat},${startLng}&marker=${endLat},${endLng}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  protected getNavigationUrl(location: LocationData): string {
    return this.mapService.getNavigationUrl(location);
  }
}