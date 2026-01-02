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
  priority: Priority;
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