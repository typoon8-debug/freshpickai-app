export type LatLng = {
  lat: number;
  lng: number;
};

export type DistanceM = number;

export type GeocodeResult = {
  lat: number;
  lng: number;
  address: string;
  roadAddress?: string;
};

export type StoreInRange = {
  store_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  delivery_radius_m: number;
  distance_m: number | null;
  in_range: boolean;
};

export type RiderNearbyStore = {
  store_id: string;
  name: string;
  address: string;
  distance_m: number;
};
