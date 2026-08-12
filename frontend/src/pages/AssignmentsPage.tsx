import { useEffect, useState } from 'react';
import api, { ApiResponse } from '../api';
import NavBar from '../components/NavBar';

type Assignment = {
  id: string;
  assignmentNumber: string;
  quantity: number;
  assigneeName: string;
  purpose: string;
  status: string;
  assignedDate: string;
  expectedReturn: string;
  asset: { assetCode: string };
  base: { name: string };
  assignedBy: { firstName: string; lastName: string };
};

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetId: '', baseId: '', quantity: 1, assigneeName: '', unit: '', purpose: '', assignedDate: '', expectedReturn: '', notes: '' });

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ assignments: Assignment[] }>>('/assignments');
        setAssignments(res.data.data.assignments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post<ApiResponse<{ assignment: Assignment }>>('/assignments', form);
      setForm({ assetId: '', baseId: '', quantity: 1, assigneeName: '', unit: '', purpose: '', assignedDate: '', expectedReturn: '', notes: '' });
      const res = await api.get<ApiResponse<{ assignments: Assignment[] }>>('/assignments');
      setAssignments(res.data.data.assignments || []);
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment.');
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
              <h1 className="text-3xl font-semibold">Assignments</h1>
              <p className="text-slate-600 dark:text-slate-400">Track allocated assets and returns.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} placeholder="Asset ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })} placeholder="Base ID" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.assigneeName} onChange={(e) => setForm({ ...form, assigneeName: e.target.value })} placeholder="Assignee Name" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Unit" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose" className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input type="date" value={form.assignedDate} onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
              <input type="date" value={form.expectedReturn} onChange={(e) => setForm({ ...form, expectedReturn: e.target.value })} className="rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="h-24 rounded border border-slate-200 bg-slate-50 px-4 py-3" />
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Saving...' : 'Create Assignment'}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">
            {loading ? (
              <p>Loading assignments...</p>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-3xl border border-slate-200 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{assignment.assignmentNumber}</h2>
                        <p className="text-slate-600 dark:text-slate-400">{assignment.asset.assetCode} • {assignment.base.name}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{assignment.status}</span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Assignee: {assignment.assigneeName} • Purpose: {assignment.purpose}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Quantity: {assignment.quantity} • Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Expected Return: {new Date(assignment.expectedReturn).toLocaleDateString()}</p>
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

export default AssignmentsPage;
