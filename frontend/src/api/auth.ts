import client from './client';
import type { User } from '../types';

export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }) => {
    const res = await client.post<{ user: User }>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<{ user: User }>('/auth/login', data);
    return res.data;
  },

  logout: async () => {
    await client.post('/auth/logout');
  },

  me: async () => {
    const res = await client.get<{ user: User }>('/auth/me');
    return res.data;
  },
};