import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`;

export type RegisterData = {
  email: string;
  plainPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type RegisteredUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export async function register(data: RegisterData): Promise<RegisteredUser> {
  const { data: user } = await axios.post<RegisteredUser>(`${API_BASE}/register`, data);
  return user;
}
