import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useSettings } from '../context/SettingsContext';
import { Priority } from '../types';
import { ArrowLeft, Plus, ExternalLink, Trash2, PiggyBank, Link as LinkIcon, ShoppingBag, Edit2, Tag } from 'lucide-react';
import { SmartTooltip } from '../components/SmartTooltip';

export const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lists, addProduct, deleteProduct, toggleProduct, addDeposit, deleteList } = usePlanner();
  const { formatCurrency } = useSettings();
  
  const list = lists.find(l => l.id === id);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // New Product State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newTags, setNewTags] = useState(''); // Comma separated
  const [newLink, setNewLink] = useState('');
  const [newStore, setNewStore] = useState('');

  if (!list) {
    return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Lista não encontrada.</div>;
  }

  const totalPlanned = list.products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const remaining = totalPlanned - list.savedAmount;
  const progress = totalPlanned > 0 ? Math.min(100, (list.savedAmount / totalPlanned) * 100) : 0;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    
    // Parse tags
    const tagArray = newTags.split(',').map(t => t.trim()).filter(t => t !== '');

    addProduct(list.id, {
        name: newName,
        price: parseFloat(newPrice),
        quantity: parseInt(newQty) || 1,
        priority: Priority.MEDIUM, // Default internal
        tags: tagArray,
        link: newLink,
        store: newStore,
        completed: false
    });
    setNewName(''); setNewPrice(''); setNewQty('1'); setNewLink(''); setNewStore(''); setNewTags('');
    setShowAddProduct(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (val > 0) {
        addDeposit(list.id, val);
        setDepositAmount('');
        setShowDeposit(false);
    }
  };

  const handleDeleteList = () => {
    if (window.confirm('Tem certeza que deseja apagar esta lista? Todo o histórico será perdido.')) {
        deleteList(list.id);
        navigate('/', { replace: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 pb-24">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-6 gap-4">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm md:text-base">
                <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
            </button>
            <div className="flex gap-2">
                <Link to={`/edit/${list.id}`} className="text-gray-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 text-xs md:text-sm bg-gray-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
                    <Edit2 className="w-4 h-4" /> Editar
                </Link>
                <button onClick={handleDeleteList} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 text-xs md:text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                    Excluir
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white break-words leading-tight">{list.name}</h1>
                <div className="flex flex-wrap items-center text-gray-500 dark:text-slate-400 gap-3 text-xs md:text-sm">
                    <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">{list.goal}</span>
                    <span>Meta: {new Date(list.targetDate).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Piggy Bank Card */}
            <div className="bg-gradient-to-br from-brand-50 to-white dark:bg-none dark:bg-slate-800 border border-brand-100 dark:border-slate-700 p-5 md:p-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors">
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-brand-900 dark:text-brand-200 font-medium flex items-center gap-2 text-sm">
                            <PiggyBank className="w-4 h-4" /> Cofrinho
                        </p>
                        <p className="text-3xl md:text-4xl font-bold text-brand-600 dark:text-brand-400 mt-2">
                            {progress.toFixed(0)}%
                        </p>
                        <p className="text-xs text-brand-800 dark:text-brand-300 mt-1">Guardado</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-wider">Faltam</p>
                        <p className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                            {remaining <= 0 ? 'Concluído!' : formatCurrency(remaining)}
                        </p>
                        <button 
                            onClick={() => setShowDeposit(!showDeposit)}
                            className="mt-3 bg-brand-600 hover:bg-brand-700 text-white text-xs px-4 py-2 rounded-full transition-colors shadow-sm active:scale-95"
                        >
                            + Guardar
                        </button>
                    </div>
                </div>
                {/* Visual Progress Bar BG */}
                <div className="absolute bottom-0 left-0 h-1.5 md:h-2 bg-brand-200 dark:bg-slate-700 w-full">
                    <div className="h-full bg-brand-500 dark:bg-brand-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                </div>

                {showDeposit && (
                    <form onSubmit={handleDeposit} className="mt-4 pt-4 border-t border-brand-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                autoFocus
                                placeholder="Valor (R$)" 
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-2 text-sm border border-brand-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            />
                            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">OK</button>
                        </div>
                    </form>
                )}
            </div>
        </div>

        {/* Product List Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 dark:bg-slate-700/30 gap-4">
                <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Itens Planejados</h2>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Total: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalPlanned)}</span></p>
                </div>
                <button 
                    onClick={() => setShowAddProduct(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Adicionar Item
                </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
                <form onSubmit={handleAddProduct} className="p-4 md:p-6 bg-blue-50/50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end animate-in slide-in-from-top-2">
                    <div className="md:col-span-4 space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-slate-400">Produto</label>
                        <input required placeholder="Nome do item" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 md:p-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:col-span-3">
                         <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-slate-400">Preço</label>
                            <input required type="number" step="0.01" placeholder="0,00" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 md:p-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-slate-400">Qtd</label>
                            <input required type="number" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 md:p-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-500 outline-none" />
                        </div>
                    </div>
                    
                    <div className="md:col-span-5 flex flex-col md:flex-row gap-3 w-full">
                         <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3"/> Tags</label>
                            <input placeholder="Ex: Prioridade, Gamer" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 md:p-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-500 outline-none" />
                        </div>
                         <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Link</label>
                            <input placeholder="https://..." value={newLink} onChange={e => setNewLink(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 md:p-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-500 outline-none" />
                        </div>
                    </div>
                    <div className="md:col-span-12 flex justify-end gap-2 mt-2 pt-2 border-t border-blue-100 dark:border-slate-700 md:border-0 md:pt-0">
                        <button type="button" onClick={() => setShowAddProduct(false)} className="px-4 py-3 md:py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg w-full md:w-auto">Cancelar</button>
                        <button type="submit" className="bg-blue-600 dark:bg-brand-600 hover:bg-blue-700 dark:hover:bg-brand-700 text-white px-6 py-3 md:py-2 text-sm rounded-lg font-medium shadow-sm w-full md:w-auto">Salvar Item</button>
                    </div>
                </form>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
                            <th className="p-4 w-12 text-center">OK</th>
                            <th className="p-4">Produto</th>
                            <th className="p-4">Loja / Link</th>
                            <th className="p-4 text-right">Preço Un.</th>
                            <th className="p-4 text-center">Qtd</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                        {list.products.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Nenhum item adicionado ainda.</td>
                            </tr>
                        )}
                        {list.products.map(product => (
                            <tr key={product.id} className="group hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={product.completed} 
                                        onChange={() => toggleProduct(list.id, product.id)}
                                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col items-start">
                                        <span className={`font-medium ${product.completed ? 'text-gray-400 dark:text-slate-600 line-through' : 'text-gray-900 dark:text-white'}`}>
                                            {product.name}
                                        </span>
                                        {/* Tags Display */}
                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex gap-1 flex-wrap mt-1">
                                                {product.tags.map(tag => (
                                                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${tag.toLowerCase().includes('alta') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        {product.store || '-'}
                                        {product.link && (
                                            <a href={product.link} target="_blank" rel="noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title="Abrir link de compra">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right text-sm text-gray-600 dark:text-slate-400">
                                    <SmartTooltip text="Use o valor com frete se possível.">
                                        {formatCurrency(product.price)}
                                    </SmartTooltip>
                                </td>
                                <td className="p-4 text-center text-sm text-gray-600 dark:text-slate-400">
                                    {product.quantity}
                                </td>
                                <td className="p-4 text-right font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(product.price * product.quantity)}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => deleteProduct(list.id, product.id)} className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-700">
                {list.products.length === 0 && (
                    <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Nenhum item adicionado ainda.</div>
                )}
                {list.products.map(product => (
                    <div key={product.id} className={`p-4 flex flex-col gap-3 ${product.completed ? 'bg-gray-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                                <input 
                                    type="checkbox" 
                                    checked={product.completed} 
                                    onChange={() => toggleProduct(list.id, product.id)}
                                    className="w-6 h-6 rounded border-gray-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500 mt-0.5"
                                />
                                <div className="flex-1">
                                    <p className={`font-medium text-base ${product.completed ? 'text-gray-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'}`}>
                                        {product.name}
                                    </p>
                                    
                                     {/* Tags Mobile */}
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex gap-1 flex-wrap mt-1 mb-1">
                                            {product.tags.map(tag => (
                                                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${tag.toLowerCase().includes('alta') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        {product.store && <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> {product.store}</span>}
                                        {product.quantity > 1 && <span className="bg-gray-100 dark:bg-slate-700 px-1.5 rounded text-xs font-semibold">x{product.quantity}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(product.price * product.quantity)}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500">{formatCurrency(product.price)}/un</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-700/50">
                            <div className="flex gap-3">
                                {product.link ? (
                                    <a href={product.link} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                        <ExternalLink className="w-3 h-3" /> Acessar Loja
                                    </a>
                                ) : (
                                    <span className="text-gray-300 dark:text-slate-600 text-xs italic">Sem link</span>
                                )}
                            </div>
                            <button onClick={() => deleteProduct(list.id, product.id)} className="text-red-400 dark:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};