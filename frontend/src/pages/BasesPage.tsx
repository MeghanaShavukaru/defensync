import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api, { ApiResponse } from '../api';

type Base = {
  id: string;
  code: string;
  name: string;
  location: string;
  status?: string;
  description?: string;
  commander?: {
    firstName: string;
    lastName: string;
  } | null;
};

const BasesPage = () => {
  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBases = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ bases: Base[] }>>('/bases');
        setBases(res.data.data.bases || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBases();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Bases</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage fictional bases and assigned commanders.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading bases...</p>
          ) : (
            <div className="grid gap-4">
              {bases.map((base) => (
                <div key={base.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{base.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{base.code}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{base.status}</span>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300">{base.location}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{base.description || 'No description available.'}</p>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Commander: {base.commander ? `${base.commander.firstName} ${base.commander.lastName}` : 'Unassigned'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BasesPage;
