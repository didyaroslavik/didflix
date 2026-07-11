import client from './client';
import { tokenStore } from './tokenStore';
import type { User } from '../types';

export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }) => {
    const res = await client.post<{ user: User; token?: string }>(
      '/auth/register',
      data
    );
    if (res.data.token) tokenStore.set(res.data.token);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<{ user: User; token?: string }>(
      '/auth/login',
      data
    );
    if (res.data.token) tokenStore.set(res.data.token);
    return res.data;
  },

  logout: async () => {
    await client.post('/auth/logout');
    tokenStore.clear();
  },

  me: async () => {
    const res = await client.get<{ user: User }>('/auth/me');
    return res.data;
  },
};