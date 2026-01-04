import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PlannerProvider } from './context/PlannerContext';
import { SettingsProvider } from './context/SettingsContext';
import { Dashboard } from './views/Dashboard';
import { CreateList } from './views/CreateList';
import { ListDetail } from './views/ListDetail';
import { Settings } from './views/Settings';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <PlannerProvider>
        <HashRouter>
          <div className="min-h-screen text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateList />} />
              <Route path="/edit/:id" element={<CreateList />} />
              <Route path="/list/:id" element={<ListDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </HashRouter>
      </PlannerProvider>
    </SettingsProvider>
  );
};

export default App;