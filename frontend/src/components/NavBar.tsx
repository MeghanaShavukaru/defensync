import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-xl font-bold">DefenSync AI</Link>
          <nav className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</Link>
            <Link to="/assets" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Assets</Link>
            <Link to="/bases" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Bases</Link>
            <Link to="/equipment-types" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Equipment Types</Link>
            <Link to="/suppliers" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Suppliers</Link>
            <Link to="/users" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Users</Link>
            <Link to="/purchases" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Purchases</Link>
            <Link to="/transfers" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Transfers</Link>
            <Link to="/assignments" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Assignments</Link>
            <Link to="/expenditures" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Expenditures</Link>
            <Link to="/maintenance" className="px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Maintenance</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm text-slate-700 dark:text-slate-200">
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </div>
          <button onClick={logout} className="rounded bg-slate-900 px-3 py-1 text-white text-sm">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
