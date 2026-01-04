import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Check, Calendar, Target, Sparkles, Loader2, PenTool, Trash2, Tag, Plus } from 'lucide-react';
import { generateListFromText } from '../services/geminiService';
import { Priority } from '../types';

// Helper type for review/edit mode
interface ReviewProduct {
  id?: string; // Optional because new AI items don't have IDs yet
  name: string;
  price: number;
  quantity: number;
  tags: string[];
  priority: Priority;
  completed?: boolean;
}

export const CreateList: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // If ID exists, we are editing
  const { lists, addList, updateList, createCompleteList } = usePlanner();
  const { formatCurrency } = useSettings();
  
  // Tabs: 'manual' | 'magic'
  const [mode, setMode] = useState<'manual' | 'magic'>('manual');
  const [step, setStep] = useState<'input' | 'review'>('input'); // For Magic flow

  // Common State
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Magic State
  const [magicText, setMagicText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Product Editor State
  const [reviewProducts, setReviewProducts] = useState<ReviewProduct[]>([]);

  // Load existing data if Editing
  useEffect(() => {
    if (id) {
        const existingList = lists.find(l => l.id === id);
        if (existingList) {
            setName(existingList.name);
            setGoal(existingList.goal);
            // Ensure date is formatted YYYY-MM-DD for input
            setTargetDate(existingList.targetDate ? existingList.targetDate.split('T')[0] : '');
            
            // Load products for editing
            setReviewProducts(existingList.products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                tags: p.tags || (p.priority === Priority.HIGH ? ['Alta Prioridade'] : []),
                priority: p.priority,
                completed: p.completed
            })));
            
            setMode('manual');
        } else {
            navigate('/');
        }
    }
  }, [id, lists, navigate]);

  const handleSave = () => {
    if (!name || !goal) return;

    // Fix Date: append Time to avoid timezone shifting to previous day
    const safeDate = targetDate ? new Date(`${targetDate}T12:00:00`).toISOString() : new Date().toISOString();

    if (id) {
        // Update existing List AND Products
        const existingList = lists.find(l => l.id === id);
        if (!existingList) return;

        // Merge updated review products with existing structure (preserve saved IDs if any)
        const updatedProducts = reviewProducts.map(p => ({
            id: p.id || crypto.randomUUID(),
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            tags: p.tags,
            priority: p.priority,
            completed: p.completed || false,
            link: existingList.products.find(ep => ep.id === p.id)?.link || '',
            store: existingList.products.find(ep => ep.id === p.id)?.store || ''
        }));

        updateList(id, { 
            name, 
            goal, 
            targetDate: safeDate,
            products: updatedProducts 
        });
        navigate(`/list/${id}`);
    } else {
        // Create new manual list
        addList({ name, goal, targetDate: safeDate });
        navigate('/');
    }
  };

  const handleMagicGenerate = async () => {
    if (!magicText.trim()) return;
    setIsGenerating(true);
    
    try {
        const payload = await generateListFromText(magicText);
        if (payload) {
            setName(payload.name);
            setGoal(payload.goal);
            setReviewProducts(payload.products.map(p => ({
                ...p,
                tags: p.priority === Priority.HIGH ? ['Alta Prioridade'] : []
            })));
            setStep('review');
        } else {
            alert('Não foi possível entender o texto. Tente novamente com mais detalhes.');
        }
    } catch (e) {
        alert('Erro ao processar com IA. Verifique sua conexão.');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleMagicConfirm = () => {
     const safeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
     const newId = createCompleteList({
         name,
         goal,
         products: reviewProducts.map(p => ({...p, priority: p.priority})) // Pass as is
     });
     navigate(`/list/${newId}`);
  };

  // --- Product Editor Actions ---

  const updateReviewProduct = (index: number, field: keyof ReviewProduct, value: any) => {
      const newProducts = [...reviewProducts];
      newProducts[index] = { ...newProducts[index], [field]: value };
      setReviewProducts(newProducts);
  };

  const removeReviewProduct = (index: number) => {
      setReviewProducts(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (index: number, newTag: string) => {
      if (!newTag.trim()) return;
      const product = reviewProducts[index];
      if (!product.tags.includes(newTag.trim())) {
          updateReviewProduct(index, 'tags', [...product.tags, newTag.trim()]);
      }
  };

  const removeTag = (index: number, tagToRemove: string) => {
      const product = reviewProducts[index];
      updateReviewProduct(index, 'tags', product.tags.filter(t => t !== tagToRemove));
  };

  const addNewItemInEditor = () => {
      setReviewProducts([...reviewProducts, {
          name: '',
          price: 0,
          quantity: 1,
          tags: [],
          priority: Priority.MEDIUM,
          completed: false
      }]);
  };

  // --- Components ---

  const renderProductEditor = () => (
    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 animate-in slide-in-from-bottom-2 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {mode === 'magic' && step === 'review' && !id ? <Sparkles className="w-4 h-4 text-indigo-500" /> : null}
                Itens da Lista
            </h3>
            <button 
                onClick={addNewItemInEditor}
                className="text-xs bg-slate-900 dark:bg-brand-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 dark:hover:bg-brand-700 transition-colors"
            >
                <Plus className="w-3 h-3" /> Novo Item
            </button>
        </div>
        
        <div className="space-y-4">
            {reviewProducts.map((prod, idx) => (
                <div key={idx} className="flex flex-col gap-3 p-4 border border-gray-100 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-700/30 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all">
                    
                    {/* Top Row: Name and Delete */}
                    <div className="flex gap-3 items-start">
                         <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Produto</label>
                            <input 
                                value={prod.name} 
                                placeholder="Nome do item"
                                onChange={(e) => updateReviewProduct(idx, 'name', e.target.value)}
                                className="w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-brand-500 outline-none py-1 text-sm font-medium text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <button onClick={() => removeReviewProduct(idx)} className="text-gray-400 hover:text-red-500 transition-colors mt-4">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Middle Row: Price, Qty */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Preço</label>
                            <input 
                                type="number"
                                value={prod.price} 
                                onChange={(e) => updateReviewProduct(idx, 'price', parseFloat(e.target.value))}
                                className="w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-brand-500 outline-none py-1 text-sm text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Qtd</label>
                            <input 
                                type="number"
                                value={prod.quantity} 
                                onChange={(e) => updateReviewProduct(idx, 'quantity', parseInt(e.target.value))}
                                className="w-full bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-brand-500 outline-none py-1 text-sm text-slate-900 dark:text-white text-center"
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Tags */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                            <Tag className="w-3 h-3" /> Tags
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                            {prod.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-600 dark:text-slate-200 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => removeTag(idx, tag)} className="hover:text-red-500 ml-1">×</button>
                                </span>
                            ))}
                            <input 
                                type="text"
                                placeholder="+ Tag"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag(idx, e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                                className="bg-transparent border-b border-gray-200 dark:border-slate-600 text-slate-900 dark:text-white text-xs py-1 w-20 focus:w-32 focus:border-indigo-500 dark:focus:border-brand-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                </div>
            ))}
            {reviewProducts.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">
                    Nenhum item na lista.
                </div>
            )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end text-sm text-gray-500 dark:text-slate-400">
            <span>Total estimado: <b className="text-slate-900 dark:text-white">{formatCurrency(reviewProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0))}</b></span>
        </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <button 
        onClick={() => navigate(id ? `/list/${id}` : '/')} 
        className="flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 md:mb-8 transition-colors text-sm md:text-base"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {id ? 'Cancelar Edição' : 'Voltar para Dashboard'}
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {id ? 'Editar Lista' : (step === 'review' ? 'Revisar Sugestão' : 'Criar nova lista')}
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm md:text-base">
        {id ? 'Altere detalhes e itens da sua lista.' : (step === 'review' ? 'A IA montou isso para você. Edite o que quiser antes de salvar.' : 'Escolha como prefere começar seu planejamento.')}
      </p>

      {/* Mode Toggler (Only show if NOT editing and NOT in review step) */}
      {!id && step === 'input' && (
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
            >
                <PenTool className="w-4 h-4" /> Manual
            </button>
            <button 
                onClick={() => setMode('magic')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mode === 'magic' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
            >
                <Sparkles className="w-4 h-4" /> IA Mágica
            </button>
        </div>
      )}

      {/* 1. MAGIC MODE INPUT */}
      {mode === 'magic' && step === 'input' && !id && (
          <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <Sparkles className="w-32 h-32 text-indigo-600 dark:text-indigo-400" />
             </div>
             <label className="block text-base font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Descreva seu plano</label>
             <textarea 
                value={magicText}
                onChange={(e) => setMagicText(e.target.value)}
                placeholder="Ex: Quero montar um quarto de bebê completo..."
                className="w-full h-40 p-4 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-base shadow-inner dark:shadow-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
             />
             <div className="pt-6">
                 <button
                    onClick={handleMagicGenerate}
                    disabled={isGenerating || !magicText.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                 >
                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Analisando...</> : <><Sparkles className="w-5 h-5" /> Gerar Rascunho</>}
                 </button>
             </div>
          </div>
      )}

      {/* 2. FORM (Manual, Edit or Review) */}
      {(mode === 'manual' || step === 'review') && (
          <div className="space-y-6">
            
            {/* Metadata Fields */}
            <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome da Lista</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base md:text-lg p-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-600"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Objetivo
                        </label>
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Data (Opcional)
                        </label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            {/* Product List Editor (Visible in Review Step OR Editing an existing list) */}
            {(step === 'review' || id) && renderProductEditor()}

            {/* Action Buttons */}
            <div className="pt-2">
                {step === 'review' && !id ? (
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleMagicConfirm}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            <Check className="w-5 h-5" /> Confirmar e Criar Lista
                        </button>
                         <button onClick={() => setStep('input')} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm text-center">Voltar e tentar outro texto</button>
                    </div>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={!name || !goal}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        {id ? <><Check className="w-5 h-5" /> Salvar Alterações</> : <><Check className="w-5 h-5" /> Criar Lista</>}
                    </button>
                )}
            </div>
          </div>
      )}
    </div>
  );
};