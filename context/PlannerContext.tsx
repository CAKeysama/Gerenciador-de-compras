import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShoppingList, Product, Priority, Deposit } from '../types';

interface PlannerContextType {
  lists: ShoppingList[];
  addList: (list: Omit<ShoppingList, 'id' | 'products' | 'savedAmount' | 'depositHistory' | 'createdAt'>) => void;
  deleteList: (id: string) => void;
  addProduct: (listId: string, product: Omit<Product, 'id' | 'completed'>) => void;
  toggleProduct: (listId: string, productId: string) => void;
  updateProduct: (listId: string, productId: string, data: Partial<Product>) => void;
  deleteProduct: (listId: string, productId: string) => void;
  addDeposit: (listId: string, amount: number) => void;
  getTotalPlanned: () => number;
  getTotalSaved: () => number;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// Estado inicial vazio - os dados virão do uso real e serão salvos no navegador
const INITIAL_DATA: ShoppingList[] = [];

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<ShoppingList[]>(() => {
    const saved = localStorage.getItem('planeja_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('planeja_data', JSON.stringify(lists));
  }, [lists]);

  const addList = (data: Omit<ShoppingList, 'id' | 'products' | 'savedAmount' | 'depositHistory' | 'createdAt'>) => {
    const newList: ShoppingList = {
      ...data,
      id: crypto.randomUUID(),
      products: [],
      savedAmount: 0,
      depositHistory: [],
      createdAt: new Date().toISOString(),
    };
    setLists(prev => [...prev, newList]);
  };

  const deleteList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  };

  const addProduct = (listId: string, productData: Omit<Product, 'id' | 'completed'>) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        products: [...list.products, { ...productData, id: crypto.randomUUID(), completed: false }]
      };
    }));
  };

  const toggleProduct = (listId: string, productId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        products: list.products.map(p => p.id === productId ? { ...p, completed: !p.completed } : p)
      };
    }));
  };

  const updateProduct = (listId: string, productId: string, data: Partial<Product>) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        products: list.products.map(p => p.id === productId ? { ...p, ...data } : p)
      };
    }));
  };

  const deleteProduct = (listId: string, productId: string) => {
    setLists(prev => prev.map(list => {
        if (list.id !== listId) return list;
        return {
            ...list,
            products: list.products.filter(p => p.id !== productId)
        };
    }));
  };

  const addDeposit = (listId: string, amount: number) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;
      const newDeposit: Deposit = { id: crypto.randomUUID(), amount, date: new Date().toISOString() };
      return {
        ...list,
        savedAmount: list.savedAmount + amount,
        depositHistory: [...list.depositHistory, newDeposit]
      };
    }));
  };

  const getTotalPlanned = () => {
    return lists.reduce((total, list) => {
      return total + list.products.reduce((lt, p) => lt + (p.price * p.quantity), 0);
    }, 0);
  };

  const getTotalSaved = () => {
    return lists.reduce((total, list) => total + list.savedAmount, 0);
  };

  return (
    <PlannerContext.Provider value={{ 
      lists, 
      addList, 
      deleteList, 
      addProduct, 
      toggleProduct, 
      updateProduct,
      deleteProduct,
      addDeposit,
      getTotalPlanned,
      getTotalSaved
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};