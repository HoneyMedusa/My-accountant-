export interface UserProfile {
  uid: string;
  email: string;
  businessName?: string;
  createdAt: any;
}

export interface StockItem {
  name: string;
  quantity: number;
  costPerItem: number;
  totalValue: number;
}

export interface StockRecord {
  id?: string;
  userId: string;
  date: string;
  items: StockItem[];
  totalStockValue: number;
  createdAt: any;
}

export interface ExpenseItem {
  category: string;
  amount: number;
  description: string;
}

export interface ExpenseRecord {
  id?: string;
  userId: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  createdAt: any;
}

export interface CashUpRecord {
  id?: string;
  userId: string;
  date: string;
  amount: number;
  createdAt: any;
}

export type View = 'dashboard' | 'stock' | 'cashups' | 'expenses' | 'history' | 'chatbot';
