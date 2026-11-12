import * as L from 'leaflet';
import { DEFAULT_CENTER, GeoLocation } from './geo-location';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; OpenStreetMap contributors';
const DEFAULT_ZOOM = 11;
const MAX_ZOOM = 19;

export type MarkerKind = 'start' | 'end' | 'waypoint' | 'selected';

const MARKER_COLORS: Record<MarkerKind, string> = {
  start: '#16a34a',
  end: '#dc2626',
  waypoint: '#2563eb',
  selected: '#7c3aed',
};

export function createMap(host: HTMLElement): L.Map {
  const leafletMap = L.map(host, { zoomControl: true }).setView(
    [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude],
    DEFAULT_ZOOM,
  );
  L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(leafletMap);
  const resizeObserver = new ResizeObserver(() => leafletMap.invalidateSize());
  resizeObserver.observe(host);
  leafletMap.on('unload', () => resizeObserver.disconnect());
  return leafletMap;
}

export function marker(location: GeoLocation, kind: MarkerKind): L.CircleMarker {
  const label = document.createElement('span');
  label.textContent = location.address;
  return L.circleMarker([location.latitude, location.longitude], {
    radius: kind === 'waypoint' ? 6 : 9,
    color: MARKER_COLORS[kind],
    fillColor: MARKER_COLORS[kind],
    fillOpacity: 0.85,
    weight: 2,
  }).bindTooltip(label);
}

export function fitTo(leafletMap: L.Map, locations: readonly GeoLocation[]): void {
  if (locations.length === 1) {
    leafletMap.setView([locations[0].latitude, locations[0].longitude], 14);
  } else if (locations.length > 1) {
    leafletMap.fitBounds(L.latLngBounds(locations.map(location => [location.latitude, location.longitude])), {
      padding: [32, 32],
    });
  }
}
