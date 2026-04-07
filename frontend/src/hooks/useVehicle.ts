import { useQuery } from '@tanstack/react-query';
import { fetchVehicleById } from '../services/api/vehicleService';

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id),
  });
}
