import axios from 'axios';
import { getMemoryToken } from './auth';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000,
});

// Attach token to every request for Safari compatibility
client.interceptors.request.use(config => {
  const token = getMemoryToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;