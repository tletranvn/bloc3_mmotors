import { useQuery } from '@tanstack/react-query';
import { fetchVehicles } from '../services/api/vehicleService';

export function useVehicles(page = 1) {
  return useQuery({
    queryKey: ['vehicles', page],
    queryFn: () => fetchVehicles(page),
  });
}
