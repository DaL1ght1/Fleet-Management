import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { GeoLocation } from './geo-location';
import { createMap, fitTo, marker } from './leaflet-map';

@Component({
  selector: 'app-route-map',
  template: `<div #host class="map"></div>`,
  styles: `
    .map {
      block-size: 320px;
      border-radius: var(--radius-surface);
      border: 1px solid var(--line);
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteMapComponent {
  readonly start = input<GeoLocation | null>(null);
  readonly end = input<GeoLocation | null>(null);
  readonly waypoints = input<readonly GeoLocation[]>([]);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly leafletMap = signal<L.Map | null>(null);
  private readonly layer = L.layerGroup();

  constructor() {
    afterNextRender(() => {
      const created = createMap(this.host().nativeElement);
      this.layer.addTo(created);
      this.leafletMap.set(created);
    });
    inject(DestroyRef).onDestroy(() => this.leafletMap()?.remove());
    effect(() => this.render());
  }

  private render(): void {
    const leafletMap = this.leafletMap();
    if (!leafletMap) {
      return;
    }
    this.layer.clearLayers();
    const start = this.start();
    const end = this.end();
    const stops = [start, ...this.waypoints(), end].filter((stop): stop is GeoLocation => stop !== null);
    this.waypoints().forEach(waypoint => marker(waypoint, 'waypoint').addTo(this.layer));
    if (start) {
      marker(start, 'start').addTo(this.layer);
    }
    if (end) {
      marker(end, 'end').addTo(this.layer);
    }
    if (stops.length > 1) {
      L.polyline(
        stops.map(stop => [stop.latitude, stop.longitude] as L.LatLngTuple),
        { color: '#2563eb', weight: 3, dashArray: '6 6' },
      ).addTo(this.layer);
    }
    fitTo(leafletMap, stops);
  }
}
