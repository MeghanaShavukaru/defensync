import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import NavBar from '../components/NavBar';

type Purchase = {
  id: string;
  purchaseNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: string;
  createdAt: string;
  base: { name: string };
  equipmentType: { name: string };
  supplier: { name: string };
};

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', supplierId: '', quantity: 1, unitCost: 0, purchaseDate: '', expectedDelivery: '', referenceNumber: '', notes: '' });

  useEffect(() => {
    const loadPurchases = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ purchases: Purchase[] }>>('/purchases');
        setPurchases(res.data.data.purchases || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<ApiResponse<{ purchase: Purchase }>>('/purchases', {
        ...form,
        expectedDelivery: form.expectedDelivery || undefined,
      });
      setForm({ baseId: '', equipmentTypeId: '', supplierId: '', quantity: 1, unitCost: 0, purchaseDate: '', expectedDelivery: '', referenceNumber: '', notes: '' });
      const res = await api.get<ApiResponse<{ purchases: Purchase[] }>>('/purchases');
      setPurchases(res.data.data.purchases || []);
    } catch (err) {
      console.error(err);
      alert('Failed to create purchase request.');
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
              <h1 className="text-3xl font-semibold">Purchases</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and review purchase requests.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })} placeholder="Base ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} placeholder="Equipment Type ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} placeholder="Supplier ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="number" min={0} value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} placeholder="Unit Cost" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="date" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} placeholder="Reference Number" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Saving...' : 'Create Purchase'}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {loading ? (
              <p>Loading purchases...</p>
            ) : (
              <div className="grid gap-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{purchase.purchaseNumber}</h2>
                        <p className="text-slate-600 dark:text-slate-400">{purchase.equipmentType.name} • {purchase.base.name}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{purchase.status}</span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Supplier: {purchase.supplier.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {purchase.quantity} • Unit: {purchase.unitCost} • Total: {purchase.totalCost}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(purchase.createdAt).toLocaleDateString()}</p>
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

export default PurchasesPage;
