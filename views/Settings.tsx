import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Toast, ToastType } from '../components/Toast';
import { 
  CreditCard, Bell, Palette, Download, Trash2, 
  ArrowLeft, Eye, EyeOff, Moon, Sun, AlertTriangle, ChevronRight, HardDrive
} from 'lucide-react';

// --- COMPONENTS ---

const Switch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'left-7' : 'left-1'}`} />
  </button>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon: any }> = ({ title, children, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 animate-in fade-in slide-in-from-bottom-2">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
      <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

// --- MAIN VIEW ---

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleTheme, exportData, clearData } = useSettings();
  
  const [activeTab, setActiveTab] = useState<'preferences' | 'appearance' | 'data'>('preferences');
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  const handleUpdateFinancial = (key: string, value: any) => {
    updateSettings('financial', { [key]: value });
    if (key === 'currency') showToast(`Moeda alterada para ${value}`);
    if (key === 'autoSaveGoal') showToast(value ? 'Meta automática ativada' : 'Meta automática desativada');
    if (key === 'closeDay') showToast('Dia de fechamento salvo');
  };

  const handleUpdateNotif = (key: string, value: any) => {
    updateSettings('notifications', { [key]: value });
    showToast('Preferências de notificação atualizadas');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    showToast(settings.appearance.theme === 'light' ? 'Modo escuro ativado' : 'Modo claro ativado');
  };

  const handlePrivacyToggle = () => {
    updateSettings('appearance', { hideValues: !settings.appearance.hideValues });
    showToast(!settings.appearance.hideValues ? 'Valores ocultos' : 'Valores visíveis');
  };

  const handleExport = () => {
    exportData();
    showToast('Download do backup iniciado', 'info');
  };

  const handleClearData = () => {
    if (window.confirm('ATENÇÃO: Isso apagará TODOS os seus dados e não pode ser desfeito. Tem certeza?')) {
      clearData();
      // O clearData já redireciona, mas por segurança visual:
      showToast('Todos os dados foram apagados', 'warning');
    }
  };

  const navItems = [
    { id: 'preferences', label: 'Preferências', icon: CreditCard },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'data', label: 'Meus Dados', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 sticky top-24">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm font-semibold' 
                      : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto hidden md:block" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          
          {/* PREFERENCES SECTION */}
          {activeTab === 'preferences' && (
            <SectionCard title="Preferências Gerais" icon={CreditCard}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Moeda Principal</label>
                     <select 
                        value={settings.financial.currency}
                        onChange={(e) => handleUpdateFinancial('currency', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                     >
                       <option value="BRL">Real Brasileiro (BRL)</option>
                       <option value="USD">US Dollar (USD)</option>
                       <option value="EUR">Euro (EUR)</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dia de Fechamento</label>
                     <input 
                        type="number"
                        min="1" max="31"
                        value={settings.financial.closeDay}
                        onBlur={(e) => handleUpdateFinancial('closeDay', parseInt(e.target.value))}
                        onChange={(e) => updateSettings('financial', { closeDay: parseInt(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                     />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Meta Automática</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sugerir aportes inteligentes baseados nas listas.</p>
                  </div>
                  <Switch checked={settings.financial.autoSaveGoal} onChange={() => handleUpdateFinancial('autoSaveGoal', !settings.financial.autoSaveGoal)} />
                </div>
                
                <hr className="border-gray-100 dark:border-slate-700" />
                
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell className="w-4 h-4" /> Notificações</h3>
                <div className="space-y-4">
                     <div className="flex items-center justify-between py-2">
                        <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Alerta de Prazos</h3>
                        <p className="text-xs text-slate-500">Avisos visuais na dashboard.</p>
                        </div>
                        <Switch checked={settings.notifications.deadlineAlert} onChange={() => handleUpdateNotif('deadlineAlert', !settings.notifications.deadlineAlert)} />
                    </div>
                     <div className="py-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-white block mb-2">Lembrete de Aporte (dias sem atividade)</label>
                        <input 
                        type="range" min="1" max="30"
                        value={settings.notifications.reminderDays}
                        onMouseUp={() => showToast(`Lembrete definido para ${settings.notifications.reminderDays} dias`)}
                        onChange={(e) => updateSettings('notifications', { reminderDays: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                        <div className="text-right text-xs text-slate-500 mt-1">{settings.notifications.reminderDays} dias</div>
                    </div>
                </div>

              </div>
            </SectionCard>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
             <SectionCard title="Personalização Visual" icon={Palette}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Tema do Sistema</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => settings.appearance.theme === 'dark' && handleThemeToggle()}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.appearance.theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                         >
                            <Sun className="w-6 h-6" />
                            <span className="text-xs font-bold">Claro</span>
                         </button>
                         <button 
                           onClick={() => settings.appearance.theme === 'light' && handleThemeToggle()}
                           className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.appearance.theme === 'dark' ? 'border-indigo-500 bg-slate-800 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                         >
                            <Moon className="w-6 h-6" />
                            <span className="text-xs font-bold">Escuro</span>
                         </button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-900 dark:text-white">Privacidade</label>
                      <button 
                        onClick={handlePrivacyToggle}
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                               {settings.appearance.hideValues ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-medium text-slate-900 dark:text-white">{settings.appearance.hideValues ? 'Valores Ocultos' : 'Valores Visíveis'}</p>
                               <p className="text-xs text-slate-500">Toque para alternar</p>
                            </div>
                         </div>
                         <Switch checked={settings.appearance.hideValues} onChange={() => {}} />
                      </button>
                   </div>
                </div>
             </SectionCard>
          )}

           {/* DATA SECTION */}
           {activeTab === 'data' && (
             <SectionCard title="Gerenciamento de Dados" icon={HardDrive}>
               <div className="space-y-6">
                 <p className="text-sm text-slate-600 dark:text-slate-400">
                    Todos os seus dados são armazenados localmente no seu navegador. Você pode fazer um backup ou resetar o aplicativo.
                 </p>
                 <div className="flex flex-col gap-3">
                     <button 
                       onClick={handleExport}
                       className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-700 dark:text-slate-300 text-sm font-medium border border-gray-100 dark:border-slate-700"
                     >
                       <span className="flex items-center gap-3"><Download className="w-5 h-5 text-brand-600" /> Exportar Backup (JSON)</span>
                       <ChevronRight className="w-4 h-4 text-slate-400" />
                     </button>
                     <button 
                       onClick={handleClearData}
                       className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30"
                     >
                       <span className="flex items-center gap-3"><Trash2 className="w-5 h-5" /> Apagar Tudo e Resetar</span>
                       <AlertTriangle className="w-4 h-4" />
                     </button>
                   </div>
               </div>
             </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
};