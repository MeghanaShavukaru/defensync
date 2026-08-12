import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api, { ApiResponse } from '../api';

type Supplier = {
  id: string;
  name: string;
  supplierCode?: string;
  status?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ suppliers: Supplier[] }>>('/suppliers');
        setSuppliers(res.data.data.suppliers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Suppliers</h1>
              <p className="text-slate-600 dark:text-slate-400">View fictional supplier partners for demo purchases.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading suppliers...</p>
          ) : (
            <div className="grid gap-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{supplier.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{supplier.supplierCode}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{supplier.status}</span>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300">Contact: {supplier.contactPerson || 'N/A'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{supplier.email || 'No email'} • {supplier.phone || 'No phone'}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{supplier.address || 'No address provided.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuppliersPage;
