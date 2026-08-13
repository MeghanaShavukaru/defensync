import axios from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown[];
};

const configuredBaseUrl = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const baseURL = configuredBaseUrl
  ? `${configuredBaseUrl.replace(/\/$/, '')}${configuredBaseUrl.endsWith('/api') ? '' : '/api'}`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
