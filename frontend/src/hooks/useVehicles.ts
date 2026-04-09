import { useQuery } from '@tanstack/react-query';
import { fetchVehicles } from '../services/api/vehicleService';
import type { VehicleFilters } from '../services/api/vehicleService';

export function useVehicles(page = 1, filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ['vehicles', page, filters],
    queryFn: () => fetchVehicles(page, filters),
    staleTime: 5 * 60 * 1000,
  });
}
