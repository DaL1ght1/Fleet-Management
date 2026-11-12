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
import { createMap, fitTo, marker } from './leaflet-map';

export interface TrackPoint {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-track-map',
  template: `<div #host class="map"></div>`,
  styles: `
    .map {
      block-size: 300px;
      border-radius: var(--radius-surface);
      border: 1px solid var(--line);
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackMapComponent {
  readonly track = input<readonly TrackPoint[]>([]);
  readonly current = input<TrackPoint | null>(null);
  readonly currentLabel = input('');

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
    const track = this.track();
    const current = this.current();
    if (track.length > 1) {
      L.polyline(
        track.map(point => [point.latitude, point.longitude] as L.LatLngTuple),
        { color: '#2563eb', weight: 4, opacity: 0.8 },
      ).addTo(this.layer);
    }
    if (current) {
      marker({ ...current, address: this.currentLabel() }, 'selected').addTo(this.layer);
    }
    fitTo(
      leafletMap,
      [...track, ...(current ? [current] : [])].map(point => ({ ...point, address: '' })),
    );
  }
}
