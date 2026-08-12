import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.firstName}.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <p className="text-slate-700 dark:text-slate-200">This is the initial protected dashboard shell for DefenSync AI.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
