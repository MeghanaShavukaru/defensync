import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api, { ApiResponse } from '../api';

type EquipmentType = {
  id: string;
  name: string;
  code: string;
  category?: string;
  unitOfMeasure?: string;
  minimumStock?: number;
  criticalStock?: number;
  individuallyTracked?: boolean;
  description?: string;
};

const EquipmentTypesPage = () => {
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ equipmentTypes: EquipmentType[] }>>('/equipment-types');
        setTypes(res.data.data.equipmentTypes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTypes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Equipment Types</h1>
              <p className="text-slate-600 dark:text-slate-400">View and manage equipment categories.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading equipment types...</p>
          ) : (
            <div className="grid gap-4">
              {types.map((type) => (
                <div key={type.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{type.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{type.code}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{type.category}</span>
                  </div>
                  <p className="mt-3 text-slate-700 dark:text-slate-300">{type.description || 'No description available.'}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span>Unit: {type.unitOfMeasure}</span>
                    <span>Min: {type.minimumStock}</span>
                    <span>Critical: {type.criticalStock}</span>
                    <span>Tracked: {type.individuallyTracked ? 'Yes' : 'No'}</span>
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

export default EquipmentTypesPage;
