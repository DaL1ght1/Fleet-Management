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
import { createMap } from './leaflet-map';
import { Zone, ZoneKind, ZONE_COLORS, ZonePoint, zoneLayer } from './zone';

export type DrawMode = 'polygon' | 'circle' | null;

@Component({
  selector: 'app-zone-map',
  template: `<div #host class="map"></div>`,
  styles: `
    :host {
      display: block;
    }
    .map {
      block-size: 100%;
      min-block-size: 360px;
      border-radius: var(--radius-surface);
      border: 1px solid var(--line);
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneMapComponent {
  readonly zones = input<readonly Zone[]>([]);
  readonly drawMode = input<DrawMode>(null);
  readonly draftKind = input<ZoneKind>('SERVICE_AREA');
  readonly draftPolygon = input<readonly ZonePoint[]>([]);
  readonly draftCenter = input<ZonePoint | null>(null);
  readonly draftRadiusMeters = input<number | null>(null);
  readonly pointPicked = output<ZonePoint>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly leafletMap = signal<L.Map | null>(null);
  private readonly zonesLayer = L.featureGroup();
  private readonly draftLayer = L.layerGroup();
  private fitted = false;

  constructor() {
    afterNextRender(() => {
      const created = createMap(this.host().nativeElement);
      this.zonesLayer.addTo(created);
      this.draftLayer.addTo(created);
      created.on('click', event => {
        if (this.drawMode()) {
          this.pointPicked.emit({ latitude: event.latlng.lat, longitude: event.latlng.lng });
        }
      });
      this.leafletMap.set(created);
    });
    inject(DestroyRef).onDestroy(() => this.leafletMap()?.remove());
    effect(() => this.renderZones());
    effect(() => this.renderDraft());
  }

  private renderZones(): void {
    const leafletMap = this.leafletMap();
    const zones = this.zones();
    if (!leafletMap) {
      return;
    }
    this.zonesLayer.clearLayers();
    zones.forEach(zone => zoneLayer(zone)?.addTo(this.zonesLayer));
    if (!this.fitted && zones.length) {
      leafletMap.fitBounds(this.zonesLayer.getBounds(), { padding: [32, 32], maxZoom: 14 });
      this.fitted = true;
    }
  }

  private renderDraft(): void {
    const leafletMap = this.leafletMap();
    if (!leafletMap) {
      return;
    }
    this.draftLayer.clearLayers();
    const color = ZONE_COLORS[this.draftKind()];
    const polygon = this.draftPolygon();
    const center = this.draftCenter();
    const radius = this.draftRadiusMeters();
    if (this.drawMode() === 'polygon' && polygon.length) {
      const points = polygon.map(point => [point.latitude, point.longitude] as L.LatLngTuple);
      (points.length > 2 ? L.polygon(points, { color, weight: 3 }) : L.polyline(points, { color, weight: 3 })).addTo(
        this.draftLayer,
      );
      points.forEach(point => L.circleMarker(point, { radius: 5, color }).addTo(this.draftLayer));
    }
    if (this.drawMode() === 'circle' && center) {
      L.circleMarker([center.latitude, center.longitude], { radius: 5, color }).addTo(this.draftLayer);
      if (radius) {
        L.circle([center.latitude, center.longitude], { radius, color, weight: 3 }).addTo(this.draftLayer);
      }
    }
  }
}
