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
import { Zone, zoneLayer } from './zone';

export interface FleetMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  state: 'moving' | 'idle' | 'stale';
}

const STATE_COLORS: Record<FleetMarker['state'], string> = {
  moving: '#16a34a',
  idle: '#2563eb',
  stale: '#9ca3af',
};

@Component({
  selector: 'app-fleet-map',
  template: `<div #host class="map"></div>`,
  styles: `
    :host {
      display: block;
    }
    .map {
      block-size: 100%;
      min-block-size: 420px;
      border-radius: var(--radius-surface);
      border: 1px solid var(--line);
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetMapComponent {
  readonly markers = input.required<readonly FleetMarker[]>();
  readonly selectedId = input<string | null>(null);
  readonly zones = input<readonly Zone[]>([]);
  readonly selected = output<string>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly leafletMap = signal<L.Map | null>(null);
  private readonly layer = L.layerGroup();
  private readonly zonesLayer = L.layerGroup();
  private fitted = false;

  constructor() {
    afterNextRender(() => {
      const created = createMap(this.host().nativeElement);
      this.zonesLayer.addTo(created);
      this.layer.addTo(created);
      this.leafletMap.set(created);
    });
    inject(DestroyRef).onDestroy(() => this.leafletMap()?.remove());
    effect(() => this.render());
    effect(() => this.renderZones());
  }

  private renderZones(): void {
    const zones = this.zones();
    if (!this.leafletMap()) {
      return;
    }
    this.zonesLayer.clearLayers();
    zones.filter(zone => zone.active).forEach(zone => zoneLayer(zone)?.addTo(this.zonesLayer));
  }

  private render(): void {
    const leafletMap = this.leafletMap();
    const markers = this.markers();
    const selectedId = this.selectedId();
    if (!leafletMap) {
      return;
    }
    this.layer.clearLayers();
    for (const item of markers) {
      const label = document.createElement('span');
      label.textContent = item.label;
      L.circleMarker([item.latitude, item.longitude], {
        radius: item.id === selectedId ? 12 : 9,
        color: item.id === selectedId ? '#111827' : STATE_COLORS[item.state],
        fillColor: STATE_COLORS[item.state],
        fillOpacity: 0.9,
        weight: item.id === selectedId ? 3 : 2,
      })
        .bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -10] })
        .on('click', () => this.selected.emit(item.id))
        .addTo(this.layer);
    }
    if (!this.fitted && markers.length) {
      leafletMap.fitBounds(L.latLngBounds(markers.map(item => [item.latitude, item.longitude])), {
        padding: [48, 48],
        maxZoom: 13,
      });
      this.fitted = true;
    }
  }
}
