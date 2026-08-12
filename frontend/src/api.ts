import axios from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown[];
};

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
