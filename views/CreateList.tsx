import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { ArrowLeft, Check, Calendar, Target } from 'lucide-react';
import { SmartTooltip } from '../components/SmartTooltip';

export const CreateList: React.FC = () => {
  const navigate = useNavigate();
  const { addList } = usePlanner();
  
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSave = () => {
    if (!name || !goal) return;
    addList({ name, goal, targetDate });
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-gray-800 mb-6 md:mb-8 transition-colors text-sm md:text-base"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para Dashboard
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Criar nova lista</h1>
      <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Defina seu objetivo em menos de 30 segundos.</p>

      <div className="space-y-4 md:space-y-6 bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nome da Lista</label>
            <SmartTooltip text="Dê um nome curto e fácil de identificar.">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: PC Gamer, Viagem..."
                    className="w-full bg-white text-slate-900 text-base md:text-lg p-3 md:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                    autoFocus
                />
            </SmartTooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Objetivo Financeiro
                </label>
                <SmartTooltip text="Qual o propósito principal? Lazer, trabalho, emergência?">
                     <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Ex: Trabalho"
                        className="w-full bg-white text-slate-900 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400"
                    />
                </SmartTooltip>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Data Desejada
                </label>
                <SmartTooltip text="Quando você pretende concluir esta meta?">
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-white text-slate-900 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400"
                    />
                </SmartTooltip>
            </div>
        </div>

        <div className="pt-4 md:pt-6">
            <button
                onClick={handleSave}
                disabled={!name || !goal}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99]"
            >
                <Check className="w-5 h-5" />
                Criar Lista de Planejamento
            </button>
        </div>
      </div>
    </div>
  );
};