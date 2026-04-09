import api from '@/lib/api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};
