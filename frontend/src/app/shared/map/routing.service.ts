import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../../core/http/silent-errors';
import { GeoLocation } from './geo-location';

export interface Route {
  distanceKm: number;
  durationMinutes: number;
  path: readonly [number, number][];
}

interface OsrmResponse {
  code: string;
  routes: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
}

@Injectable({ providedIn: 'root' })
export class RoutingService {
  private readonly http = inject(HttpClient);

  route(from: GeoLocation, to: GeoLocation): Observable<Route | null> {
    const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
    return this.http
      .get<OsrmResponse>(`${environment.routingUrl}/route/v1/driving/${coordinates}`, {
        params: { overview: 'full', geometries: 'geojson' },
        context: new HttpContext().set(SILENT_ERRORS, true),
      })
      .pipe(
        map(response => {
          const route = response.code === 'Ok' ? response.routes[0] : undefined;
          return route
            ? {
                distanceKm: Math.round(route.distance / 100) / 10,
                durationMinutes: Math.max(1, Math.round(route.duration / 60)),
                path: route.geometry.coordinates.map(
                  ([longitude, latitude]) => [latitude, longitude] as [number, number],
                ),
              }
            : null;
        }),
        catchError(() => of(null)),
      );
  }
}
