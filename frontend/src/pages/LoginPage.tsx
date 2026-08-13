import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api, { ApiResponse } from '../api';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = object({
  email: string().email('Please enter a valid email'),
  password: string().min(1, 'Please enter a password'),
});

type LoginForm = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    active: boolean;
    baseId?: string | null;
  };
};

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuthToken, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', values);
      setAuthToken(response.data.data.token);
      setUser(response.data.data.user);
      setErrorMessage(null);
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status: number; data?: { message?: string } };
        request?: unknown;
      };
      if (apiError?.response || apiError?.request) {
        setErrorMessage(
          apiError.response?.data?.message ||
            (apiError.response
              ? `Login failed (server returned ${apiError.response.status})`
              : 'Cannot reach the login server. Check the API URL or try again shortly.'),
        );
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl dark:bg-slate-950 dark:text-slate-100">
        <h1 className="mb-4 text-3xl font-semibold">DefenSync AI</h1>
        <p className="mb-8 text-slate-600 dark:text-slate-300">Secure multi-base asset management and decision support.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-500"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-500"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
