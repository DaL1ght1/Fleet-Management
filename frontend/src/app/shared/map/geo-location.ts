export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export const DEFAULT_CENTER: GeoLocation = { latitude: 36.8065, longitude: 10.1815, address: 'Tunis' };
