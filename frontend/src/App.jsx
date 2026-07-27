import { useCallback, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import CrudPage from './components/CrudPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HsePerformancePage from './pages/HsePerformancePage.jsx';
import { MODULES, VIEW_META } from './config/modules.jsx';
import { api } from './lib/api.js';

function simplePage(moduleKey, onDataChanged) {
  const [title, subtitle] = VIEW_META[moduleKey];
  return (
    <CrudPage
      moduleKey={moduleKey}
      cfg={MODULES[moduleKey]}
      title={title}
      subtitle={subtitle}
      onDataChanged={onDataChanged}
    />
  );
}

export default function App() {
  const [counts, setCounts] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCounts = useCallback(async () => {
    const entries = await Promise.all(
      Object.keys(MODULES).map(async (key) => {
        try {
          const { total } = await api.get(`/${key}`);
          return [key, total];
        } catch {
          return [key, 0];
        }
      })
    );
    setCounts(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const bump = useCallback(() => {
    loadCounts();
    setRefreshKey((k) => k + 1);
  }, [loadCounts]);

  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] max-md:grid-cols-1">
      <Sidebar counts={counts} />
      <main className="px-8 pb-16 pt-6 max-sm:px-4">
        <Routes>
          <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
          <Route path="/incidents" element={simplePage('incidents', bump)} />
          <Route path="/inspections" element={simplePage('inspections', bump)} />
          <Route path="/trainings" element={simplePage('trainings', bump)} />
          <Route path="/capa" element={simplePage('capa', bump)} />
          <Route path="/hse-performance" element={<HsePerformancePage onDataChanged={bump} />} />
          <Route path="/permits" element={simplePage('permits', bump)} />
          <Route path="/kpis" element={simplePage('kpis', bump)} />
          <Route path="/documents" element={simplePage('documents', bump)} />
        </Routes>
      </main>
    </div>
  );
}
