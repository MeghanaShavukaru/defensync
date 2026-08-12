import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import NavBar from '../components/NavBar';

type MaintenanceRecord = {
  id: string;
  maintenanceId: string;
  maintenanceType: string;
  issue: string;
  status: string;
  startDate: string;
  expectedCompletion: string;
  asset: { assetCode: string };
};

const MaintenancePage = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetId: '', maintenanceType: '', issue: '', description: '', technician: '', startDate: '', expectedCompletion: '', cost: 0, partsNotes: '', nextServiceDate: '', notes: '' });

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ records: MaintenanceRecord[] }>>('/maintenance');
        setRecords(res.data.data.records || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<ApiResponse<{ record: MaintenanceRecord }>>('/maintenance', form);
      setForm({ assetId: '', maintenanceType: '', issue: '', description: '', technician: '', startDate: '', expectedCompletion: '', cost: 0, partsNotes: '', nextServiceDate: '', notes: '' });
      const res = await api.get<ApiResponse<{ records: MaintenanceRecord[] }>>('/maintenance');
      setRecords(res.data.data.records || []);
    } catch (err) {
      console.error(err);
      alert('Failed to create maintenance record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Maintenance</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and monitor scheduled maintenance.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} placeholder="Asset ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })} placeholder="Maintenance Type" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Issue" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} placeholder="Technician" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" value={form.expectedCompletion} onChange={(e) => setForm({ ...form, expectedCompletion: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="number" min={0} value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} placeholder="Cost" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <textarea value={form.partsNotes} onChange={(e) => setForm({ ...form, partsNotes: e.target.value })} placeholder="Parts Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Saving...' : 'Create Maintenance'}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {loading ? (
              <p>Loading maintenance records...</p>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <div key={record.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{record.maintenanceId}</h2>
                        <p className="text-slate-600 dark:text-slate-400">{record.asset.assetCode}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{record.status}</span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Type: {record.maintenanceType}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Issue: {record.issue}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Start: {new Date(record.startDate).toLocaleDateString()} • Expected: {new Date(record.expectedCompletion).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaintenancePage;
