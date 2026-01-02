import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PlannerProvider } from './context/PlannerContext';
import { Dashboard } from './views/Dashboard';
import { CreateList } from './views/CreateList';
import { ListDetail } from './views/ListDetail';

const App: React.FC = () => {
  return (
    <PlannerProvider>
      <HashRouter>
        <div className="min-h-screen text-slate-900 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateList />} />
            <Route path="/list/:id" element={<ListDetail />} />
          </Routes>
        </div>
      </HashRouter>
    </PlannerProvider>
  );
};

export default App;