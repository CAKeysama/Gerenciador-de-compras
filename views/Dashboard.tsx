import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, DollarSign, AlertCircle, Loader2, Sparkles, ArrowRight, Wallet, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyzeFinances } from '../services/geminiService';
import { FinancialInsight } from '../types';

export const Dashboard: React.FC = () => {
  const { lists, getTotalPlanned, getTotalSaved } = usePlanner();
  const { settings, updateSettings, formatCurrency } = useSettings();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const totalPlanned = getTotalPlanned();
  const totalSaved = getTotalSaved();
  const percentage = totalPlanned > 0 ? (totalSaved / totalPlanned) * 100 : 0;
  const hideValues = settings.appearance.hideValues;

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
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Visão Geral</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-1">
             Olá! Acompanhe seu progresso e metas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => updateSettings('appearance', { hideValues: !hideValues })}
             className="p-2 text-gray-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
          >
             {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <Link to="/settings" className="p-2 text-gray-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors">
             <SettingsIcon className="w-6 h-6" />
          </Link>
          <Link 
            to="/create" 
            className="hidden md:flex bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-medium items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nova Lista
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* Card 1: Planned */}
        <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between h-40 md:h-48 lg:col-span-1">
           <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase">Planejado Total</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1 md:mt-2">
                   {formatCurrency(totalPlanned)}
                </h3>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-400 dark:text-slate-300">
                <DollarSign className="w-5 h-5" />
              </div>
           </div>
           <div className="mt-auto">
             <div className="w-full bg-gray-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 dark:bg-slate-400 w-full opacity-20"></div>
             </div>
             <p className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 mt-2">Soma de todas as metas</p>
           </div>
        </div>

        {/* Card 2: Saved */}
        <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between h-40 md:h-48 lg:col-span-1">
           <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase">Já Guardado</p>
                <h3 className="text-xl md:text-2xl font-bold text-brand-600 dark:text-brand-500 mt-1 md:mt-2">
                   {formatCurrency(totalSaved)}
                </h3>
              </div>
              <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600 dark:text-brand-500">
                <Wallet className="w-5 h-5" />
              </div>
           </div>
           <div className="mt-auto">
             <div className="flex justify-between text-[10px] md:text-xs text-gray-500 dark:text-slate-400 mb-1">
                <span>Progresso global</span>
                <span>{percentage.toFixed(0)}%</span>
             </div>
             <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
             </div>
           </div>
        </div>

        {/* Card 3: AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-white dark:from-navy-900 dark:via-slate-800 dark:to-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 flex flex-col h-auto min-h-[12rem] md:h-48 lg:col-span-2 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
               <Sparkles className="w-24 h-24 text-indigo-500" />
           </div>

           <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Análise Inteligente
              </span>
              {insights.length > 0 && (
                <button onClick={fetchInsights} className="text-[10px] md:text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border border-indigo-100 dark:border-slate-600 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors">
                    Atualizar
                </button>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
               {!loadingInsights && insights.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center py-2">
                    <p className="text-indigo-900/60 dark:text-slate-400 text-xs md:text-sm mb-3 max-w-xs mx-auto">Dicas personalizadas baseadas nos seus padrões.</p>
                    <button 
                      onClick={fetchInsights}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                      Gerar Análise
                    </button>
                 </div>
               )}
               
               {loadingInsights && (
                 <div className="flex flex-col items-center justify-center h-full text-indigo-400">
                   <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin mb-2" />
                   <span className="text-xs md:text-sm font-medium">Analisando...</span>
                 </div>
               )}

               {insights.length > 0 && (
                 <div className="grid grid-cols-1 gap-2">
                   {insights.map((insight, idx) => (
                     <div key={idx} className={`bg-white/90 dark:bg-slate-900/80 p-3 rounded-xl border ${insight.type === 'warning' ? 'border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10' : 'border-indigo-50 dark:border-slate-700'} shadow-sm`}>
                        <p className={`font-semibold text-xs mb-0.5 ${insight.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>{insight.title}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-[10px] md:text-xs leading-relaxed">{insight.message}</p>
                     </div>
                   ))}
                 </div>
               )}
           </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lists */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Minhas Listas</h2>
            {lists.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 mx-1">
                    <p className="text-gray-400 dark:text-slate-500 mb-4 text-sm md:text-base">Você ainda não tem listas.</p>
                    <Link to="/create" className="text-brand-600 dark:text-brand-500 font-medium hover:underline text-sm md:text-base">Começar agora</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {lists.map(list => {
                        const lTotal = list.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
                        const lProg = lTotal > 0 ? (list.savedAmount / lTotal) * 100 : 0;
                        
                        return (
                            <Link to={`/list/${list.id}`} key={list.id} className="block group">
                                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-900 transition-all duration-300 relative overflow-hidden active:scale-[0.98]">
                                    <div className="flex justify-between items-center mb-3 md:mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-500 transition-colors">{list.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{list.products.length} itens • {new Date(list.targetDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 p-1.5 md:p-2 rounded-full group-hover:bg-brand-50 dark:group-hover:bg-brand-900 transition-colors">
                                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-500" />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between text-xs md:text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5 md:mb-2">
                                            <span>{formatCurrency(list.savedAmount)} <span className="text-gray-400 dark:text-slate-500 font-normal">de {formatCurrency(lTotal)}</span></span>
                                            <span className={lProg >= 100 ? 'text-brand-600 dark:text-brand-500' : ''}>{lProg.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 md:h-2.5 rounded-full overflow-hidden">
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
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Comparativo</h2>
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-64 md:h-[400px] flex flex-col">
                {lists.length > 0 ? (
                    <>
                        <p className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-2 md:mb-4">Meta vs Guardado</p>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.appearance.theme === 'dark' ? '#334155' : '#f1f5f9'} />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} interval={0} height={20} tickFormatter={(val) => val.slice(0, 6) + '..'} />
                                    <YAxis tick={{fontSize: 10, fill: '#64748b'}} />
                                    <Tooltip 
                                        cursor={{fill: settings.appearance.theme === 'dark' ? '#1e293b' : '#f8fafc'}}
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: 'none', 
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                                            fontSize: '12px',
                                            backgroundColor: settings.appearance.theme === 'dark' ? '#1e293b' : '#fff',
                                            color: settings.appearance.theme === 'dark' ? '#fff' : '#000'
                                        }}
                                        formatter={(value: number) => [formatCurrency(value), '']}
                                    />
                                    <Bar name="Meta" dataKey="Meta" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={16} />
                                    <Bar name="Guardado" dataKey="Guardado" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                         <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                             <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-gray-300 dark:text-slate-500" />
                         </div>
                        <p className="text-xs md:text-sm text-gray-400 dark:text-slate-500">Sem dados para comparar.</p>
                    </div>
                )}
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl md:rounded-2xl flex items-start gap-3 md:gap-4">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-500 mt-0.5">
                     <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                    <p className="text-xs md:text-sm font-bold text-amber-900 dark:text-amber-400">Dica</p>
                    <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">Depósitos pequenos e frequentes criam grandes resultados.</p>
                </div>
            </div>
        </div>

      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <Link 
        to="/create"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 dark:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-90 transition-transform z-50"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};