import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import { useAuth } from '../hooks/useAuth';

type Asset = {
  id: string;
  assetCode: string;
  serialNumber?: string;
  quantity: number;
  status: string;
  acquisitionDate: string;
};

const AssetsPage = () => {
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetCode: '', equipmentTypeId: '', baseId: '', acquisitionDate: '' });

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAssets = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ assets: Asset[] }>>('/assets');
        setAssets(res.data.data.assets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [isAuthenticated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<{ asset: Asset }>>('/assets', {
        ...form,
      });
      setAssets(prev => [res.data.data.asset, ...prev]);
      setForm({ assetCode: '', equipmentTypeId: '', baseId: '', acquisitionDate: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create asset. Ensure you are authorized and IDs are valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl p-6">
        <h2 className="text-2xl font-semibold">Assets</h2>

        <form onSubmit={submit} className="my-4 flex flex-col gap-2 max-w-md">
        <input value={form.assetCode} onChange={e => setForm({ ...form, assetCode: e.target.value })} placeholder="Asset Code" className="rounded p-2 border" />
        <input value={form.equipmentTypeId} onChange={e => setForm({ ...form, equipmentTypeId: e.target.value })} placeholder="EquipmentTypeId (UUID)" className="rounded p-2 border" />
        <input value={form.baseId} onChange={e => setForm({ ...form, baseId: e.target.value })} placeholder="BaseId (UUID)" className="rounded p-2 border" />
        <input type="date" value={form.acquisitionDate} onChange={e => setForm({ ...form, acquisitionDate: e.target.value })} className="rounded p-2 border" />
        <button className="rounded bg-slate-900 text-white px-4 py-2">Create Asset</button>
      </form>

        {loading ? <p>Loading...</p> : (
          <div className="grid gap-3">
            {assets.map(a => (
              <div key={a.id} className="rounded border p-3 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.assetCode}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{a.serialNumber || '—'}</div>
                  </div>
                  <div className="text-sm">Qty: {a.quantity}</div>
                </div>
                <div className="text-xs text-slate-500 mt-2">Status: {a.status} • Acquired: {new Date(a.acquisitionDate).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsPage;
