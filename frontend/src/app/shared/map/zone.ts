import * as L from 'leaflet';

export interface ZonePoint {
  latitude: number;
  longitude: number;
}

export type ZoneKind = 'DEPOT' | 'SERVICE_AREA' | 'RESTRICTED';

export interface Zone {
  id: string;
  name: string;
  kind: ZoneKind;
  active: boolean;
  polygon: readonly ZonePoint[] | null;
  center: ZonePoint | null;
  radiusMeters: number | null;
}

export const ZONE_COLORS: Record<ZoneKind, string> = {
  DEPOT: '#2563eb',
  SERVICE_AREA: '#16a34a',
  RESTRICTED: '#dc2626',
};

export function zoneLayer(zone: Zone): L.Layer | null {
  const style: L.PathOptions = {
    color: ZONE_COLORS[zone.kind],
    weight: 2,
    fillOpacity: zone.active ? 0.15 : 0.04,
    dashArray: zone.active ? undefined : '6 6',
  };
  const label = document.createElement('span');
  label.textContent = zone.name;
  if (zone.polygon?.length) {
    return L.polygon(
      zone.polygon.map(point => [point.latitude, point.longitude] as L.LatLngTuple),
      style,
    ).bindTooltip(label, { sticky: true });
  }
  if (zone.center && zone.radiusMeters) {
    return L.circle([zone.center.latitude, zone.center.longitude], { ...style, radius: zone.radiusMeters }).bindTooltip(
      label,
      { sticky: true },
    );
  }
  return null;
}
