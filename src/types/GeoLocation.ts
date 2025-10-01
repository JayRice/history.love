export type GeoLocation = {
  id: string;
  label: string;
  rawQuery?: string;
  latitude?: number;
  longitude?: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  countryCode?: string | null;
};