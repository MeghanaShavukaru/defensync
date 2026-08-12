import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import BasesPage from './pages/BasesPage';
import EquipmentTypesPage from './pages/EquipmentTypesPage';
import SuppliersPage from './pages/SuppliersPage';
import UsersPage from './pages/UsersPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExpendituresPage from './pages/ExpendituresPage';
import MaintenancePage from './pages/MaintenancePage';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
        <Route path="/bases" element={<ProtectedRoute><BasesPage /></ProtectedRoute>} />
        <Route path="/equipment-types" element={<ProtectedRoute><EquipmentTypesPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
        <Route path="/expenditures" element={<ProtectedRoute><ExpendituresPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
