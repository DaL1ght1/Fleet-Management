import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  signal, 
  inject, 
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapService, LocationData, MapCoordinates } from '../../../core/services/map.service';

export interface MapSelectionEvent {
  coordinates: MapCoordinates;
  locationData?: LocationData;
  selectionType: 'start' | 'end' | 'waypoint';
  waypointIndex?: number;
}

export interface MapLocation {
  coordinates: MapCoordinates;
  locationData?: LocationData;
  type: 'start' | 'end' | 'waypoint';
  waypointIndex?: number;
  marker?: any; // Will hold Leaflet marker reference
}

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="interactive-map-container">
      <!-- Map Controls -->
      <div class="map-controls">
        <div class="selection-mode">
          <mat-chip-set>
            <mat-chip-option
              [selected]="currentSelectionMode() === 'start'"
              (click)="setSelectionMode('start')"
              class="start-chip">
              <mat-icon matChipAvatar>play_circle</mat-icon>
              Select Start Location
            </mat-chip-option>
            <mat-chip-option
              [selected]="currentSelectionMode() === 'end'"
              (click)="setSelectionMode('end')"
              class="end-chip">
              <mat-icon matChipAvatar>stop_circle</mat-icon>
              Select End Location
            </mat-chip-option>
            <mat-chip-option
              [selected]="currentSelectionMode() === 'waypoint'"
              (click)="setSelectionMode('waypoint')"
              class="waypoint-chip">
              <mat-icon matChipAvatar>location_on</mat-icon>
              Add Waypoint
            </mat-chip-option>
          </mat-chip-set>
        </div>
        
        <div class="map-actions">
          <button mat-icon-button 
                  (click)="centerOnUserLocation()" 
                  matTooltip="Center on current location">
            <mat-icon>my_location</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="clearAllMarkers()" 
                  matTooltip="Clear all locations">
            <mat-icon>clear_all</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="fitBoundsToMarkers()" 
                  matTooltip="Fit view to all locations"
                  [disabled]="selectedLocations().length === 0">
            <mat-icon>fit_screen</mat-icon>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-wrapper">
        <div #mapContainer class="map-container" id="interactive-map-{{componentId}}"></div>
        
        <!-- Loading Overlay -->
        <div class="map-loading" *ngIf="mapLoading()">
          <div class="loading-content">
            <mat-icon class="loading-icon">map</mat-icon>
            <p>Loading map...</p>
          </div>
        </div>
        
        <!-- Debug/Fallback Info -->
        <div class="map-debug" *ngIf="!mapLoading() && !map">
          <div class="debug-content">
            <mat-icon>error_outline</mat-icon>
            <p>Map failed to initialize</p>
            <small>Check browser console for details</small>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="map-instructions" *ngIf="!mapLoading()">
          <div class="instruction-card">
            <mat-icon>touch_app</mat-icon>
            <span>{{ getInstructionText() }}</span>
          </div>
        </div>
      </div>

      <!-- Selected Locations Summary -->
      <div class="locations-summary" *ngIf="selectedLocations().length > 0">
        <h4>Selected Locations</h4>
        <div class="location-list">
          <div class="location-item" 
               *ngFor="let location of selectedLocations()" 
               [class]="'location-' + location.type">
            <mat-icon [class]="'location-icon ' + location.type + '-icon'">
              {{ getLocationIcon(location.type) }}
            </mat-icon>
            <div class="location-details">
              <span class="location-type">{{ getLocationTypeLabel(location.type, location.waypointIndex) }}</span>
              <span class="location-address" *ngIf="location.locationData?.address">
                {{ location.locationData?.address }}
              </span>
              <span class="location-coords" *ngIf="!location.locationData?.address">
                {{ location.coordinates.lat | number:'1.6-6' }}, {{ location.coordinates.lng | number:'1.6-6' }}
              </span>
            </div>
            <button mat-icon-button 
                    (click)="removeLocation(location)" 
                    class="remove-location">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './interactive-map.component.scss'
})
export class InteractiveMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  @Input() initialCenter: MapCoordinates = { lat: 33.8869, lng: 9.5375 }; // Tunisia center
  @Input() initialZoom = 10;
  @Input() height = '400px';
  @Input() startLocation: LocationData | null = null;
  @Input() endLocation: LocationData | null = null;
  @Input() waypoints: LocationData[] = [];
  
  @Output() locationSelected = new EventEmitter<MapSelectionEvent>();
  @Output() locationRemoved = new EventEmitter<MapLocation>();
  
  private mapService = inject(MapService);
  private platformId = inject(PLATFORM_ID);
  
  // Signals for reactive state
  mapLoading = signal(true);
  currentSelectionMode = signal<'start' | 'end' | 'waypoint'>('start');
  selectedLocations = signal<MapLocation[]>([]);
  
  // Map instance and markers
  protected map: any = null;
  private markers: Map<string, any> = new Map();
  private waypointCounter = 0;
  protected componentId = Math.random().toString(36).substr(2, 9);

  ngOnInit() {
    // Map will be initialized in ngAfterViewInit
  }

  ngAfterViewInit() {
    console.log('InteractiveMapComponent ngAfterViewInit called');
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running in browser, checking map container...');
      // Ensure the component is properly rendered before initializing map
      setTimeout(() => {
        if (this.mapContainer && this.mapContainer.nativeElement) {
        const containerEl = this.mapContainer.nativeElement;
        console.log('Map container found, details:', {
          width: containerEl.offsetWidth,
          height: containerEl.offsetHeight,
          clientWidth: containerEl.clientWidth,
          clientHeight: containerEl.clientHeight,
          scrollWidth: containerEl.scrollWidth,
          scrollHeight: containerEl.scrollHeight,
          display: getComputedStyle(containerEl).display,
          visibility: getComputedStyle(containerEl).visibility,
          position: getComputedStyle(containerEl).position,
          id: containerEl.id,
          className: containerEl.className
        });
          this.loadLeafletAndInitialize();
        } else {
          console.error('Map container not found!', {
            mapContainer: this.mapContainer,
            nativeElement: this.mapContainer?.nativeElement
          });
          this.mapLoading.set(false);
        }
      }, 100);
    } else {
      console.log('Not running in browser environment');
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadLeafletAndInitialize() {
    console.log('Loading Leaflet and initializing map...');
    
    // Try to load from CDN with multiple fallbacks
    this.loadLeafletResources().then(() => {
      console.log('Leaflet resources loaded, initializing map...');
      setTimeout(() => this.initializeMap(), 300);
    }).catch((error) => {
      console.error('Failed to load Leaflet:', error);
      this.mapLoading.set(false);
    });
  }
  
  private async loadLeafletResources(): Promise<void> {
    // Load CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const cssLoaded = new Promise<void>((resolve, reject) => {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.onload = () => resolve();
        leafletCSS.onerror = () => reject(new Error('CSS load failed'));
        document.head.appendChild(leafletCSS);
      });
      
      await cssLoaded;
    }
    
    // Load JS
    if (!(window as any).L) {
      const jsLoaded = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('JS load failed'));
        document.head.appendChild(script);
      });
      
      await jsLoaded;
    }
  }

  private initializeMap() {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Not running in browser environment');
      return;
    }

    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('Map container not available');
      this.mapLoading.set(false);
      return;
    }

    try {
      const L = (window as any).L;
      if (!L) {
        console.error('Leaflet library not loaded');
        this.mapLoading.set(false);
        return;
      }

      console.log('Initializing map...', {
        container: this.mapContainer.nativeElement,
        center: this.initialCenter,
        zoom: this.initialZoom
      });

      // Initialize map using the ViewChild element
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.initialCenter.lat, this.initialCenter.lng],
        zoom: this.initialZoom,
        preferCanvas: true,
        renderer: L.svg()
      });

      console.log('Map instance created:', this.map);

      // Add OpenStreetMap tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        tileSize: 256,
        zoomOffset: 0
      });
      
      tileLayer.addTo(this.map);
      console.log('Tile layer added to map');
      
      // Add tile layer events for debugging
      tileLayer.on('loading', () => console.log('Tiles loading...'));
      tileLayer.on('load', () => console.log('Tiles loaded successfully'));
      tileLayer.on('tileerror', (e: any) => console.error('Tile load error:', e));

      // Add click handler
      this.map.on('click', (e: any) => this.onMapClick(e));

      // Force map resize after a short delay
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Map initialized successfully');
        }
      }, 100);

      // Load initial locations if provided
      this.loadInitialLocations();
      
      this.mapLoading.set(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapLoading.set(false);
    }
  }

  private loadInitialLocations() {
    const locations: MapLocation[] = [];

    if (this.startLocation?.coordinates) {
      locations.push({
        coordinates: this.startLocation.coordinates,
        locationData: this.startLocation,
        type: 'start'
      });
    }

    if (this.endLocation?.coordinates) {
      locations.push({
        coordinates: this.endLocation.coordinates,
        locationData: this.endLocation,
        type: 'end'
      });
    }

    this.waypoints.forEach((waypoint, index) => {
      if (waypoint.coordinates) {
        locations.push({
          coordinates: waypoint.coordinates,
          locationData: waypoint,
          type: 'waypoint',
          waypointIndex: index
        });
      }
    });

    locations.forEach(location => {
      this.addMarkerToMap(location);
    });

    this.selectedLocations.set(locations);
  }

  private onMapClick(e: any) {
    const coordinates: MapCoordinates = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };

    const selectionMode = this.currentSelectionMode();
    let waypointIndex: number | undefined;

    if (selectionMode === 'waypoint') {
      waypointIndex = this.waypointCounter++;
    }

    // Create map location
    const mapLocation: MapLocation = {
      coordinates,
      type: selectionMode,
      waypointIndex
    };

    // Remove existing location of the same type (except waypoints)
    if (selectionMode !== 'waypoint') {
      this.removeExistingLocation(selectionMode);
    }

    // Add marker to map
    this.addMarkerToMap(mapLocation);

    // Update selected locations
    const currentLocations = this.selectedLocations();
    this.selectedLocations.set([...currentLocations, mapLocation]);

    // Reverse geocode the coordinates
    this.mapService.reverseGeocode(coordinates).subscribe(locationData => {
      if (locationData) {
        mapLocation.locationData = locationData;
        // Update the marker popup with address
        this.updateMarkerPopup(mapLocation);
        
        // Emit selection event
        this.locationSelected.emit({
          coordinates,
          locationData,
          selectionType: selectionMode,
          waypointIndex
        });
      } else {
        // Emit selection event without address
        this.locationSelected.emit({
          coordinates,
          selectionType: selectionMode,
          waypointIndex
        });
      }
    });

    // Auto-advance selection mode
    if (selectionMode === 'start') {
      this.setSelectionMode('end');
    }
  }

  private removeExistingLocation(type: 'start' | 'end') {
    const currentLocations = this.selectedLocations();
    const existingLocation = currentLocations.find(loc => loc.type === type);
    
    if (existingLocation) {
      this.removeLocationMarker(existingLocation);
      const updatedLocations = currentLocations.filter(loc => loc.type !== type);
      this.selectedLocations.set(updatedLocations);
    }
  }

  private addMarkerToMap(location: MapLocation) {
    if (!this.map) return;

    const L = (window as any).L;
    const { coordinates, type } = location;

    // Create custom icon based on type
    const iconConfig = this.getMarkerIcon(type);
    const iconSymbol = this.getIconSymbol(iconConfig.icon);
    const customIcon = L.divIcon({
      className: `custom-marker ${type}-marker`,
      html: `<div class="marker-content">
               <div class="marker-icon">${iconSymbol}</div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    // Create marker
    const marker = L.marker([coordinates.lat, coordinates.lng], { 
      icon: customIcon 
    }).addTo(this.map);

    // Add popup
    const popupContent = this.getMarkerPopupContent(location);
    marker.bindPopup(popupContent);

    // Store marker reference
    const markerId = this.getLocationId(location);
    this.markers.set(markerId, marker);
    location.marker = marker;
  }

  private updateMarkerPopup(location: MapLocation) {
    if (location.marker) {
      const popupContent = this.getMarkerPopupContent(location);
      location.marker.setPopupContent(popupContent);
    }
  }

  private removeLocationMarker(location: MapLocation) {
    const markerId = this.getLocationId(location);
    const marker = this.markers.get(markerId);
    
    if (marker && this.map) {
      this.map.removeLayer(marker);
      this.markers.delete(markerId);
    }
  }

  private getLocationId(location: MapLocation): string {
    if (location.type === 'waypoint' && location.waypointIndex !== undefined) {
      return `${location.type}-${location.waypointIndex}`;
    }
    return location.type;
  }

  private getMarkerIcon(type: 'start' | 'end' | 'waypoint') {
    const icons = {
      start: { icon: 'play_arrow', color: '#22c55e' },
      end: { icon: 'flag', color: '#ef4444' },
      waypoint: { icon: 'place', color: '#f59e0b' }
    };
    return icons[type];
  }

  private getMarkerPopupContent(location: MapLocation): string {
    const typeLabel = this.getLocationTypeLabel(location.type, location.waypointIndex);
    const address = location.locationData?.address || 'Loading address...';
    const coords = `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`;
    
    return `
      <div class="marker-popup">
        <strong>${typeLabel}</strong><br>
        <small>${address}</small><br>
        <small>${coords}</small>
      </div>
    `;
  }

  setSelectionMode(mode: 'start' | 'end' | 'waypoint') {
    this.currentSelectionMode.set(mode);
  }

  centerOnUserLocation() {
    this.mapService.getCurrentLocation().subscribe(location => {
      if (location && this.map) {
        this.map.setView([location.lat, location.lng], 15);
      }
    });
  }

  clearAllMarkers() {
    this.selectedLocations().forEach(location => {
      this.removeLocationMarker(location);
    });
    this.selectedLocations.set([]);
    this.waypointCounter = 0;
    this.locationRemoved.emit();
  }

  removeLocation(location: MapLocation) {
    this.removeLocationMarker(location);
    const currentLocations = this.selectedLocations();
    const updatedLocations = currentLocations.filter(loc => 
      this.getLocationId(loc) !== this.getLocationId(location)
    );
    this.selectedLocations.set(updatedLocations);
    this.locationRemoved.emit(location);
  }

  fitBoundsToMarkers() {
    if (!this.map || this.selectedLocations().length === 0) return;

    const L = (window as any).L;
    const bounds = L.latLngBounds();
    
    this.selectedLocations().forEach(location => {
      bounds.extend([location.coordinates.lat, location.coordinates.lng]);
    });
    
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }

  getInstructionText(): string {
    const mode = this.currentSelectionMode();
    const instructions = {
      start: 'Click on the map to select start location',
      end: 'Click on the map to select end location', 
      waypoint: 'Click on the map to add waypoint'
    };
    return instructions[mode];
  }

  getLocationIcon(type: 'start' | 'end' | 'waypoint'): string {
    const icons = {
      start: 'play_circle',
      end: 'stop_circle',
      waypoint: 'location_on'
    };
    return icons[type];
  }

  getLocationTypeLabel(type: 'start' | 'end' | 'waypoint', waypointIndex?: number): string {
    if (type === 'waypoint' && waypointIndex !== undefined) {
      return `Waypoint ${waypointIndex + 1}`;
    }
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Location';
  }

  private getIconSymbol(iconName: string): string {
    // Use Material Icons font classes instead of unicode/emoji
    return `<span class="material-icons">${iconName}</span>`;
  }
}
