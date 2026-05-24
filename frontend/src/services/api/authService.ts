import apiClient from './axiosInstance';

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
  const { data: user } = await apiClient.post<RegisteredUser>(`/register`, data);
  return user;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>(`/login`, { email, password });
  return data.token;
}

export type UpdateProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
};

export async function updateProfile(id: number, data: UpdateProfileData, token: string): Promise<import('../../context/AuthContext').AuthUser> {
  const { data: user } = await apiClient.put(`/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return user;
}
