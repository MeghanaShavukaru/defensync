import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import NavBar from '../components/NavBar';

type Expenditure = {
  id: string;
  expenditureNumber: string;
  quantity: number;
  category: string;
  activityReference?: string;
  expenditureDate: string;
  status?: string;
  base: { name: string };
  equipmentType: { name: string };
  createdBy: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string } | null;
};

const ExpendituresPage = () => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: 1, category: '', activityReference: '', expenditureDate: '', notes: '' });

  useEffect(() => {
    const loadExpenditures = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ expenditures: Expenditure[] }>>('/expenditures');
        setExpenditures(res.data.data.expenditures || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadExpenditures();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<ApiResponse<{ expenditure: Expenditure }>>('/expenditures', form);
      setForm({ baseId: '', equipmentTypeId: '', quantity: 1, category: '', activityReference: '', expenditureDate: '', notes: '' });
      const res = await api.get<ApiResponse<{ expenditures: Expenditure[] }>>('/expenditures');
      setExpenditures(res.data.data.expenditures || []);
    } catch (err) {
      console.error(err);
      alert('Failed to create expenditure.');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    setLoading(true);
    try {
      await api.post(`/expenditures/${id}/approve`);
      const res = await api.get<ApiResponse<{ expenditures: Expenditure[] }>>('/expenditures');
      setExpenditures(res.data.data.expenditures || []);
    } catch (err) {
      console.error(err);
      alert('Failed to approve expenditure.');
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
              <h1 className="text-3xl font-semibold">Expenditures</h1>
              <p className="text-slate-600 dark:text-slate-400">Record spending requests and approvals.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })} placeholder="Base ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} placeholder="Equipment Type ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.activityReference} onChange={(e) => setForm({ ...form, activityReference: e.target.value })} placeholder="Activity Reference" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" value={form.expenditureDate} onChange={(e) => setForm({ ...form, expenditureDate: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Saving...' : 'Create Expenditure'}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {loading ? (
              <p>Loading expenditures...</p>
            ) : (
              <div className="grid gap-4">
                {expenditures.map((expenditure) => (
                  <div key={expenditure.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{expenditure.expenditureNumber}</h2>
                        <p className="text-slate-600 dark:text-slate-400">{expenditure.equipmentType.name} • {expenditure.base.name}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {expenditure.approvedBy ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Category: {expenditure.category}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {expenditure.quantity} • Date: {new Date(expenditure.expenditureDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created by: {expenditure.createdBy.firstName} {expenditure.createdBy.lastName}</p>
                    <button onClick={() => approve(expenditure.id)} disabled={loading || !!expenditure.approvedBy} className="mt-3 rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-60">
                      Approve
                    </button>
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

export default ExpendituresPage;
