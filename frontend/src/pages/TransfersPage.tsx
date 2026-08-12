import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import NavBar from '../components/NavBar';

type Transfer = {
  id: string;
  transferNumber: string;
  quantity: number;
  reason: string;
  priority: string;
  status: string;
  createdAt: string;
  sourceBase: { name: string };
  destinationBase: { name: string };
  equipmentType: { name: string };
  requestedBy: { firstName: string; lastName: string };
};

const TransfersPage = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: 1, reason: '', priority: '', notes: '' });

  useEffect(() => {
    const loadTransfers = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ transfers: Transfer[] }>>('/transfers');
        setTransfers(res.data.data.transfers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<ApiResponse<{ transfer: Transfer }>>('/transfers', form);
      setForm({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: 1, reason: '', priority: '', notes: '' });
      const res = await api.get<ApiResponse<{ transfers: Transfer[] }>>('/transfers');
      setTransfers(res.data.data.transfers || []);
    } catch (err) {
      console.error(err);
      alert('Failed to create transfer request.');
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
              <h1 className="text-3xl font-semibold">Transfers</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and review transfer requests.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.sourceBaseId} onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })} placeholder="Source Base ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.destinationBaseId} onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })} placeholder="Destination Base ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} placeholder="Equipment Type ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} placeholder="Priority" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Saving...' : 'Create Transfer'}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {loading ? (
              <p>Loading transfers...</p>
            ) : (
              <div className="grid gap-4">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{transfer.transferNumber}</h2>
                        <p className="text-slate-600 dark:text-slate-400">{transfer.equipmentType.name} • {transfer.sourceBase.name} → {transfer.destinationBase.name}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{transfer.status}</span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Qty: {transfer.quantity} • Priority: {transfer.priority}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Requested by: {transfer.requestedBy.firstName} {transfer.requestedBy.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(transfer.createdAt).toLocaleDateString()}</p>
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

export default TransfersPage;
