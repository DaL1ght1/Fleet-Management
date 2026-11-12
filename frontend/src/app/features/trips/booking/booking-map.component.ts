import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { GeoLocation } from '../../../shared/map/geo-location';
import { createMap } from '../../../shared/map/leaflet-map';

export interface PickedPoint {
  latitude: number;
  longitude: number;
}

function pin(label: string, kind: 'from' | 'to'): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="booking-pin" data-kind="${kind}"><span>${label}</span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
  });
}

@Component({
  selector: 'app-booking-map',
  template: `<div #host class="map"></div>`,
  styles: `
    :host {
      display: block;
      block-size: 100%;
    }

    .map {
      block-size: 100%;
      min-block-size: 320px;
      border-radius: var(--radius-panel);
      overflow: hidden;
      cursor: crosshair;
    }

    :host ::ng-deep .booking-pin {
      display: grid;
      place-items: center;
      inline-size: 34px;
      block-size: 34px;
      border-radius: 50% 50% 50% 4px;
      rotate: -45deg;
      background: var(--asphalt-900);
      border: 3px solid #fff;
      box-shadow: 0 6px 16px rgb(0 0 0 / 35%);
      color: #fff;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 15px;
      line-height: 1;
    }

    :host ::ng-deep .booking-pin[data-kind='to'] {
      background: var(--signal-500);
      color: var(--signal-ink);
    }

    :host ::ng-deep .booking-pin > span {
      rotate: 45deg;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingMapComponent {
  readonly from = input<GeoLocation | null>(null);
  readonly to = input<GeoLocation | null>(null);
  readonly path = input<readonly [number, number][] | null>(null);
  readonly picked = output<PickedPoint>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly leafletMap = signal<L.Map | null>(null);
  private readonly markers = L.layerGroup();
  private readonly route = L.layerGroup();

  constructor() {
    afterNextRender(() => {
      const created = createMap(this.host().nativeElement);
      this.route.addTo(created);
      this.markers.addTo(created);
      created.on('click', event => this.picked.emit({ latitude: event.latlng.lat, longitude: event.latlng.lng }));
      this.leafletMap.set(created);
    });
    inject(DestroyRef).onDestroy(() => this.leafletMap()?.remove());
    effect(() => this.render());
  }

  private render(): void {
    const leafletMap = this.leafletMap();
    const from = this.from();
    const to = this.to();
    const path = this.path();
    if (!leafletMap) {
      return;
    }
    this.markers.clearLayers();
    this.route.clearLayers();
    const points: L.LatLngExpression[] = [];
    if (from) {
      L.marker([from.latitude, from.longitude], { icon: pin('A', 'from'), keyboard: false }).addTo(this.markers);
      points.push([from.latitude, from.longitude]);
    }
    if (to) {
      L.marker([to.latitude, to.longitude], { icon: pin('B', 'to'), keyboard: false }).addTo(this.markers);
      points.push([to.latitude, to.longitude]);
    }
    if (path?.length) {
      const line: L.LatLngTuple[] = [...path];
      L.polyline(line, { color: '#1f2830', weight: 9, opacity: 0.85 }).addTo(this.route);
      L.polyline(line, {
        color: '#ffc233',
        weight: 3,
        dashArray: '10 10',
      }).addTo(this.route);
      points.push(...line);
    } else if (from && to) {
      L.polyline(points, { color: '#56636f', weight: 3, dashArray: '4 8' }).addTo(this.route);
    }
    if (points.length === 1) {
      leafletMap.setView(points[0], 14);
    } else if (points.length > 1) {
      leafletMap.fitBounds(L.latLngBounds(points), { padding: [56, 56] });
    }
  }
}
