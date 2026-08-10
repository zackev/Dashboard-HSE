import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import CrudPage from './components/CrudPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HsePerformancePage from './pages/HsePerformancePage.jsx';
import SopDocuments from './pages/SopDocuments.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { MODULES, VIEW_META } from './config/modules.jsx';
import PermitListPage from './pages/PermitListPage.jsx';
import PermitFormPage from './pages/PermitFormPage.jsx';
import PermitDetailPage from './pages/PermitDetailPage.jsx';
import { api } from './lib/api.js';
import { useAuth } from './context/AuthContext.jsx';

const COUNTABLE_MODULES = [
  'incidents', 'inspections', 'trainings', 'capa', 'hse_performance', 'permits', 'kpis', 'documents',
];

function simplePage(moduleKey, onDataChanged, cfgOverride, extraProps = {}) {
  const [title, subtitle] = VIEW_META[moduleKey];
  return (
    <CrudPage
      moduleKey={moduleKey}
      cfg={cfgOverride || MODULES[moduleKey]}
      title={title}
      subtitle={subtitle}
      onDataChanged={onDataChanged}
      {...extraProps}
    />
  );
}

function FullscreenLoading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Memuat...</div>;
}

/** Layout untuk halaman yang butuh login (sidebar + area konten). */
function AuthedLayout({ counts }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] max-md:grid-cols-1">
      <Sidebar counts={counts} />
      <main className="px-8 pb-16 pt-6 max-sm:px-4">
        <Outlet />
      </main>
    </div>
  );
}

/** Bungkus satu route supaya hanya bisa diakses kalau user punya permission terkait. */
function Guard({ need, altNeed, children }) {
  const { hasPermission } = useAuth();
  const ok = hasPermission(need) || (altNeed && hasPermission(altNeed));
  return ok ? children : <Navigate to="/" replace />;
}

/** Sama seperti Guard, tapi untuk Ijin Kerja yang punya 3 permission terkait sekaligus (Admin/GM/Pemohon). */
function PermitsGuard({ children }) {
  const { hasPermission } = useAuth();
  const ok = hasPermission('permits') || hasPermission('permits_gm') || hasPermission('permits_own');
  return ok ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, hasPermission } = useAuth();
  const [counts, setCounts] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCounts = useCallback(async () => {
    if (!user) return;
    const visible = COUNTABLE_MODULES.filter((key) => {
      if (key === 'permits') return hasPermission('permits') || hasPermission('permits_gm') || hasPermission('permits_own');
      if (key === 'documents') return hasPermission('documents'); // SOP employee tidak butuh badge angka
      return hasPermission(key);
    });
    const entries = await Promise.all(
      visible.map(async (key) => {
        try {
          const { total } = await api.get(`/${key}`);
          return [key, total];
        } catch {
          return [key, 0];
        }
      })
    );
    setCounts(Object.fromEntries(entries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const bump = useCallback(() => {
    loadCounts();
    setRefreshKey((k) => k + 1);
  }, [loadCounts]);

  // Ijin Kerja sekarang dedicated pages (bukan CrudPage generik lagi) -
  // karena strukturnya sudah jauh lebih kompleks (multi-section form,
  // approval 2 tingkat Admin->GM, cetak PDF, izin lembur).

  const documentsElement = hasPermission('documents')
    ? simplePage('documents', bump)
    : <SopDocuments />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AuthedLayout counts={counts} />}>
        <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
        <Route path="/incidents" element={<Guard need="incidents">{simplePage('incidents', bump)}</Guard>} />
        <Route path="/inspections" element={<Guard need="inspections">{simplePage('inspections', bump)}</Guard>} />
        <Route path="/trainings" element={<Guard need="trainings">{simplePage('trainings', bump)}</Guard>} />
        <Route path="/capa" element={<Guard need="capa">{simplePage('capa', bump)}</Guard>} />
        <Route
          path="/hse-performance"
          element={<Guard need="hse_performance"><HsePerformancePage onDataChanged={bump} /></Guard>}
        />
        <Route path="/permits" element={<PermitsGuard><PermitListPage /></PermitsGuard>} />
        <Route path="/permits/new" element={<Guard need="permits_own"><PermitFormPage /></Guard>} />
        <Route path="/permits/:id/edit" element={<Guard need="permits_own"><PermitFormPage /></Guard>} />
        <Route path="/permits/:id" element={<PermitsGuard><PermitDetailPage /></PermitsGuard>} />
        <Route path="/kpis" element={<Guard need="kpis">{simplePage('kpis', bump)}</Guard>} />
        <Route path="/documents" element={<Guard need="documents" altNeed="documents_sop">{documentsElement}</Guard>} />
        <Route path="/settings" element={<Guard need="settings"><Settings /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
