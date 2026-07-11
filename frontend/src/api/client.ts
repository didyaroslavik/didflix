import axios from 'axios';
import { tokenStore } from './tokenStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000,
});

client.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;