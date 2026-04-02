import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

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

export async function fetchVehicles(page = 1): Promise<VehicleCollection> {
  const { data } = await axios.get<VehicleCollection>(`${API_BASE}/vehicles`, {
    params: { page },
  });
  return data;
}

export async function fetchVehicleById(id: number): Promise<Vehicle> {
  const { data } = await axios.get<Vehicle>(`${API_BASE}/vehicles/${id}`);
  return data;
}
