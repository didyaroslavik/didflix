import client from './client';
import type { User } from '../types';

// Store token in memory for Safari fallback
let memoryToken: string | null = null;

export function setMemoryToken(token: string | null) {
  memoryToken = token;
  if (token) {
    localStorage.setItem('didflix-token', token);
  } else {
    localStorage.removeItem('didflix-token');
  }
}

export function getMemoryToken(): string | null {
  return memoryToken || localStorage.getItem('didflix-token');
}

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
    if (res.data.token) setMemoryToken(res.data.token);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await client.post<{ user: User; token?: string }>(
      '/auth/login',
      data
    );
    if (res.data.token) setMemoryToken(res.data.token);
    return res.data;
  },

  logout: async () => {
    await client.post('/auth/logout');
    setMemoryToken(null);
  },

  me: async () => {
    const res = await client.get<{ user: User }>('/auth/me');
    return res.data;
  },
};