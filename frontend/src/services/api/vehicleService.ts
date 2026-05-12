import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`;

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

  const { data } = await axios.get<VehicleCollection>(`${API_BASE}/vehicles`, { params });
  return data;
}

export async function fetchVehicleById(id: number): Promise<Vehicle> {
  const { data } = await axios.get<Vehicle>(`${API_BASE}/vehicles/${id}`);
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
  const { data } = await axios.post<Vehicle>(`${API_BASE}/vehicles`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function updateVehicle(token: string, id: number, payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await axios.put<Vehicle>(`${API_BASE}/vehicles/${id}`, payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function deleteVehicle(token: string, id: number): Promise<void> {
  await axios.delete(`${API_BASE}/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
