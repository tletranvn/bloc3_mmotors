import apiClient from './axiosInstance';

export type Vehicle = {
  '@id': string;
  '@type': string;
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  color: string | null;
  salePrice: string | null;
  rentalPriceMonthly: string | null;
  availabilityType: string;
  status: string;
  description: string | null;
  createdAt: string;
  imageUrl: string | null;
  activeSubmissionsCount: number;
};

export type VehicleCollection = {
  member: Vehicle[];
  totalItems: number;
};

export type VehicleFilters = {
  availabilityType?: string;
  brand?: string;
  fuelType?: string;
  maxPrice?: number;
};

export async function fetchVehicles(page = 1, filters: VehicleFilters = {}): Promise<VehicleCollection> {
  // URLSearchParams permet d'envoyer la même clé plusieurs fois
  // ex: availabilityType[]=SALE&availabilityType[]=BOTH
  const params = new URLSearchParams();
  params.append('page', String(page));

  if (filters.availabilityType) {
    // Inclure les véhicules BOTH quand on filtre par SALE ou RENTAL
    params.append('availabilityType[]', filters.availabilityType);
    params.append('availabilityType[]', 'BOTH');
  }

  if (filters.brand) params.append('brand', filters.brand);
  if (filters.fuelType) params.append('fuelType', filters.fuelType);

  if (filters.maxPrice && filters.maxPrice > 0) {
    if (filters.availabilityType === 'RENTAL') {
      params.append('rentalPriceMonthly[lte]', String(filters.maxPrice));
    } else {
      params.append('salePrice[lte]', String(filters.maxPrice));
    }
  }

  const { data } = await apiClient.get<VehicleCollection>(`/vehicles`, { params });
  return data;
}

export async function fetchVehicleById(id: number): Promise<Vehicle> {
  const { data } = await apiClient.get<Vehicle>(`/vehicles/${id}`);
  return data;
}

export type VehiclePayload = {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  color: string | null;
  availabilityType: string;
  status: string;
  description: string | null;
  imageUrl: string | null;
  salePrice: string | null;
  rentalPriceMonthly: string | null;
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/ld+json',
});

export async function createVehicle(token: string, payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>(`/vehicles`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function updateVehicle(token: string, id: number, payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await apiClient.put<Vehicle>(`/vehicles/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function deleteVehicle(token: string, id: number): Promise<void> {
  await apiClient.delete(`/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function toggleVehicleAvailability(token: string, id: number): Promise<Vehicle> {
  const { data } = await apiClient.patch<Vehicle>(
    `/vehicles/${id}/toggle-availability`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/merge-patch+json' } },
  );
  return data;
}
