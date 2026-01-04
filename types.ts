export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
}

export interface Deposit {
  id: string;
  amount: number;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  link?: string;
  store?: string;
  notes?: string;
  tags: string[]; // Novo sistema de tags
  priority: Priority; // Mantido para compatibilidade interna
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  goal: string;
  targetDate: string; // ISO String
  products: Product[];
  savedAmount: number; // Cofrinho
  depositHistory: Deposit[];
  createdAt: string;
}

export interface AppState {
  lists: ShoppingList[];
}

export interface FinancialInsight {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export interface AIListPayload {
  name: string;
  goal: string;
  products: {
    name: string;
    price: number;
    quantity: number;
    tags?: string[];
    priority: Priority;
  }[];
}

// --- SETTINGS TYPES ---

export interface SettingsState {
  financial: {
    currency: string;
    closeDay: number;
    autoSaveGoal: boolean;
  };
  notifications: {
    reminderDays: number;
    deadlineAlert: boolean;
    aiInsights: boolean; // Renomeado de weeklyReport para algo mais genérico local
  };
  appearance: {
    theme: 'light' | 'dark';
    hideValues: boolean;
  };
}