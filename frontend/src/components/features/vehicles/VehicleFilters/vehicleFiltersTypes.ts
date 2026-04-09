export type VehicleFiltersState = {
  availabilityType: string;
  brand: string;
  fuelType: string;
  maxPrice: number;
};

export const DEFAULT_FILTERS: VehicleFiltersState = {
  availabilityType: '',
  brand: '',
  fuelType: '',
  maxPrice: 0,
};
