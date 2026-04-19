import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8082'}/api`;

export type RegisterData = {
  email: string;
  plainPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  rgpdConsent: boolean;
};

export type RegisteredUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  rgpdConsent: boolean;
};

export async function register(data: RegisterData): Promise<RegisteredUser> {
  const { data: user } = await axios.post<RegisteredUser>(`${API_BASE}/register`, data);
  return user;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await axios.post<{ token: string }>(`${API_BASE}/login`, { email, password });
  return data.token;
}
