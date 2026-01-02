import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, DollarSign, ArrowRight, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { analyzeFinances } from '../services/geminiService';
import { FinancialInsight } from '../types';
import { IntelligentAnalysis } from '../components/IntelligentAnalysis';
import { RotatingTips } from '../components/RotatingTips';

export const Dashboard: React.FC = () => {
  const { lists, getTotalPlanned, getTotalSaved } = usePlanner();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const totalPlanned = getTotalPlanned();
  const totalSaved = getTotalSaved();
  const percentage = totalPlanned > 0 ? (totalSaved / totalPlanned) * 100 : 0;

  const data = lists.map(l => ({
    name: l.name,
    Guardado: l.savedAmount,
    Meta: l.products.reduce((acc, p) => acc + (p.price * p.quantity), 0)
  }));

  const fetchInsights = async () => {
    if (lists.length === 0) return;
    setLoadingInsights(true);
    const result = await analyzeFinances(lists);
    setInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 animate-in fade-in duration-500 relative min-h-screen">
      
      {/* Header - Desktop Button hidden on mobile */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Seu progresso financeiro em tempo real.</p>
        </div>
        <Link 
          to="/create" 
          className="hidden md:flex bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-medium items-center gap-2 shadow-lg shadow-slate-200 hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nova Lista
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">

        {/* Card 1: Planned */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 md:h-48">
           <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase">Planejado Total</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 md:mt-2">R$ {totalPlanned.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <DollarSign className="w-5 h-5" />
              </div>
           </div>
           <div className="mt-auto">
             <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 w-full opacity-20"></div>
             </div>
             <p className="text-[10px] md:text-xs text-gray-400 mt-2">Soma de todas as metas</p>
           </div>
        </div>

        {/* Card 2: Saved */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 md:h-48">
           <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase">Já Guardado</p>
                <h3 className="text-xl md:text-2xl font-bold text-brand-600 mt-1 md:mt-2">R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</h3>
              </div>
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Wallet className="w-5 h-5" />
              </div>
           </div>
           <div className="mt-auto">
             <div className="flex justify-between text-[10px] md:text-xs text-gray-500 mb-1">
                <span>Progresso global</span>
                <span>{percentage.toFixed(0)}%</span>
             </div>
             <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
             </div>
           </div>
        </div>

        {/* Card 3: Placeholder */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-40 md:h-48 hidden lg:flex items-center justify-center">
           <p className="text-gray-400 text-sm text-center">Espaço para mais métricas</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lists */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Minhas Listas</h2>
            {lists.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-dashed border-gray-300 mx-1">
                    <p className="text-gray-400 mb-4 text-sm md:text-base">Você ainda não tem listas.</p>
                    <Link to="/create" className="text-brand-600 font-medium hover:underline text-sm md:text-base">Começar agora</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {lists.map(list => {
                        const lTotal = list.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
                        const lProg = lTotal > 0 ? (list.savedAmount / lTotal) * 100 : 0;
                        
                        return (
                            <Link to={`/list/${list.id}`} key={list.id} className="block group">
                                <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300 relative overflow-hidden active:scale-[0.98]">
                                    <div className="flex justify-between items-center mb-3 md:mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{list.name}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{list.products.length} itens • {new Date(list.targetDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 p-1.5 md:p-2 rounded-full group-hover:bg-brand-50 transition-colors">
                                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-brand-600" />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between text-xs md:text-sm font-medium text-gray-600 mb-1.5 md:mb-2">
                                            <span>R$ {list.savedAmount.toLocaleString('pt-BR')} <span className="text-gray-400 font-normal">de {lTotal.toLocaleString('pt-BR')}</span></span>
                                            <span className={lProg >= 100 ? 'text-brand-600' : ''}>{lProg.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 md:h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${lProg >= 100 ? 'bg-brand-500' : lProg > 50 ? 'bg-brand-400' : 'bg-amber-400'}`} 
                                                style={{ width: `${lProg}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Chart */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Comparativo</h2>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-64 md:h-[400px] flex flex-col">
                {lists.length > 0 ? (
                    <>
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 md:mb-4">Meta vs Guardado</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} interval={0} height={20} tickFormatter={(val) => val.slice(0, 6) + '..'} />
                                    <YAxis tick={{fontSize: 10, fill: '#64748b'}} />
                                    <Tooltip
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                                    />
                                    <Bar name="Meta" dataKey="Meta" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={16} />
                                    <Bar name="Guardado" dataKey="Guardado" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                             <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
                         </div>
                        <p className="text-xs md:text-sm text-gray-400">Sem dados para comparar.</p>
                    </div>
                )}
            </div>

            <RotatingTips />

            <IntelligentAnalysis
              insights={insights}
              loadingInsights={loadingInsights}
              onFetchInsights={fetchInsights}
            />
        </div>

      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <Link 
        to="/create"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-90 transition-transform z-50"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};