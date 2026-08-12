import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api, { ApiResponse } from '../api';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role?: string;
  active?: boolean;
  base?: {
    name: string;
  } | null;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
        setUsers(res.data.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Users</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage demo users and roles.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{user.role}</span>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300">Username: {user.username}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Base: {user.base ? user.base.name : 'Global'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Status: {user.active ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
