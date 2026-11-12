import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SILENT_ERRORS } from '../../core/http/silent-errors';
import { LanguageService } from '../../core/i18n/language.service';
import { DEFAULT_CENTER, GeoLocation } from './geo-location';

interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
}

interface PhotonResponse {
  features: PhotonFeature[];
}

export interface Place extends GeoLocation {
  title: string;
  subtitle: string;
}

const SEARCH_LIMIT = 6;
const PHOTON_LANGUAGES = new Set(['en', 'fr', 'de', 'it']);

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);
  private readonly context = new HttpContext().set(SILENT_ERRORS, true);

  search(query: string, near: GeoLocation = DEFAULT_CENTER): Observable<Place[]> {
    return this.http
      .get<PhotonResponse>(`${environment.geocodingUrl}/api`, {
        params: { q: query, limit: SEARCH_LIMIT, lat: near.latitude, lon: near.longitude, ...this.languageParam() },
        context: this.context,
      })
      .pipe(
        map(response => response.features.map(toPlace)),
        catchError(() => of([])),
      );
  }

  reverse(latitude: number, longitude: number): Observable<Place> {
    const fallback = coordinatesPlace(latitude, longitude);
    return this.http
      .get<PhotonResponse>(`${environment.geocodingUrl}/reverse`, {
        params: { lat: latitude, lon: longitude, ...this.languageParam() },
        context: this.context,
      })
      .pipe(
        map(response => {
          const feature = response.features[0];
          return feature ? { ...toPlace(feature), latitude, longitude } : fallback;
        }),
        catchError(() => of(fallback)),
      );
  }

  private languageParam(): Record<string, string> {
    const code = this.language.current().code;
    return PHOTON_LANGUAGES.has(code) ? { lang: code } : {};
  }
}

function toPlace(feature: PhotonFeature): Place {
  const [longitude, latitude] = feature.geometry.coordinates;
  const properties = feature.properties;
  const street = [properties.housenumber, properties.street].filter(Boolean).join(' ');
  const title = properties.name ?? street ?? properties.city ?? '';
  const city = properties.city ?? properties.county ?? null;
  const subtitle = [title === street ? null : street, properties.district, city, properties.country]
    .filter((part, index, parts): part is string => !!part && part !== title && parts.indexOf(part) === index)
    .join(', ');
  return {
    latitude,
    longitude,
    title: title || subtitle,
    subtitle,
    address: [title, subtitle].filter(Boolean).join(', '),
    city,
    state: properties.state ?? null,
    zipCode: properties.postcode ?? null,
  };
}

function coordinatesPlace(latitude: number, longitude: number): Place {
  const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  return { latitude, longitude, title: label, subtitle: '', address: label };
}
