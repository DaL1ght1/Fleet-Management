import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates?: MapCoordinates;
  placeId?: string;
  formattedAddress?: string;
  country?: string;
  city?: string;
  postalCode?: string;
}

export interface MapRoute {
  startLocation: LocationData;
  endLocation: LocationData;
  distance?: string;
  duration?: string;
  polyline?: string;
}

export interface MapConfig {
  center: MapCoordinates;
  zoom: number;
  mapTypeId?: string;
  styles?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private http = inject(HttpClient);
  
  // Default center for Tunisia
  private readonly DEFAULT_CENTER: MapCoordinates = {
    lat: 33.8869, // Tunisia coordinates
    lng: 9.5375
  };

  private readonly DEFAULT_ZOOM = 10;

  // Cache for geocoded addresses to avoid unnecessary API calls
  private geocodeCache = new Map<string, LocationData>();

  /**
   * Get default map configuration for Tunisia
   */
  getDefaultMapConfig(): MapConfig {
    return {
      center: this.DEFAULT_CENTER,
      zoom: this.DEFAULT_ZOOM,
      mapTypeId: 'roadmap'
    };
  }

  /**
   * Geocode an address to get coordinates
   * Uses browser's Geolocation API as fallback if no API key is available
   */
  geocodeAddress(address: string): Observable<LocationData | null> {
    if (!address?.trim()) {
      return of(null);
    }

    // Check cache first
    const cacheKey = address.toLowerCase().trim();
    if (this.geocodeCache.has(cacheKey)) {
      return of(this.geocodeCache.get(cacheKey)!);
    }

    // For demo purposes, we'll use OpenStreetMap Nominatim API (free)
    // In production, you might want to use Google Maps Geocoding API
    return this.geocodeWithNominatim(address).pipe(
      tap(result => {
        if (result) {
          this.geocodeCache.set(cacheKey, result);
        }
      }),
      catchError(error => {
        console.warn('Geocoding failed:', error);
        // Return basic location data without coordinates
        return of({
          address: address,
          formattedAddress: address
        });
      })
    );
  }

  /**
   * Reverse geocode coordinates to get address
   */
  reverseGeocode(coordinates: MapCoordinates): Observable<LocationData | null> {
    const { lat, lng } = coordinates;
    
    // Use Nominatim for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    return this.http.get<any>(url).pipe(
      map(result => {
        if (result && result.display_name) {
          return {
            address: result.display_name,
            formattedAddress: result.display_name,
            coordinates: { lat, lng },
            city: result.address?.city || result.address?.town || result.address?.village,
            country: result.address?.country,
            postalCode: result.address?.postcode
          };
        }
        return null;
      }),
      catchError(error => {
        console.warn('Reverse geocoding failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Calculate route between two locations
   */
  calculateRoute(start: LocationData, end: LocationData): Observable<MapRoute | null> {
    if (!start.coordinates || !end.coordinates) {
      // If we don't have coordinates, try to geocode first
      return this.geocodeLocationsAndCalculateRoute(start, end);
    }

    // Use OpenRouteService for routing (free tier available)
    // You can also implement Google Maps Directions API here
    return this.calculateRouteWithOpenRoute(start, end);
  }

  /**
   * Get current user location
   */
  getCurrentLocation(): Observable<MapCoordinates | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return of(null);
    }

    return from(new Promise<MapCoordinates | null>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }));
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1: MapCoordinates, coord2: MapCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    } else if (distanceKm < 100) {
      return `${distanceKm.toFixed(1)} km`;
    } else {
      return `${Math.round(distanceKm)} km`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  }

  /**
   * Check if a location is within Tunisia bounds (approximate)
   */
  isLocationInTunisia(coordinates: MapCoordinates): boolean {
    const { lat, lng } = coordinates;
    // Approximate bounds for Tunisia
    return lat >= 30.2 && lat <= 37.5 && lng >= 7.5 && lng <= 11.8;
  }

  // Private methods

  private geocodeWithNominatim(address: string): Observable<LocationData | null> {
    // Add Tunisia bias to search
    const query = encodeURIComponent(`${address}, Tunisia`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=tn`;
    
    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (results && results.length > 0) {
          const result = results[0];
          return {
            address: address,
            formattedAddress: result.display_name,
            coordinates: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            },
            placeId: result.place_id?.toString(),
            city: this.extractCity(result),
            country: 'Tunisia'
          };
        }
        return null;
      })
    );
  }

  private geocodeLocationsAndCalculateRoute(start: LocationData, end: LocationData): Observable<MapRoute | null> {
    // This would involve geocoding both locations first, then calculating route
    // For simplicity, returning estimated data
    const estimatedDistance = this.estimateDistance(start, end);
    const estimatedDuration = this.estimateDuration(estimatedDistance);
    
    return of({
      startLocation: start,
      endLocation: end,
      distance: this.formatDistance(estimatedDistance),
      duration: this.formatDuration(estimatedDuration)
    });
  }

  private calculateRouteWithOpenRoute(start: LocationData, end: LocationData): Observable<MapRoute | null> {
    // OpenRouteService API (requires API key in production)
    // For demo, we'll calculate straight-line distance and estimate
    if (start.coordinates && end.coordinates) {
      const distance = this.calculateDistance(start.coordinates, end.coordinates);
      const duration = this.estimateDuration(distance);
      
      return of({
        startLocation: start,
        endLocation: end,
        distance: this.formatDistance(distance),
        duration: this.formatDuration(duration)
      });
    }
    
    return of(null);
  }

  private estimateDistance(start: LocationData, end: LocationData): number {
    // If we have coordinates, calculate actual distance
    if (start.coordinates && end.coordinates) {
      return this.calculateDistance(start.coordinates, end.coordinates);
    }
    
    // Otherwise, estimate based on city names or return default
    return 25; // Default 25km estimate
  }

  private estimateDuration(distanceKm: number): number {
    // Estimate duration based on average speed (considering city traffic)
    const averageSpeedKmh = 35; // 35 km/h average in urban areas
    return (distanceKm / averageSpeedKmh) * 60; // Convert to minutes
  }

  private extractCity(nominatimResult: any): string | undefined {
    const address = nominatimResult.address;
    if (!address) return undefined;
    
    return address.city || address.town || address.village || address.municipality;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Clear geocoding cache (useful for memory management)
   */
  clearCache(): void {
    this.geocodeCache.clear();
  }

  /**
   * Get map provider specific embed URL
   */
  getMapEmbedUrl(location: LocationData, zoom: number = 15): string {
    if (location.coordinates) {
      // OpenStreetMap embed URL
      const { lat, lng } = location.coordinates;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    }
    
    // Fallback: search-based embed
    const query = encodeURIComponent(location.address);
    return `https://www.openstreetmap.org/search?query=${query}`;
  }

  /**
   * Generate Google Maps URL for external navigation
   */
  getNavigationUrl(destination: LocationData): string {
    if (destination.coordinates) {
      const { lat, lng } = destination.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    
    const query = encodeURIComponent(destination.address);
    return `https://www.google.com/maps/search/${query}`;
  }
}